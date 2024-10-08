import { DayWeek, Period } from "@prisma/client";

export interface AvailableTimeData {
	day: DayWeek;
	period: Period;
	startTime: string;
	endTime: string;
	interval: number;
	companyId: number;
}
