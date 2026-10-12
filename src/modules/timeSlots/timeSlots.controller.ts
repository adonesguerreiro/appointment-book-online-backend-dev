import { DayWeek } from "@prisma/client";
import { findTimeSlotsByDayAndCompanyId } from "./timeSlots.services";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/apiError";
import { dateConvertDay } from "../../utils/dateConvertDay";
import { Request, Response } from "express";

export const getTimeSlotsByDayAndCompanyId = async (
	req: Request,
	res: Response,
) => {
	const { date } = req.params;
	const companyId = Number(req.companyId);

	const convertDateDay = await dateConvertDay(date as string);
	const day = convertDateDay as DayWeek;

	const page = Math.max(1, parseInt(req.query.page as string) || 1);
	const limit = Math.min(
		100,
		Math.max(1, parseInt(req.query.limit as string) || 10),
	);
	const skip = (page - 1) * limit;

	const totalItems = await prisma.avaliableTime.count({
		where: { companyId },
	});

	const totalPages = Math.ceil(totalItems / limit);

	try {
		const timeSlots = await findTimeSlotsByDayAndCompanyId(
			Number(req.companyId),
			day,
			skip,
			limit,
		);

		res.send({ timeSlots: timeSlots, totalPages, currentPage: page });
	} catch (err) {
		if (err instanceof ApiError) {
			return res.status(err.statusCode).json({ err });
		}
		return res.status(500).json({ error: "Internal server error" });
	}
};
