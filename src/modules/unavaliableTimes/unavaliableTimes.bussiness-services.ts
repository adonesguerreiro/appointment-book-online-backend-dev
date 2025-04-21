import { UnavaliableData } from "../../interfaces/UnavaliableData";
import { ApiError } from "../../utils/apiError";
import * as unavaliableTimesServices from "./unavaliableTimes.services";

export const getAllUnavaliableTimesByCompany = async (
	page: number,
	limit: number,
	companyId: number
) => {
	try {
		const skip = (page - 1) * limit;

		const totalItems =
			await unavaliableTimesServices.countAllUnavaliableTimesByCompanyId(
				companyId
			);

		const totalPages = Math.ceil(totalItems / limit);

		if (page > totalPages) {
			throw new ApiError("Página não encontrada", 404);
		}

		const unavaliableTimes =
			await unavaliableTimesServices.findAllAvaliableTimesByCompanyId(
				companyId,
				skip,
				limit
			);

		if (!unavaliableTimes) {
			throw new Error("AvaliableTimes not found");
		}

		return { unavaliableTimes, totalPages, currentPage: page };
	} catch (err) {
		throw err;
	}
};

export const getAvaliableTimeById = async (id: number, companyId: number) => {
	try {
		const avaliableTime =
			await unavaliableTimesServices.findUnavaliableTimeById(id, companyId);
		if (!avaliableTime) {
			throw new Error("AvaliableTime not found");
		}
		return avaliableTime;
	} catch (err) {
		throw err;
	}
};

export const createUnavaliableTime = async (data: UnavaliableData) => {
	try {
		const existingDate =
			await unavaliableTimesServices.findUnavaliableTimeByDate(
				data.date,
				data.companyId
			);

		if (existingDate) {
			throw new ApiError("Data já está em uso.", 400);
		}

		const startOfDayDate =
			data.date.split("T")[0] + `T${data.startTime}:00.000Z`;
		const endOfDayDate = data.date.split("T")[0] + `T${data.endTime}:00.000Z`;

		const existingSchedule =
			await unavaliableTimesServices.findUnavaliableTimeByTime(
				startOfDayDate,
				endOfDayDate,
				data.companyId
			);

		if (existingSchedule != null) {
			throw new ApiError("Já existe agendamento para esta data e horário", 400);
		}

		const existingDateDeleted =
			await unavaliableTimesServices.findUnavaliableTimeDeleted(
				data.date,
				data.companyId
			);

		if (existingDateDeleted) {
			data.deletedAt = null;
			const unavaliableTimeUpdated =
				await unavaliableTimesServices.updateUnavaliableTime(
					existingDateDeleted.id,
					data
				);

			return unavaliableTimeUpdated;
		}

		const unavaliableTimeCreated =
			await unavaliableTimesServices.createUnavaliableTime(data);

		return unavaliableTimeCreated;
	} catch (err) {
		throw err;
	}
};

export const updateUnavaliableTime = async (
	id: number,
	data: UnavaliableData
) => {
	try {
		const existingUnavaliableTime =
			await unavaliableTimesServices.findUnavaliableTimeById(
				id,
				data.companyId
			);

		if (!existingUnavaliableTime) {
			throw new ApiError("UnavaliableTime not found", 404);
		}
		const existingDate =
			await unavaliableTimesServices.findUnavaliableTimeByDate(
				data.date,
				data.companyId
			);

		if (existingDate) {
			throw new ApiError("Data já está em uso.", 400);
		}

		const startOfDayDate =
			data.date.split("T")[0] + `T${data.startTime}:00.000Z`;
		const endOfDayDate = data.date.split("T")[0] + `T${data.endTime}:00.000Z`;

		const existingSchedule =
			await unavaliableTimesServices.findUnavaliableTimeByTime(
				startOfDayDate,
				endOfDayDate,
				data.companyId
			);

		if (existingSchedule != null) {
			throw new ApiError("Já existe agendamento para esta data e horário", 400);
		}

		const unavaliableTimeUpdated =
			await unavaliableTimesServices.updateUnavaliableTime(id, data);

		if (!unavaliableTimeUpdated) {
			throw new ApiError("UnavaliableTime not found", 404);
		}
		return unavaliableTimeUpdated;
	} catch (err) {
		throw err;
	}
};

export const deleteUnavaliableTime = async (id: number, companyId: number) => {
	try {
		const unavaliableTimeDeleted =
			await unavaliableTimesServices.deleteUnavaliableTime(id);

		if (!unavaliableTimeDeleted) {
			throw new ApiError("UnavaliableTime not found", 404);
		}

		return unavaliableTimeDeleted;
	} catch (err) {
		throw err;
	}
};
