import * as yup from "yup";

export const customerSchema = yup.object().shape({
	customerName: yup.string().required("Name is required"),
	mobile: yup.string().required("Mobile number is required"),
});
