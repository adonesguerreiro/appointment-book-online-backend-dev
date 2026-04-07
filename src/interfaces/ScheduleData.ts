import { ScheduleStatus } from "@prisma/client";

export interface ScheduleData {
	customerId: number;
	customerName: string;
	customerPhone: string;
	serviceId: number;
	serviceName: string;
	duration: number;
	price: number;
	date: string;
	status: ScheduleStatus;
	timeSlotAvaliable?: string;
	companyId: number;
	timeSlotId: number;
}
