import { authConfig } from "../../config/auth";
import * as userServices from "../users/users.services";
import jwt from "jsonwebtoken";
import { Resend } from "resend";

export const forgotPassword = async (email: string) => {
	try {
		const existingUser = await userServices.findUserByEmail(email);
		if (existingUser) {
			const token = jwt.sign({ userId: existingUser.id }, authConfig.secret, {
				expiresIn: "1m",
			});

			const resend = new Resend(process.env.RESEND_API_KEY);

			const { data, error } = await resend.emails.send({
				from: "Agenda ja <onboarding@resend.dev>",
				to: [`${existingUser.email}`],
				subject: "Recuperação de senha",
				html: `<strong>Email de recuperação de senha</strong> </br> Olá ${existingUser.name}, </br> Você solicitou a recuperação de senha. </br> Por favor, clique no link abaixo para redefinir sua senha: </br>
				<br><a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">Clique aqui para redefinir sua senha</a>`,
			});

			if (error) {
				return console.error({ error });
			}

			console.log({ data });

			return {
				message:
					"Se esse e-mail estiver cadastrado, enviaremos um link de recuperação.",
			};
		}
	} catch (err) {
		console.log(err);
		throw err;
	}
};
