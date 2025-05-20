import { DayWeek } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { date } from "yup";

export const countAllTimeSlotByCompanyId = async (companyId: number) => {
	return await prisma.avaliableTimeSlot.count({
		where: { companyId },
	});
};

export const findSlugCompanyByName = async (slugCompany: string) => {
	return await prisma.company.findFirst({
		where: { slugCompany },
	});
};

export const findAllTimeSlot = async (
	slugCompany: string,
	startTimeDate: Date,
	endTimeDate: Date,
	day: DayWeek,
	skip: number,
	limit: number
) => {
	return await prisma.company.findFirst({
		where: { slugCompany },
		select: {
			id: true,
			mobile: true,
			users: {
				select: {
					id: true,
					name: true,
					avatarUrl: true,
				},
			},
			services: {
				select: {
					id: true,
					serviceName: true,
				},
			},
			avaliableTimeSlot: {
				select: {
					id: true,
					timeSlot: true,
				},
				where: {
					avaliableTime: {
						day,
					},
					schedules: {
						none: {
							date: {
								gte: startTimeDate,
								lte: endTimeDate,
							},
						},
					},
				},
				skip,
				take: limit,
			},
		},
	});
};

export const findCompanyById = async (id: number) => {
	return await prisma.company.findUnique({
		where: { id },
	});
};
