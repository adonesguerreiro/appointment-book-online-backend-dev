import { log } from "../../config/logger";
import { ApiError } from "../../utils/apiError";
import * as scheduleServices from "../schedule/schedule.services";

export const getTimeSlotByCompanyId = async (
	timeSlot: string,
	companyId: number,
) => {
	try {
		const existingTimeSlot = await scheduleServices.findTimeSlotByCompanyId(
			timeSlot,
			companyId,
		);

		if (!existingTimeSlot) {
			throw new ApiError("Avalible time slot not found", 400);
		}

		return existingTimeSlot;
	} catch (err) {
		log().error(
			{ err, timeSlot: timeSlot, companyId: companyId },
			"Error while fetching time slot by company id",
		);
		throw err;
	}
};
