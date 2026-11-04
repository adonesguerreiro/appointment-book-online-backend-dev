import { Request, Response } from "express";
import * as availabilityBusinessService from "./availability.business-service";
import { ApiError } from "../../utils/apiError";

export const getAvailableSlotsForDate = async (req: Request, res: Response) => {
	const { date } = req.params;
	const companyId = Number(req.companyId);
	const excludeScheduleId = req.query.excludeScheduleId
		? Number(req.query.excludeScheduleId)
		: undefined;

	try {
		const slots = await availabilityBusinessService.getAvailableSlotsForDate(
			companyId,
			date,
			excludeScheduleId,
		);

		res.send({ slots });
	} catch (err) {
		if (err instanceof ApiError) {
			return res.status(err.statusCode).json({ message: err.message });
		}
		return res.status(500).json({ error: "Internal server error" });
	}
};
