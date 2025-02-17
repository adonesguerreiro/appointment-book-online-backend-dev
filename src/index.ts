import { AddressData } from "./interfaces/AddressData";
import { DayWeek, PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import bcrypt from "bcrypt";
import { ErrorResponse } from "./interfaces/ErrorResponse";
import { userSchema } from "./schemas/userSchema";
import { companySchema } from "./schemas/companySchema";
import { addressSchema } from "./schemas/addressSchema";
import { serviceSchema } from "./schemas/serviceSchema";
import { customerSchema } from "./schemas/customerSchema";
import { avaliableSchema } from "./schemas/avaliableSchema";
import { unavaliableSchema } from "./schemas/unavaliableSchema";
import { UserData } from "./interfaces/UserData";
import { CompanyData } from "./interfaces/CompanyData";
import { ServiceData } from "./interfaces/ServiceData";
import { CustomerData } from "./interfaces/CustomerData";
import { AvailableTimeData } from "./interfaces/AvailableTimeData";
import { UnavaliableData } from "./interfaces/UnavaliableData";
import jwt from "jsonwebtoken";
import { authConfig } from "./config/auth";
import auth from "./middlewares/auth";
import { SessionData } from "./interfaces/SessionData";
import { sessionSchema } from "./schemas/sessionSchema";
import { scheduleSchema } from "./schemas/scheduleSchema";
import { ScheduleData } from "./interfaces/ScheduleData";
import { handleYupError } from "./utils/handleYupError";
import { generateAvaliableTimes } from "./utils/generateAvaliableTimes";
import { dateConvertDay } from "./utils/dateConvertDay";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

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

interface SessionRequest extends Request {
	body: SessionData;
}

app.post("/sessions", async (req: SessionRequest, res: Response) => {
	const { email, password } = req.body;

	try {
		await sessionSchema.validate(req.body, { abortEarly: false });

		const existingUser = await prisma.user.findUnique({
			where: { email },
		});

		if (!existingUser) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "User not found." }],
			};
			return res.status(401).json(errorResponse);
		}

		const isPasswordValid = await bcrypt.compare(
			password,
			existingUser.password
		);

		if (!isPasswordValid) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Invalid password" }],
			};
			return res.status(401).json(errorResponse);
		}

		const { id, name } = existingUser;

		return res.json({
			existingUser: id,
			name,
			email,
			token: jwt.sign({ id }, authConfig.secret, {
				expiresIn: authConfig.expiresIn,
			}),
		});
	} catch (err) {
		handleYupError(err, res);
	}
});

app.post("/forgot-password", async (req: Request, res: Response) => {
	const { email } = req.body;
	const user = await prisma.user.findUnique({
		where: { email },
	});

	if (user) {
		const token = jwt.sign({ userId: user.id }, authConfig.secret, {
			expiresIn: "5m",
		});

		const mailerSend = new MailerSend({
			apiKey: process.env.API_EMAIL_KEY || "",
		});

		const sentFrom = new Sender(`${process.env.API_SMTP_KEY}`, "AdthaSoftware");

		const recipients = [new Recipient(`${user.email}`, `${user.name}`)];
		console.log(recipients[0].name);

		const personalization = [
			{
				email: `${user.email}`,
				data: {
					user: {
						name: `${recipients[0].name}`,
						email: `${recipients[0].email}`,
					},
					action_url: `${process.env.FRONTEND_URL}/reset-password?token=${token}`,
					support_url: "https://wa.me/65996731038",
					account_name: `${user.name}`,
				},
			},
		];

		const emailParams = new EmailParams()
			.setFrom(sentFrom)
			.setTo(recipients)
			.setSubject("Subject")
			.setTemplateId("zr6ke4n7e2mgon12")
			.setPersonalization(personalization);

		try {
			await mailerSend.email.send(emailParams);
			res.status(200).send({
				message: "Email enviado com sucesso, verifique sua caixa de entrada.",
			});
		} catch (error) {
			console.error("Error sending email:", error);
			res
				.status(500)
				.send({ error: "Erro ao enviar o email, tente novamente." });
		}
	}

	res.status(200).send({
		message:
			"Se esse e-mail estiver cadastrado, enviaremos um link de recuperação.",
	});
});

app.post("/reset-password", async (req: Request, res: Response) => {
	const { newPassword } = req.body;
	const token = req.query.token as string;
	try {
		const payload = jwt.verify(token, authConfig.secret) as { userId: number };
		if (!payload) {
			res.status(401).send({ error: "Token inválido ou expirado." });
			return;
		}

		const user = await prisma.user.findUnique({
			where: { id: payload.userId },
		});

		if (!user) {
			res.status(401).send({ error: "Token inválido ou expirado." });
			return;
		}

		const passwordHash = await bcrypt.hash(newPassword, 10);
		await prisma.user.update({
			where: { id: payload.userId },
			data: { password: passwordHash },
		});

		res.status(200).send({ message: "Senha resetada com sucesso." });
	} catch (error) {
		console.error("Error reset password:", error);
		res.status(500).send({ error: "Erro ao resetar a senha." });
	}
});

interface UserRequest extends Request {
	body: UserData;
}

app.post("/users", async (req: UserRequest, res: Response) => {
	const { name, email, password, specialty } = req.body;
	const passwordHash = await bcrypt.hash(password, 10);

	try {
		await userSchema.validate(req.body, { abortEarly: false });

		const existingUser = await prisma.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Email already in use" }],
			};
			return res.status(400).json(errorResponse);
		}

		const userCreated = await prisma.user.create({
			data: {
				name,
				email,
				password: passwordHash,
				specialty,
				companyId: req.companyId,
			},
		});

		res.send(userCreated);
	} catch (err) {
		handleYupError(err, res);
	}
});

app.post("/companies", async (req: CompanyRequest, res: Response) => {
	const { name, mobile, email, cnpj } = req.body;

	try {
		await companySchema.validate(req.body, { abortEarly: false });

		const existingCompany = await prisma.company.findFirst({
			where: { OR: [{ mobile }, { email }, { cnpj }] },
		});

		if (existingCompany?.mobile) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Mobile number already in use" }],
			};

			return res.status(400).json(errorResponse);
		}

		if (existingCompany?.email) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Mobile number already in use" }],
			};

			return res.status(400).json(errorResponse);
		}

		if (existingCompany?.cnpj) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Mobile number already in use" }],
			};

			return res.status(400).json(errorResponse);
		}
		const companyCreated = await prisma.company.create({
			data: { name, mobile, email, cnpj },
		});

		res.send(companyCreated);
	} catch (err) {
		handleYupError(err, res);
	}
});

app.use(auth);

app.get(
	"/dashboard/month/:month/year/:year",
	async (req: Request, res: Response) => {
		const { month, year } = req.params;

		const scheduleByStatus = await prisma.schedule.groupBy({
			by: ["status"],
			where: {
				companyId: req.companyId,
				date: {
					gte: new Date(`${year}-${month}-01`),
					lte: new Date(`${year}-${month}-31`),
				},
			},
			_count: {
				status: true,
			},
		});

		res.send({ scheduleByStatus });
	}
);

app.get("/users", async (req: Request, res: Response) => {
	const page = parseInt(req.query.page as string) || 1;
	const limit = parseInt(req.query.limit as string) || 10;
	const skip = (page - 1) * limit;

	const users = await prisma.user.findMany({
		skip: skip,
		take: limit,
	});

	res.send(users);
});

app.get("/users/id", async (req: Request, res: Response) => {
	const userId = await prisma.user.findUnique({
		where: { id: Number(req.userId) },
	});

	if (!userId) return res.status(400).send({ error: "User not found" });

	res.send(userId);
});

app.put("/users", async (req: UserRequest, res: Response) => {
	const userId = req.userId;
	const { name, email, password, newPassword, specialty } = req.body;

	try {
		await userSchema.validate(req.body, { abortEarly: false });

		const existingUser = await prisma.user.findUnique({
			where: {
				email,
				NOT: { id: Number(userId) },
			},
		});

		if (email === existingUser?.email && !newPassword) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Email já está em uso" }],
			};
			return res.status(400).json(errorResponse);
		}

		if (newPassword) {
			const passwordMatch = await bcrypt.compare(
				password,
				existingUser!.password
			);

			if (!passwordMatch) {
				const errorResponse: ErrorResponse = {
					errors: [{ message: "Senha atual incorreta" }],
				};
				return res.status(400).json(errorResponse);
			}

			const newPasswordHash = await bcrypt.hash(newPassword, 10);
			existingUser!.password = newPasswordHash;

			const userUpdated = await prisma.user.update({
				where: { id: Number(userId) },
				data: {
					name,
					email,
					password: newPasswordHash,
					specialty,
					companyId: req.companyId,
				},
			});

			return res.send(userUpdated);
		}

		const passwordHash = await bcrypt.hash(password, 10);
		const userUpdated = await prisma.user.update({
			where: { id: Number(userId) },
			data: {
				name,
				email,
				password: passwordHash,
				specialty,
				companyId: req.companyId,
			},
		});

		return res.send(userUpdated);
	} catch (err) {
		handleYupError(err, res);
	}
});

app.delete("/users/:id", async (req: Request, res: Response) => {
	const { id } = req.params;

	const userId = await prisma.user.findUnique({
		where: { id: parseInt(id) },
	});

	if (!userId) return res.status(400).send({ error: "User not found" });

	const userDeleted = await prisma.user.delete({
		where: { id: parseInt(id) },
	});

	res.send(userDeleted);
});

interface CompanyRequest extends Request {
	body: CompanyData;
}

app.get("/companies", async (req: Request, res: Response) => {
	const page = parseInt(req.query.page as string) || 1;
	const limit = parseInt(req.query.limit as string) || 10;
	const skip = (page - 1) * limit;

	const companies = await prisma.company.findMany({
		skip: skip,
		take: limit,
	});

	res.send(companies);
});

app.get("/companies/id", async (req: Request, res: Response) => {
	const companyId = await prisma.company.findUnique({
		where: { id: req.companyId },
		include: {
			addresses: true,
		},
	});

	if (!companyId) return res.status(400).send({ error: "Company not found" });

	res.send(companyId);
});

app.put("/companies", async (req: CompanyRequest, res: Response) => {
	const userId = req.userId;
	const { name, mobile, email, cnpj } = req.body;

	try {
		await companySchema.validate(req.body, { abortEarly: false });

		const companyId = await prisma.company.findUnique({
			where: { id: Number(userId) },
		});

		if (!companyId) return res.status(400).send({ error: "Company not found" });

		const existingCompany = await prisma.company.findFirst({
			where: {
				OR: [{ mobile }, { email }, { cnpj }],
				NOT: { id: Number(userId) },
			},
			include: { addresses: true },
		});

		if (existingCompany?.mobile === mobile) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Número de celular já está em uso" }],
			};

			return res.status(400).json(errorResponse);
		}

		if (existingCompany?.email === email) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Email já está em uso" }],
			};

			return res.status(400).json(errorResponse);
		}

		if (existingCompany?.cnpj === cnpj) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "CNPJ já está em uso" }],
			};

			return res.status(400).json(errorResponse);
		}

		const companyUpdated = await prisma.company.update({
			where: { id: Number(userId) },
			data: {
				name,
				mobile,
				email,
				cnpj,
			},
			include: { addresses: true },
		});

		res.send({ companyUpdated });
	} catch (err) {
		handleYupError(err, res);
	}
});

app.delete("/companies/:id", async (req: Request, res: Response) => {
	const { id } = req.params;

	const companyId = await prisma.company.findUnique({
		where: { id: parseInt(id) },
	});

	if (!companyId) return res.status(400).send({ error: "Company not found" });

	const companyDeleted = await prisma.company.delete({
		where: { id: parseInt(id) },
	});

	res.send(companyDeleted);
});

app.get("/addresses", async (req: Request, res: Response) => {
	const page = parseInt(req.query.page as string) || 1;
	const limit = parseInt(req.query.limit as string) || 10;
	const skip = (page - 1) * limit;

	const addresses = await prisma.address.findMany({
		skip: skip,
		take: limit,
	});

	res.send(addresses);
});

app.get("/addresses/:id", async (req: Request, res: Response) => {
	const { id } = req.params;

	const addressId = await prisma.address.findUnique({
		where: { id: parseInt(id) },
	});

	if (!addressId) return res.status(400).send({ error: "Address not found" });

	res.send(addressId);
});

interface AddressRequest extends Request {
	body: AddressData;
}

app.post("/addresses", async (req: AddressRequest, res: Response) => {
	const { street, number, complement, neighborhood, city, state, postalCode } =
		req.body;

	try {
		await addressSchema.validate(req.body, { abortEarly: false });

		const existingAddress = await prisma.address.findFirst({
			where: {
				street,
				number,
				neighborhood,
				city,
				state,
				postalCode,
				companyId: req.companyId,
			},
		});

		if (existingAddress?.street && existingAddress.companyId) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Street address already in use" }],
			};

			return res.status(400).json(errorResponse);
		}

		if (existingAddress?.number && existingAddress.companyId) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Number already in use" }],
			};

			return res.status(400).json(errorResponse);
		}

		if (existingAddress?.neighborhood && existingAddress.companyId) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Neighborhood already in use" }],
			};

			return res.status(400).json(errorResponse);
		}

		if (existingAddress?.city && existingAddress.companyId) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "City already in use" }],
			};

			return res.status(400).json(errorResponse);
		}

		if (existingAddress?.state && existingAddress.companyId) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "State already in use" }],
			};

			return res.status(400).json(errorResponse);
		}

		if (existingAddress?.postalCode && existingAddress.companyId) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Postal code already in use" }],
			};

			return res.status(400).json(errorResponse);
		}

		const addressCreated = await prisma.address.create({
			data: {
				street,
				number,
				complement,
				neighborhood,
				city,
				state,
				postalCode,
				companyId: Number(req.companyId),
			},
		});

		res.send(addressCreated);
	} catch (err) {
		handleYupError(err, res);
	}
});

app.put("/addresses/:id", async (req: AddressRequest, res: Response) => {
	const { id } = req.params;

	const { street, number, complement, neighborhood, city, state, postalCode } =
		req.body;

	try {
		await addressSchema.validate(req.body, { abortEarly: false });

		const addressId = await prisma.address.findUnique({
			where: { id: parseInt(id) },
		});

		if (!addressId) return res.status(400).send({ error: "Address not found" });

		const addressUpdated = await prisma.address.update({
			where: { id: parseInt(id) },
			data: {
				street,
				number,
				complement,
				neighborhood,
				city,
				state,
				postalCode,
				companyId: Number(req.companyId),
			},
		});

		res.send(addressUpdated);
	} catch (err) {
		handleYupError(err, res);
	}
});

app.delete("/addresses/:id", async (req: Request, res: Response) => {
	const { id } = req.params;

	const addressId = await prisma.address.findUnique({
		where: { id: parseInt(id) },
	});

	if (!addressId) return res.status(400).send({ error: "Address not found" });

	const addressDeleted = await prisma.company.delete({
		where: { id: parseInt(id) },
	});

	res.send(addressDeleted);
});

app.get("/services", async (req: Request, res: Response) => {
	const page = Math.max(1, parseInt(req.query.page as string) || 1);
	const limit = Math.min(
		100,
		Math.max(1, parseInt(req.query.limit as string) || 10)
	);
	const skip = (page - 1) * limit;

	const totalItems = await prisma.service.count({
		where: { companyId: req.companyId },
	});

	const totalPages = Math.ceil(totalItems / limit);

	if (page > totalPages) {
		return res.status(404).send({ error: "Página não encontrada" });
	}

	const services = await prisma.service.findMany({
		where: { companyId: req.companyId, deletedAt: null },
		skip: skip,
		take: limit,
		orderBy: { serviceName: "asc" },
	});

	res.send({ services, totalPages, currentPage: page });
});

app.get("/services/:id", async (req: Request, res: Response) => {
	const { id } = req.params;

	const serviceId = await prisma.service.findUnique({
		where: { id: parseInt(id), companyId: req.companyId },
	});

	if (!serviceId) return res.status(400).send({ error: "Service not found" });

	res.send(serviceId);
});

interface ServiceRequest extends Request {
	body: ServiceData;
}

app.post("/services", async (req: ServiceRequest, res: Response) => {
	const { serviceName, duration, price } = req.body;

	try {
		await serviceSchema.validate(req.body, { abortEarly: false });

		const existingService = await prisma.service.findFirst({
			where: {
				serviceName,
				companyId: req.companyId,
				deletedAt: null,
			},
		});

		if (existingService) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Nome do serviço já está em uso" }],
			};

			return res.status(400).json(errorResponse);
		}

		const existingServiceDeleted = await prisma.service.findFirst({
			where: {
				serviceName,
				companyId: req.companyId,
				NOT: {
					deletedAt: null,
				},
			},
		});

		let serviceCreated;

		if (existingServiceDeleted) {
			serviceCreated = await prisma.service.update({
				where: { id: existingServiceDeleted.id },
				data: {
					serviceName,
					duration,
					price,
					companyId: req.companyId,
					deletedAt: null,
				},
			});
		} else {
			serviceCreated = await prisma.service.create({
				data: {
					serviceName,
					duration,
					price,
					companyId: Number(req.companyId),
				},
			});
		}

		res.send(serviceCreated);
	} catch (err) {
		handleYupError(err, res);
	}
});

app.put("/services/:id", async (req: ServiceRequest, res: Response) => {
	const { id } = req.params;
	const { serviceName, duration, price } = req.body;

	try {
		await serviceSchema.validate(req.body, { abortEarly: false });

		const serviceId = await prisma.service.findUnique({
			where: { id: parseInt(id) },
		});

		if (!serviceId) return res.status(400).send({ error: "Service not found" });

		const existingService = await prisma.service.findFirst({
			where: {
				NOT: { id: parseInt(id) },
				companyId: req.companyId,
				serviceName,
			},
		});

		if (existingService) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Nome do serviço já está em uso" }],
			};
			return res.status(400).json(errorResponse);
		}

		const serviceUpdated = await prisma.service.update({
			where: { id: parseInt(id) },
			data: { serviceName, duration, price, companyId: req.companyId },
		});

		res.send(serviceUpdated);
	} catch (err) {
		handleYupError(err, res);
	}
});

app.delete("/services/:id", async (req: Request, res: Response) => {
	const { id } = req.params;

	const serviceId = await prisma.service.findUnique({
		where: { id: parseInt(id) },
	});

	const serviceScheduleExists = await prisma.schedule.findFirst({
		where: { serviceId: parseInt(id) },
	});

	if (serviceScheduleExists) {
		const errorResponse: ErrorResponse = {
			errors: [
				{ message: "Serviço possui agendamentos, não é possível deletar" },
			],
		};

		return res.status(400).json(errorResponse);
	}

	if (!serviceId) return res.status(400).send({ error: "Service not found" });

	const serviceDeleted = await prisma.service.update({
		where: { id: parseInt(id) },
		data: { deletedAt: new Date() },
	});

	res.send(serviceDeleted);
});

app.get("/schedules", async (req: Request, res: Response) => {
	try {
		const page = Math.max(1, parseInt(req.query.page as string) || 1);
		const limit = Math.min(
			100,
			Math.max(1, parseInt(req.query.limit as string) || 10)
		);
		const skip = (page - 1) * limit;

		const totalItems = await prisma.schedule.count({
			where: { companyId: req.companyId },
		});

		const totalPages = Math.ceil(totalItems / limit);

		if (page > totalPages) {
			return res.status(404).send({ error: "Página não encontrada" });
		}

		const schedules = await prisma.schedule.findMany({
			where: { companyId: req.companyId },
			skip,
			take: limit,
			orderBy: { date: "asc" },
		});

		res.send({ schedules, totalPages, currentPage: page });
	} catch (error) {
		console.error("Erro no backend:", error);
		res.status(500).send({ error: "Erro no servidor" });
	}
});

app.get("/schedules/:id", async (req: Request, res: Response) => {
	const { id } = req.params;

	const scheduleId = await prisma.schedule.findUnique({
		where: { id: parseInt(id), companyId: req.companyId },
	});

	if (!scheduleId) return res.status(400).send({ error: "Schedule not found" });

	res.send(scheduleId);
});

interface ScheduleRequest extends Request {
	body: ScheduleData;
}
app.post("/schedules", async (req: ScheduleRequest, res: Response) => {
	const { date, timeSlotAvaliable, status, customerId, serviceId } = req.body;

	const formattedDate = date.split("T")[0] + `T${timeSlotAvaliable}:00.000Z`;

	try {
		await scheduleSchema.validate(req.body, { abortEarly: false });

		const existingCustomerId = await prisma.customer.findFirst({
			where: { id: Number(customerId), companyId: req.companyId },
		});

		if (!existingCustomerId) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Cliente não encontrado" }],
			};

			return res.status(400).json(errorResponse);
		}

		const existingServiceId = await prisma.service.findFirst({
			where: { id: Number(serviceId), companyId: req.companyId },
		});

		if (!existingServiceId) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Serviço não encontrado" }],
			};

			return res.status(400).json(errorResponse);
		}

		const existingSchedule = await prisma.schedule.findFirst({
			where: {
				date: formattedDate,
				status,
				companyId: req.companyId,
			},
		});

		if (existingSchedule) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Agendamento já existe!" }],
			};

			return res.status(400).json(errorResponse);
		}

		const startOfDayDate = date.split("T")[0] + `T00:00:00.000Z`;
		const endOfDayDate = date.split("T")[0] + `T23:59:59.000Z`;

		const existingScheduleTime = await prisma.unavaliableTime.findFirst({
			where: {
				date: {
					gte: startOfDayDate,
					lte: endOfDayDate,
				},
				companyId: req.companyId,
			},
		});

		if (existingScheduleTime) {
			const errorResponse: ErrorResponse = {
				errors: [
					{
						message:
							"Já existe horário indisponível para este período, não será possível agendar.",
					},
				],
			};

			return res.status(400).json(errorResponse);
		}

		const scheduleCreated = await prisma.schedule.create({
			data: {
				date: formattedDate,
				status,
				customerId: existingCustomerId.id,
				customerName: existingCustomerId.customerName,
				customerPhone: existingCustomerId.mobile,
				serviceId: existingServiceId.id,
				serviceName: existingServiceId.serviceName,
				duration: existingServiceId.duration,
				price: existingServiceId.price,
				companyId: Number(req.companyId),
			},
		});

		res.send(scheduleCreated);
	} catch (err) {
		handleYupError(err, res);
	}
});

app.put("/schedules/:id", async (req: ScheduleRequest, res: Response) => {
	const { id } = req.params;
	const { date, timeSlotAvaliable, status, customerId, serviceId } = req.body;

	const formattedDate = date.split("T")[0] + `T${timeSlotAvaliable}:00.000Z`;

	try {
		await scheduleSchema.validate(req.body, { abortEarly: false });

		const existingCustomerId = await prisma.customer.findFirst({
			where: { id: Number(customerId), companyId: req.companyId },
		});

		if (!existingCustomerId) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Cliente não encontrado" }],
			};

			return res.status(400).json(errorResponse);
		}

		const existingServiceId = await prisma.service.findFirst({
			where: { id: Number(serviceId), companyId: req.companyId },
		});

		if (!existingServiceId) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Serviço não encontrado" }],
			};

			return res.status(400).json(errorResponse);
		}

		const existingSchedule = await prisma.schedule.findFirst({
			where: {
				date: formattedDate,
				status,
				companyId: req.companyId,
			},
		});

		if (existingSchedule) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Agendamento já existe!" }],
			};

			return res.status(400).json(errorResponse);
		}

		const startOfDayDate = date.split("T")[0] + `T00:00:00.000Z`;
		const endOfDayDate = date.split("T")[0] + `T23:59:59.000Z`;

		const existingScheduleTime = await prisma.unavaliableTime.findFirst({
			where: {
				date: {
					gte: startOfDayDate,
					lte: endOfDayDate,
				},
				companyId: req.companyId,
			},
		});

		if (existingScheduleTime) {
			const errorResponse: ErrorResponse = {
				errors: [
					{
						message:
							"Existe horário indisponível para este período, não será possível agendar.",
					},
				],
			};

			return res.status(400).json(errorResponse);
		}

		const scheduleUpdated = await prisma.schedule.update({
			where: { id: parseInt(id) },
			data: {
				date: formattedDate,
				status,
				customerId: existingCustomerId.id,
				customerName: existingCustomerId.customerName,
				customerPhone: existingCustomerId.mobile,
				serviceId: existingServiceId.id,
				serviceName: existingServiceId.serviceName,
				duration: existingServiceId.duration,
				price: existingServiceId.price,
				companyId: req.companyId,
			},
		});

		res.send(scheduleUpdated);
	} catch (err) {
		handleYupError(err, res);
	}
});

app.get("/customers", async (req: Request, res: Response) => {
	const page = Math.max(1, parseInt(req.query.page as string) || 1);
	const limit = Math.min(
		100,
		Math.max(1, parseInt(req.query.limit as string) || 10)
	);
	const skip = (page - 1) * limit;

	const totalItems = await prisma.customer.count({
		where: { companyId: req.companyId },
	});

	const totalPages = Math.ceil(totalItems / limit);

	if (page > totalPages) {
		return res.status(404).send({ error: "Página não encontrada" });
	}

	const customers = await prisma.customer.findMany({
		where: { companyId: req.companyId, deletedAt: null },
		skip: skip,
		take: limit,
		orderBy: { customerName: "asc" },
	});

	res.send({ customers, totalPages, currentPage: page });
});

app.get("/customers/:id", async (req: Request, res: Response) => {
	const { id } = req.params;

	const customerId = await prisma.customer.findUnique({
		where: { id: parseInt(id) },
	});

	if (!customerId) return res.status(400).send({ error: "Customer not found" });

	res.send(customerId);
});

interface CustomerRequest extends Request {
	body: CustomerData;
}

app.post("/customers", async (req: CustomerRequest, res: Response) => {
	const { customerName, mobile } = req.body;

	try {
		await customerSchema.validate(req.body, { abortEarly: false });

		const existingCustomer = await prisma.customer.findFirst({
			where: { mobile, companyId: req.companyId, deletedAt: null },
		});

		if (existingCustomer) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Número de celular já está em uso" }],
			};

			return res.status(400).json(errorResponse);
		}

		const existingCustomerDeleted = await prisma.customer.findFirst({
			where: {
				customerName,
				mobile,
				companyId: req.companyId,
				NOT: { deletedAt: null },
			},
		});

		let customerCreated;

		if (existingCustomerDeleted) {
			customerCreated = await prisma.customer.update({
				where: { id: existingCustomerDeleted.id },
				data: {
					customerName,
					mobile,
					deletedAt: null,
					companyId: req.companyId,
				},
			});
		} else {
			customerCreated = await prisma.customer.create({
				data: { customerName, mobile, companyId: Number(req.companyId) },
			});
		}

		res.send(customerCreated);
	} catch (err) {
		handleYupError(err, res);
	}
});

app.put("/customers/:id", async (req: CustomerRequest, res: Response) => {
	const { id } = req.params;
	const { customerName, mobile } = req.body;

	try {
		await customerSchema.validate(req.body, { abortEarly: false });

		const customerId = await prisma.customer.findUnique({
			where: { id: parseInt(id) },
		});

		if (!customerId)
			return res.status(400).send({ error: "Customer not found" });

		const existingCustomer = await prisma.customer.findFirst({
			where: {
				NOT: { id: parseInt(id) },
				companyId: req.companyId,
				mobile,
			},
		});

		if (existingCustomer) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Número do celular já está em uso" }],
			};

			return res.status(400).json(errorResponse);
		}

		const customer = await prisma.customer.update({
			where: { id: parseInt(id) },
			data: { customerName, mobile, companyId: req.companyId },
		});

		res.send(customer);
	} catch (err) {
		handleYupError(err, res);
	}
});

app.delete("/customers/:id", async (req: Request, res: Response) => {
	const { id } = req.params;

	const customerId = await prisma.customer.findUnique({
		where: { id: parseInt(id) },
	});

	if (!customerId) return res.status(400).send({ error: "Customer not found" });

	const customerSchedulesExists = await prisma.schedule.findFirst({
		where: { customerId: parseInt(id) },
	});

	if (customerSchedulesExists) {
		const errorResponse: ErrorResponse = {
			errors: [
				{ message: "Cliente possui agendamentos, não é possível deletar" },
			],
		};

		return res.status(400).json(errorResponse);
	}

	const customerDeleted = await prisma.customer.update({
		where: { id: parseInt(id) },
		data: { deletedAt: new Date() },
	});

	res.send(customerDeleted);
});

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
