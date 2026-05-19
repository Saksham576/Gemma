from pathlib import Path

from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from .demo_pdf import create_demo_pdf
from .gemma_adapter import GemmaAdapter, GemmaResponseError, GemmaUnavailableError
from .pdf_service import PdfProcessingError, PdfService, read_sample_pdf
from .schemas import ChatRequest, ChatResponse, DemoDoc, ExtractionResult, ModelStatus

app = FastAPI(title="TableProof API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

adapter = GemmaAdapter()
service = PdfService(adapter)
ROOT = Path(__file__).resolve().parents[2]

DEMO_DOCS = [
    DemoDoc(
        id="sample",
        title="Generated quarterly report",
        file_name="messy-quarterly-report.pdf",
        description="Small synthetic table for fast smoke tests.",
    ),
    DemoDoc(
        id="census-qfr",
        title="Census Quarterly Financial Report",
        file_name="census-qfr22q1.pdf",
        description="Public financial report with dense government tables.",
        source_url="https://www2.census.gov/econ/qfr/pubs/qfr22q1.pdf",
    ),
    DemoDoc(
        id="irs-tax-table",
        title="IRS 2005 tax table",
        file_name="irs-tax-table-2005.pdf",
        description="Public dense tax table PDF for row and range questions.",
        source_url="https://www.irs.gov/pub/irs-prior/i1040tt--2005.pdf",
    ),
]


@app.get("/health")
async def health() -> dict[str, str | bool]:
    return {"ok": True, "model": adapter.model, "mock": adapter.mock}


@app.get("/model-status", response_model=ModelStatus)
async def model_status(validate: bool = Query(default=False)) -> ModelStatus:
    return adapter.model_status(validate=validate)


@app.get("/demo-docs", response_model=list[DemoDoc])
async def demo_docs() -> list[DemoDoc]:
    return DEMO_DOCS


@app.get("/sample.pdf")
async def sample_pdf() -> Response:
    try:
        content = read_sample_pdf()
    except FileNotFoundError:
        from pathlib import Path

        path = Path(__file__).resolve().parents[2] / "samples" / "messy-quarterly-report.pdf"
        create_demo_pdf(path)
        content = path.read_bytes()
    return Response(content=content, media_type="application/pdf")


@app.get("/demo-docs/{doc_id}.pdf")
async def demo_doc_pdf(doc_id: str) -> Response:
    doc = next((item for item in DEMO_DOCS if item.id == doc_id), None)
    if not doc:
        raise HTTPException(status_code=404, detail="Unknown demo document.")
    if doc.id == "sample":
        return await sample_pdf()
    path = ROOT / "samples" / doc.file_name
    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"{doc.file_name} is missing. Download the public test corpus before running this demo document.",
        )
    return Response(content=path.read_bytes(), media_type="application/pdf")


@app.post("/extract", response_model=ExtractionResult)
async def extract(file: UploadFile = File(...)) -> ExtractionResult:
    if file.content_type not in {"application/pdf", "application/octet-stream"}:
        raise HTTPException(status_code=400, detail="Upload a PDF file.")
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="The uploaded PDF is empty.")
    try:
        return await service.extract(file.filename or "uploaded.pdf", content)
    except PdfProcessingError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except GemmaUnavailableError as exc:
        raise HTTPException(status_code=503, detail=f"Gemma 4 unavailable: {exc}") from exc
    except GemmaResponseError as exc:
        raise HTTPException(status_code=502, detail=f"Gemma 4 response could not be used: {exc}") from exc


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    try:
        answer, citations = await adapter.answer_question(request.question, request.tables)
        return ChatResponse(answer=answer, citations=citations)
    except GemmaUnavailableError as exc:
        raise HTTPException(status_code=503, detail=f"Gemma 4 unavailable: {exc}") from exc
    except GemmaResponseError as exc:
        raise HTTPException(status_code=502, detail=f"Gemma 4 response could not be used: {exc}") from exc
