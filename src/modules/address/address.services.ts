import { prisma } from "../../config/prisma";

export const findAllAddresses = async (skip: number, limit: number) => {
	return await prisma.address.findMany({
		skip,
		take: limit,
	});
};
