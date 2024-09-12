import { CompanyData } from "./CompanyData";

export interface AddressData extends CompanyData {
	id: number;
	street: string;
	number: string;
	complement: string | null;
	neighborhood: string;
	city: string;
	state: string;
	postalCode: string;
	companyId: number;
}
