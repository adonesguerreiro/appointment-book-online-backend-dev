import { UserData } from "../../interfaces/UserData";
import { userSchema } from "../../schemas/userSchema";
import { ApiError } from "../../utils/apiError";
import { hashPassword } from "../../utils/hashPassword";
import { passwordValid } from "../../utils/passwordValid";
import * as userServices from "./users.services";
import * as company from "../companies/companies.services";
import { authConfig } from "../../config/auth";
import { Resend } from "resend";
import jwt from "jsonwebtoken";

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

export const getUserBySlugCompany = async (slugCompany: string) => {
	try {
		const userExists = await company.findUserSlugCompanyByName(slugCompany);

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
		const { ...data } = createData;

		const existingUser = await userServices.findUserByEmail(data.email);
		if (existingUser) {
			throw new ApiError("Email está em uso", 400);
		}

		if (data.password) {
			const createdHashPassword = await hashPassword(data.password);
			data.password = createdHashPassword;
		}

		const user = await userServices.createUser(data);

		if (!user) {
			throw new Error("Usuário não criado");
		}

		const token = jwt.sign(
			{ userId: user.id, type: "create-password" },
			authConfig.secret,
			{
				expiresIn: "5m",
			},
		);

		const resend = new Resend(process.env.RESEND_API_KEY);

		const { data: emailData, error } = await resend.emails.send({
			from: "Agenda ja <onboarding@resend.dev>",
			to: [`${user.email}`],
			subject: "Criação de senha",
			html: `<strong>Email de criação de senha</strong> </br> Olá ${user.name}, </br> Você solicitou a criação de senha. </br> Por favor, clique no link abaixo para redefinir sua senha: </br>
				<br><a href="${process.env.FRONTEND_URL}/create-password?token=${token}">Clique aqui para redefinir sua senha</a>`,
		});

		if (error) {
			return console.error({ error });
		}

		console.log({ data: emailData });

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

		if (!existingUser.password || !data.password) {
			throw new ApiError("Senha é obrigatória", 400);
		}

		const isPasswordValid = await passwordValid(
			data.password,
			existingUser.password,
		);

		if (!isPasswordValid) {
			throw new ApiError("Senha atual inválida", 400);
		}

		const existingUserEmail = await userServices.findUserByIdAndEmail(
			id,
			data.email,
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
