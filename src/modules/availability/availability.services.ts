import { DayWeek } from "@prisma/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { prisma } from "../../config/prisma";

dayjs.extend(utc);

export const findRulesByDayAndCompany = async (
	companyId: number,
	day: DayWeek,
) => {
	return await prisma.avaliableTime.findMany({
		where: { companyId, day, deletedAt: null },
	});
};

export const findBookedTimesForDate = async (
	companyId: number,
	date: string,
	excludeScheduleId?: number,
) => {
	const start = dayjs.utc(date).startOf("day").toDate();
	const end = dayjs.utc(date).endOf("day").toDate();

	const schedules = await prisma.schedule.findMany({
		where: {
			companyId,
			date: { gte: start, lte: end },
			status: { not: "CANCELLED" },
			deletedAt: null,
			...(excludeScheduleId ? { NOT: { id: excludeScheduleId } } : {}),
		},
		select: { date: true },
	});

	return schedules.map((schedule) => dayjs.utc(schedule.date).format("HH:mm"));
};

export const findBlocksForDate = async (companyId: number, date: string) => {
	const start = dayjs.utc(date).startOf("day").toDate();
	const end = dayjs.utc(date).endOf("day").toDate();

	return await prisma.unavaliableTime.findMany({
		where: { companyId, date: { gte: start, lte: end } },
	});
};

export const findConflictingSchedule = async (
	companyId: number,
	date: Date,
	excludeScheduleId?: number,
) => {
	return await prisma.schedule.findFirst({
		where: {
			companyId,
			date,
			status: { not: "CANCELLED" },
			deletedAt: null,
			...(excludeScheduleId ? { NOT: { id: excludeScheduleId } } : {}),
		},
	});
};
