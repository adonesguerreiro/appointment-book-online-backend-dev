import { authConfig, refreshConfig } from "../../config/auth";
import { SessionData } from "../../interfaces/SessionData";
import { sessionSchema } from "../../schemas/sessionSchema";
import { ApiError } from "../../utils/apiError";
import { passwordValid } from "../../utils/passwordValid";
import * as userServices from "../users/users.services";
import jwt from "jsonwebtoken";

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
				401
			);
		}

		const isPasswordValid = await passwordValid(password, userExists.password);
		if (!isPasswordValid) {
			throw new ApiError("Email ou senha incorretos", 401);
		}

		const { id, companyId } = userExists;

		const jwtToken = {
			id,
			companyId,
			token: jwt.sign({ id, companyId }, authConfig.secret, {
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

		return { jwtToken, refreshToken };
	} catch (err) {
		throw err;
	}
};

export const refreshSession = async (refreshToken: string) => {
	try {
		const decoded = jwt.verify(
			refreshToken,
			refreshConfig.refreshSecret
		) as any;

		const newAccessToken = {
			id: decoded.id,
			companyId: decoded.companyId,
			token: jwt.sign(
				{ id: decoded.id, companyId: decoded.companyId },
				authConfig.secret,
				{
					algorithm: "HS256",
					allowInsecureKeySizes: true,
				}
			),
			expiresIn: authConfig.expiresIn,
		};

		return newAccessToken;
	} catch (err) {
		throw new ApiError("Refresh token inválido", 401);
	}
};
