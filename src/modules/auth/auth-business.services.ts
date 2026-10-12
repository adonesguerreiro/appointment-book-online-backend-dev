import jwt from "jsonwebtoken";
import { authConfig, refreshConfig } from "../../config/auth";
import { SessionData } from "../../interfaces/SessionData";
import { sessionSchema } from "../../schemas/sessionSchema";
import { ApiError } from "../../utils/apiError";
import { passwordValid } from "../../utils/passwordValid";
import * as userServices from "../users/users.services";
import { UserData } from "../../interfaces/UserData";
import { hashPassword } from "../../utils/hashPassword";
import { log } from "../../config/logger";

export const authSession = async (sessionData: SessionData) => {
	try {
		await sessionSchema.validate(sessionData, { abortEarly: false });
		const { email, password } = sessionData;

		const userExists = await userServices.findUserByEmail(email);

		if (!userExists) {
			throw new ApiError("Usuário não existe", 400);
		}

		if (userExists.blocked === true) {
			throw new ApiError(
				"Usuário está sem acesso, entre em contato com o suporte.",
				401,
			);
		}

		if (!userExists.password) {
			throw new ApiError("Usuário precisa criar senha primeiro", 400);
		}

		const isPasswordValid = await passwordValid(password, userExists.password);
		if (!isPasswordValid) {
			throw new ApiError("Email ou senha incorretos", 401);
		}

		const { id, companyId } = userExists;

		const jwtToken = {
			id,
			companyId,
			token: jwt.sign({ id, companyId }, authConfig.secret as string, {
				algorithm: "HS256",
				allowInsecureKeySizes: true,
			}),
			expiresIn: authConfig.expiresIn,
		};

		const refreshToken = {
			token: jwt.sign({ id, companyId }, refreshConfig.refreshSecret, {
				algorithm: "HS256",
				allowInsecureKeySizes: true,
			}),
			expiresIn: refreshConfig.expiresIn,
		};

		log().info(
			{ userId: id, companyId: companyId },
			"Login process completed successfully",
		);

		return { jwtToken, refreshToken };
	} catch (err) {
		log().error({ err, body: sessionData }, "Error during login process");
		throw err;
	}
};

export const createPassword = async (data: {
	token: string;
	password: string;
}) => {
	try {
		const { token, password } = data;

		const payload = jwt.verify(token, authConfig.secret as string) as {
			userId: number;
			companyId: number;
			type: string;
		};

		if (!payload) {
			throw new ApiError("Token inválido ou expirado", 400);
		}

		if (payload.type !== "create-password") {
			throw new ApiError("Token inválido para criação de senha", 400);
		}

		const user = await userServices.findUserById(payload.userId);

		if (!user) {
			throw new ApiError("Usuário não encontrado", 404);
		}

		if (user.password !== null) {
			throw new ApiError("Senha já criada para este usuário", 400);
		}

		data.password = await hashPassword(password);

		const dataUpdate: UserData = {
			name: user.name,
			email: user.email,
			password: data.password,
			companyId: user.companyId,
		};

		const updatedUser = await userServices.updateUser(user.id, dataUpdate);

		if (!updatedUser) {
			throw new ApiError("Erro ao criar senha", 500);
		}

		log().info(
			{ userId: payload.userId,
				companyId: payload.companyId,
			},
			"Password created successfully",
		);

		return { message: "Senha criada com sucesso" };
	} catch (err) {
		log().error({ err, body: data }, "Error during password creation process");
		throw err;
	}
};

export const refreshSession = async (refreshToken: string) => {
	try {
		const decoded = jwt.verify(
			refreshToken,
			refreshConfig.refreshSecret,
		) as any;

		const newAccessToken = {
			id: decoded.id,
			companyId: decoded.companyId,
			token: jwt.sign(
				{ id: decoded.id, companyId: decoded.companyId },
				authConfig.secret as string,
				{
					algorithm: "HS256",
					allowInsecureKeySizes: true,
				},
			),
			expiresIn: authConfig.expiresIn,
			refreshToken: refreshToken,
		};

		log().info(
			{ userId: decoded.id,
				companyId: decoded.companyId,
			},
			"Refresh token processed successfully",
		);

		return newAccessToken;
	} catch (err) {
		log().error(
			{ err, body: refreshToken },
			"Error during refresh token processing",
		);
		throw new ApiError("Refresh token inválido", 401);
	}
};
