import { prisma } from "../../config/prisma";
import { ServiceData } from "../../interfaces/ServiceData";

export const countAllServicesByCompany = async (companyId: number) => {
	return await prisma.service.count({
		where: { companyId },
	});
};

export const findAllServicesByCompany = async (
	companyId: number,
	skip: number,
	limit: number
) => {
	return await prisma.service.findMany({
		where: { companyId, deletedAt: null },
		skip,
		take: limit,
		orderBy: { serviceName: "asc" },
	});
};

export const findServiceById = async (id: number, companyId: number) => {
	return await prisma.service.findFirst({
		where: { id, companyId, deletedAt: null },
	});
};

export const findServiceInSchedule = async (id: number) => {
	return await prisma.schedule.findFirst({
		where: { serviceId: id },
	});
};

export const findServiceByName = async (
	serviceName: string,
	companyId: number
) => {
	return await prisma.service.findFirst({
		where: {
			serviceName: {
				equals: serviceName,
				mode: "insensitive",
			},
			companyId,
		},
	});
};

export const findServiceByNameEdit = async (
	serviceName: string,
	companyId: number,
	id: number
) => {
	return await prisma.service.findFirst({
		where: {
			serviceName: {
				equals: serviceName,
				mode: "insensitive",
			},
			companyId,
			NOT: {
				id,
			},
		},
	});
};

export const createService = async (data: ServiceData) => {
	return await prisma.service.create({ data });
};

export const updateService = async (id: number, data: ServiceData) => {
	return await prisma.service.update({
		where: { id },
		data,
	});
};

export const deleteService = async (id: number) => {
	return await prisma.service.update({
		where: { id },
		data: { deletedAt: new Date() },
	});
};
