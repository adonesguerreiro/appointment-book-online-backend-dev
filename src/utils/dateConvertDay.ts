import { DayWeek } from "@prisma/client";

export async function dateConvertDay(date: string) {
	const dateObj = new Date(date);
	const day = dateObj.getDay() + 1;

	switch (day) {
		case 1:
			return DayWeek.MONDAY;
		case 2:
			return DayWeek.TUESDAY;
		case 3:
			return DayWeek.WEDNESDAY;
		case 4:
			return DayWeek.THURSDAY;
		case 5:
			return DayWeek.FRIDAY;
		case 6:
			return DayWeek.SATURDAY;
		case 7:
			return DayWeek.SUNDAY;
		default:
			throw new Error("Invalid date format");
	}
}
