import { DayWeek, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function generateAvaliableTimes(
	startTime: string,
	endTime: string,
	interval: number,
	companyId: number
): Promise<string[]> {
	const timeSlots: string[] = [];
	const currentTime = new Date(`1970-01-01T${startTime}:00`);
	const endTimeDate = new Date(`1970-01-01T${endTime}:00`);

	const existingAvailableTimeSlot = await prisma.avaliableTimeSlot.findMany({
		where: {
			companyId,
			timeSlot: {
				gte: currentTime.toTimeString().slice(0, 5),
				lte: endTimeDate.toTimeString().slice(0, 5),
			},
		},
	});

	const existingTimeStrings = new Set(
		existingAvailableTimeSlot.map((slot) => slot.timeSlot)
	);

	while (currentTime <= endTimeDate) {
		const currentTimeString = currentTime.toTimeString().slice(0, 5);

		if (!existingTimeStrings.has(currentTimeString)) {
			timeSlots.push(currentTimeString);
		}

		currentTime.setMinutes(currentTime.getMinutes() + interval);
	}

	return timeSlots;
}
