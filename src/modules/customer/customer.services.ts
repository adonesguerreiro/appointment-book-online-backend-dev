import { prisma } from "../../config/prisma";
import { CustomerData } from "../../interfaces/CustomerData";

export const countAllCustomersByCompanyId = async (companyId: number) => {
	return await prisma.customer.count({
		where: { companyId },
	});
};

export const findCustomerById = async (id: number, companyId: number) => {
	return await prisma.customer.findFirst({
		where: { id, companyId },
	});
};

export const findAllCustomersByCompanyId = async (
	companyId: number,
	skip: number,
	limit: number
) => {
	return await prisma.customer.findMany({
		where: { companyId, deletedAt: null },
		skip,
		take: limit,
		orderBy: { customerName: "asc" },
	});
};

export const findCustomerByName = async (
	customerName: string,
	companyId: number
) => {
	return await prisma.customer.findFirst({
		where: {
			customerName: {
				equals: customerName,
				mode: "insensitive",
			},
			companyId,
			NOT: { deletedAt: null },
		},
	});
};

export const findCustomerByMobile = async (
	mobile: string,
	companyId: number
) => {
	return await prisma.customer.findFirst({
		where: { mobile, companyId, deletedAt: null },
	});
};

export const findCustomerIdBySchedule = async (
	customerId: number,
	companyId: number
) => {
	return await prisma.schedule.findFirst({
		where: { customerId, companyId },
	});
};

export const createCustomer = async (data: CustomerData) => {
	return await prisma.customer.create({ data });
};

export const updateCustomer = async (id: number, data: CustomerData) => {
	return await prisma.customer.update({
		where: { id },
		data,
	});
};

export const deleteCustomer = async (id: number) => {
	return await prisma.customer.update({
		where: { id },
		data: { deletedAt: new Date() },
	});
};
