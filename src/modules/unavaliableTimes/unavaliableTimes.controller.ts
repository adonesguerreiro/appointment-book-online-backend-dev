import { Request, Response } from "express";
import * as unavaliableTimeBusinessServices from "./unavaliableTimes.bussiness-services";
import { unavaliableSchema } from "../../schemas/unavaliableSchema";
import { handleYupError } from "../../utils/handleYupError";

export const getAllAvaliableTimesByCompanyId = async (
	req: Request,
	res: Response
) => {
	try {
		const page = Math.max(1, parseInt(req.query.page as string) || 1);
		const limit = Math.min(
			100,
			Math.max(1, parseInt(req.query.limit as string) || 10)
		);

		const unavaliableTimes =
			await unavaliableTimeBusinessServices.getAllUnavaliableTimesByCompany(
				page,
				limit,
				Number(req.companyId)
			);

		if (!unavaliableTimes) {
			throw new Error("AvaliableTime not found");
		}

		res.send(unavaliableTimes);
	} catch (err) {
		res.status(500).json({ error: err });
	}
};

export const getUnavaliableTimeById = async (req: Request, res: Response) => {
	try {
		const unavaliableTime =
			await unavaliableTimeBusinessServices.getAvaliableTimeById(
				Number(req.params.id),
				Number(req.companyId)
			);
		if (!unavaliableTime) {
			throw new Error("AvaliableTime not found");
		}
		res.send(unavaliableTime);
	} catch (err) {
		res.status(500).json({ error: err });
	}
};

export const createUnavaliableTime = async (req: Request, res: Response) => {
	const { date, startTime, endTime } = req.body;
	try {
		await unavaliableSchema.validate(req.body, { abortEarly: false });

		const unavaliableTime =
			await unavaliableTimeBusinessServices.createUnavaliableTime({
				date,
				startTime,
				endTime,
				companyId: Number(req.companyId),
			});

		if (!unavaliableTime) {
			throw new Error("UnavaliableTime not found");
		}

		res.send(unavaliableTime);
	} catch (err) {
		const yupHandled = handleYupError(err, res);
		console.error(err);
		if (yupHandled) return;

		res.status(500).json({ error: err });
	}
};

export const updateUnavaliableTime = async (req: Request, res: Response) => {
	const { id } = req.params;
	const { date, startTime, endTime } = req.body;
	try {
		await unavaliableSchema.validate(req.body, { abortEarly: false });

		const unavaliableTime =
			await unavaliableTimeBusinessServices.updateUnavaliableTime(Number(id), {
				date,
				startTime,
				endTime,
				companyId: Number(req.companyId),
			});

		if (!unavaliableTime) {
			throw new Error("UnavaliableTime not found");
		}

		res.send(unavaliableTime);
	} catch (err) {
		const yupHandled = handleYupError(err, res);
		console.error(err);
		if (yupHandled) return;

		res.status(500).json({ error: err });
	}
};

export const deleteUnavaliableTime = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const unavaliableTime =
			await unavaliableTimeBusinessServices.deleteUnavaliableTime(
				Number(id),
				Number(req.companyId)
			);
		if (!unavaliableTime) {
			throw new Error("UnavaliableTime not found");
		}
		res.send(unavaliableTime);
	} catch (err) {
		res.status(500).json({ error: err });
	}
};
