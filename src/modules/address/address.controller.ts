import * as addressesBussinessServices from "./address.business-services";
import { Request, Response } from "express";

export const getAllAddresses = async (req: Request, res: Response) => {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;

		const addresses = await addressesBussinessServices.getAllAddresses(
			page,
			limit
		);

		if (!addresses) {
			throw new Error("Addresses not found");
		}

		res.send(addresses);
	} catch (err) {
		throw err;
	}
};
