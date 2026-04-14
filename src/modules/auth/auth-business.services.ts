import { Resend } from "resend";
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
				401,
			);
		}

		if (!userExists.password) {
			throw new ApiError("Senha é obrigatória", 400);
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
			refreshConfig.refreshSecret,
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
				},
			),
			expiresIn: authConfig.expiresIn,
			refreshToken: refreshToken,
		};

		return newAccessToken;
	} catch (err) {
		throw new ApiError("Refresh token inválido", 401);
	}
};

export const createPassword = async (email: string, password: string) => {
	const resend = new Resend(process.env.RESEND_API_KEY);
	const user = await userServices.findUserByEmail(email);

	if (!user) {
		throw new ApiError("Usuário não encontrado", 404);
	}
	const token = jwt.sign({ userId: user.id }, authConfig.secret, {
		expiresIn: "15m",
	});

	const { error } = await resend.emails.send({
		from: "Agenda ja <onboarding@resend.dev>",
		to: [`${user.email}`],
		subject: "Criação de senha para nova conta",
		html: `<strong>Email de criação de senha</strong> </br> Olá ${user.name}, </br> Você criou uma nova conta na Agenda Ja. </br> Por favor, clique no link abaixo para criar sua senha: </br>
				<br><a href="${process.env.FRONTEND_URL}/create-password?token=${token}">Clique aqui para criar sua senha</a>`,
	});

	if (error) {
		return console.error({ error });
	}
};
