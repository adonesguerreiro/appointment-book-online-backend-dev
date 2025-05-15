import { Request, Response } from "express";
import * as companiesBusinessServices from "./companies.business-services";
import { CompanyData } from "../../interfaces/CompanyData";
import { handleYupError } from "../../utils/handleYupError";
import slugify from "slugify";

export const getAllCompanies = async (req: Request, res: Response) => {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;

		const companies = await companiesBusinessServices.getAllCompanies(
			Number(page),
			Number(limit)
		);
		res.send(companies);
	} catch (err) {
		res.status(500).json({ error: err });
	}
};
export const getCompaniesById = async (req: Request, res: Response) => {
	try {
		const company = await companiesBusinessServices.getCompanyById(
			Number(req.companyId)
		);

		if (!company) {
			return res.status(404).send({ message: "Company not found" });
		}

		res.send(company);
	} catch (err) {
		res.status(500).json({ error: err });
	}
};

interface CompanyRequest extends Request {
	body: CompanyData;
}

export const createCompany = async (req: CompanyRequest, res: Response) => {
	try {
		const { name, mobile, email, cnpj } = req.body;

		const company = await companiesBusinessServices.createCompany({
			name,
			mobile,
			email,
			cnpj,
			slugCompany: slugify(name, { lower: true, strict: true }),
		});
		res.send(company);
	} catch (err) {
		const yupHandled = handleYupError(err, res);
		if (yupHandled) return;

		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const updateCompany = async (req: CompanyRequest, res: Response) => {
	try {
		const { name, mobile, email, cnpj } = req.body;
		const company = await companiesBusinessServices.updateCompany(
			Number(req.companyId),
			{
				name,
				mobile,
				email,
				cnpj,
				slugCompany: slugify(name, { lower: true, strict: true }),
			}
		);
		res.send(company);
	} catch (err) {
		const yupHandled = handleYupError(err, res);
		if (yupHandled) return;

		res.status(500).json({ error: "Internal Server Error" });
	}
};
