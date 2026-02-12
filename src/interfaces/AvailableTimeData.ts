import { DayWeek, Period } from "../../prisma/generated/client/enums";

export interface AvailableTimeData {
	id?: number;
	day: DayWeek;
	period: Period;
	startTime: string;
	endTime: string;
	interval: number;
	companyId: number;
	deletedAt?: Date | null;
}
