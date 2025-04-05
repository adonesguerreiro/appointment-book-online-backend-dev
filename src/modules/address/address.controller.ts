import { ApiError } from "../../utils/apiError";
import { handleYupError } from "../../utils/handleYupError";
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

export const getAddressById = async (req: Request, res: Response) => {
	try {
		const address = await addressesBussinessServices.getAddressById(
			Number(req.companyId)
		);

		if (!address) {
			throw new Error("Address not found");
		}

		res.send(address);
	} catch (err) {
		throw err;
	}
};

export const createAddress = async (req: Request, res: Response) => {
	try {
		const {
			id,
			street,
			number,
			complement,
			neighborhood,
			city,
			state,
			postalCode,
		} = req.body;

		const findAdress = await addressesBussinessServices.getAddressById(
			Number(req.companyId)
		);

		if (findAdress) {
			throw new ApiError(
				"Já existe um endereço cadastrado para esta empresa",
				400
			);
		}

		const findAddressData = await addressesBussinessServices.getAddressFindData(
			{
				id,
				street,
				number,
				complement,
				neighborhood,
				city,
				state,
				postalCode,
				companyId: Number(req.companyId),
			}
		);

		if (findAddressData) {
			throw new ApiError("Endereço já cadastrado", 400);
		}

		const address = await addressesBussinessServices.createAddress({
			id,
			street,
			number,
			complement,
			neighborhood,
			city,
			state,
			postalCode,
			companyId: Number(req.companyId),
		});

		if (!address) {
			throw new Error("Address not created");
		}

		res.send(address);
	} catch (err) {
		const yupHandled = handleYupError(err, res);
		if (yupHandled) return;
	}
};

export const updateAddress = async (req: Request, res: Response) => {
	try {
		const {
			street,
			number,
			complement,
			neighborhood,
			city,
			state,
			postalCode,
		} = req.body;

		const address = await addressesBussinessServices.updateAddress({
			id: Number(req.params.id),
			street,
			number,
			complement,
			neighborhood,
			city,
			state,
			postalCode,
			companyId: Number(req.companyId),
		});

		if (!address) {
			throw new Error("Address not updated");
		}

		res.send(address);
	} catch (err) {
		const yupHandled = handleYupError(err, res);
		if (yupHandled) return;
	}
};
