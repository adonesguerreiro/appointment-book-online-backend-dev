import { authConfig } from "../../config/auth";
import { handleYupError } from "../../utils/handleYupError";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../../config/prisma";
import { findUserById, updateResetPassword } from "./resetPassword.services";

export const resetPassword = async (req: Request, res: Response) => {
	const { newPassword } = req.body;
	const token = req.query.token as string;
	try {
		const payload = jwt.verify(token, authConfig.secret as string) as {
			userId: number;
			companyId: number;
			type: string;
		};

		if (!payload) {
			res.status(401).send({ error: "Token inválido ou expirado." });
			return;
		}

		if (payload.type !== "reset-password") {
			res
				.status(401)
				.send({ error: "Token inválido para redefinição de senha." });
			return;
		}

		const user = await findUserById(payload.userId);

		if (!user) {
			res.status(401).send({ error: "Token inválido ou expirado." });
			return;
		}

		const passwordHash = await bcrypt.hash(newPassword, 10);
		await updateResetPassword({ userId: payload.userId }, passwordHash);

		res.status(200).send({ message: "Senha resetada com sucesso." });
	} catch (err) {
		handleYupError(err, res);
	}
};
