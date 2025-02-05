import { DayWeek, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function generateAvailableTimes(
	day: DayWeek,
	startTime: string,
	endTime: string,
	interval: number,
	companyId: number
): Promise<string[]> {
	const timeSlots: string[] = [];
	const currentTime = new Date(`1970-01-01T${startTime}:00`);
	const endTimeDate = new Date(`1970-01-01T${endTime}:00`);

	const existingAvailableTimeSlot = await prisma.availableTimeSlot.findMany({
		where: {
      companyId,
			timeSlot: {
				gte: currentTime.toTimeString().slice(0, 5),
				lte: endTimeDate.toTimeString().slice(0, 5),
			}
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
		endTime = currentTime.toTimeString().slice(0, 5);
	}

	return timeSlots;
}
