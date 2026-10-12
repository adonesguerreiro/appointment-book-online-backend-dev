import { log } from "../../config/logger";
import { CustomerData } from "../../interfaces/CustomerData";
import { ApiError } from "../../utils/apiError";
import * as customerServices from "./customer.services";

export const getAllCustomersByCompanyId = async (
	page: number,
	limit: number,
	companyId: number,
) => {
	try {
		const skip = (page - 1) * limit;

		const totalItems =
			await customerServices.countAllCustomersByCompanyId(companyId);

		const totalPages = Math.ceil(totalItems / limit);

		if (page > totalPages && totalPages !== 0) {
			throw new ApiError("Página não encontrada", 404);
		}
		const customersExists = await customerServices.findAllCustomersByCompanyId(
			companyId,
			skip,
			limit,
		);

		if (!customersExists) {
			throw new Error("Customer not found");
		}

		return { customersExists, totalPages };
	} catch (err) {
		log().error(
			{ err, page: page, limit: limit },
			"Error while fetching customers",
		);
		throw err;
	}
};

export const getCustomerById = async (id: number, companyId: number) => {
	try {
		const customerExists = await customerServices.findCustomerById(
			id,
			companyId,
		);
		if (!customerExists) {
			throw new Error("Customer not found");
		}

		return customerExists;
	} catch (err) {
		log().error({ err }, "Error while fetching customer");
		throw err;
	}
};

export const createCustomer = async (data: CustomerData) => {
	try {
		const customerExistsMobile = await customerServices.findCustomerByMobile(
			data.mobile,
			data.companyId,
		);

		if (customerExistsMobile) {
			throw new ApiError("Já existe cliente com este número de celular.", 400);
		}

		let customerCreated = null;

		const customerExists = await customerServices.findCustomerByName(
			data.customerName,
			data.companyId,
		);

		if (customerExists?.deletedAt) {
			data.deletedAt = null;
			customerCreated = customerServices.updateCustomer(
				customerExists.id,
				data,
			);

			return customerCreated;
		}

		customerCreated = await customerServices.createCustomer(data);

		log().info({ customerCreated }, "Create customer completed successfully");

		return customerCreated;
	} catch (err) {
		log().error({ err }, "Error while creating customer");
		throw err;
	}
};

export const updateCustomer = async (id: number, data: CustomerData) => {
	try {
		const customerExists = await customerServices.findCustomerById(
			id,
			data.companyId,
		);
		if (!customerExists) {
			throw new Error("Customer not found");
		}

		const customerExistsMobile = await customerServices.findCustomerByMobile(
			data.mobile,
			data.companyId,
			id,
		);

		if (customerExistsMobile && customerExistsMobile.id !== id) {
			throw new ApiError("Já existe cliente com este número de celular.", 400);
		}

		const customerUpdated = await customerServices.updateCustomer(id, data);

		log().info({ customerUpdated }, "Update customer completed successfully");

		return customerUpdated;
	} catch (err) {
		log().error({ err }, "Error while updating customer");
		throw err;
	}
};

export const deleteCustomer = async (id: number, companyId: number) => {
	try {
		const customerExists = await customerServices.findCustomerById(
			id,
			companyId,
		);

		if (!customerExists) {
			throw new Error("Customer not found");
		}

		const customerExistsSchedules =
			await customerServices.findCustomerIdBySchedule(id, companyId);

		if (customerExistsSchedules) {
			throw new ApiError(
				"Cliente possui agendamentos, não é possível deletar",
				400,
			);
		}

		const customerDeleted = await customerServices.deleteCustomer(id);

		log().info(
			{ customerDeleted: customerDeleted.id },
			"Delete customer completed successfully",
		);

		return customerDeleted;
	} catch (err) {
		log().error({ err }, "Error while deleting customer");
		throw err;
	}
};
