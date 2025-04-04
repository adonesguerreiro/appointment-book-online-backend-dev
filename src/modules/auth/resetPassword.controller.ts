import { authConfig } from "../../config/auth";
import { handleYupError } from "../../utils/handleYupError";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../../config/prisma";

export const resetPassword = async (req: Request, res: Response) => {
	const { newPassword } = req.body;
	const token = req.query.token as string;
	try {
		const payload = jwt.verify(token, authConfig.secret) as { userId: number };
		if (!payload) {
			res.status(401).send({ error: "Token inválido ou expirado." });
			return;
		}

		const user = await prisma.user.findUnique({
			where: { id: payload.userId },
		});

		if (!user) {
			res.status(401).send({ error: "Token inválido ou expirado." });
			return;
		}

		const passwordHash = await bcrypt.hash(newPassword, 10);
		await prisma.user.update({
			where: { id: payload.userId },
			data: { password: passwordHash },
		});

		res.status(200).send({ message: "Senha resetada com sucesso." });
	} catch (err) {
		handleYupError(err, res);
	}
};
