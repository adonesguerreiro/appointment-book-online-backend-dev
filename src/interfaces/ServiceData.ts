export interface ServiceData {
	id?: number;
	serviceName: string;
	duration: number;
	price: number;
	companyId: number;
	deletedAt?: Date | null;
}
