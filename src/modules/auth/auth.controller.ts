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
		return res.status(200).json(session);
	} catch (error: any) {
		const yupHandled = handleYupError(error, res);
		if (yupHandled) return;

		res.status(500).json({ error: "Internal Server Error" });
	}
};
