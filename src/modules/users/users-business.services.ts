import { UserData } from "../../interfaces/UserData";
import { userSchema } from "../../schemas/userSchema";
import { ApiError } from "../../utils/apiError";
import { hashPassword } from "../../utils/hashPassword";
import { passwordValid } from "../../utils/passwordValid";
import * as userServices from "./users.services";

export const getAllUsers = async (page: number, limit: number) => {
	try {
		const skip = (page - 1) * limit;
		const usersExists = userServices.findAllUsers(skip, limit);

		if (!usersExists) {
			throw new Error("Users not found");
		}
		return usersExists;
	} catch (err) {
		throw err;
	}
};

export const getUserById = async (id: number) => {
	try {
		const userExists = userServices.findUserById(id);

		if (!userExists) {
			throw new Error("User not found");
		}

		return userExists;
	} catch (err) {
		throw err;
	}
};

export const createUser = async (createData: UserData) => {
	try {
		await userSchema.validate(createData, { abortEarly: false });
		const { newPassword, confirmPassword, ...data } = createData;

		const existingUser = await userServices.findUserByEmail(data.email);
		if (existingUser) {
			throw new ApiError("Email está em uso", 400);
		}

		const createdHashPassword = await hashPassword(data.password);
		data.password = createdHashPassword;

		const user = await userServices.createUser(data);

		if (!user) {
			throw new Error("Usuário não criado");
		}

		return user;
	} catch (err) {
		throw err;
	}
};

export const updateUser = async (id: number, updateData: UserData) => {
	try {
		await userSchema.validate(updateData, { abortEarly: false });

		const { newPassword, confirmPassword, ...data } = updateData;
		await userSchema.validate(updateData, { abortEarly: false });

		const existingUser = await userServices.findUserById(id);
		if (!existingUser) {
			throw new ApiError("Usuário não encontrado", 404);
		}

		const isPasswordValid = await passwordValid(
			data.password,
			existingUser.password
		);

		if (!isPasswordValid) {
			throw new ApiError("Senha atual inválida", 400);
		}

		const existingUserEmail = await userServices.findUserByIdAndEmail(
			id,
			data.email
		);
		if (existingUserEmail) {
			throw new ApiError("Email está em uso", 400);
		}

		if (data.email === existingUser.email && !data.password) {
			throw new ApiError("Email já está em uso", 400);
		}

		if (newPassword) {
			const newPasswordHash = await hashPassword(newPassword!);
			data.password = newPasswordHash;

			const userUpdated = await userServices.updateUser(id, data);

			return userUpdated;
		}

		if (data.password && data.password !== existingUser.password) {
			const updatedHashPassword = await hashPassword(data.password);
			data.password = updatedHashPassword;
		}

		const userUpdated = await userServices.updateUser(id, data);

		if (!userUpdated) {
			throw new Error("Usuário nao atualizado");
		}

		return userUpdated;
	} catch (err) {
		throw err;
	}
};
