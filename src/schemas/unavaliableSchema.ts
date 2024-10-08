import * as yup from "yup";

export const unavaliableSchema = yup.object().shape({
	date: yup.string().nullable(),
	startTime: yup.string().required("Start time is required"),
	endTime: yup.string().required("End time is required"),
});
