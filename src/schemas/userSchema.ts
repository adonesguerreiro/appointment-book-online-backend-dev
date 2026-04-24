import * as yup from "yup";

export const userSchema = yup.object().shape({
	name: yup.string().required("Nome é obrigatorio"),
	email: yup.string().email().required("E-mail é obrigatorio"),
	password: yup
		.string()
		.min(8, "Senha deve ter no mínimo 8 caracteres")
		.matches(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
			"Senha deve ter mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial",
		),
	specialty: yup.string(),
});
