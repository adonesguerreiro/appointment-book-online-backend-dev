import { ScheduleStatus } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ScheduleData } from "../../interfaces/ScheduleData";

export const countAllSchedulesByCompanyId = async (companyId: number) => {
	return await prisma.schedule.count({
		where: { companyId },
	});
};

export const findAllSchedulesByCompanyId = async (
	companyId: number,
	skip: number,
	limit: number
) => {
	return await prisma.schedule.findMany({
		where: { companyId },
		skip,
		take: limit,
		orderBy: { date: "asc" },
	});
};

export const findScheduleById = async (id: number, companyId: number) => {
	return await prisma.schedule.findFirst({
		where: { id, companyId },
	});
};

export const findScheduleTimeUnavaliable = async (
	startOfDayDate: Date,
	endOfDayDate: Date,
	companyId: number
) => {
	return await prisma.unavaliableTime.findFirst({
		where: {
			date: {
				gte: startOfDayDate,
				lte: endOfDayDate,
			},
			companyId,
		},
	});
};

export const findScheduleByDateAndStatus = async (
	date: string,
	status: ScheduleStatus,
	companyId: number
) => {
	return await prisma.schedule.findFirst({
		where: {
			date,
			status,
			companyId,
		},
	});
};

export const findTimeSlotByCompanyId =  async(timeSlot: string, companyId: number ) => {
	return await prisma.avaliableTimeSlot.findFirst({
		where: {
			timeSlot,
			companyId,
		}
	})
}

export const createSchedule = async (data: ScheduleData) => {
	return await prisma.schedule.create({ data });
};

export const updateSchedule = async (id: number, data: ScheduleData) => {
	return await prisma.schedule.update({
		where: { id },
		data,
	});
};
