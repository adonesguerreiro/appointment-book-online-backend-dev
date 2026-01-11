import { DayWeek } from "../../../prisma/generated/client/client";
import { ApiError } from "../../utils/apiError";
import * as avaliableTimesServices from "./avaliableTimes.services";
import { dateConvertDay } from "../../utils/dateConvertDay";
import { AvailableTimeData } from "../../interfaces/AvailableTimeData";
import { generateAvaliableTimes } from "../../utils/generateAvaliableTimes";

export const getAllAvaliableTimesByCompany = async (
	page: number,
	limit: number,
	companyId: number,
	date: string
) => {
	try {
		const skip = (page - 1) * limit;

		const totalItems =
			await avaliableTimesServices.countAllAvaliableTimesByCompanyId(companyId);

		const totalPages = Math.ceil(totalItems / limit);

		if (page > totalPages) {
			throw new ApiError("Página não encontrada", 404);
		}

		let avaliableTimes;

		if (date) {
			const convertDateDay = await dateConvertDay(date as string);
			const day = convertDateDay as DayWeek;

			avaliableTimes =
				await avaliableTimesServices.findAvaliableTimesByDayAndCompanyId(
					companyId,
					day,
					skip,
					limit
				);

			if (!avaliableTimes) {
				throw new Error("AvaliableTimes not found");
			}

			return {
				avaliableTimes,
			};
		}

		avaliableTimes =
			await avaliableTimesServices.findAllAvaliableTimesByCompanyId(
				companyId,
				skip,
				limit
			);

		if (!avaliableTimes) {
			throw new Error("AvaliableTimes not found");
		}

		return { avaliableTimes, totalPages, currentPage: page };
	} catch (err) {
		throw err;
	}
};

export const getAvaliableTimeById = async (id: number, companyId: number) => {
	try {
		const avaliableTime = await avaliableTimesServices.findAvaliableTimeById(
			id,
			companyId
		);
		if (!avaliableTime) {
			throw new Error("AvaliableTime not found");
		}
		return avaliableTime;
	} catch (err) {
		throw err;
	}
};

export const createAvaliableTime = async (data: AvailableTimeData) => {
	try {
		const avaliableTimeExists =
			await avaliableTimesServices.findAvaliableTimeByDayAndPeriod(
				data.day,
				data.period,
				data.companyId
			);

		if (avaliableTimeExists) {
			throw new ApiError("Horário disponível já está em uso.", 400);
		}

		const avaliableTimesDeleted =
			await avaliableTimesServices.findAvaliableTimeDeleted(
				data.day,
				data.period,
				data.companyId
			);

		if (avaliableTimesDeleted) {
			data.deletedAt = null;
			const avaliableTimeUpdated =
				await avaliableTimesServices.updateAvaliableTime(
					avaliableTimesDeleted.id,
					data
				);

			return avaliableTimeUpdated;
		}

		const avaliableTimeCreated =
			await avaliableTimesServices.createAvaliableTime(data);

		const avaliableTimeSlotCreated = await generateAvaliableTimes(
			data.startTime,
			data.endTime,
			data.interval,
			data.companyId
		);

		const timeSlotCreated =
			await avaliableTimesServices.createOrUpdateAvaliableTimeSlot(
				avaliableTimeSlotCreated,
				avaliableTimeCreated,
				data.companyId
			);

		if (!timeSlotCreated) {
			throw new Error("AvaliableTimeSlot not found");
		}

		return { avaliableTimeCreated, avaliableTimeSlotCreated: timeSlotCreated };
	} catch (err) {
		throw err;
	}
};

export const updateAvaliableTime = async (
	id: number,
	data: AvailableTimeData
) => {
	try {
		const avaliableTimeId = await avaliableTimesServices.findAvaliableTimeById(
			id,
			data.companyId
		);

		if (!avaliableTimeId) {
			throw new Error("AvaliableTime not found");
		}

		const avaliableTimeExists =
			await avaliableTimesServices.findAvaliableTimeByDayAndPeriod(
				data.day,
				data.period,
				data.companyId
			);

		if (
			avaliableTimeExists?.startTime === data.startTime &&
			avaliableTimeExists?.endTime === data.endTime
		) {
			throw new ApiError("Horário disponível já está em uso.", 400);
		}

		const avaliableTimeSchedule =
			(await avaliableTimesServices.findAvaliableTimeBySchedule(
				data.companyId,
				data.startTime,
				data.endTime
			)) as Array<AvailableTimeData>;

		if (avaliableTimeSchedule.length > 0) {
			throw new ApiError(
				"Ja existe um agendamento para este período, não é possível alterar.",
				400
			);
		}

		const avaliableTimeUpdated =
			await avaliableTimesServices.updateAvaliableTime(id, data);

		const availableTimeSlotUpdated = await generateAvaliableTimes(
			data.startTime,
			data.endTime,
			data.interval!,
			data.companyId
		);

		const timeSlotUpdated =
			await avaliableTimesServices.createOrUpdateAvaliableTimeSlot(
				availableTimeSlotUpdated,
				avaliableTimeUpdated,
				data.companyId
			);

		if (!timeSlotUpdated) {
			throw new Error("AvaliableTimeSlot not found");
		}

		return avaliableTimeUpdated;
	} catch (err) {
		throw err;
	}
};

export const deleteAvaliableTime = async (id: number, companyId: number) => {
	try {
		const avaliableTimeExists =
			await avaliableTimesServices.findAvaliableTimeById(id, companyId);

		if (!avaliableTimeExists) {
			throw new Error("AvaliableTime not found");
		}

		const avaliableTimeSlotsSchedule =
			(await avaliableTimesServices.findAvaliableTimeBySchedule(
				avaliableTimeExists.companyId,
				avaliableTimeExists.startTime,
				avaliableTimeExists.endTime
			)) as Array<AvailableTimeData>;

		if (avaliableTimeSlotsSchedule.length > 0) {
			throw new ApiError(
				"Ja existe um agendamento para este período, não é possível excluir.",
				400
			);
		}

		const avaliableTimeDeleted =
			await avaliableTimesServices.deleteAvaliableTime(id);

		return avaliableTimeDeleted;
	} catch (err) {
		throw err;
	}
};
