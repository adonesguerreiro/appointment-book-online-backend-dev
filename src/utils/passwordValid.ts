import bcrypt from "bcrypt";
export const passwordValid = async (
	password: string,
	currentPassword: string
) => {
	return await bcrypt.compare(password, currentPassword);
};
