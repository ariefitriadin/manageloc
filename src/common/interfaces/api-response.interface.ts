export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

export interface ApiErrorResponse extends ApiResponse {
  error?: string;
}
