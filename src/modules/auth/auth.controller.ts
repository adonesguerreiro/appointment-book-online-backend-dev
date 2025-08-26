import { handleYupError } from "../../utils/handleYupError";
import { Request, Response } from "express";
import { SessionData } from "../../interfaces/SessionData";
import * as authBusinessServices from "../auth/auth-business.services";

interface SessionRequest extends Request {
	body: SessionData;
}

export const sessions = async (req: SessionRequest, res: Response) => {
	try {
		const { email, password } = req.body;

		const session = await authBusinessServices.authSession({ email, password });

		res.cookie("token", session.token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
			maxAge: 60 * 60 * 1000,
		});

		return res.status(200).json({
			message: "Autenticado com sucesso",
			user: {
				id: session.id,
				companyId: session.companyId,
			},
		});
	} catch (error: any) {
		const yupHandled = handleYupError(error, res);
		if (yupHandled) return;

		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const sessionMe = async (req: Request, res: Response) => {
	try {
		if (!req.userId) {
			return res.status(401).json({ error: "Not authenticated" });
		}

		return res.json({
			id: req.userId,
			companyId: req.companyId,
			token: req.cookies.token,
		});
	} catch (error: any) {
		console.error("Error in sessionMe:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const logout = (req: Request, res: Response) => {
	if (!req.cookies.token) {
		return res.status(401).json({ error: "Not authenticated" });
	}
	res.clearCookie("token");

	return res.status(200).json({ message: "Deslogado com sucesso." });
};
