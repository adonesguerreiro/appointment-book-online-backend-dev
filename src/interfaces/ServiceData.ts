export interface ServiceData {
	id?: number;
	serviceName: string;
	duration: string;
	price: number;
	companyId: number;
	deletedAt?: Date | null;
}
