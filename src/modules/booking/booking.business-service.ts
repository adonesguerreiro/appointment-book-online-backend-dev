import { DayWeek } from "@prisma/client";
import { ApiError } from "../../utils/apiError";
import * as bookingService from "./booking.services";
import dayjs from "dayjs";
import { dateConvertDay } from "../../utils/dateConvertDay";
import * as scheduleServices from "../schedule/schedule.services";
import { ScheduleData } from "../../interfaces/ScheduleData";

export const getAllTimeSlotByCompanyId = async (
	slugCompany: string,
	companyId: number,
	date: string,
	startTimeDate: Date,
	endTimeDate: Date,
	page: number,
	limit: number
) => {
	try {
		const skip = (page - 1) * limit;

		const totalItems = await bookingService.countAllTimeSlotByCompanyId(
			companyId
		);

		const totalPages = Math.ceil(totalItems / limit);

		if (page > totalPages) {
			throw new ApiError("Página não encontrada", 404);
		}

		const slugCompanyExists = await bookingService.findSlugCompanyByName(
			slugCompany
		);

		if (!slugCompanyExists) {
			throw new ApiError("Slug company not found", 404);
		}

		let timeSlotsExists = null;
		if (date) {
			const formattedDate = dayjs(date as string).format("YYYY-MM-DD");
			const convertDateDay = await dateConvertDay(formattedDate);
			const day = convertDateDay as DayWeek;

			timeSlotsExists = await bookingService.findAllTimeSlot(
				slugCompany!,
				startTimeDate,
				endTimeDate,
				day,
				skip,
				limit
			);
		}

		if (!timeSlotsExists) {
			throw new Error("Time slot not found");
		}

		return { timeSlots: timeSlotsExists, totalPages };
	} catch (err) {
		throw err;
	}
};

export const createBooking = async (data: ScheduleData) => {
	try {
		const scheduleExists = await scheduleServices.findScheduleByDateAndStatus(
			data.date,
			data.status,
			data.companyId
		);

		if (scheduleExists) {
			throw new ApiError("Já existe agendamento para esta data e horário", 400);
		}

		const booking = await scheduleServices.createSchedule(data);

		if (!booking) {
			throw new Error("Booking not created");
		}

		return booking;
	} catch (err) {
		throw err;
	}
};
