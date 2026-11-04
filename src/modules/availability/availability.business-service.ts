import { DayWeek } from "@prisma/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { ApiError } from "../../utils/apiError";
import { dateConvertDay } from "../../utils/dateConvertDay";
import { generateTimeSlots } from "../../utils/generateAvaliableTimes";
import { log } from "../../config/logger";
import * as availabilityServices from "./availability.services";

dayjs.extend(utc);

const isWithinBlock = (
	time: string,
	blocks: { startTime: string; endTime: string }[],
) => blocks.some((block) => time >= block.startTime && time <= block.endTime);

export const getAvailableSlotsForDate = async (
	companyId: number,
	date: string,
	excludeScheduleId?: number,
) => {
	try {
		const day = (await dateConvertDay(date)) as DayWeek;

		const rules = await availabilityServices.findRulesByDayAndCompany(
			companyId,
			day,
		);

		const allSlots = rules.flatMap((rule) =>
			generateTimeSlots(rule.startTime, rule.endTime, rule.interval),
		);

		const bookedTimes = await availabilityServices.findBookedTimesForDate(
			companyId,
			date,
			excludeScheduleId,
		);

		const blocks = await availabilityServices.findBlocksForDate(
			companyId,
			date,
		);

		const availableSlots = allSlots
			.filter((slot) => !bookedTimes.includes(slot))
			.filter((slot) => !isWithinBlock(slot, blocks))
			.sort();

		return availableSlots;
	} catch (err) {
		log().error(
			{ err, companyId, date },
			"Error while computing available slots",
		);
		throw err;
	}
};

export const isSlotAvailable = async (
	companyId: number,
	date: string,
	excludeScheduleId?: number,
) => {
	try {
		const day = (await dateConvertDay(date.split("T")[0])) as DayWeek;
		const time = dayjs.utc(date).format("HH:mm");

		const rules = await availabilityServices.findRulesByDayAndCompany(
			companyId,
			day,
		);

		const matchesRule = rules.some((rule) => {
			if (time < rule.startTime || time > rule.endTime) return false;
			const slots = generateTimeSlots(
				rule.startTime,
				rule.endTime,
				rule.interval,
			);
			return slots.includes(time);
		});

		if (!matchesRule) {
			throw new ApiError("Horário fora do funcionamento", 400);
		}

		const blocks = await availabilityServices.findBlocksForDate(
			companyId,
			date.split("T")[0],
		);

		if (isWithinBlock(time, blocks)) {
			throw new ApiError("Horário bloqueado", 400);
		}

		const conflict = await availabilityServices.findConflictingSchedule(
			companyId,
			new Date(date),
			excludeScheduleId,
		);

		if (conflict) {
			throw new ApiError("Horário já ocupado", 400);
		}

		return true;
	} catch (err) {
		log().error(
			{ err, companyId, date },
			"Error while validating slot availability",
		);
		throw err;
	}
};
