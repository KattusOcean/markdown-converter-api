export interface ConvertRequest {
  url: string;
}

export interface ConvertResponse {
  original_url: string;
  markdown: string;
  html: string;
}

export interface ApiErrorResponse {
  error: string;
}
