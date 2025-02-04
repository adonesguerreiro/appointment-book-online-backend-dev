import * as yup from "yup";

export const avaliableSchema = yup.object().shape({
	day: yup
		.string()
		.required("Day is required")
		.oneOf(
			[
				"MONDAY",
				"TUESDAY",
				"WEDNESDAY",
				"THURSDAY",
				"FRIDAY",
				"SATURDAY",
				"SUNDAY",
			],
			"Valid day is only MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY or SUNDAY"
		),
	startTime: yup.string().required("Start time is required"),
	endTime: yup.string().required("End time is required"),
	period: yup
		.string()
		.required()
		.oneOf(
			["MORNING", "AFTERNOON", "EVENING"],
			"Valid period is only MORNING, AFTERNOON, EVENING"
		)
		.test(
			"valid-period",
			"Schedule does not match the period informed",
			function (value) {
				const { startTime, endTime } = this.parent;

				const startTimeDate = new Date(`1970-01-01T${startTime}:00Z`);
				const endTimeDate = new Date(`1970-01-01T${endTime}:00Z`);

				if (
					value === "MORNING" &&
					startTimeDate >= new Date(`1970-01-01T01:00:00Z`) &&
					endTimeDate <= new Date(`1970-01-01T12:59:00Z`)
				) {
					return true;
				} else if (
					value === "AFTERNOON" &&
					startTimeDate >= new Date(`1970-01-01T13:00:00Z`) &&
					endTimeDate <= new Date(`1970-01-01T18:59:00Z`)
				) {
					return true;
				} else if (
					value === "EVENING" &&
					startTimeDate >= new Date(`1970-01-01T19:00:00Z`) &&
					endTimeDate <= new Date(`1970-01-01T23:59:00Z`)
				) {
					return true;
				}

				return this.createError({
					message: "Schedule does not match the period informed",
				});
			}
		),

	interval: yup.number().required("Interval is required"),
});
