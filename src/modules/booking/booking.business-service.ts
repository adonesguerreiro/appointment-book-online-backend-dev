import { ApiError } from "../../utils/apiError";
import * as scheduleServices from "../schedule/schedule.services";
import { ScheduleData } from "../../interfaces/ScheduleData";
import { log } from "../../config/logger";

export const createBooking = async (data: ScheduleData) => {
	try {
		const scheduleExists = await scheduleServices.findScheduleByDateAndStatus(
			data.date,
			data.status,
			data.companyId,
		);

		if (scheduleExists) {
			throw new ApiError("Já existe agendamento para esta data e horário", 400);
		}

		const booking = await scheduleServices.createSchedule(data);

		if (!booking) {
			throw new Error("Booking not created");
		}

		log().info(
			{ bookingId: booking.id },
			"Create booking completed successfully",
		);

		return booking;
	} catch (err) {
		log().error({ err, body: data }, "Error while creating booking");
		throw err;
	}
};
