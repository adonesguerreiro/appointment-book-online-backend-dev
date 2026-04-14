export interface UserData {
	name: string;
	email: string;
	password: string;
	newPassword?: string;
	confirmPassword?: string;
	companyId: number;
	avatarUrl?: string;
	avatarPublicId?: string;
}
