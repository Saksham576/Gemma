# TableProof: Fixing Broken PDF Tables With Gemma 4 Vision and Long Context

## What I Built

TableProof is a local-first PDF table auditor. You upload a messy PDF, and the app reconstructs tables, marks uncertain cells, cites the source page, and exports clean CSV or JSON.

The problem I focused on is simple: a lot of document AI and RAG workflows fail because PDF parsing is bad before retrieval even begins. Tables get flattened into paragraphs, units disappear, scanned reports lose structure, and users cannot tell which values are trustworthy.

TableProof treats Gemma 4 as a careful table reviewer. It reads rendered PDF page images, compares them with baseline extracted text, and returns strict structured data with confidence and review warnings.

## Demo

Demo flow:

1. Confirm the status panel says Live Gemma mode.
2. Run the generated sample PDF as a fast smoke test.
3. Run the Census QFR or IRS tax table public PDF.
4. View the extracted table and page scan report.
5. Inspect confidence scores and review flags.
6. Export CSV or JSON from the visible table.
7. Ask open-ended questions over the extracted tables with citations.

Demo checklist:

- Live Gemma status is green before recording.
- Uploaded/demo PDF name matches the extracted result.
- Page scan chips show how many tables were found per scanned page.
- CSV and JSON exports match the selected table.
- The answer panel cites table id and page.

Suggested recording script:

> I am starting with a PDF that contains a table ordinary text parsers can easily damage. TableProof renders the page as an image and asks Gemma 4 to reconstruct the table as strict JSON. The app does not just show values; it marks confidence, keeps units, cites the page, and flags cells that need human review. I can export the result or ask a question over the extracted table.

Public PDFs used for demo testing:

- Census QFR: `https://www2.census.gov/econ/qfr/pubs/qfr22q1.pdf`
- IRS tax table: `https://www.irs.gov/pub/irs-prior/i1040tt--2005.pdf`

## Code

Repository link:

```text
TODO: add GitHub repo URL
```

Important files:

- `backend/app/gemma_adapter.py`: Gemma 4 prompt, JSON schema, API call, mock mode.
- `backend/app/pdf_service.py`: PDF rendering and baseline text extraction.
- `frontend/src/main.tsx`: upload, extraction, exports, and table Q&A UI.

## How I Used Gemma 4

I used Gemma 4 as the central reasoning and extraction layer, not just as a chat interface.

The backend sends each PDF page as an image, along with baseline text extracted by `pdfplumber`. Gemma 4 is prompted to act as a careful document table auditor and return strict JSON:

- table title
- source page
- headers
- rows
- units
- cell confidence
- cell warnings
- overall table confidence

The app is designed for `gemma-4-26b-a4b-it` because it balances strong reasoning, multimodal input, and long context. For a local-first variant, the same adapter can point at smaller Gemma 4 models through a local runtime.

This is useful because table extraction needs more than OCR. The model has to understand visual layout, preserve row and column relationships, avoid guessing, and explain uncertainty.

## What I Would Add Next

- Side-by-side page image with clickable extracted cells.
- Batch folder processing.
- Automatic comparison between multiple extraction engines.
- A local model profile for laptops.
- Human approval workflow before tables enter a RAG index.
