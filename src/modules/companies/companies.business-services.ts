import { CompanyData } from "../../interfaces/CompanyData";
import { companySchema } from "../../schemas/companySchema";
import { ApiError } from "../../utils/apiError";
import * as companiesServices from "./companies.services";

export const getAllCompanies = (page: number, limit: number) => {
	try {
		const skip = (page - 1) * limit;
		const companies = companiesServices.findAllCompanies(skip, limit);
		if (!companies) {
			throw new Error("Companies not found");
		}

		return companies;
	} catch (err) {
		throw err;
	}
};

export const getCompanyById = async (id: number) => {
	try {
		const companies = await companiesServices.findCompanyById(id);
		if (!companies) {
			throw new Error("Company not found");
		}

		return companies;
	} catch (err) {
		throw err;
	}
};

export const createCompany = async (createData: CompanyData) => {
	try {
		await companySchema.validate(createData, { abortEarly: false });

		const companyExists =
			await companiesServices.findCompanyByEmailOrCnpjOrMobile(
				createData.email,
				createData.cnpj,
				createData.mobile
			);

		if (companyExists?.mobile === createData.mobile) {
			throw new ApiError("Número de celular está em uso", 400);
		}

		if (companyExists?.email === createData.email) {
			throw new ApiError("Email está em uso", 400);
		}

		if (companyExists?.cnpj === createData.cnpj) {
			throw new ApiError("CNPJ está em uso", 400);
		}

		const company = await companiesServices.createCompany(createData);

		return company;
	} catch (err) {
		throw err;
	}
};

export const updateCompany = async (id: number, updateData: CompanyData) => {
	try {
		await companySchema.validate(updateData, { abortEarly: false });

		const companyExists = await companiesServices.findCompanyById(id);

		if (!companyExists) {
			throw new ApiError("Company not found", 404);
		}

		const companyExistsWithSameData =
			await companiesServices.findCompanyByEmailOrCnpjOrMobile(
				updateData.email,
				updateData.cnpj,
				updateData.mobile
			);

		if (companyExistsWithSameData?.mobile === updateData.mobile) {
			throw new ApiError("Número de celular está em uso", 400);
		}

		if (companyExistsWithSameData?.email === updateData.email) {
			throw new ApiError("Email está em uso", 400);
		}

		if (companyExistsWithSameData?.cnpj === updateData.cnpj) {
			throw new ApiError("CNPJ está em uso", 400);
		}

		const company = await companiesServices.updateCompany(id, updateData);

		return company;
	} catch (err) {
		throw err;
	}
};
