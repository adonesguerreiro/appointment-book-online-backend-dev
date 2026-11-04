import { log } from "../../config/logger";
import { ScheduleData } from "../../interfaces/ScheduleData";
import { ApiError } from "../../utils/apiError";
import * as scheduleServices from "./schedule.services";

export const getAllSchedulesByCompanyId = async (
	page: number,
	limit: number,
	companyId: number,
) => {
	try {
		const skip = (page - 1) * limit;

		const totalItems =
			await scheduleServices.countAllSchedulesByCompanyId(companyId);

		const totalPages = Math.ceil(totalItems / limit);

		if (page > totalPages && totalPages !== 0) {
			throw new ApiError("Página não encontrada", 404);
		}

		const schedulesExists = await scheduleServices.findAllSchedulesByCompanyId(
			companyId,
			skip,
			limit,
		);

		if (!schedulesExists) {
			throw new Error("Schedules not found");
		}

		return { schedulesExists, totalPages };
	} catch (err) {
		log().error(
			{ err, page: page, limit: limit },
			"Error while fetching schedules",
		);
		throw err;
	}
};

export const getScheduleById = async (id: number, companyId: number) => {
	try {
		const scheduleExists = await scheduleServices.findScheduleById(
			id,
			companyId,
		);
		if (!scheduleExists) {
			throw new Error("Schedule not found");
		}

		return scheduleExists;
	} catch (err) {
		log().error(
			{ err, id: id, companyId: companyId },
			"Error while fetching schedule by id",
		);
		throw err;
	}
};

export const createSchedule = async (data: ScheduleData) => {
	try {
		const scheduleExists = await scheduleServices.findScheduleByDateAndStatus(
			data.date,
			data.status,
			data.companyId,
		);

		if (scheduleExists) {
			throw new ApiError("Já existe agendamento para esta data e horário", 400);
		}

		const scheduleCreated = await scheduleServices.createSchedule(data);

		log().info(
			{ scheduleCreated: scheduleCreated },
			"Create schedule completed successfully",
		);

		return scheduleCreated;
	} catch (err) {
		log().error({ err, body: data }, "Error while creating schedule");
		throw err;
	}
};

export const updateSchedule = async (id: number, data: ScheduleData) => {
	try {
		const existingSchedule = await scheduleServices.findScheduleById(
			id,
			data.companyId,
		);

		if (!existingSchedule) {
			throw new ApiError("Agendamento não encontrado", 404);
		}

		const scheduleExists = await scheduleServices.findScheduleByDateAndStatus(
			data.date,
			data.status,
			data.companyId,
		);

		if (scheduleExists) {
			throw new ApiError("Já existe agendamento para esta data e horário", 400);
		}

		const scheduleUpdated = await scheduleServices.updateSchedule(id, data);

		log().info(
			{ scheduleUpdated: scheduleUpdated },
			"Update schedule completed successfully",
		);

		return scheduleUpdated;
	} catch (err) {
		log().error({ err, id: id, body: data }, "Error while updating schedule");
		throw err;
	}
};
