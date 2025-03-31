import { hashPassword } from "./../../utils/hashPassword";
import { prisma } from "../../config/prisma";
import { UserData } from "../../interfaces/UserData";
export const findAllUsers = async (skip: number, limit: number) => {
	return await prisma.user.findMany({
		skip: skip,
		take: limit,
	});
};

export const findUserById = async (id: number) => {
	return await prisma.user.findUnique({
		where: { id },
	});
};

export const findUserByEmail = async (email: string) => {
	return await prisma.user.findUnique({
		where: { email },
	});
};

export const findUserByIdAndEmail = async (id: number, email: string) => {
	return await prisma.user.findFirst({
		where: {
			email,
			NOT: { id },
		},
	});
};

// export const findByIdAndPassword = async (id: number, password: string) => {
// 	await prisma.user.findUnique({
// 		where: { id },
// 	});
// };

export const createUser = async (data: UserData) => {
	return await prisma.user.create({
		data,
	});
};

export const updateUser = async (id: number, data: UserData) => {
	return await prisma.user.update({
		where: { id },
		data,
	});
};
