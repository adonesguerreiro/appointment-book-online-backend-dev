import { ScheduleStatus } from "@prisma/client";

export interface ScheduleData {
	customerId: number;
	serviceId: number;
	date: string;
	status: ScheduleStatus;
	companyId: number;
}
