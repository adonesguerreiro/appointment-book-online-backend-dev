import { prisma } from "../../config/prisma";

export const findCustomerById = async (id: number, companyId: number) => {
	return await prisma.customer.findFirst({
		where: { id, companyId },
	});
};
