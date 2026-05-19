import type { ChatResponse, DemoDoc, ExtractedTable, ExtractionResult, ModelStatus } from "./types";

async function readError(response: Response): Promise<string> {
  const text = await response.text();
  try {
    const payload = JSON.parse(text);
    if (typeof payload.detail === "string") return payload.detail;
    return JSON.stringify(payload.detail ?? payload);
  } catch {
    return text || `${response.status} ${response.statusText}`;
  }
}

export async function extractPdf(file: File): Promise<ExtractionResult> {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch("/api/extract", { method: "POST", body });
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  return response.json();
}

export async function fetchSamplePdf(): Promise<File> {
  const response = await fetch("/api/sample.pdf");
  const blob = await response.blob();
  return new File([blob], "messy-quarterly-report.pdf", { type: "application/pdf" });
}

export async function askTables(question: string, tables: ExtractedTable[]): Promise<ChatResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, tables }),
  });
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  return response.json();
}

export async function getModelStatus(validate = false): Promise<ModelStatus> {
  const response = await fetch(`/api/model-status${validate ? "?validate=true" : ""}`);
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  return response.json();
}

export async function getDemoDocs(): Promise<DemoDoc[]> {
  const response = await fetch("/api/demo-docs");
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  return response.json();
}

export async function fetchDemoPdf(doc: DemoDoc): Promise<File> {
  const response = await fetch(`/api/demo-docs/${doc.id}.pdf`);
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  const blob = await response.blob();
  return new File([blob], doc.file_name, { type: "application/pdf" });
}
