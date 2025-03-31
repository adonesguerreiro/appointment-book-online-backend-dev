import { handleYupError } from "../../utils/handleYupError";
import * as usersBussinessServices from "./users-business.services";
import { Request, Response } from "express";

export const getAllUsers = async (req: Request, res: Response) => {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;

		const users = await usersBussinessServices.getAllUsers(page, limit);

		if (!users) {
			return res.status(404).send({ message: "Users not found" });
		}

		res.send(users);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const getUserById = async (req: Request, res: Response) => {
	try {
		const user = await usersBussinessServices.getUserById(Number(req.userId));

		if (!user) {
			return res.status(404).send({ message: "User not found" });
		}

		res.send(user);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export const createUser = async (req: Request, res: Response) => {
	try {
		const user = await usersBussinessServices.createUser(req.body);
		res.status(200).send(user);
	} catch (error: any) {
		const yupHandled = handleYupError(error, res);
		if (yupHandled) return;

		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const updateUser = async (req: Request, res: Response) => {
	try {
		const user = await usersBussinessServices.updateUser(
			Number(req.userId),
			req.body
		);
		res.status(200).send(user);
	} catch (error: any) {
		const yupHandled = handleYupError(error, res);
		if (yupHandled) return;

		res.status(500).json({ error: "Internal Server Error" });
	}
};
