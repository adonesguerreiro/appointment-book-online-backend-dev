import { Prisma, ScheduleStatus } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ScheduleData } from "../../interfaces/ScheduleData";
import { ApiError } from "../../utils/apiError";

export const countAllSchedulesByCompanyId = async (companyId: number) => {
	return await prisma.schedule.count({
		where: { companyId },
	});
};

export const findAllSchedulesByCompanyId = async (
	companyId: number,
	skip: number,
	limit: number,
) => {
	return await prisma.schedule.findMany({
		where: { companyId, deletedAt: null },
		skip,
		take: limit,
		orderBy: { date: "asc" },
	});
};

export const findScheduleById = async (id: number, companyId: number) => {
	return await prisma.schedule.findFirst({
		where: { id, companyId, deletedAt: null },
	});
};

export const findScheduleByDateAndStatus = async (
	date: string,
	status: ScheduleStatus,
	companyId: number,
) => {
	return await prisma.schedule.findFirst({
		where: {
			date,
			status,
			companyId,
		},
	});
};

export const createSchedule = async (data: ScheduleData) => {
	try {
		return await prisma.schedule.create({
			data,
		});
	} catch (err) {
		if (
			err instanceof Prisma.PrismaClientKnownRequestError &&
			err.code === "P2002"
		) {
			throw new ApiError("Horário já ocupado", 400);
		}

		throw err;
	}
};

export const updateSchedule = async (id: number, data: ScheduleData) => {
	try {
		return await prisma.schedule.update({
			where: { id },
			data,
		});
	} catch (err) {
		if (
			err instanceof Prisma.PrismaClientKnownRequestError &&
			err.code === "P2002"
		) {
			throw new ApiError("Horário já ocupado", 400);
		}

		throw err;
	}
};
