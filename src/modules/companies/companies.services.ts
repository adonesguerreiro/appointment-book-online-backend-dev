import { prisma } from "../../config/prisma";
import { CompanyData } from "../../interfaces/CompanyData";

export const findAllCompanies = async (skip: number, limit: number) => {
	return await prisma.company.findMany({
		skip,
		take: limit,
	});
};
export const findCompanyById = async (id: number) => {
	return await prisma.company.findUnique({
		where: { id },
		include: {
			addresses: true,
		},
	});
};

export const findCompanyByEmailOrCnpjOrMobile = async (
	email?: string,
	cnpj?: string,
	mobile?: string
) => {
	return await prisma.company.findFirst({
		where: { OR: [{ mobile }, { email }, { cnpj }] },
	});
};

export const createCompany = async (data: CompanyData) => {
	return await prisma.company.create({
		data,
	});
};

export const updateCompany = async (id: number, data: CompanyData) => {
	return await prisma.company.update({
		where: { id },
		data,
	});
};
