import * as yup from "yup";

export const addressSchema = yup.object().shape({
	street: yup.string().required("Street is required"),
	number: yup.number().required("Number is required"),
	complement: yup.string(),
	neighborhood: yup.string().required("Neighborhood is required"),
	city: yup.string().required("City is required"),
	state: yup.string().required("State").max(2),
	postalCode: yup.string().required("Postal Code is required"),
});
