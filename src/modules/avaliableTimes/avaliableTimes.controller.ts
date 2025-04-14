import { Request, Response } from "express";
import * as avaliableTimesBusinessServices from "./avaliableTimes.business-services";
import { avaliableSchema } from "../../schemas/avaliableSchema";
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

		const avaliableTime =
			await avaliableTimesBusinessServices.getAllAvaliableTimesByCompany(
				page,
				limit,
				Number(req.companyId),
				req.query.date as string
			);

		if (!avaliableTime) {
			throw new Error("AvaliableTime not found");
		}

		res.send(avaliableTime);
	} catch (err) {
		res.status(500).json({ error: err });
	}
};

export const getAvaliableTimeById = async (req: Request, res: Response) => {
	try {
		const avaliableTime =
			await avaliableTimesBusinessServices.getAvaliableTimeById(
				Number(req.params.id),
				Number(req.companyId)
			);
		if (!avaliableTime) {
			throw new Error("AvaliableTime not found");
		}
		res.send(avaliableTime);
	} catch (err) {
		res.status(500).json({ error: err });
	}
};

export const createAvaliableTime = async (req: Request, res: Response) => {
	const { day, period, startTime, endTime, interval } = req.body;

	try {
		await avaliableSchema.validate(req.body, { abortEarly: false });

		const avaliableCreated =
			await avaliableTimesBusinessServices.createAvaliableTime({
				day,
				period,
				startTime,
				endTime,
				interval,
				companyId: Number(req.companyId),
			});

		if (!avaliableCreated) {
			throw new Error("AvaliableTime not found");
		}

		res.send({
			avaliableCreated,
			avaliableTimeSlotCreated: avaliableCreated,
		});
	} catch (err) {
		const yupHandled = handleYupError(err, res);
		if (yupHandled) return;

		res.status(500).json({ error: err });
	}
};

export const updateAvaliableTime = async (req: Request, res: Response) => {
	const { id } = req.params;
	const { day, period, startTime, endTime, interval } = req.body;

	try {
		await avaliableSchema.validate(req.body, { abortEarly: false });

		const avaliableTime =
			await avaliableTimesBusinessServices.updateAvaliableTime(Number(id), {
				day,
				period,
				startTime,
				endTime,
				interval,
				companyId: Number(req.companyId),
			});

		if (!avaliableTime) {
			throw new Error("AvaliableTime not found");
		}

		res.send(avaliableTime);
	} catch (err) {
		const yupHandled = handleYupError(err, res);
		if (yupHandled) return;

		res.status(500).json({ error: err });
	}
};

export const deleteAvaliableTime = async (req: Request, res: Response) => {
	try {
		const avaliableTime =
			await avaliableTimesBusinessServices.deleteAvaliableTime(
				Number(req.params.id),
				Number(req.companyId)
			);
		if (!avaliableTime) {
			throw new Error("AvaliableTime not found");
		}
		res.send(avaliableTime);
	} catch (err) {
		const yupHandled = handleYupError(err, res);
		if (yupHandled) return;

		res.status(500).json({ error: err });
	}
};
