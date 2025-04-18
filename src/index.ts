import { AddressData } from "./interfaces/AddressData";
import { DayWeek, PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import { ErrorResponse } from "./interfaces/ErrorResponse";
import { addressSchema } from "./schemas/addressSchema";
import { serviceSchema } from "./schemas/serviceSchema";
import { customerSchema } from "./schemas/customerSchema";
import { avaliableSchema } from "./schemas/avaliableSchema";
import { unavaliableSchema } from "./schemas/unavaliableSchema";
import { ServiceData } from "./interfaces/ServiceData";
import { CustomerData } from "./interfaces/CustomerData";
import { AvailableTimeData } from "./interfaces/AvailableTimeData";
import { UnavaliableData } from "./interfaces/UnavaliableData";
import auth from "./middlewares/auth";
import { scheduleSchema } from "./schemas/scheduleSchema";
import { ScheduleData } from "./interfaces/ScheduleData";
import { handleYupError } from "./utils/handleYupError";
import { generateAvaliableTimes } from "./utils/generateAvaliableTimes";
import { dateConvertDay } from "./utils/dateConvertDay";
// import cloudinary from "./config/cloudinary";
// import multer from "multer";
// import fs from "fs";
import { sessions } from "./modules/auth/auth.controller";
import { forgotPassword } from "./modules/auth/forgotPassword.controller";
import { resetPassword } from "./modules/auth/resetPassword.controller";
import * as usersControllers from "./modules/users/users.controller";
// import * as uploadController from "./modules/upload/uploadAvatar.controller";
import * as dashboardController from "./modules/dashboard/dashboard.controller";
import * as companiesControllers from "./modules/companies/companies.controller";
import * as addressesControllers from "./modules/address/address.controller";
import * as servicesControllers from "./modules/services/services.controller";
import * as schedulesControllers from "./modules/schedule/schedule.controller";
import * as customersControllers from "./modules/customer/customer.controller";
import * as avaliableTimesControllers from "./modules/avaliableTimes/avaliableTimes.controller";
// import { upload } from "./middlewares/upload";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
	const { message } = req.body;

	if (!message) return res.status(400).send({ error: "Message is required" });

	res.send({ message });
});

// Autenticação - Login, Esqueci minha senha e Reset de senha
app.post("/sessions", sessions);
app.post("/forgot-password", forgotPassword);
app.post("/reset-password", resetPassword);

// 	try {
// 		const { email } = req.body;
// 		const user = await prisma.user.findUnique({
// 			where: { email },
// 		});

// 	try {
// 		const { email } = req.body;
// 		const user = await prisma.user.findUnique({
// 			where: { email },
// 		});

// 		if (user) {
// 			const token = jwt.sign({ userId: user.id }, authConfig.secret, {
// 				expiresIn: "5m",
// 			});
// 		if (user) {
// 			const token = jwt.sign({ userId: user.id }, authConfig.secret, {
// 				expiresIn: "5m",
// 			});

// 			const mailerSend = new MailerSend({
// 				apiKey: process.env.API_EMAIL_KEY || "",
// 			});
// 			const mailerSend = new MailerSend({
// 				apiKey: process.env.API_EMAIL_KEY || "",
// 			});

// 			const sentFrom = new Sender(
// 				`${process.env.API_SMTP_KEY}`,
// 				"AdthaSoftware"
// 			);
// 			const sentFrom = new Sender(
// 				`${process.env.API_SMTP_KEY}`,
// 				"AdthaSoftware"
// 			);

// 			const recipients = [new Recipient(`${user.email}`, `${user.name}`)];
// 			console.log(recipients[0].name);
// 			const recipients = [new Recipient(`${user.email}`, `${user.name}`)];
// 			console.log(recipients[0].name);

// 			const personalization = [
// 				{
// 					email: `${user.email}`,
// 					data: {
// 						user: {
// 							name: `${recipients[0].name}`,
// 							email: `${recipients[0].email}`,
// 						},
// 						action_url: `${process.env.FRONTEND_URL}/reset-password?token=${token}`,
// 						support_url: "https://wa.me/65996731038",
// 						account_name: `${user.name}`,
// 					},
// 				},
// 			];
// 			const personalization = [
// 				{
// 					email: `${user.email}`,
// 					data: {
// 						user: {
// 							name: `${recipients[0].name}`,
// 							email: `${recipients[0].email}`,
// 						},
// 						action_url: `${process.env.FRONTEND_URL}/reset-password?token=${token}`,
// 						support_url: "https://wa.me/65996731038",
// 						account_name: `${user.name}`,
// 					},
// 				},
// 			];

// 			const emailParams = new EmailParams()
// 				.setFrom(sentFrom)
// 				.setTo(recipients)
// 				.setSubject("Subject")
// 				.setTemplateId("zr6ke4n7e2mgon12")
// 				.setPersonalization(personalization);
// 			const emailParams = new EmailParams()
// 				.setFrom(sentFrom)
// 				.setTo(recipients)
// 				.setSubject("Subject")
// 				.setTemplateId("zr6ke4n7e2mgon12")
// 				.setPersonalization(personalization);

// 			try {
// 				await mailerSend.email.send(emailParams);
// 				res.status(200).send({
// 					message: "Email enviado com sucesso, verifique sua caixa de entrada.",
// 				});
// 			} catch (error) {
// 				console.error("Error sending email:", error);
// 				res
// 					.status(500)
// 					.send({ error: "Erro ao enviar o email, tente novamente." });
// 			}
// 		}
// 			try {
// 				await mailerSend.email.send(emailParams);
// 				res.status(200).send({
// 					message: "Email enviado com sucesso, verifique sua caixa de entrada.",
// 				});
// 			} catch (error) {
// 				console.error("Error sending email:", error);
// 				res
// 					.status(500)
// 					.send({ error: "Erro ao enviar o email, tente novamente." });
// 			}
// 		}

// 		res.status(200).send({
// 			message:
// 				"Se esse e-mail estiver cadastrado, enviaremos um link de recuperação.",
// 		});
// 	} catch (err) {
// 		handleYupError(err, res);
// 	}
// });

// app.post("/reset-password", async (req: Request, res: Response) => {
// 	const { newPassword } = req.body;
// 	const token = req.query.token as string;
// 	try {
// 		const payload = jwt.verify(token, authConfig.secret) as { userId: number };
// 		if (!payload) {
// 			res.status(401).send({ error: "Token inválido ou expirado." });
// 			return;
// 		}
// 		res.status(200).send({
// 			message:
// 				"Se esse e-mail estiver cadastrado, enviaremos um link de recuperação.",
// 		});
// 	} catch (err) {
// 		handleYupError(err, res);
// 	}
// });

// app.post("/reset-password", async (req: Request, res: Response) => {
// 	const { newPassword } = req.body;
// 	const token = req.query.token as string;
// 	try {
// 		const payload = jwt.verify(token, authConfig.secret) as { userId: number };
// 		if (!payload) {
// 			res.status(401).send({ error: "Token inválido ou expirado." });
// 			return;
// 		}

// 		const user = await prisma.user.findUnique({
// 			where: { id: payload.userId },
// 		});
// 		const user = await prisma.user.findUnique({
// 			where: { id: payload.userId },
// 		});

// 		if (!user) {
// 			res.status(401).send({ error: "Token inválido ou expirado." });
// 			return;
// 		}
// 		if (!user) {
// 			res.status(401).send({ error: "Token inválido ou expirado." });
// 			return;
// 		}

// 		const passwordHash = await bcrypt.hash(newPassword, 10);
// 		await prisma.user.update({
// 			where: { id: payload.userId },
// 			data: { password: passwordHash },
// 		});
// 		const passwordHash = await bcrypt.hash(newPassword, 10);
// 		await prisma.user.update({
// 			where: { id: payload.userId },
// 			data: { password: passwordHash },
// 		});

// 		res.status(200).send({ message: "Senha resetada com sucesso." });
// 	} catch (err) {
// 		handleYupError(err, res);
// 	}
// });

app.use(auth);

app.get("/users", usersControllers.getAllUsers);
app.get("/users/id", usersControllers.getUserById);
app.post("/users", usersControllers.createUser);
app.put("/users", usersControllers.updateUser);

// app.put(
// 	"/upload",
// 	upload.single("avatarUrl"),
// 	uploadController.uploadProfilePhoto
// );//*

app.get(
	"/dashboard/month/:month/year/:year",
	dashboardController.dashboardPerMonthAndYear
);

// const upload = multer({ dest: "uploads/" });

// app.put(
// 	"/upload",
// 	upload.single("avatarUrl"),
// 	async (req: Request, res: Response) => {
// 		const file = req.file;

// 		if (!file) {
// 			return res.status(400).json({ error: "No file uploaded" });
// 		}

// 		const existingUserAvatar = await prisma.user.findUnique({
// 			where: { id: Number(req.userId) },
// 		});

// 		if (existingUserAvatar?.avatarUrl && existingUserAvatar?.avatarPublicId) {
// 			await cloudinary.uploader.destroy(existingUserAvatar?.avatarPublicId!);
// 		}

// 		const cloudinaryResponse = await cloudinary.uploader.upload(file?.path!, {
// 			folder: "profilePhotoUsers",
// 			overwrite: true,
// 			format: "webp",
// 		});
// 		fs.unlinkSync(file?.path!);

// 		const userUpdated = await prisma.user.update({
// 			where: { id: Number(req.userId) },
// 			data: {
// 				avatarUrl: cloudinaryResponse.secure_url,
// 				avatarPublicId: cloudinaryResponse.public_id,
// 			},
// 		});

// 		res.send(userUpdated);
// 	}
// );

app.use(auth);
// Usuário
app.get("/users", usersControllers.getAllUsers);
app.get("/users/id", usersControllers.getUserById);
app.post("/users", usersControllers.createUser);
app.put("/users", usersControllers.updateUser);

// Dashboard por mês e ano
app.get(
	"/dashboard/month/:month/year/:year",
	dashboardController.dashboardPerMonthAndYear
);

// Empresa
app.get("/companies", companiesControllers.getAllCompanies);
app.get("/companies/id", companiesControllers.getCompaniesById);
app.post("/companies", companiesControllers.createCompany);
app.put("/companies", companiesControllers.updateCompany);

//Endereço
app.get("/addresses", addressesControllers.getAllAddresses);
app.get("/addresses/id", addressesControllers.getAddressById);
app.post("/addresses", addressesControllers.createAddress);
app.put("/addresses/:id", addressesControllers.updateAddress);

// Serviços

app.get("/services", servicesControllers.getAllServicesByCompanyId);
app.get("/services/:id", servicesControllers.getServiceById);
app.post("/services", servicesControllers.createService);
app.put("/services/:id", servicesControllers.updateService);
app.delete("/services/:id", servicesControllers.deleteService);

//Agenda
app.get("/schedules", schedulesControllers.getAllSchedulesByCompanyId);
app.get("/schedules/:id", schedulesControllers.getScheduleById);
app.post("/schedules", schedulesControllers.createSchedule);
app.put("/schedules/:id", schedulesControllers.updateSchedule);

// Cliente
app.get("/customers", customersControllers.getAllSchedulesByCompanyId);
app.get("/customers/:id", customersControllers.getCustomerById);
app.post("/customers", customersControllers.createCustomer);
app.put("/customers/:id", customersControllers.updateCustomer);
app.delete("/customers/:id", customersControllers.deleteCustomer);

// Horário disponível
app.get(
	"/avaliable-times",
	avaliableTimesControllers.getAllAvaliableTimesByCompanyId
);
app.get("/avaliable-times/:id", avaliableTimesControllers.getAvaliableTimeById);
app.post("/avaliable-times", avaliableTimesControllers.createAvaliableTime);
app.put("/avaliable-times/:id", avaliableTimesControllers.updateAvaliableTime);
app.delete(
	"/avaliable-times/:id",
	avaliableTimesControllers.deleteAvaliableTime
);

// const upload = multer({ dest: "uploads/" });

// app.put(
// 	"/upload",
// 	upload.single("avatarUrl"),
// 	async (req: Request, res: Response) => {
// 		const file = req.file;

// 		if (!file) {
// 			return res.status(400).json({ error: "No file uploaded" });
// 		}

// 		const existingUserAvatar = await prisma.user.findUnique({
// 			where: { id: Number(req.userId) },
// 		});

// 		if (existingUserAvatar?.avatarUrl && existingUserAvatar?.avatarPublicId) {
// 			await cloudinary.uploader.destroy(existingUserAvatar?.avatarPublicId!);
// 		}

// 		const cloudinaryResponse = await cloudinary.uploader.upload(file?.path!, {
// 			folder: "profilePhotoUsers",
// 			overwrite: true,
// 			format: "webp",
// 		});
// 		fs.unlinkSync(file?.path!);

// 		const userUpdated = await prisma.user.update({
// 			where: { id: Number(req.userId) },
// 			data: {
// 				avatarUrl: cloudinaryResponse.secure_url,
// 				avatarPublicId: cloudinaryResponse.public_id,
// 			},
// 		});

// 		res.send(userUpdated);
// 	}
// );

app.get("/unavaliable-times", async (req: Request, res: Response) => {
	const page = Math.max(1, parseInt(req.query.page as string) || 1);
	const limit = Math.min(
		100,
		Math.max(1, parseInt(req.query.limit as string) || 10)
	);
	const skip = (page - 1) * limit;

	const totalItems = await prisma.unavaliableTime.count({
		where: { companyId: req.companyId },
	});

	const totalPages = Math.ceil(totalItems / limit);

	if (page > totalPages) {
		return res.status(404).send({ error: "Página não encontrada" });
	}

	const unavaliableTimes = await prisma.unavaliableTime.findMany({
		where: { companyId: req.companyId, deletedAt: null },
		skip: skip,
		take: limit,
		orderBy: { date: "asc" },
	});

	res.send({ unavaliableTimes, totalPages, currentPage: page });
});

app.get("/unavaliable-times/:id", async (req: Request, res: Response) => {
	const { id } = req.params;

	const unavaliableTimeId = await prisma.unavaliableTime.findUnique({
		where: { id: parseInt(id), deletedAt: null },
	});

	if (!unavaliableTimeId)
		return res.status(400).send({ error: "Unavailable times not found" });

	res.send(unavaliableTimeId);
});

interface UnavaliableRequest extends Request {
	body: UnavaliableData;
}

app.post(
	"/unavaliable-times",
	async (req: UnavaliableRequest, res: Response) => {
		const { date, startTime, endTime } = req.body;

		try {
			await unavaliableSchema.validate(req.body, { abortEarly: false });

			const existingDate = await prisma.unavaliableTime.findFirst({
				where: {
					date,
					companyId: req.companyId,
					deletedAt: null,
				},
			});

			if (existingDate?.date) {
				const errorResponse: ErrorResponse = {
					errors: [{ message: "Data já está em uso" }],
				};

				return res.status(400).json(errorResponse);
			}

			const startOfDayDate = date.split("T")[0] + `T${startTime}:00.000Z`;
			const endOfDayDate = date.split("T")[0] + `T${endTime}:00.000Z`;

			const existingSchedule = await prisma.schedule.findFirst({
				where: {
					date: {
						gte: startOfDayDate,
						lte: endOfDayDate,
					},
					status: "SCHEDULED",
					companyId: req.companyId,
				},
			});

			if (existingSchedule) {
				const errorResponse: ErrorResponse = {
					errors: [{ message: "Já existe um agendamento para este período." }],
				};

				return res.status(400).json(errorResponse);
			}

			let unavaliableTimeCreated;

			const existingDateDeleted = await prisma.unavaliableTime.findFirst({
				where: {
					date,
					companyId: req.companyId,
					NOT: {
						deletedAt: null,
					},
				},
			});

			if (existingDateDeleted) {
				unavaliableTimeCreated = await prisma.unavaliableTime.update({
					where: { id: existingDateDeleted.id },
					data: {
						startTime,
						endTime,
						deletedAt: null,
					},
				});
			} else {
				unavaliableTimeCreated = await prisma.unavaliableTime.create({
					data: { date, startTime, endTime, companyId: Number(req.companyId) },
				});
			}

			res.send(unavaliableTimeCreated);
		} catch (err) {
			handleYupError(err, res);
		}
	}
);

app.put(
	"/unavaliable-times/:id",
	async (req: UnavaliableRequest, res: Response) => {
		const { id } = req.params;
		const { date, startTime, endTime } = req.body;

		try {
			await unavaliableSchema.validate(req.body, { abortEarly: false });

			const unavaliableTimeId = await prisma.unavaliableTime.findUnique({
				where: { id: parseInt(id) },
			});

			if (!unavaliableTimeId)
				return res.status(400).send({ error: "Unavaliable time not found" });

			const existingDate = await prisma.unavaliableTime.findFirst({
				where: {
					date,
					companyId: req.companyId,
				},
			});

			if (existingDate?.date) {
				const errorResponse: ErrorResponse = {
					errors: [{ message: "Data já está em uso." }],
				};

				return res.status(400).json(errorResponse);
			}

			const startOfDayDate = date.split("T")[0] + `T${startTime}:00.000Z`;
			const endOfDayDate = date.split("T")[0] + `T${endTime}:00.000Z`;

			const existingSchedule = await prisma.schedule.findFirst({
				where: {
					date: {
						gte: startOfDayDate,
						lte: endOfDayDate,
					},
					status: "SCHEDULED",
					companyId: Number(req.userId),
				},
			});

			if (existingSchedule) {
				const errorResponse: ErrorResponse = {
					errors: [{ message: "Já existe um agendamento para este período." }],
				};

				return res.status(400).json(errorResponse);
			}

			const unavaliableUpdated = await prisma.unavaliableTime.update({
				where: { id: parseInt(id) },
				data: { date, startTime, endTime },
			});

			res.send(unavaliableUpdated);
		} catch (err) {
			handleYupError(err, res);
		}
	}
);

app.delete("/unavailable-times/:id", async (req: Request, res: Response) => {
	const { id } = req.params;

	const unavaliableTimeId = await prisma.unavaliableTime.findUnique({
		where: { id: parseInt(id) },
	});

	if (!unavaliableTimeId)
		return res.status(400).send({ error: "Unavaliable time not found" });

	const unavaliableDeleted = await prisma.unavaliableTime.update({
		where: { id: parseInt(id) },
		data: { deletedAt: new Date() },
	});

	res.send(unavaliableDeleted);
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
