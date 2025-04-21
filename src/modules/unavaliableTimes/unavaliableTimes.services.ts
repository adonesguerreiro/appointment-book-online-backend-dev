import { prisma } from "../../config/prisma";
import { UnavaliableData } from "../../interfaces/UnavaliableData";

export const countAllUnavaliableTimesByCompanyId = async (
	companyId: number
) => {
	return await prisma.unavaliableTime.count({
		where: { companyId },
	});
};

export const findAllAvaliableTimesByCompanyId = async (
	companyId: number,
	skip: number,
	limit: number
) => {
	return await prisma.unavaliableTime.findMany({
		where: { companyId, deletedAt: null },
		skip: skip,
		take: limit,
		orderBy: { date: "asc" },
	});
};

export const findUnavaliableTimeById = async (
	id: number,
	companyId: number
) => {
	return await prisma.unavaliableTime.findFirst({
		where: { id, companyId, deletedAt: null },
	});
};

export const findUnavaliableTimeByDate = async (
	date: string,
	companyId: number
) => {
	return await prisma.unavaliableTime.findFirst({
		where: {
			date,
			companyId: companyId,
			deletedAt: null,
		},
	});
};

export const findUnavaliableTimeByTime = async (
	startOfDayDate: string,
	endOfDayDate: string,
	companyId: number
) => {
	return await prisma.schedule.findFirst({
		where: {
			date: {
				gte: startOfDayDate,
				lte: endOfDayDate,
			},
			status: "SCHEDULED",
			companyId,
		},
	});
};

export const findUnavaliableTimeDeleted = async (
	date: string,
	companyId: number
) => {
	return await prisma.unavaliableTime.findFirst({
		where: {
			date,
			companyId: companyId,
			NOT: {
				deletedAt: null,
			},
		},
	});
};

export const createUnavaliableTime = async (data: UnavaliableData) => {
	return await prisma.unavaliableTime.create({
		data,
	});
};

export const updateUnavaliableTime = async (
	id: number,
	data: UnavaliableData
) => {
	return await prisma.unavaliableTime.update({
		where: { id },
		data,
	});
};

export const deleteUnavaliableTime = async (id: number) => {
	return await prisma.unavaliableTime.update({
		where: { id },
		data: { deletedAt: new Date() },
	});
};
