import { DayWeek } from "@prisma/client";
import { prisma } from "../../config/prisma";

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
	const company = await prisma.company.findFirst({
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
		},
	});

	if (!company) {
		throw new Error("Company not found");
	}

	const unavaliableTime = await prisma.unavaliableTime.findMany({
		where: {
			companyId: company.id,
			date: {
				gte: startTimeDate,
				lte: endTimeDate,
			},
		},
	});

	const allTimeSlots = await prisma.avaliableTimeSlot.findMany({
		select: {
			id: true,
			timeSlot: true,
		},
		where: {
			companyId: company.id,
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
	});

	const avaliableTimeSlots = allTimeSlots.filter((slot) => {
		return !unavaliableTime.some((unavaliable) => {
			return (
				slot.timeSlot >= unavaliable.startTime &&
				slot.timeSlot <= unavaliable.endTime
			);
		});
	});

	return {
		...company,
		avaliableTimeSlots,
	};
};

export const findCompanyById = async (id: number) => {
	return await prisma.company.findUnique({
		where: { id },
	});
};
