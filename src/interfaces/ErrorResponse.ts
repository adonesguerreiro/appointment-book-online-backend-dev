export interface ErrorResponse {
	errors: { path?: string; message: string }[];
}
