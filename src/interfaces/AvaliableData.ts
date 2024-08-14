import { DayWeek } from "@prisma/client";

export interface AvaliableData {
	day: DayWeek;
	startTime: string;
	endTime: string;
	interval: number;
	companyId: number;
}
