import { prisma } from "../../config/prisma";

export const getAllAppointmentsPerMonthAndYear = async (
	month: string,
	year: string,
	companyId: number
) => {
	return await prisma.schedule.groupBy({
		by: ["status"],
		where: {
			companyId,
			date: {
				gte: new Date(`${year}-${month}-01`),
				lte: new Date(`${year}-${month}-31`),
			},
		},
		_count: {
			status: true,
		},
	});
};
