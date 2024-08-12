import * as yup from "yup";

export const companySchema = yup.object().shape({
	name: yup.string().required(),
	mobile: yup.string().required(),
	email: yup.string().email().required(),
	cnpj: yup.string().required(),
});
