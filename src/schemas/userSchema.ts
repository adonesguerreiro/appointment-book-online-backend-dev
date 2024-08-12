import * as yup from "yup";

export const userSchema = yup.object().shape({
	name: yup.string().required("Name is required"),
	email: yup.string().email().required("Email is required"),
	password: yup
		.string()
		.min(8, "Password must be at least 8 characters")
		.required("Password is required"),
	specialty: yup.string(),
});
