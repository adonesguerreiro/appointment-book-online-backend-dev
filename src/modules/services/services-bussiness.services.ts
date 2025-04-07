import { ServiceData } from "../../interfaces/ServiceData";
import { ApiError } from "../../utils/apiError";
import * as services from "./services";

export const getAllServicesByCompanyId = async (
	page: number,
	limit: number,
	companyId: number
) => {
	try {
		const skip = (page - 1) * limit;

		const totalItems = await services.countAllServicesByCompany(companyId);

		const totalPages = Math.ceil(totalItems / limit);

		if (page > totalPages) {
			throw new ApiError("Página não encontrada", 404);
		}

		const servicesExists = await services.findAllServicesByCompany(
			companyId,
			skip,
			limit
		);

		if (!servicesExists) {
			throw new Error("Services not found");
		}

		return { servicesExists, totalPages };
	} catch (err) {
		throw err;
	}
};

export const getServiceById = async (id: number, companyId: number) => {
	try {
		const serviceExists = await services.findServiceById(id, companyId);
		if (!serviceExists) {
			throw new Error("Service not found");
		}

		return serviceExists;
	} catch (err) {
		throw err;
	}
};

export const createService = async (data: ServiceData) => {
	try {
		const serviceExists = await services.findServiceByName(
			data.serviceName,
			data.companyId
		);

		let serviceCreated = null;

		if (serviceExists?.deletedAt) {
			data.deletedAt = null;
			serviceCreated = await services.updateService(serviceExists.id, data);

			return serviceCreated;
		}

		if (serviceExists) {
			throw new ApiError("Nome do serviço já está em uso", 400);
		}

		serviceCreated = await services.createService(data);

		return serviceCreated;
	} catch (err) {
		throw err;
	}
};

export const updateService = async (id: number, data: ServiceData) => {
	try {
		const serviceExists = await services.findServiceById(id, data.companyId);
		if (!serviceExists) {
			throw new Error("Service not found");
		}
		const serviceNameExists = await services.findServiceByNameEdit(
			data.serviceName,
			data.companyId,
			id
		);

		if (serviceNameExists) {
			throw new ApiError("Nome do serviço já está em uso", 400);
		}

		const serviceUpdated = await services.updateService(id, data);

		return serviceUpdated;
	} catch (err) {
		throw err;
	}
};

export const deleteService = async (id: number, companyId: number) => {
	try {
		const serviceExists = await services.findServiceById(id, companyId);

		if (!serviceExists) {
			throw new Error("Service not found");
		}
    
		const serviceInSchedule = await services.findServiceInSchedule(id);
		if (serviceInSchedule) {
			throw new ApiError(
				"Serviço possui agendamentos, não é possível deletar",
				400
			);
		}

		const serviceDeleted = await services.deleteService(id);

		return serviceDeleted;
	} catch (err) {
		throw err;
	}
};
