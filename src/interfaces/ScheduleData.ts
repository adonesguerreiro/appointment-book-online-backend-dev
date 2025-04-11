import { ScheduleStatus } from "@prisma/client";

export interface ScheduleData {
	customerId: number;
	customerName: string;
	customerPhone: string;
	serviceId: number;
	serviceName: string;
	duration: string;
	price: number;
	date: string;
	status: ScheduleStatus;
	timeSlotAvaliable?: string;
	companyId: number;
}
