import { AvaliableTimeSlot, DayWeek, Period } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AvailableTimeData } from "../../interfaces/AvailableTimeData";

export const countAllAvaliableTimesByCompanyId = async (companyId: number) => {
	return await prisma.avaliableTime.count({
		where: { companyId },
	});
};

export const findAllAvaliableTimesByCompanyId = async (
	companyId: number,
	skip: number,
	limit: number
) => {
	return await prisma.avaliableTime.findMany({
		where: { companyId, deletedAt: null },
		skip: skip,
		take: limit,
		orderBy: { day: "asc" },
	});
};

export const findAvaliableTimeById = async (id: number, companyId: number) => {
	return await prisma.avaliableTime.findFirst({
		where: { id, companyId, deletedAt: null },
	});
};

export const findAvaliableTimesByDayAndCompanyId = async (
	companyId: number,
	day: DayWeek,
	skip: number,
	limit: number
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

export const findAvaliableTimeByDayAndPeriod = async (
	day: DayWeek,
	period: Period,
	companyId: number
) => {
	return await prisma.avaliableTime.findFirst({
		where: {
			day,
			period,
			companyId,
			deletedAt: null,
		},
	});
};

export const findAvaliableTimeDeleted = async (
	day: DayWeek,
	period: Period,
	companyId: number
) => {
	return await prisma.avaliableTime.findFirst({
		where: {
			day,
			period,
			companyId,
			NOT: {
				deletedAt: null,
			},
		},
	});
};

export const findAvaliableTimeBySchedule = async (
	companyId: number,
	startTime: string,
	endTime: string
) => {
	return await prisma.$queryRaw`
  SELECT *
  FROM "Schedule"
  WHERE
    "companyId" = ${companyId}
    AND (
      "status" = 'SCHEDULED'
      OR "status" = 'ATTENDED'
      OR "status" = 'CANCELLED'
    )
    AND TO_CHAR("date", 'HH24:MI:SS')
      BETWEEN ${startTime} AND ${endTime}
  LIMIT 1;
`;
};

export const createAvaliableTime = async (data: AvailableTimeData) => {
	return await prisma.avaliableTime.create({
		data,
	});
};

export const updateAvaliableTime = async (
	id: number,
	data: AvailableTimeData
) => {
	return await prisma.avaliableTime.update({
		where: { id },
		data,
	});
};

export const createOrUpdateAvaliableTimeSlot = async (
	avaliableTimeSlot: string[],
	avaliableCreated: any,
	companyId: number
) => {
	for (const time of avaliableTimeSlot) {
		await prisma.avaliableTimeSlot.upsert({
			where: {
				timeSlot_avaliableTimeId_companyId: {
					timeSlot: time,
					avaliableTimeId: Number(avaliableCreated.id),
					companyId,
				},
			},
			update: {
				timeSlot: time,
			},
			create: {
				timeSlot: time,
				avaliableTimeId: Number(avaliableCreated.id),
				companyId,
				updatedAt: new Date(),
			},
		});
	}

	return { avaliableTimeSlot };
};

export const deleteAvaliableTime = async (id: number) => {
	return await prisma.avaliableTime.update({
		where: { id },
		data: { deletedAt: new Date() },
	});
};
