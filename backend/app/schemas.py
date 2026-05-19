from pydantic import BaseModel, Field


class TableCell(BaseModel):
    value: str
    confidence: float = Field(ge=0, le=1)
    source_text: str | None = None
    warning: str | None = None


class ExtractedTable(BaseModel):
    id: str
    title: str
    page: int
    headers: list[str]
    rows: list[list[TableCell]]
    units: str | None = None
    confidence: float = Field(ge=0, le=1)
    warnings: list[str] = Field(default_factory=list)


class PageFinding(BaseModel):
    page: int
    has_tables: bool
    text_preview: str
    image_b64: str | None = None


class PageScan(BaseModel):
    page: int
    status: str
    tables_found: int
    detail: str


class ExtractionResult(BaseModel):
    file_name: str
    model: str
    mode: str
    pages_scanned: int
    tables: list[ExtractedTable]
    pages: list[PageScan] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class ChatRequest(BaseModel):
    question: str
    tables: list[ExtractedTable]


class ChatResponse(BaseModel):
    answer: str
    citations: list[str]


class ModelStatus(BaseModel):
    model: str
    mode: str
    mock: bool
    vision_enabled: bool
    reasoning_enabled: bool
    message: str
    error: str | None = None
    max_pages: int


class DemoDoc(BaseModel):
    id: str
    title: str
    file_name: str
    description: str
    source_url: str | None = None
