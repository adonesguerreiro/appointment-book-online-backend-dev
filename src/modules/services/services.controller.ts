import { Request, Response } from "express";
import * as servicesBussinessServices from "./services-bussiness.services";
import { handleYupError } from "../../utils/handleYupError";
import { serviceSchema } from "../../schemas/serviceSchema";

export const getAllServicesByCompanyId = async (
	req: Request,
	res: Response
) => {
	try {
		const page = Math.max(1, parseInt(req.query.page as string) || 1);
		const limit = Math.min(
			100,
			Math.max(1, parseInt(req.query.limit as string) || 10)
		);

		const services = await servicesBussinessServices.getAllServicesByCompanyId(
			page,
			limit,
			Number(req.companyId)
		);

		if (!services) {
			throw new Error("Services not found");
		}

		res.send({
			services: services.servicesExists,
			totalPages: services.totalPages,
			currentPage: page,
		});
	} catch (err) {
		const yupHandled = handleYupError(err, res);
		if (yupHandled) return;

		res.status(500).json({ error: err });
	}
};

export const getServiceById = async (req: Request, res: Response) => {
	try {
		const serviceId = await servicesBussinessServices.getServiceById(
			Number(req.params.id),
			Number(req.companyId)
		);

		if (!serviceId) {
			throw new Error("Service not found");
		}

		res.send(serviceId);
	} catch (err) {
		const yupHandled = handleYupError(err, res);
		if (yupHandled) return;

		res.status(500).json({ error: err });
	}
};

export const createService = async (req: Request, res: Response) => {
	const { serviceName, duration, price } = req.body;

	try {
		await serviceSchema.validate(req.body, { abortEarly: false });

		const serviceCreated = await servicesBussinessServices.createService({
			serviceName,
			duration,
			price,
			companyId: Number(req.companyId),
		});

		res.status(200).send(serviceCreated);
	} catch (err) {
		const yupHandled = handleYupError(err, res);
		if (yupHandled) return;

		res.status(500).json({ error: err });
	}
};

export const updateService = async (req: Request, res: Response) => {
	const { serviceName, duration, price } = req.body;

	try {
		await serviceSchema.validate(req.body, { abortEarly: false });

		const serviceUpdated = await servicesBussinessServices.updateService(
			Number(req.params.id),
			{
				serviceName,
				duration,
				price,
				companyId: Number(req.companyId),
			}
		);

		res.status(200).send(serviceUpdated);
	} catch (err) {
		const yupHandled = handleYupError(err, res);
		if (yupHandled) return;

		res.status(500).json({ error: err });
	}
};

export const deleteService = async (req: Request, res: Response) => {
	try {
		const serviceDeleted = await servicesBussinessServices.deleteService(
			Number(req.params.id),
			Number(req.companyId)
		);

		if (!serviceDeleted) {
			throw new Error("Service not found");
		}

		res.status(200).send(serviceDeleted);
	} catch (err) {
		const yupHandled = handleYupError(err, res);
		if (yupHandled) return;

		res.status(500).json({ error: err });
	}
};
