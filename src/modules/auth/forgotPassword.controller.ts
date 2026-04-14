import { Request, Response } from "express";
import * as forgotBusinessService from "../auth/forgotPassword-business.services";

export const forgotPassword = async (req: Request, res: Response) => {
	try {
		const { email } = req.body;
		const forgotPassword = await forgotBusinessService.forgotPassword(email);

		res.status(200).send(forgotPassword);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};
