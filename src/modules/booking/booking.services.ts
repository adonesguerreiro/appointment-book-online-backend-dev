import { prisma } from "../../config/prisma";

export const findSlugCompanyByName = async (slugCompany: string) => {
	return await prisma.company.findFirst({
		where: { slugCompany },
	});
};

export const findCompanyById = async (id: number) => {
	return await prisma.company.findUnique({
		where: { id },
	});
};
