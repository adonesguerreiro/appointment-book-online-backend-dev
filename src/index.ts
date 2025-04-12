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

app.get("/avaliable-times", async (req: Request, res: Response) => {
	const { date } = req.query;

	const page = Math.max(1, parseInt(req.query.page as string) || 1);
	const limit = Math.min(
		100,
		Math.max(1, parseInt(req.query.limit as string) || 10)
	);
	const skip = (page - 1) * limit;

	const totalItems = await prisma.avaliableTime.count({
		where: { companyId: req.companyId },
	});

	const totalPages = Math.ceil(totalItems / limit);

	if (page > totalPages) {
		return res.status(404).send({ error: "Página não encontrada" });
	}

	let avaliableTimes;

	if (date) {
		const convertDateDay = await dateConvertDay(date as string);
		const day = convertDateDay as DayWeek;

		avaliableTimes = await prisma.avaliableTime.findMany({
			where: {
				companyId: req.companyId,
				...(day && { day: day as DayWeek }),
				deletedAt: null,
			},
			include: {
				avaliableTimeSlot: {
					orderBy: {
						timeSlot: "asc",
					},
				},
			},
			skip: skip,
			take: limit,
		});
	} else {
		avaliableTimes = await prisma.avaliableTime.findMany({
			where: { companyId: req.companyId, deletedAt: null },
			skip: skip,
			take: limit,
			orderBy: { day: "asc" },
		});
	}

	res.send({ avaliableTimes, totalPages, currentPage: page });
});

app.get("/avaliable-times/:id", async (req: Request, res: Response) => {
	const { id } = req.params;

	const avaliableTimeId = await prisma.avaliableTime.findUnique({
		where: { id: parseInt(id) },
	});

	if (!avaliableTimeId)
		return res.status(400).send({ error: "Time not found" });

	res.send(avaliableTimeId);
});

interface AvaliableRequest extends Request {
	body: AvailableTimeData;
}

app.post("/avaliable-times", async (req: AvaliableRequest, res: Response) => {
	const { day, period, startTime, endTime, interval } = req.body;

	try {
		await avaliableSchema.validate(req.body, { abortEarly: false });

		const existingAvaliableTime = await prisma.avaliableTime.findFirst({
			where: {
				day,
				period,
				companyId: req.companyId,
				deletedAt: null,
			},
		});

		if (existingAvaliableTime) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Horário disponível já está em uso." }],
			};

			return res.status(400).json(errorResponse);
		}

		const existingAvaliableTimeDeleted = await prisma.avaliableTime.findFirst({
			where: {
				day,
				period,
				companyId: req.companyId,
				NOT: {
					deletedAt: null,
				},
			},
		});

		let avaliableCreated = null;

		if (existingAvaliableTimeDeleted) {
			avaliableCreated = await prisma.avaliableTime.update({
				where: { id: Number(existingAvaliableTimeDeleted.id) },
				data: {
					startTime,
					endTime,
					interval,
					deletedAt: null,
				},
			});
		} else {
			avaliableCreated = await prisma.avaliableTime.create({
				data: {
					day,
					period,
					startTime,
					endTime,
					interval,
					companyId: Number(req.companyId),
					updatedAt: new Date(),
				},
			});
		}

		const avaliableTimeSlotCreated = await generateAvaliableTimes(
			startTime,
			endTime,
			interval!,
			Number(req.companyId)
		);

		for (const time of avaliableTimeSlotCreated) {
			await prisma.avaliableTimeSlot.upsert({
				where: {
					timeSlot_avaliableTimeId_companyId: {
						timeSlot: time,
						avaliableTimeId: Number(avaliableCreated.id),
						companyId: Number(req.userId),
					},
				},
				update: {
					timeSlot: time,
				},
				create: {
					timeSlot: time,
					avaliableTimeId: Number(avaliableCreated.id),
					companyId: Number(req.userId),
					updatedAt: new Date(),
				},
			});
		}

		res.send({ avaliableCreated, avaliableTimeSlotCreated });
	} catch (err) {
		handleYupError(err, res);
	}
});

app.put(
	"/avaliable-times/:id",
	async (req: AvaliableRequest, res: Response) => {
		const { id } = req.params;
		const { day, period, startTime, endTime, interval } = req.body;

		try {
			await avaliableSchema.validate(req.body, { abortEarly: false });

			const avaliableTimeId = await prisma.avaliableTime.findUnique({
				where: { id: parseInt(id) },
			});

			if (!avaliableTimeId)
				return res.status(400).send({ error: "Available time not found" });

			const existingAvaliableTime = await prisma.avaliableTime.findFirst({
				where: {
					NOT: { id: parseInt(id) },
					day,
					period,
					startTime,
					endTime,
					interval,
					companyId: req.companyId,
				},
			});

			if (existingAvaliableTime) {
				const errorResponse: ErrorResponse = {
					errors: [{ message: "Horário disponível já está em uso." }],
				};

				return res.status(400).json(errorResponse);
			}

			const existingSchedule = await prisma.$queryRaw`
  SELECT *
  FROM "Schedule"
  WHERE
    "companyId" = ${req.companyId}
    AND "status" = 'SCHEDULED'
    AND TO_CHAR("date", 'HH24:MI:SS') BETWEEN ${startTime} AND ${endTime}
  LIMIT 1;
`;

			if (existingSchedule) {
				const errorResponse: ErrorResponse = {
					errors: [
						{
							message:
								"Já existe um agendamento para este período, não é possível alterar.",
						},
					],
				};

				return res.status(400).json(errorResponse);
			}

			const avaliableUpdated = await prisma.avaliableTime.update({
				where: { id: parseInt(id) },
				data: {
					day,
					startTime,
					period,
					endTime,
					interval,
					companyId: req.companyId,
				},
			});

			const availableTimeSlotUpdated = await generateAvaliableTimes(
				startTime,
				endTime,
				interval!,
				Number(req.companyId)
			);

			for (const time of availableTimeSlotUpdated) {
				await prisma.avaliableTimeSlot.upsert({
					where: {
						timeSlot_avaliableTimeId_companyId: {
							timeSlot: time,
							avaliableTimeId: Number(avaliableUpdated.id),
							companyId: Number(req.companyId),
						},
					},
					update: {
						timeSlot: time,
					},
					create: {
						timeSlot: time,
						avaliableTimeId: Number(avaliableUpdated.id),
						companyId: Number(req.companyId),
						updatedAt: new Date(),
					},
				});
			}

			res.send({
				availableTimeSlotUpdated,
			});
		} catch (err) {
			handleYupError(err, res);
		}
	}
);

app.delete("/avaliable-times/:id", async (req: Request, res: Response) => {
	const { id } = req.params;

	const avaliableId = await prisma.avaliableTime.findUnique({
		where: { id: parseInt(id) },
	});

	if (!avaliableId) return res.status(400).send({ error: "Time not found" });

	const allSchedules = await prisma.schedule.findMany({
		where: { companyId: req.companyId },
	});

	const scheduleExists = (
		await Promise.all(
			allSchedules.map(async (schedule) => {
				const scheduleTime = schedule.date
					.toISOString()
					.split("T")[1]
					.slice(0, 5);
				const scheduleDay = await dateConvertDay(
					schedule.date.toISOString().split("T")[0]
				);

				return (
					scheduleTime >= avaliableId.startTime &&
					scheduleTime <= avaliableId.endTime &&
					scheduleDay === avaliableId.day
				);
			})
		)
	).find(Boolean);

	if (scheduleExists) {
		const errorResponse: ErrorResponse = {
			errors: [
				{
					message:
						"Horário disponível possui agendamentos, não é possível deletar",
				},
			],
		};

		return res.status(400).json(errorResponse);
	}

	const avaliableDeleted = await prisma.avaliableTime.update({
		where: { id: parseInt(id) },
		data: { deletedAt: new Date() },
	});

	res.send(avaliableDeleted);
});

app.get(
	"/available-time-slot/company/:id",
	async (req: Request, res: Response) => {
		const { id } = req.params;
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;
		const skip = (page - 1) * limit;

		const avaliableTimeSlot = await prisma.avaliableTimeSlot.findMany({
			where: { companyId: parseInt(id) },
			skip: skip,
			take: limit,
		});

		if (!avaliableTimeSlot) {
			return res.status(400).send({ error: "Time not found" });
		}

		res.send(avaliableTimeSlot);
	}
);

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
