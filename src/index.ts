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

interface UserRequest extends Request {
	body: UserData;
}

app.get(
	"/dashboard/company/:id/month/:month/year/:year",
	async (req: Request, res: Response) => {
		const { id, month, year } = req.params;

		if (!id) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "ID da empresa é obrigatório" }],
			};
			return res.status(400).json(errorResponse);
		}
		const scheduleByStatus = await prisma.schedule.groupBy({
			by: ["status"],
			where: {
				companyId: Number(id),
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

app.post("/users", async (req: UserRequest, res: Response) => {
	const { name, email, password, specialty, companyId } = req.body;
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
			data: { name, email, password: passwordHash, specialty, companyId },
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

app.get("/users/:id", async (req: Request, res: Response) => {
	const { id } = req.params;

	const userId = await prisma.user.findUnique({
		where: { id: parseInt(id) },
	});

	if (!userId) return res.status(400).send({ error: "User not found" });

	res.send(userId);
});

app.put("/users", async (req: UserRequest, res: Response) => {
	const userId = req.userId;
	const { name, email, password, newPassword, specialty, companyId } = req.body;

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
					companyId: Number(req.userId),
				},
			});

			return res.send(userUpdated);
		}

		const passwordHash = await bcrypt.hash(password, 10);
		const userUpdated = await prisma.user.update({
			where: { id: Number(userId) },
			data: { name, email, password: passwordHash, specialty, companyId },
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

app.get("/companies/:id", async (req: Request, res: Response) => {
	const { id } = req.params;

	const companyId = await prisma.company.findUnique({
		where: { id: parseInt(id) },
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
	const {
		street,
		number,
		complement,
		neighborhood,
		city,
		state,
		postalCode,
		companyId,
	} = req.body;

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
				companyId,
			},
		});

		res.send(addressCreated);
	} catch (err) {
		handleYupError(err, res);
	}
});

app.put("/addresses/:id", async (req: AddressRequest, res: Response) => {
	const { id } = req.params;

	const {
		street,
		number,
		complement,
		neighborhood,
		city,
		state,
		postalCode,
		companyId,
	} = req.body;

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
				companyId,
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

app.get("/services/company/:id", async (req: Request, res: Response) => {
	const { id } = req.params;
	const page = Math.max(1, parseInt(req.query.page as string) || 1);
	const limit = Math.min(
		100,
		Math.max(1, parseInt(req.query.limit as string) || 10)
	);
	const skip = (page - 1) * limit;

	const totalItems = await prisma.service.count({
		where: { companyId: parseInt(id) },
	});

	const totalPages = Math.ceil(totalItems / limit);

	if (page > totalPages) {
		return res.status(404).send({ error: "Página não encontrada" });
	}

	const services = await prisma.service.findMany({
		where: { companyId: parseInt(id), deletedAt: null },
		skip: skip,
		take: limit,
	});

	res.send({ services, totalPages, currentPage: page });
});

app.get("/services/:id", async (req: Request, res: Response) => {
	const { id } = req.params;
	const userId = req.userId;

	const serviceId = await prisma.service.findUnique({
		where: { id: parseInt(id), companyId: Number(userId) },
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
				companyId: Number(req.userId),
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
				companyId: Number(req.userId),
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
					companyId: Number(req.userId),
					deletedAt: null,
				},
			});
		} else {
			serviceCreated = await prisma.service.create({
				data: { serviceName, duration, price, companyId: Number(req.userId) },
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
				companyId: Number(req.userId),
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
			data: { serviceName, duration, price, companyId: Number(req.userId) },
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

app.get("/schedules/company/:id", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const page = Math.max(1, parseInt(req.query.page as string) || 1);
		const limit = Math.min(
			100,
			Math.max(1, parseInt(req.query.limit as string) || 10)
		);
		const skip = (page - 1) * limit;

		const totalItems = await prisma.schedule.count({
			where: { companyId: parseInt(id) },
		});

		const totalPages = Math.ceil(totalItems / limit);

		if (page > totalPages) {
			return res.status(404).send({ error: "Página não encontrada" });
		}

		const schedules = await prisma.schedule.findMany({
			where: { companyId: parseInt(id) },
			skip,
			take: limit,
		});

		res.send({ schedules, totalPages, currentPage: page });
	} catch (error) {
		console.error("Erro no backend:", error);
		res.status(500).send({ error: "Erro no servidor" });
	}
});

app.get("/schedules/:id", async (req: Request, res: Response) => {
	const { id } = req.params;
	const userId = req.userId;

	const scheduleId = await prisma.schedule.findUnique({
		where: { id: parseInt(id), companyId: Number(userId) },
	});

	if (!scheduleId) return res.status(400).send({ error: "Schedule not found" });

	res.send(scheduleId);
});

interface ScheduleRequest extends Request {
	body: ScheduleData;
}
app.post("/schedules", async (req: ScheduleRequest, res: Response) => {
	const { date, timeSlotAvailable, status, customerId, serviceId } = req.body;

	const formattedDate = date.split("T")[0] + `T${timeSlotAvailable}:00.000Z`;

	try {
		await scheduleSchema.validate(req.body, { abortEarly: false });

		const existingCustomerId = await prisma.customer.findFirst({
			where: { id: Number(customerId), companyId: Number(req.userId) },
		});

		if (!existingCustomerId) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Cliente não encontrado" }],
			};

			return res.status(400).json(errorResponse);
		}

		const existingServiceId = await prisma.service.findFirst({
			where: { id: Number(serviceId), companyId: Number(req.userId) },
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
				companyId: Number(req.userId),
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
				companyId: Number(req.userId),
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
				companyId: Number(req.userId),
			},
		});

		res.send(scheduleCreated);
	} catch (err) {
		handleYupError(err, res);
	}
});

app.put("/schedules/:id", async (req: ScheduleRequest, res: Response) => {
	const { id } = req.params;
	const { date, timeSlotAvailable, status, customerId, serviceId } = req.body;

	const formattedDate = date.split("T")[0] + `T${timeSlotAvailable}:00.000Z`;

	try {
		await scheduleSchema.validate(req.body, { abortEarly: false });

		const existingCustomerId = await prisma.customer.findFirst({
			where: { id: Number(customerId), companyId: Number(req.userId) },
		});

		if (!existingCustomerId) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Cliente não encontrado" }],
			};

			return res.status(400).json(errorResponse);
		}

		const existingServiceId = await prisma.service.findFirst({
			where: { id: Number(serviceId), companyId: Number(req.userId) },
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
				companyId: Number(req.userId),
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
				companyId: Number(req.userId),
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
				companyId: Number(req.userId),
			},
		});

		res.send(scheduleUpdated);
	} catch (err) {
		handleYupError(err, res);
	}
});

app.get("/customers/company/:id", async (req: Request, res: Response) => {
	const { id } = req.params;
	const page = Math.max(1, parseInt(req.query.page as string) || 1);
	const limit = Math.min(
		100,
		Math.max(1, parseInt(req.query.limit as string) || 10)
	);
	const skip = (page - 1) * limit;

	const totalItems = await prisma.customer.count({
		where: { companyId: parseInt(id) },
	});

	const totalPages = Math.ceil(totalItems / limit);

	if (page > totalPages) {
		return res.status(404).send({ error: "Página não encontrada" });
	}

	const customers = await prisma.customer.findMany({
		where: { companyId: parseInt(id), deletedAt: null },
		skip: skip,
		take: limit,
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
			where: { mobile, companyId: Number(req.userId), deletedAt: null },
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
				companyId: Number(req.userId),
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
					companyId: Number(req.userId),
				},
			});
		} else {
			customerCreated = await prisma.customer.create({
				data: { customerName, mobile, companyId: Number(req.userId) },
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
				companyId: Number(req.userId),
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
			data: { customerName, mobile, companyId: Number(req.userId) },
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

app.get("/available-times/company/:id", async (req: Request, res: Response) => {
	const { id } = req.params;
	const { date } = req.query;

	const page = Math.max(1, parseInt(req.query.page as string) || 1);
	const limit = Math.min(
		100,
		Math.max(1, parseInt(req.query.limit as string) || 10)
	);
	const skip = (page - 1) * limit;

	const totalItems = await prisma.availableTime.count({
		where: { companyId: parseInt(id) },
	});

	const totalPages = Math.ceil(totalItems / limit);

	if (page > totalPages) {
		return res.status(404).send({ error: "Página não encontrada" });
	}

	let availableTimes;

	if (date) {
		const convertDateDay = await dateConvertDay(date as string);
		const day = convertDateDay as DayWeek;

		availableTimes = await prisma.availableTime.findMany({
			where: {
				companyId: parseInt(id),
				...(day && { day: day as DayWeek }),
				deletedAt: null,
			},
			include: {
				availableTimeSlot: {
					orderBy: {
						timeSlot: "asc",
					},
				},
			},
			skip: skip,
			take: limit,
		});
	} else {
		availableTimes = await prisma.availableTime.findMany({
			where: { companyId: parseInt(id), deletedAt: null },
			skip: skip,
			take: limit,
		});
	}

	res.send({ availableTimes, totalPages, currentPage: page });
});

app.get("/available-times/:id", async (req: Request, res: Response) => {
	const { id } = req.params;

	const avaliableTimeId = await prisma.availableTime.findUnique({
		where: { id: parseInt(id) },
	});

	if (!avaliableTimeId)
		return res.status(400).send({ error: "Time not found" });

	res.send(avaliableTimeId);
});

interface AvaliableRequest extends Request {
	body: AvailableTimeData;
}

app.post("/available-times", async (req: AvaliableRequest, res: Response) => {
	const { day, period, startTime, endTime, interval } = req.body;

	try {
		await avaliableSchema.validate(req.body, { abortEarly: false });

		const existingAvailableTime = await prisma.availableTime.findFirst({
			where: {
				day,
				period,
				companyId: Number(req.userId),
				deletedAt: null,
			},
		});

		if (existingAvailableTime) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Horário disponível já está em uso." }],
			};

			return res.status(400).json(errorResponse);
		}

		const existingAvailableTimeDeleted = await prisma.availableTime.findFirst({
			where: {
				day,
				period,
				companyId: Number(req.userId),
				NOT: {
					deletedAt: null,
				},
			},
		});

		let avaliableCreated = null;

		if (existingAvailableTimeDeleted) {
			avaliableCreated = await prisma.availableTime.update({
				where: { id: Number(existingAvailableTimeDeleted.id) },
				data: {
					startTime,
					endTime,
					interval,
					deletedAt: null,
				},
			});
		} else {
			avaliableCreated = await prisma.availableTime.create({
				data: {
					day,
					period,
					startTime,
					endTime,
					interval,
					companyId: Number(req.userId),
				},
			});
		}

		const availableTimeSlotCreated = await generateAvaliableTimes(
			startTime,
			endTime,
			interval!,
			Number(req.userId)
		);

		for (const time of availableTimeSlotCreated) {
			await prisma.availableTimeSlot.upsert({
				where: {
					timeSlot_availableTimeId_companyId: {
						timeSlot: time,
						availableTimeId: Number(avaliableCreated.id),
						companyId: Number(req.userId),
					},
				},
				update: {
					timeSlot: time,
				},
				create: {
					timeSlot: time,
					availableTimeId: Number(avaliableCreated.id),
					companyId: Number(req.userId),
				},
			});
		}

		res.send({ avaliableCreated, availableTimeSlotCreated });
	} catch (err) {
		handleYupError(err, res);
	}
});

app.put(
	"/available-times/:id",
	async (req: AvaliableRequest, res: Response) => {
		const { id } = req.params;
		const userId = req.userId;
		const { day, period, startTime, endTime, interval } = req.body;

		try {
			await avaliableSchema.validate(req.body, { abortEarly: false });

			const avaliableTimeId = await prisma.availableTime.findUnique({
				where: { id: parseInt(id) },
			});

			if (!avaliableTimeId)
				return res.status(400).send({ error: "Available time not found" });

			const existingAvailableTime = await prisma.availableTime.findFirst({
				where: {
					NOT: { id: parseInt(id) },
					day,
					period,
					startTime,
					endTime,
					interval,
					companyId: Number(userId),
				},
			});

			if (existingAvailableTime) {
				const errorResponse: ErrorResponse = {
					errors: [{ message: "Horário disponível já está em uso." }],
				};

				return res.status(400).json(errorResponse);
			}

			const avaliableUpdated = await prisma.availableTime.update({
				where: { id: parseInt(id) },
				data: {
					day,
					startTime,
					period,
					endTime,
					interval,
					companyId: Number(userId),
				},
			});

			const availableTimeSlotUpdated = await generateAvaliableTimes(
				startTime,
				endTime,
				interval!,
				Number(userId)
			);

			for (const time of availableTimeSlotUpdated) {
				await prisma.availableTimeSlot.upsert({
					where: {
						timeSlot_availableTimeId_companyId: {
							timeSlot: time,
							availableTimeId: Number(avaliableUpdated.id),
							companyId: Number(userId),
						},
					},
					update: {
						timeSlot: time,
					},
					create: {
						timeSlot: time,
						availableTimeId: Number(avaliableUpdated.id),
						companyId: Number(userId),
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

app.delete("/available-times/:id", async (req: Request, res: Response) => {
	const { id } = req.params;
	const userId = req.userId;

	const avaliableId = await prisma.availableTime.findUnique({
		where: { id: parseInt(id) },
	});

	if (!avaliableId) return res.status(400).send({ error: "Time not found" });

	const allSchedules = await prisma.schedule.findMany({
		where: { companyId: Number(userId) },
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

	const avaliableDeleted = await prisma.availableTime.update({
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

		const availableTimeSlot = await prisma.availableTimeSlot.findMany({
			where: { companyId: parseInt(id) },
			skip: skip,
			take: limit,
		});

		res.send(availableTimeSlot);
	}
);

app.get(
	"/unavailable-times/company/:id",
	async (req: Request, res: Response) => {
		const { id } = req.params;
		const page = Math.max(1, parseInt(req.query.page as string) || 1);
		const limit = Math.min(
			100,
			Math.max(1, parseInt(req.query.limit as string) || 10)
		);
		const skip = (page - 1) * limit;

		const totalItems = await prisma.unavaliableTime.count({
			where: { companyId: parseInt(id) },
		});

		const totalPages = Math.ceil(totalItems / limit);

		if (page > totalPages) {
			return res.status(404).send({ error: "Página não encontrada" });
		}

		const unavailableTimes = await prisma.unavaliableTime.findMany({
			where: { companyId: parseInt(id), deletedAt: null },
			skip: skip,
			take: limit,
		});

		res.send({ unavailableTimes, totalPages, currentPage: page });
	}
);

app.get("/unavailable-times/:id", async (req: Request, res: Response) => {
	const { id } = req.params;

	const unavailableTimeId = await prisma.unavaliableTime.findUnique({
		where: { id: parseInt(id), deletedAt: null },
	});

	if (!unavailableTimeId)
		return res.status(400).send({ error: "Unavailable times not found" });

	res.send(unavailableTimeId);
});

interface UnavaliableRequest extends Request {
	body: UnavaliableData;
}

app.post(
	"/unavailable-times",
	async (req: UnavaliableRequest, res: Response) => {
		const userId = req.userId;
		const { date, startTime, endTime } = req.body;

		try {
			await unavaliableSchema.validate(req.body, { abortEarly: false });

			const existingDate = await prisma.unavaliableTime.findFirst({
				where: {
					date,
					companyId: Number(userId),
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
					companyId: Number(req.userId),
				},
			});

			if (existingSchedule) {
				const errorResponse: ErrorResponse = {
					errors: [{ message: "Já existe um agendamento para este período." }],
				};

				return res.status(400).json(errorResponse);
			}

			let unavailableTimeCreated;

			const existingDateDeleted = await prisma.unavaliableTime.findFirst({
				where: {
					date,
					companyId: Number(userId),
					NOT: {
						deletedAt: null,
					},
				},
			});

			if (existingDateDeleted) {
				unavailableTimeCreated = await prisma.unavaliableTime.update({
					where: { id: existingDateDeleted.id },
					data: {
						startTime,
						endTime,
						deletedAt: null,
					},
				});
			} else {
				unavailableTimeCreated = await prisma.unavaliableTime.create({
					data: { date, startTime, endTime, companyId: Number(req.userId) },
				});
			}

			// const unavailableTimeCreated = await prisma.unavaliableTime.create({
			// 	data: { date, startTime, endTime, companyId: Number(req.userId) },
			// });

			res.send(unavailableTimeCreated);
		} catch (err) {
			handleYupError(err, res);
		}
	}
);

app.put(
	"/unavailable-times/:id",
	async (req: UnavaliableRequest, res: Response) => {
		const { id } = req.params;
		const { date, startTime, endTime, companyId } = req.body;

		try {
			await unavaliableSchema.validate(req.body, { abortEarly: false });

			const unavailableTimeId = await prisma.unavaliableTime.findUnique({
				where: { id: parseInt(id) },
			});

			if (!unavailableTimeId)
				return res.status(400).send({ error: "Unavaliable time not found" });

			const existingDate = await prisma.unavaliableTime.findFirst({
				where: {
					date,
					companyId,
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

			const unavailableUpdated = await prisma.unavaliableTime.update({
				where: { id: parseInt(id) },
				data: { startTime, endTime, companyId },
			});

			res.send(unavailableUpdated);
		} catch (err) {
			handleYupError(err, res);
		}
	}
);

app.delete("/unavailable-times/:id", async (req: Request, res: Response) => {
	const { id } = req.params;

	const unavailableTimeId = await prisma.unavaliableTime.findUnique({
		where: { id: parseInt(id) },
	});

	if (!unavailableTimeId)
		return res.status(400).send({ error: "Unavaliable time not found" });

	const unavailableDeleted = await prisma.unavaliableTime.update({
		where: { id: parseInt(id) },
		data: { deletedAt: new Date() },
	});

	res.send(unavailableDeleted);
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
