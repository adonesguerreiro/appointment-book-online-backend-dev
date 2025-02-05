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
	if (err instanceof yup.ValidationError) {
		const errorResponse: ErrorResponse = {
			errors: err.inner.map((error) => ({
				path: error.path,
				message: error.message,
			})),
		};
		return res.status(400).json(errorResponse);
	} else {
		console.error(err);
		return res.status(500).json({ message: "Internal server error" });
	}
}
