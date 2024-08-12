import * as yup from "yup";

export const customerSchema = yup.object().shape({
	name: yup.string().required("Name is required"),
	mobile: yup.string().required("Mobile number is required"),
});
