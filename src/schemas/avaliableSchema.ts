import * as yup from "yup";

export const avaliableSchema = yup.object().shape({
	day: yup.string().required("Day is required"),
	startTime: yup.string().required("Start time is required"),
	endTime: yup.string().required("End time is required"),
	interval: yup.number().required("Interval is required"),
});
