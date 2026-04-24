import * as yup from "yup";

export const sessionSchema = yup.object().shape({
	email: yup.string().email().required("Email is required"),
	password: yup
		.string()
		.min(8, "Password must be at least 8 characters")
		.matches(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
			"Password must have at least 8 characters, 1 uppercase, 1 lowercase, 1 number and 1 special character",
		)
		.required("Password is required"),
});
