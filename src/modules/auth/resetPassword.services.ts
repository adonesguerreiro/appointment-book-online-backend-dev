import { prisma } from "../../config/prisma";

export const updateResetPassword = async (
	payload: { userId: number },
	passwordHash: string,
) => {
	return await prisma.user.update({
		where: { id: payload.userId },
		data: { password: passwordHash },
	});
};

export const findUserById = async (id: number) => {
	return await prisma.user.findUnique({
		where: { id },
	});
};
