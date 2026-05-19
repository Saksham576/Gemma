import io
from pathlib import Path

import fitz
import pdfplumber

from .config import settings
from .gemma_adapter import GemmaAdapter
from .schemas import ExtractedTable, ExtractionResult, PageScan, TableCell


class PdfProcessingError(ValueError):
    pass


class PdfService:
    def __init__(self, adapter: GemmaAdapter) -> None:
        self.adapter = adapter

    async def extract(self, file_name: str, content: bytes) -> ExtractionResult:
        pages = self._render_pages(content)
        text_by_page, native_tables_by_page = self._extract_text_and_tables(content)
        all_tables = []
        page_scans = []
        warnings = []

        for page_number, image_bytes in pages:
            text_preview = text_by_page.get(page_number, "")
            native_tables = native_tables_by_page.get(page_number, [])
            if self.adapter.mock and native_tables:
                tables = self._native_tables_to_result(page_number, native_tables)
                page_warnings = [
                    "Mock mode used pdfplumber table extraction for this uploaded PDF. Enable live Gemma 4 for image-based table understanding."
                ]
            else:
                tables, page_warnings = await self.adapter.extract_tables(
                    page_number=page_number,
                    image_bytes=image_bytes,
                    text_preview=text_preview,
                )
            all_tables.extend(tables)
            warnings.extend(page_warnings)
            page_scans.append(
                PageScan(
                    page=page_number,
                    status="tables-found" if tables else "no-tables",
                    tables_found=len(tables),
                    detail=(
                        f"Found {len(tables)} table(s) on page {page_number}."
                        if tables
                        else f"No extractable tables found on page {page_number}."
                    ),
                )
            )

        return ExtractionResult(
            file_name=file_name,
            model=self.adapter.model,
            mode="mock" if self.adapter.mock else "gemma-api",
            pages_scanned=len(pages),
            tables=all_tables,
            pages=page_scans,
            warnings=sorted(set(warnings)),
        )

    def _render_pages(self, content: bytes) -> list[tuple[int, bytes]]:
        try:
            document = fitz.open(stream=content, filetype="pdf")
            rendered = []
            for index, page in enumerate(document[: settings.max_pages]):
                pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
                rendered.append((index + 1, pixmap.tobytes("png")))
            document.close()
        except Exception as exc:
            raise PdfProcessingError("Could not open or render this PDF. Please upload a valid PDF file.") from exc
        if not rendered:
            raise PdfProcessingError("This PDF has no pages to scan.")
        return rendered

    def _extract_text_and_tables(self, content: bytes) -> tuple[dict[int, str], dict[int, list[list[list[str]]]]]:
        text: dict[int, str] = {}
        tables: dict[int, list[list[list[str]]]] = {}
        try:
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                for index, page in enumerate(pdf.pages[: settings.max_pages]):
                    page_number = index + 1
                    text[page_number] = page.extract_text(x_tolerance=1, y_tolerance=3) or ""
                    extracted = page.extract_tables() or []
                    cleaned = []
                    for table in extracted:
                        rows = [[self._clean_cell(cell) for cell in row] for row in table if row]
                        rows = [row for row in rows if any(cell for cell in row)]
                        if len(rows) >= 2 and len(rows[0]) >= 2:
                            cleaned.append(rows)
                    tables[page_number] = cleaned
        except Exception:
            for page_number in range(1, settings.max_pages + 1):
                text.setdefault(page_number, "")
                tables.setdefault(page_number, [])
        return text, tables

    def _native_tables_to_result(self, page_number: int, tables: list[list[list[str]]]) -> list[ExtractedTable]:
        results = []
        for table_index, table in enumerate(tables, start=1):
            width = max(len(row) for row in table)
            padded = [row + [""] * (width - len(row)) for row in table]
            headers = [cell or f"Column {index}" for index, cell in enumerate(padded[0], start=1)]
            rows = [
                [
                    TableCell(
                        value=cell,
                        confidence=0.82 if cell else 0.62,
                        source_text=cell or None,
                        warning=None if cell else "Empty cell found by local parser",
                    )
                    for cell in row
                ]
                for row in padded[1:]
            ]
            results.append(
                ExtractedTable(
                    id=f"page-{page_number}-table-{table_index}",
                    title=f"Extracted table {table_index}",
                    page=page_number,
                    headers=headers,
                    rows=rows,
                    confidence=0.82,
                    warnings=[
                        "This table came from the local PDF parser because live Gemma 4 mode is not enabled."
                    ],
                )
            )
        return results

    @staticmethod
    def _clean_cell(value: object) -> str:
        if value is None:
            return ""
        return " ".join(str(value).replace("\n", " ").split())


def read_sample_pdf() -> bytes:
    sample = Path(__file__).resolve().parents[2] / "samples" / "messy-quarterly-report.pdf"
    return sample.read_bytes()
