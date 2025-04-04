
import { Request, Response } from "express";
import * as forgotBusinessService from "../auth/forgotPassword-business.services";

// export const forgotPassword = async (req: Request, res: Response) => {
// 	try {
// 		const { email } = req.body;
// 		const user = await prisma.user.findUnique({
// 			where: { email },
// 		});

// 		if (user) {
// 			const token = jwt.sign({ userId: user.id }, authConfig.secret, {
// 				expiresIn: "5m",
// 			});

// 			const recipients = [new Recipient(`${user.email}`, `${user.name}`)];
// 			console.log(recipients[0].name);

// 			const personalization = [
// 				{
// 					email: `${user.email}`,
// 					data: {
// 						user: {
// 							name: `${recipients[0].name}`,
// 							email: `${recipients[0].email}`,
// 						},
// 						action_url: `${process.env.FRONTEND_URL}/reset-password?token=${token}`,
// 						support_url: "https://wa.me/65996731038",
// 						account_name: `${user.name}`,
// 					},
// 				},
// 			];

// 			const emailParams = new EmailParams()
// 				.setFrom(sentFrom)
// 				.setTo(recipients)
// 				.setSubject("Subject")
// 				.setTemplateId("zr6ke4n7e2mgon12")
// 				.setPersonalization(personalization);

// 			try {
// 				await mailerSend.email.send(emailParams);
// 				res.status(200).send({
// 					message: "Email enviado com sucesso, verifique sua caixa de entrada.",
// 				});
// 			} catch (error) {
// 				console.error("Error sending email:", error);
// 				res
// 					.status(500)
// 					.send({ error: "Erro ao enviar o email, tente novamente." });
// 			}
// 		}

// 		res.status(200).send({
// 			message:
// 				"Se esse e-mail estiver cadastrado, enviaremos um link de recuperação.",
// 		});
// 	} catch (err) {
// 		handleYupError(err, res);
// 	}
// };

export const forgotPassword = async (req: Request, res: Response) => {
	try {
		const { email } = req.body;
		const forgotPassword = await forgotBusinessService.forgotPassword(email);

		res.status(200).send(forgotPassword);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};
