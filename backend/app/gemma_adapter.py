import base64
import json
import re
from typing import Any

from google import genai
from google.genai import types
from pydantic import ValidationError

from .config import settings
from .schemas import ExtractedTable, ModelStatus, TableCell


TABLE_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "tables": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "title": {"type": "string"},
                    "page": {"type": "integer"},
                    "headers": {"type": "array", "items": {"type": "string"}},
                    "rows": {
                        "type": "array",
                        "items": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "value": {"type": "string"},
                                    "confidence": {"type": "number"},
                                    "source_text": {"type": "string"},
                                    "warning": {"type": "string"},
                                },
                                "required": ["value", "confidence"],
                            },
                        },
                    },
                    "units": {"type": "string"},
                    "confidence": {"type": "number"},
                    "warnings": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["id", "title", "page", "headers", "rows", "confidence", "warnings"],
            },
        },
        "warnings": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["tables", "warnings"],
}


ANSWER_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "answer": {"type": "string"},
        "citations": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["answer", "citations"],
}


class GemmaUnavailableError(RuntimeError):
    pass


class GemmaResponseError(RuntimeError):
    pass


class GemmaAdapter:
    def __init__(self) -> None:
        self.model = settings.gemma_model
        self.mock = settings.use_mock_gemma
        self.client = None if self.mock or not settings.google_api_key else genai.Client(api_key=settings.google_api_key)
        self._status_cache: ModelStatus | None = None

    def model_status(self, validate: bool = False) -> ModelStatus:
        if self.mock:
            return ModelStatus(
                model=self.model,
                mode="local-parser",
                mock=True,
                vision_enabled=False,
                reasoning_enabled=False,
                message="Running in local parser mode. Add GOOGLE_API_KEY and set USE_MOCK_GEMMA=false for Gemma 4 vision and reasoning.",
                max_pages=settings.max_pages,
            )

        if self._status_cache:
            return self._status_cache

        if not settings.google_api_key or not self.client:
            self._status_cache = ModelStatus(
                model=self.model,
                mode="gemma-unavailable",
                mock=False,
                vision_enabled=False,
                reasoning_enabled=False,
                message="Live Gemma mode was requested, but GOOGLE_API_KEY is missing.",
                error="Missing GOOGLE_API_KEY in backend/.env.",
                max_pages=settings.max_pages,
            )
            return self._status_cache

        if "gemma-4" not in self.model.lower():
            self._status_cache = ModelStatus(
                model=self.model,
                mode="gemma-unavailable",
                mock=False,
                vision_enabled=False,
                reasoning_enabled=False,
                message="Live mode requires a Gemma 4 model for this challenge demo.",
                error=f"Configured model is {self.model}, not a Gemma 4 model.",
                max_pages=settings.max_pages,
            )
            return self._status_cache

        if not validate:
            return ModelStatus(
                model=self.model,
                mode="gemma-configured",
                mock=False,
                vision_enabled=False,
                reasoning_enabled=False,
                message="Gemma 4 is configured but not validated yet. Use Check Gemma or run an extraction to verify access.",
                max_pages=settings.max_pages,
            )

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents="Reply with OK if this Gemma 4 model is available.",
                config=types.GenerateContentConfig(temperature=0),
            )
            if not (response.text or "").strip():
                raise GemmaUnavailableError("Gemma returned an empty validation response.")
            self._status_cache = ModelStatus(
                model=self.model,
                mode="live-gemma",
                mock=False,
                vision_enabled=True,
                reasoning_enabled=True,
                message="Live Gemma 4 is connected for page-image table extraction and open-ended table Q&A.",
                max_pages=settings.max_pages,
            )
        except Exception as exc:
            self._status_cache = ModelStatus(
                model=self.model,
                mode="gemma-unavailable",
                mock=False,
                vision_enabled=False,
                reasoning_enabled=False,
                message="Live Gemma mode was requested, but the configured model could not be reached.",
                error=self._friendly_error(exc),
                max_pages=settings.max_pages,
            )
        return self._status_cache

    def require_live_model(self) -> None:
        status = self.model_status(validate=True)
        if status.mode != "live-gemma":
            raise GemmaUnavailableError(status.error or status.message)

    async def extract_tables(
        self,
        *,
        page_number: int,
        image_bytes: bytes,
        text_preview: str,
    ) -> tuple[list[ExtractedTable], list[str]]:
        if self.mock:
            return self._mock_extract(page_number, text_preview)
        self.require_live_model()

        prompt = (
            "You are TableProof, a careful document table auditor. Extract every visible table "
            "from this PDF page image. Preserve row order, units, footnote clues, empty cells, "
            "and uncertainty. Return strict JSON matching the schema. Mark low-confidence cells "
            "instead of guessing."
            f"\n\nPage number: {page_number}\nBaseline extracted text:\n{text_preview[:6000]}"
        )
        image_part = types.Part.from_bytes(data=image_bytes, mime_type="image/png")
        last_raw = ""
        last_error = ""
        for attempt in range(2):
            try:
                active_prompt = prompt if attempt == 0 else self._repair_prompt(page_number, last_raw, last_error)
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=[active_prompt, image_part],
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=TABLE_SCHEMA,
                        temperature=0.1,
                    ),
                )
                last_raw = response.text or ""
                return self._parse_tables_payload(last_raw, page_number)
            except (json.JSONDecodeError, ValidationError, KeyError, TypeError, ValueError) as exc:
                last_error = str(exc)
            except Exception as exc:
                raise GemmaUnavailableError(self._friendly_error(exc)) from exc
        raise GemmaResponseError(f"Gemma returned table JSON that could not be validated for page {page_number}: {last_error}")

    async def answer_question(self, question: str, tables: list[ExtractedTable]) -> tuple[str, list[str]]:
        context = "\n\n".join(table.model_dump_json() for table in tables)
        if self.mock:
            return self._mock_answer(question, tables)
        self.require_live_model()

        prompt = (
            "Answer the user's question using only the extracted tables. Return JSON with an answer "
            "and citations. Citations must use table ids and pages, for example page-2-table-1 p.2. "
            "If the tables do not contain the answer, say what is missing and cite the nearest relevant table."
            f"\n\nQuestion: {question}\n\nTables JSON:\n{context[:180000]}"
        )
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=ANSWER_SCHEMA,
                    temperature=0.2,
                ),
            )
            payload = self._load_json_object(response.text or "{}")
            answer = str(payload.get("answer") or "No answer returned by Gemma.")
            citations = [str(item) for item in payload.get("citations", []) if str(item).strip()]
            if not citations:
                citations = [f"{table.id} p.{table.page}" for table in tables[:3]]
            return answer, citations
        except (json.JSONDecodeError, TypeError, ValueError) as exc:
            raise GemmaResponseError(f"Gemma returned answer JSON that could not be parsed: {exc}") from exc
        except Exception as exc:
            raise GemmaUnavailableError(self._friendly_error(exc)) from exc

    def _mock_extract(self, page_number: int, text_preview: str) -> tuple[list[ExtractedTable], list[str]]:
        return [], [
            "Mock Gemma mode is active. Text-based table extraction is used locally; set GOOGLE_API_KEY and USE_MOCK_GEMMA=false for live Gemma 4 vision extraction."
        ]

    def _mock_answer(self, question: str, tables: list[ExtractedTable]) -> tuple[str, list[str]]:
        citations = [f"{table.id} p.{table.page}" for table in tables[:2]]
        question_lower = question.lower()
        wants_lowest = any(word in question_lower for word in ["lowest", "least", "minimum", "min", "smallest"])
        wants_highest = any(word in question_lower for word in ["highest", "most", "maximum", "max", "largest"])
        metric_hints = [
            "revenue",
            "cost",
            "margin",
            "profit",
            "sales",
            "tickets",
            "total",
            "income",
            "expense",
            "growth",
        ]
        requested_metric = next((hint for hint in metric_hints if hint in question_lower), None)

        for table in tables:
            for row in table.rows:
                label = row[0].value.lower() if row else ""
                if requested_metric and requested_metric not in label:
                    continue
                values = [
                    (table.headers[index], cell.value, self._numeric_value(cell.value))
                    for index, cell in enumerate(row[1:], start=1)
                    if index < len(table.headers)
                ]
                numeric_values = [value for value in values if value[2] is not None]
                if not numeric_values:
                    continue
                if wants_lowest:
                    header, raw_value, _ = min(numeric_values, key=lambda value: value[2] or 0)
                    return f"The lowest listed {row[0].value} is {raw_value} in {header}.", [f"{table.id} p.{table.page}"]
                if wants_highest:
                    header, raw_value, _ = max(numeric_values, key=lambda value: value[2] or 0)
                    return f"The highest listed {row[0].value} is {raw_value} in {header}.", [f"{table.id} p.{table.page}"]

        return (
            "I could not answer that from the local mock table parser. Try asking for the highest or lowest value of a visible row, or enable live Gemma 4 mode for broader reasoning.",
            citations,
        )

    @staticmethod
    def _numeric_value(value: str) -> float | None:
        match = re.search(r"-?\d[\d,]*(?:\.\d+)?", value)
        if not match:
            return None
        number = float(match.group(0).replace(",", ""))
        lowered = value.lower()
        if "b" in lowered:
            number *= 1_000_000_000
        elif "m" in lowered:
            number *= 1_000_000
        elif "k" in lowered:
            number *= 1_000
        return number

    def _parse_tables_payload(self, raw: str, page_number: int) -> tuple[list[ExtractedTable], list[str]]:
        payload = self._load_json_object(raw)
        raw_tables = payload.get("tables", [])
        if not isinstance(raw_tables, list):
            raise ValueError("tables must be a list")
        tables = []
        for index, table in enumerate(raw_tables, start=1):
            validated = ExtractedTable.model_validate(table)
            tables.append(
                validated.model_copy(
                    update={
                        "id": validated.id or f"page-{page_number}-table-{index}",
                        "page": page_number,
                    }
                )
            )
        warnings = payload.get("warnings", [])
        if not isinstance(warnings, list):
            warnings = [str(warnings)]
        return tables, [str(warning) for warning in warnings if str(warning).strip()]

    @staticmethod
    def _load_json_object(raw: str) -> dict[str, Any]:
        raw = raw.strip()
        if not raw:
            raise json.JSONDecodeError("empty response", raw, 0)
        if raw.startswith("```"):
            raw = re.sub(r"^```(?:json)?", "", raw).strip()
            raw = re.sub(r"```$", "", raw).strip()
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", raw, re.DOTALL)
            if not match:
                raise
            payload = json.loads(match.group(0))
        if not isinstance(payload, dict):
            raise ValueError("Gemma response must be a JSON object")
        return payload

    @staticmethod
    def _repair_prompt(page_number: int, raw: str, error: str) -> str:
        return (
            "Repair this table extraction response into valid strict JSON for TableProof. "
            "Return only a JSON object with keys tables and warnings. Preserve the visual facts; "
            "do not invent values. Each table needs id, title, page, headers, rows, confidence, "
            "and warnings. Each cell needs value and confidence."
            f"\n\nPage number: {page_number}\nValidation error:\n{error}\n\nBroken response:\n{raw[:12000]}"
        )

    @staticmethod
    def _friendly_error(exc: Exception) -> str:
        message = str(exc).strip() or exc.__class__.__name__
        lower = message.lower()
        if "api key" in lower or "permission" in lower or "unauthenticated" in lower:
            return "Gemma 4 authentication failed. Check GOOGLE_API_KEY in backend/.env."
        if "not found" in lower or "404" in lower:
            return f"Gemma 4 model {settings.gemma_model} was not found or is not enabled for this key."
        if "quota" in lower or "rate" in lower or "429" in lower:
            return "Gemma 4 quota or rate limit was reached. Wait, raise quota, or use fewer pages."
        if "internal error" in lower or "500" in lower or "internal" in lower:
            return f"Google returned an internal error for {settings.gemma_model}. This is usually transient or model-access related; retry later or confirm the model is enabled for the key."
        return message


def image_to_data_url(image_bytes: bytes) -> str:
    return "data:image/png;base64," + base64.b64encode(image_bytes).decode("utf-8")
