import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { AlertTriangle, Bot, BrainCircuit, CheckCircle2, Download, FileSearch, Loader2, MessageSquare, ShieldCheck, Upload } from "lucide-react";
import { askTables, extractPdf, fetchDemoPdf, getDemoDocs, getModelStatus } from "./api";
import type { ChatResponse, DemoDoc, ExtractedTable, ExtractionResult, ModelStatus } from "./types";
import "./styles.css";

function confidenceLabel(value: number) {
  if (value >= 0.92) return "High";
  if (value >= 0.78) return "Review";
  return "Low";
}

function toCsv(table: ExtractedTable) {
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
  return [table.headers.map(escape).join(","), ...table.rows.map((row) => row.map((cell) => escape(cell.value)).join(","))].join("\n");
}

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function App() {
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState("Which quarter had the highest revenue?");
  const [chat, setChat] = useState<ChatResponse | null>(null);
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [demoDocs, setDemoDocs] = useState<DemoDoc[]>([]);
  const [extractionStage, setExtractionStage] = useState<string | null>(null);

  useEffect(() => {
    void refreshModelStatus();
    void getDemoDocs().then(setDemoDocs).catch(() => setDemoDocs([]));
  }, []);

  const selectedTable = useMemo(() => {
    if (!result?.tables.length) return null;
    return result.tables.find((table) => table.id === selectedId) ?? result.tables[0];
  }, [result, selectedId]);

  async function runExtraction(file: File) {
    setBusy(true);
    setError(null);
    setChat(null);
    setResult(null);
    setSelectedId(null);
    setExtractionStage(`Uploading ${file.name}`);
    try {
      setExtractionStage(`Scanning up to ${modelStatus?.max_pages ?? 6} page(s)`);
      const extraction = await extractPdf(file);
      setResult(extraction);
      setSelectedId(extraction.tables[0]?.id ?? null);
      setExtractionStage(`Reviewed ${extraction.pages_scanned} page(s)`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Extraction failed.");
      setExtractionStage(null);
      void refreshModelStatus();
    } finally {
      setBusy(false);
    }
  }

  async function runDemoDoc(doc: DemoDoc) {
    setBusy(true);
    setError(null);
    setExtractionStage(`Loading ${doc.title}`);
    try {
      const file = await fetchDemoPdf(doc);
      setBusy(false);
      await runExtraction(file);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Demo PDF could not be loaded.");
      setExtractionStage(null);
      setBusy(false);
    }
  }

  async function askQuestion() {
    if (!result?.tables.length || !question.trim()) return;
    setBusy(true);
    setError(null);
    try {
      setChat(await askTables(question, result.tables));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Question failed.");
    } finally {
      setBusy(false);
    }
  }

  async function refreshModelStatus(validate = false) {
    try {
      setModelStatus(await getModelStatus(validate));
    } catch {
      setModelStatus(null);
    }
  }

  const modeClass = modelStatus?.mode === "live-gemma" ? "live-mode" : modelStatus?.mode === "gemma-unavailable" ? "error-mode" : "muted-mode";
  const modeTitle =
    modelStatus?.mode === "live-gemma"
      ? "Live Gemma mode"
      : modelStatus?.mode === "gemma-unavailable"
        ? "Gemma unavailable"
        : modelStatus?.mode === "gemma-configured"
          ? "Gemma configured"
          : "Local parser mode";

  return (
    <main className="shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">Gemma 4 document intelligence</p>
          <h1>TableProof</h1>
        </div>
        <div className="status">
          <ShieldCheck size={18} />
          <span>{modelStatus ? `${modelStatus.model} · ${modelStatus.mode}` : "checking model"}</span>
        </div>
      </section>

      <section className="workspace">
        <aside className="panel upload-panel">
          <label className="dropzone">
            <Upload size={28} />
            <strong>Upload a PDF</strong>
            <span>Gemma 4 extracts tables from page images, then marks uncertain cells.</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void runExtraction(file);
              }}
            />
          </label>
          <div className="demo-docs">
            <strong>Demo PDFs</strong>
            {demoDocs.map((doc) => (
              <button key={doc.id} onClick={() => void runDemoDoc(doc)} disabled={busy}>
                {busy ? <Loader2 className="spin" size={17} /> : <FileSearch size={17} />}
                <span>{doc.title}</span>
              </button>
            ))}
          </div>
          {extractionStage && (
            <p className="progress-note">
              {busy ? <Loader2 className="spin" size={15} /> : <CheckCircle2 size={15} />}
              {extractionStage}
            </p>
          )}
          {result && (
            <div className="facts">
              <div>
                <span>File</span>
                <strong>{result.file_name}</strong>
              </div>
              <div>
                <span>Pages scanned</span>
                <strong>{result.pages_scanned}</strong>
              </div>
              <div>
                <span>Tables found</span>
                <strong>{result.tables.length}</strong>
              </div>
            </div>
          )}
          {error && <p className="error">{error}</p>}
          {result?.warnings.map((warning) => (
            <p className="warning" key={warning}>
              <AlertTriangle size={15} /> {warning}
            </p>
          ))}
          {modelStatus && (
            <div className={`mode-box ${modeClass}`}>
              <BrainCircuit size={18} />
              <div>
                <strong>{modeTitle}</strong>
                <p>{modelStatus.message}</p>
                {modelStatus.error && <p>{modelStatus.error}</p>}
                {modelStatus.mode === "gemma-configured" && (
                  <button className="inline-check" onClick={() => void refreshModelStatus(true)} disabled={busy}>
                    Check Gemma
                  </button>
                )}
              </div>
            </div>
          )}
        </aside>

        <section className="panel main-panel">
          {!selectedTable ? (
            <div className="empty">
              <Bot size={42} />
              <h2>{result ? "No tables found" : "Ready for a messy table"}</h2>
              <p>
                {result
                  ? "The uploaded PDF was processed, but no tables were detected in the scanned pages. In local parser mode this can happen for scanned or image-only PDFs."
                  : "Start with the bundled sample or upload a public report, statement, invoice, or benchmark PDF."}
              </p>
            </div>
          ) : (
            <>
              <div className="table-toolbar">
                <div>
                  <p className="eyebrow">Page {selectedTable.page}</p>
                  <h2>{selectedTable.title}</h2>
                </div>
                <div className="toolbar-actions">
                  <select value={selectedTable.id} onChange={(event) => setSelectedId(event.target.value)}>
                    {result?.tables.map((table) => (
                      <option value={table.id} key={table.id}>
                        {table.title}
                      </option>
                    ))}
                  </select>
                  <button onClick={() => download(`${selectedTable.id}.csv`, toCsv(selectedTable), "text/csv")}>
                    <Download size={16} /> CSV
                  </button>
                  <button
                    onClick={() =>
                      download(`${selectedTable.id}.json`, JSON.stringify(selectedTable, null, 2), "application/json")
                    }
                  >
                    <Download size={16} /> JSON
                  </button>
                </div>
              </div>

              <div className="trust-row">
                <span className="pill">{confidenceLabel(selectedTable.confidence)} confidence</span>
                {selectedTable.units && <span className="pill muted">{selectedTable.units}</span>}
                <span className="pill muted">Citation: {selectedTable.id} p.{selectedTable.page}</span>
              </div>

              {result?.pages.length ? (
                <div className="page-scans">
                  {result.pages.map((page) => (
                    <span className={page.tables_found ? "page-scan ok" : "page-scan"} key={page.page}>
                      Page {page.page}: {page.tables_found} table(s)
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      {selectedTable.headers.map((header) => (
                        <th key={header}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTable.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={`${rowIndex}-${cellIndex}`} className={cell.warning ? "flagged" : ""}>
                            <span>{cell.value}</span>
                            <small>{Math.round(cell.confidence * 100)}%</small>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedTable.warnings.length > 0 && (
                <div className="review-box">
                  <AlertTriangle size={18} />
                  <div>
                    <strong>Review flags</strong>
                    {selectedTable.warnings.map((warning) => (
                      <p key={warning}>{warning}</p>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        <aside className="panel chat-panel">
          <div className="chat-title">
            <MessageSquare size={18} />
            <h2>Ask the tables</h2>
          </div>
          <textarea value={question} onChange={(event) => setQuestion(event.target.value)} />
          <button className="primary" onClick={askQuestion} disabled={busy || !result?.tables.length}>
            {busy ? <Loader2 className="spin" size={18} /> : <Bot size={18} />}
            {modelStatus?.mode === "live-gemma" ? "Ask Gemma" : "Ask local fallback"}
          </button>
          {modelStatus?.mode !== "live-gemma" && (
            <p className="helper-text">
              Local fallback can answer simple min/max questions from extracted rows. Live Gemma mode is required for flexible reasoning over any detected table.
            </p>
          )}
          {chat && (
            <div className="answer">
              <strong>Answer</strong>
              <p>{chat.answer}</p>
              <span>{chat.citations.join(" · ")}</span>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
