import { authConfig } from "../../config/auth";
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

		const { id, name, companyId } = userExists;

		const jwtToken = {
			id,
			name,
			email,
			companyId,
			token: jwt.sign({ id, companyId }, authConfig.secret, {
				algorithm: "HS256",
				allowInsecureKeySizes: true,
			}),
			expiresIn: authConfig.expiresIn,
		};

		return jwtToken;
	} catch (err) {
		throw err;
	}
};
