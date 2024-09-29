import * as yup from "yup";

export const scheduleSchema = yup.object().shape({
	date: yup.string().required("Date is required"),
	status: yup.string().oneOf(["SCHEDULED", "CANCELLED", " ATTENDED"]),
	customerId: yup.object().required("Customer Id is required"),
	serviceId: yup.string().required("Service Id is required"),
});
