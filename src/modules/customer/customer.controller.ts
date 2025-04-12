import { Request, Response } from "express";
import * as customerBusinessServices from "./customer.business-services";
import { handleYupError } from "../../utils/handleYupError";
import { customerSchema } from "../../schemas/customerSchema";
export const getAllSchedulesByCompanyId = async (
	req: Request,
	res: Response
) => {
	try {
		const page = Math.max(1, parseInt(req.query.page as string) || 1);
		const limit = Math.min(
			100,
			Math.max(1, parseInt(req.query.limit as string) || 10)
		);

		const customers = await customerBusinessServices.getAllCustomersByCompanyId(
			Number(page),
			Number(limit),
			Number(req.companyId)
		);

		if (!customers) {
			throw new Error("Schedules not found");
		}

		res.status(200).send({
			customers: customers.customersExists,
			totalPages: customers.totalPages,
			currentPage: page,
		});
	} catch (err) {
		const yupHandled = handleYupError(err, res);
		if (yupHandled) return;

		res.status(500).json({ error: err });
	}
};

export const getCustomerById = async (req: Request, res: Response) => {
	try {
		const customerId = await customerBusinessServices.getCustomerById(
			Number(req.params.id),
			Number(req.companyId)
		);

		if (!customerId) {
			throw new Error("Customer not found");
		}

		res.status(200).send(customerId);
	} catch (err) {
		const yupHandled = handleYupError(err, res);
		if (yupHandled) return;

		res.status(500).json({ error: err });
	}
};

export const createCustomer = async (req: Request, res: Response) => {
	const { customerName, mobile } = req.body;

	try {
		await customerSchema.validate(req.body, { abortEarly: false });

		const customerCreated = await customerBusinessServices.createCustomer({
			customerName,
			mobile,
			companyId: Number(req.companyId),
		});

		res.send(customerCreated);
	} catch (err) {
		const yupHandled = handleYupError(err, res);
		if (yupHandled) return;

		res.status(500).json({ error: err });
	}
};

export const updateCustomer = async (req: Request, res: Response) => {
	const { customerName, mobile } = req.body;

	try {
		await customerSchema.validate(req.body, { abortEarly: false });

		const customerUpdated = await customerBusinessServices.updateCustomer(
			Number(req.params.id),
			{
				customerName,
				mobile,
				companyId: Number(req.companyId),
			}
		);

		res.status(200).send(customerUpdated);
	} catch (err) {
		const yupHandled = handleYupError(err, res);
		if (yupHandled) return;

		res.status(500).json({ error: err });
	}
};

export const deleteCustomer = async (req: Request, res: Response) => {
	try {
		const customerDeleted = await customerBusinessServices.deleteCustomer(
			Number(req.params.id),
			Number(req.companyId)
		);

		if (!customerDeleted) {
			throw new Error("Customer not found");
		}

		res.status(200).send(customerDeleted);
	} catch (err) {
		const yupHandled = handleYupError(err, res);
		if (yupHandled) return;

		res.status(500).json({ error: err });
	}
};
