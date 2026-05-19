export type TableCell = {
  value: string;
  confidence: number;
  source_text?: string | null;
  warning?: string | null;
};

export type ExtractedTable = {
  id: string;
  title: string;
  page: number;
  headers: string[];
  rows: TableCell[][];
  units?: string | null;
  confidence: number;
  warnings: string[];
};

export type PageScan = {
  page: number;
  status: string;
  tables_found: number;
  detail: string;
};

export type ExtractionResult = {
  file_name: string;
  model: string;
  mode: "mock" | "gemma-api";
  pages_scanned: number;
  tables: ExtractedTable[];
  pages: PageScan[];
  warnings: string[];
};

export type ChatResponse = {
  answer: string;
  citations: string[];
};

export type ModelStatus = {
  model: string;
  mode: "local-parser" | "gemma-configured" | "live-gemma" | "gemma-unavailable";
  mock: boolean;
  vision_enabled: boolean;
  reasoning_enabled: boolean;
  message: string;
  error?: string | null;
  max_pages: number;
};

export type DemoDoc = {
  id: string;
  title: string;
  file_name: string;
  description: string;
  source_url?: string | null;
};
