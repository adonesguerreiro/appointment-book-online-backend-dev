import * as yup from "yup";

export const serviceSchema = yup.object().shape({
	serviceName: yup.string().required("Name is required"),
	duration: yup.string().required("Duration is required"),
	price: yup.number().min(0.01).required("Price is required"),
});
