import { Request, Response } from "express";
import * as uploadBusinessServices from "./uploadAvatar-business.services";
import { handleYupError } from "../../utils/handleYupError";

export const uploadProfilePhoto = async (req: Request, res: Response) => {
	try {
		const file = req.file;

		if (!file) {
			return res.status(404).send({ message: "File not uploaded" });
		}

		const uploadProfilePhoto = await uploadBusinessServices.uploadProfilePhoto(
			Number(req.userId),
			file,
			req.body
		);

		res.send(uploadProfilePhoto);
	} catch (err) {
		const yupHandled = handleYupError(err, res);
		if (yupHandled) return;

		res.status(500).json({ error: err });
	}
};
