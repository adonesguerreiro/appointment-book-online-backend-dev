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
	} catch (err) {
		res.status(500).json({ error: err });
	}
};

export const getUserById = async (req: Request, res: Response) => {
	try {
		const user = await usersBussinessServices.getUserById(Number(req.userId));

		if (!user) {
			return res.status(404).send({ message: "User not found" });
		}

		res.send(user);
	} catch (err) {
		res.status(500).json({ error: err });
	}
};

export const createUser = async (req: Request, res: Response) => {
	try {
		const { name, email, password, specialty } = req.body;
		const user = await usersBussinessServices.createUser({
			name,
			email,
			password,
			specialty,
			companyId: Number(req.companyId),
		});
		res.status(200).send(user);
	} catch (err) {
		const yupHandled = handleYupError(err, res);
		if (yupHandled) return;

		res.status(500).json({ error: err });
	}
};

export const updateUser = async (req: Request, res: Response) => {
	try {
		const { name, email, password, specialty } = req.body;
		const user = await usersBussinessServices.updateUser(Number(req.userId), {
			name,
			email,
			password,
			specialty,
			companyId: Number(req.companyId),
		});
		res.status(200).send(user);
	} catch (err) {
		const yupHandled = handleYupError(err, res);
		if (yupHandled) return;

		res.status(500).json({ error: "Internal Server Error" });
	}
};
