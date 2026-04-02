import { DayWeek } from "../../../prisma/generated/client/enums";
import { prisma } from "../../config/prisma";

export const findTimeSlotsByDayAndCompanyId = async (
	companyId: number,
	day: DayWeek,
	skip: number,
	limit: number,
) => {
	return await prisma.avaliableTime.findMany({
		where: {
			companyId,
			...(day && { day: day as DayWeek }),
			deletedAt: null,
		},
		include: {
			avaliableTimeSlot: {
				orderBy: {
					timeSlot: "asc",
				},
			},
		},
		skip: skip,
		take: limit,
	});
};
