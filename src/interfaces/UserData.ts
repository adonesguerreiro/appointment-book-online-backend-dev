export interface UserData {
	name: string;
	email: string;
	password: string;
	newPassword?: string;
	confirmPassword?: string;
	specialty: string;
	companyId: number;
	avatarUrl?: string;
}
