import { MailerSend, Sender, Recipient, EmailParams } from "mailersend";
import { authConfig } from "../../config/auth";
import { handleYupError } from "../../utils/handleYupError";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const forgotPassword = async (req: Request, res: Response) => {
	try {
		const { email } = req.body;
		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (user) {
			const token = jwt.sign({ userId: user.id }, authConfig.secret, {
				expiresIn: "5m",
			});

			const mailerSend = new MailerSend({
				apiKey: process.env.API_EMAIL_KEY || "",
			});

			const sentFrom = new Sender(
				`${process.env.API_SMTP_KEY}`,
				"AdthaSoftware"
			);

			const recipients = [new Recipient(`${user.email}`, `${user.name}`)];
			console.log(recipients[0].name);

			const personalization = [
				{
					email: `${user.email}`,
					data: {
						user: {
							name: `${recipients[0].name}`,
							email: `${recipients[0].email}`,
						},
						action_url: `${process.env.FRONTEND_URL}/reset-password?token=${token}`,
						support_url: "https://wa.me/65996731038",
						account_name: `${user.name}`,
					},
				},
			];

			const emailParams = new EmailParams()
				.setFrom(sentFrom)
				.setTo(recipients)
				.setSubject("Subject")
				.setTemplateId("zr6ke4n7e2mgon12")
				.setPersonalization(personalization);

			try {
				await mailerSend.email.send(emailParams);
				res.status(200).send({
					message: "Email enviado com sucesso, verifique sua caixa de entrada.",
				});
			} catch (error) {
				console.error("Error sending email:", error);
				res
					.status(500)
					.send({ error: "Erro ao enviar o email, tente novamente." });
			}
		}

		res.status(200).send({
			message:
				"Se esse e-mail estiver cadastrado, enviaremos um link de recuperação.",
		});
	} catch (err) {
		handleYupError(err, res);
	}
};
