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

	const existingAvailableTime = await prisma.availableTime.findFirst({
		where: {
			day,
			companyId,
		},
	});

	let existingStartTime = existingAvailableTime
		? new Date(`1970-01-01T${existingAvailableTime.startTime}:00`)
		: null;
	let existingEndTime = existingAvailableTime
		? new Date(`1970-01-01T${existingAvailableTime.endTime}:00`)
		: null;

	while (currentTime < endTimeDate) {
		const currentTimeString = currentTime.toTimeString().slice(0, 5);

		timeSlots.push(currentTimeString);
		currentTime.setMinutes(currentTime.getMinutes() + interval);
	}

	return timeSlots;
}
