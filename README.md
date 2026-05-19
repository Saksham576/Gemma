# TableProof

TableProof is a Gemma 4 powered PDF table auditor for messy reports, invoices, benchmark PDFs, and financial statements.

It turns page images into structured tables, marks uncertain cells, cites the source page, and exports CSV or JSON. The app is built for the DEV Gemma 4 Challenge as a local-first document intelligence demo.

## Why This Exists

RAG and document search often fail before retrieval starts because PDF table extraction is weak. Tables get flattened, scanned pages lose structure, units disappear, and users do not know which values are safe to trust.

TableProof uses Gemma 4 as a visual table reconstruction and verification layer:

- Render PDF pages to images.
- Send page image plus baseline text to Gemma 4.
- Request strict JSON with headers, rows, confidence, units, warnings, and page citation.
- Show review flags before export.

## Stack

- Frontend: React, Vite, TypeScript
- Backend: FastAPI, PyMuPDF, pdfplumber, Pydantic
- Model adapter: Google GenAI SDK for Gemma 4, with a mock mode for local demos

## Run

```bash
npm run setup
npm run dev
```

Frontend: http://localhost:5173

Backend: http://localhost:8000

## Use Live Gemma 4

Create `backend/.env` from `backend/.env.example`:

```bash
GOOGLE_API_KEY=your_google_ai_studio_key
USE_MOCK_GEMMA=false
GEMMA_MODEL=gemma-4-26b-a4b-it
MAX_PAGES=6
```

Restart `npm run dev` after changing env vars.

The app defaults to mock mode so the demo is still runnable without credentials. In mock mode, uploaded PDFs are analyzed with the local text/table parser instead of Gemma 4 vision. This works for text-based PDFs with extractable tables, but scanned/image-only PDFs need live Gemma 4 mode.

Live Gemma mode is the intended challenge demo:

- Gemma 4 receives rendered PDF page images.
- Gemma 4 detects and reconstructs tables from visual layout.
- Gemma 4 returns strict JSON with confidence and warnings.
- Gemma 4 answers flexible questions over the extracted tables.

Local parser mode is only a fallback for development.

## Demo Flow

1. Click a bundled demo PDF.
2. Inspect the extracted table.
3. Notice cell-level confidence and review flags.
4. Export CSV or JSON.
5. Ask: `Which quarter had the highest revenue?`, `Which value is lowest?`, or `Summarize this table with citations.`

Bundled demo PDFs:

- Generated quarterly report: fast local smoke test.
- Census QFR financial report: public dense financial tables.
- IRS 2005 tax table: public dense tax table rows and ranges.

Live Gemma mode should be used for the final recording. Local parser mode is useful only for development checks.

## Challenge Notes

Recommended submission track: `Build With Gemma 4`.

Tags:

```text
devchallenge gemmachallenge gemma
```

The challenge post should emphasize that Gemma 4 is not used as a generic chatbot. It is the core structured extraction and reasoning layer for table reconstruction, confidence marking, and cited answers.
