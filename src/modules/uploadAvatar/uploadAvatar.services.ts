import { prisma } from "../../config/prisma";
import { UserData } from "../../interfaces/UserData";

export const uploadProfilePhoto = async (id: number, data: UserData) => {
	return await prisma.user.update({
		where: { id },
		data,
	});
};
