import { Recipient, EmailParams, Sender, MailerSend } from "mailersend";
import { authConfig } from "../../config/auth";
import * as userServices from "../users/users.services";
import jwt from "jsonwebtoken";
import { mailerSend, sentFrom } from "../../config/mailerSend";

export const forgotPassword = async (email: string) => {
	try {
		const existingUser = await userServices.findUserByEmail(email);
		if (existingUser) {
			const token = jwt.sign({ userId: existingUser.id }, authConfig.secret, {
				expiresIn: "5m",
			});

			const recipients = [
				new Recipient(`${existingUser.email}`, `${existingUser.name}`),
			];

			const personalization = [
				{
					email: `${existingUser.email}`,
					data: {
						user: {
							name: `${recipients[0].name}`,
							email: `${recipients[0].email}`,
						},
						action_url: `${process.env.FRONTEND_URL}/reset-password?token=${token}`,
						support_url: "https://wa.me/65996731038",
						account_name: `${existingUser.name}`,
					},
				},
			];

			const emailParams = new EmailParams()
				.setFrom(sentFrom)
				.setTo(recipients)
				.setSubject("Subject")
				.setTemplateId("zr6ke4n7e2mgon12")
				.setPersonalization(personalization);

			await mailerSend.email.send(emailParams);
			return {
				message: "Email enviado com sucesso, verifique sua caixa de entrada.",
			};
		}

		return {
			message:
				"Se esse e-mail estiver cadastrado, enviaremos um link de recuperação.",
		};
	} catch (err) {
		console.log(err);
		throw err;
	}
};
