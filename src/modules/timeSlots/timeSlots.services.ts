import { DayWeek } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const findTimeSlotsByDayAndCompanyId = async (
	companyId: number,
	day: DayWeek,
	skip: number,
	limit: number,
) => {
	return await prisma.avaliableTimeSlot.findMany({
		select: {
			id: true,
			timeSlot: true,
		},
		where: {
			companyId,
			avaliableTime: {
				day,
			},
		},
		skip,
		take: limit,
		orderBy: {
			timeSlot: "asc",
		},
	});
};
