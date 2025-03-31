import * as yup from "yup";

export const userSchema = yup.object().shape({
	name: yup.string().required("Nome é obrigatorio"),
	email: yup.string().email().required("E-mail é obrigatorio"),
	password: yup
		.string()
		.min(8, "Senha deve ter no mínimo 8 caracteres")
		.required("Senha é obrigatória"),
	specialty: yup.string(),
});
