import * as yup from "yup";
import { Response } from "express";

interface ValidationErrorItem {
	path: string | undefined;
	message: string;
}

interface ErrorResponse {
	errors: ValidationErrorItem[];
}

export function handleYupError(err: unknown, res: Response) {
	if (res.headersSent) {
		console.error("Erro após resposta já enviada:", err);
		return;
	} else if (err instanceof yup.ValidationError) {
		const errorResponse: ErrorResponse = {
			errors: err.inner.map((error) => ({
				path: error.path,
				message: error.message,
			})),
		};
		return res.status(400).json(errorResponse);
	} else if (err instanceof Error) {
		return res.status(400).json({ message: err.message });
	} else {
		return res.status(500).json({ message: "Internal server error" });
	}
}
