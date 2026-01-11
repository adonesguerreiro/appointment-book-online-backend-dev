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

		return res.status(200).json({
			message: "Autenticado com sucesso",
			token: session.jwtToken.token,
			refreshToken: session.refreshToken.token,
		});

		// res.cookie("token", session.jwtToken.token, {
		// 	httpOnly: true,
		// 	secure: process.env.NODE_ENV === "production",
		// 	sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
		// 	maxAge: 60 * 60 * 1000,
		// });

		// res.cookie("refreshToken", session.refreshToken.token, {
		// 	httpOnly: true,
		// 	secure: process.env.NODE_ENV === "production",
		// 	sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
		// 	maxAge: 60 * 60 * 1000 * 24,
		// });

		// return res.status(200).json({
		// 	message: "Autenticado com sucesso",
		// });
	} catch (error: any) {
		const yupHandled = handleYupError(error, res);
		if (yupHandled) return;

		res.status(500).json({ error: "Internal Server Error" });
	}
};

// export const refreshToken = async (req: Request, res: Response) => {
// 	try {
// 		const refreshToken = req.cookies.refreshToken;
// 		if (!refreshToken) {
// 			return res.status(401).json({ error: "Refresh token not provided." });
// 		}

// 		const session = await authBusinessServices.refreshSession(refreshToken);

// 		res.cookie("token", session.token, {
// 			httpOnly: true,
// 			secure: process.env.NODE_ENV === "production",
// 			sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
// 			maxAge: 60 * 60 * 1000,
// 			domain:
// 				process.env.NODE_ENV === "production" ? ".up.railway.app" : undefined,
// 		});
// 		return res.status(200).json({ message: "Token refreshed successfully." });
// 	} catch (error: any) {
// 		console.error("Error in refreshToken:", error);
// 		res.status(500).json({ error: "Internal Server Error" });
// 	}
// };

export const refreshToken = async (req: Request, res: Response) => {
	try {
		const { refreshToken } = req.body;
		if (!refreshToken) {
			return res.status(401).json({ error: "Refresh token not provided." });
		}

		const session = await authBusinessServices.refreshSession(refreshToken);

		return res.status(200).json({
			token: session.token,
			refreshToken: session.refreshToken,
			expiresIn: session.expiresIn,
		});
	} catch (error: any) {
		console.error("Error in refreshToken:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const sessionMe = async (req: Request, res: Response) => {
	try {
		if (!req.userId) {
			return res.status(401).json({ error: "Not authenticated" });
		}
		return res.json({ id: req.userId, companyId: req.companyId });

		// return res.json({
		// 	id: req.userId,
		// 	companyId: req.companyId,
		// 	token: req.cookies.token,
		// });
	} catch (error: any) {
		console.error("Error in sessionMe:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const logout = (req: Request, res: Response) => {
	res.clearCookie("token");
	res.clearCookie("refreshToken");

	return res.status(200).json({ message: "Deslogado com sucesso." });
};
