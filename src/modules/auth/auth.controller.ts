import { handleYupError } from "../../utils/handleYupError";
import { Request, Response } from "express";
import { SessionData } from "../../interfaces/SessionData";
import * as authBusinessServices from "../auth/auth-business.services";

interface SessionRequest extends Request {
	body: SessionData;
}

// export const sessions = async (req: SessionRequest, res: Response) => {
// 	const { email, password } = req.body;

// 	try {
// 		await sessionSchema.validate(req.body, { abortEarly: false });

// 		const existingUser = await prisma.user.findUnique({
// 			where: { email },
// 		});

// 		if (!existingUser) {
// 			const errorResponse: ErrorResponse = {
// 				errors: [{ message: "Usuário não encontrado." }],
// 			};
// 			return res.status(401).json(errorResponse);
// 		}

// 		if (existingUser.blocked === true) {
// 			const errorResponse: ErrorResponse = {
// 				errors: [
// 					{
// 						message: "Usuário está sem acesso, entre em contato com o suporte.",
// 					},
// 				],
// 			};

// 			return res.status(401).json(errorResponse);
// 		}

// 		const isPasswordValid = await bcrypt.compare(
// 			password,
// 			existingUser.password
// 		);

// 		if (!isPasswordValid) {
// 			const errorResponse: ErrorResponse = {
// 				errors: [{ message: "Senha inválida." }],
// 			};
// 			return res.status(401).json(errorResponse);
// 		}

// 		const { id, name } = existingUser;

// 		return res.json({
// 			existingUser: id,
// 			name,
// 			email,
// 			token: jwt.sign({ id }, authConfig.secret, {
// 				expiresIn: authConfig.expiresIn,
// 			}),
// 		});
// 	} catch (err) {
// 		handleYupError(err, res);
// 	}
// };

export const sessions = async (req: SessionRequest, res: Response) => {
	try {
		const { email, password } = req.body;

		const session = await authBusinessServices.authSession({ email, password });
		return res.status(200).json(session);
	} catch (error: any) {
		const yupHandled = handleYupError(error, res);
		if (yupHandled) return;

		res.status(500).json({ error: "Internal Server Error" });
	}
};
