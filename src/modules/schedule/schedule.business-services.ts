import { ScheduleData } from "../../interfaces/ScheduleData";
import { ApiError } from "../../utils/apiError";
import * as scheduleServices from "./schedule.services";

export const getAllSchedulesByCompanyId = async (
	page: number,
	limit: number,
	companyId: number
) => {
	try {
		const skip = (page - 1) * limit;

		const totalItems = await scheduleServices.countAllSchedulesByCompanyId(
			companyId
		);

		const totalPages = Math.ceil(totalItems / limit);

		if (page > totalPages) {
			throw new ApiError("Página não encontrada", 404);
		}

		const schedulesExists = await scheduleServices.findAllSchedulesByCompanyId(
			companyId,
			skip,
			limit
		);

		if (!schedulesExists) {
			throw new Error("Schedules not found");
		}

		return { schedulesExists, totalPages };
	} catch (err) {
		throw err;
	}
};

export const getScheduleById = async (id: number, companyId: number) => {
	try {
		const scheduleExists = await scheduleServices.findScheduleById(
			id,
			companyId
		);
		if (!scheduleExists) {
			throw new Error("Schedule not found");
		}

		return scheduleExists;
	} catch (err) {
		throw err;
	}
};

export const getScheduleTimeUnavaliable = async (
	startOfDayDate: Date,
	endOfDayDate: Date,
	companyId: number
) => {
	try {
		const existingScheduleTime =
			await scheduleServices.findScheduleTimeUnavaliable(
				startOfDayDate,
				endOfDayDate,
				companyId
			);

		if (existingScheduleTime) {
			throw new ApiError(
				"Já existe horário indisponível para este período, não será possível agendar.",
				400
			);
		}

		return existingScheduleTime;
	} catch (err) {
		throw err;
	}
};

export const getTimeSlotByCompanyId = async (
	timeSlot: string,
	companyId: number
) => {
	try {
		const existingTimeSlot = await scheduleServices.findTimeSlotByCompanyId(
			timeSlot,
			companyId
		);

		if (!existingTimeSlot) {
			throw new ApiError("Avalible time slot not found", 400);
		}

		return existingTimeSlot;
	} catch (err) {
		throw err;
	}
};

export const createSchedule = async (data: ScheduleData) => {
	try {
		const scheduleExists = await scheduleServices.findScheduleByDateAndStatus(
			data.date,
			data.status,
			data.companyId
		);

		if (scheduleExists) {
			throw new ApiError("Já existe agendamento para esta data e horário", 400);
		}

		const scheduleCreated = await scheduleServices.createSchedule(data);

		return scheduleCreated;
	} catch (err) {
		throw err;
	}
};

export const updateSchedule = async (id: number, data: ScheduleData) => {
	try {
		const scheduleExists = await scheduleServices.findScheduleByDateAndStatus(
			data.date,
			data.status,
			data.companyId
		);

		if (scheduleExists) {
			throw new ApiError("Já existe agendamento para esta data e horário", 400);
		}

		const scheduleUpdated = await scheduleServices.updateSchedule(id, data);

		return scheduleUpdated;
	} catch (err) {
		throw err;
	}
};
