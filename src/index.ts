import { AddressData } from "./interfaces/AddressData";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import bcrypt from "bcrypt";
import * as yup from "yup";
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
import { AvaliableData } from "./interfaces/AvaliableData";
import { UnavaliableData } from "./interfaces/UnavaliableData";

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

interface UserRequest extends Request {
	body: UserData;
}

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
		if (err instanceof yup.ValidationError) {
			const errorResponse: ErrorResponse = {
				errors: err.inner.map((error) => ({
					path: error.path,
					message: error.message,
				})),
			};
			return res.status(400).json(errorResponse);
		} else {
			res.status(500).json({ message: "Internal server error" });
		}
	}
});

app.put("/users/:id", async (req: UserRequest, res: Response) => {
	const { id } = req.params;
	const { name, email, password, specialty, companyId } = req.body;
	const passwordHash = await bcrypt.hash(password, 10);

	try {
		await userSchema.validate(req.body, { abortEarly: false });

		const existingUser = await prisma.user.findFirst({
			where: { email },
		});

		if (existingUser) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Email already in use" }],
			};
			return res.status(400).json(errorResponse);
		}

		const userUpdated = await prisma.user.update({
			where: { id: parseInt(id) },
			data: { name, email, password: passwordHash, specialty, companyId },
		});

		res.send(userUpdated);
	} catch (err) {
		if (err instanceof yup.ValidationError) {
			const errorResponse: ErrorResponse = {
				errors: err.inner.map((error) => ({
					path: error.path,
					message: error.message,
				})),
			};
			return res.status(400).json(errorResponse);
		} else {
			res.status(500).json({ message: "Internal server error" });
		}
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
	});

	if (!companyId) return res.status(400).send({ error: "Company not found" });

	res.send(companyId);
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
		if (err instanceof yup.ValidationError) {
			const errorResponse: ErrorResponse = {
				errors: err.inner.map((error) => ({
					path: error.path,
					message: error.message,
				})),
			};
			return res.status(400).json(errorResponse);
		} else {
			res.status(500).json({ message: "Internal server error" });
		}
	}
});

app.put("/companies/:id", async (req: CompanyRequest, res: Response) => {
	const { id } = req.params;
	const { name, mobile, email, cnpj } = req.body;

	try {
		await companySchema.validate(req.body, { abortEarly: false });

		const companyId = await prisma.company.findUnique({
			where: { id: parseInt(id) },
		});

		if (!companyId) return res.status(400).send({ error: "Company not found" });

		const existingCompany = await prisma.company.findFirst({
			where: {
				mobile,
				email,
				cnpj,
			},
		});

		if (existingCompany?.mobile) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Mobile number already in use" }],
			};

			return res.status(400).json(errorResponse);
		}

		if (existingCompany?.email) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Email already in use" }],
			};

			return res.status(400).json(errorResponse);
		}

		if (existingCompany?.cnpj) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "CNPJ already in use" }],
			};

			return res.status(400).json(errorResponse);
		}

		const companyUpdated = await prisma.company.update({
			where: { id: parseInt(id) },
			data: { name, mobile, email, cnpj },
		});

		res.send(companyUpdated);
	} catch (err) {
		if (err instanceof yup.ValidationError) {
			const errorResponse: ErrorResponse = {
				errors: err.inner.map((error) => ({
					path: error.path,
					message: error.message,
				})),
			};
			return res.status(400).json(errorResponse);
		} else {
			res.status(500).json({ message: "Internal server error" });
		}
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
		if (err instanceof yup.ValidationError) {
			const errorResponse: ErrorResponse = {
				errors: err.inner.map((error) => ({
					path: error.path,
					message: error.message,
				})),
			};
			return res.status(400).json(errorResponse);
		} else {
			res.status(500).json({ message: "Internal server error" });
		}
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

		if (existingAddress?.street && existingAddress?.companyId) {
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
		if (err instanceof yup.ValidationError) {
			const errorResponse: ErrorResponse = {
				errors: err.inner.map((error) => ({
					path: error.path,
					message: error.message,
				})),
			};
			return res.status(400).json(errorResponse);
		} else {
			res.status(500).json({ message: "Internal server error" });
		}
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
	const page = parseInt(req.query.page as string) || 1;
	const limit = parseInt(req.query.limit as string) || 10;
	const skip = (page - 1) * limit;

	const services = await prisma.service.findMany({
		skip: skip,
		take: limit,
	});

	res.send(services);
});

app.get("/services/:id", async (req: Request, res: Response) => {
	const { id } = req.params;

	const serviceId = await prisma.service.findUnique({
		where: { id: parseInt(id) },
	});

	if (!serviceId) return res.status(400).send({ error: "Service not found" });

	res.send(serviceId);
});

interface ServiceRequest extends Request {
	body: ServiceData;
}

app.post("/services", async (req: ServiceRequest, res: Response) => {
	const { name, duration, price, companyId } = req.body;

	try {
		await serviceSchema.validate(req.body, { abortEarly: false });

		const existingService = await prisma.service.findFirst({
			where: {
				name,
			},
		});

		if (existingService?.name && existingService.companyId) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Service name already in use" }],
			};

			return res.status(400).json(errorResponse);
		}

		const serviceCreated = await prisma.service.create({
			data: { name, duration, price, companyId },
		});

		res.send(serviceCreated);
	} catch (err) {
		if (err instanceof yup.ValidationError) {
			const errorResponse: ErrorResponse = {
				errors: err.inner.map((error) => ({
					path: error.path,
					message: error.message,
				})),
			};
			return res.status(400).json(errorResponse);
		} else {
			res.status(500).json({ message: "Internal server error" });
		}
	}
});

app.put("/services/:id", async (req: ServiceRequest, res: Response) => {
	const { id } = req.params;
	const { name, duration, price, companyId } = req.body;

	try {
		await serviceSchema.validate(req.body, { abortEarly: false });

		const serviceId = await prisma.service.findUnique({
			where: { id: parseInt(id) },
		});

		if (!serviceId) return res.status(400).send({ error: "Service not found" });

		const existingService = await prisma.service.findFirst({
			where: {
				name,
			},
		});

		if (existingService?.name && existingService.companyId) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Service name already in use" }],
			};

			return res.status(400).json(errorResponse);
		}

		const serviceUpdated = await prisma.service.update({
			where: { id: parseInt(id) },
			data: { name, duration, price, companyId },
		});

		res.send(serviceUpdated);
	} catch (err) {
		if (err instanceof yup.ValidationError) {
			const errorResponse: ErrorResponse = {
				errors: err.inner.map((error) => ({
					path: error.path,
					message: error.message,
				})),
			};
			return res.status(400).json(errorResponse);
		} else {
			res.status(500).json({ message: "Internal server error" });
		}
	}
});

app.delete("/services/:id", async (req: Request, res: Response) => {
	const { id } = req.params;

	const serviceId = await prisma.service.findUnique({
		where: { id: parseInt(id) },
	});

	if (!serviceId) return res.status(400).send({ error: "Service not found" });

	const serviceDeleted = await prisma.service.delete({
		where: { id: parseInt(id) },
	});

	res.send(serviceDeleted);
});

app.get("/customers", async (req: Request, res: Response) => {
	const page = parseInt(req.query.page as string) || 1;
	const limit = parseInt(req.query.limit as string) || 10;
	const skip = (page - 1) * limit;

	const customers = await prisma.customer.findMany({
		skip: skip,
		take: limit,
	});

	res.send(customers);
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
	const { name, mobile, companyId } = req.body;

	try {
		await customerSchema.validate(req.body, { abortEarly: false });

		const existingCustomer = await prisma.customer.findFirst({
			where: { mobile },
		});

		if (existingCustomer?.mobile && existingCustomer.companyId) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Customer mobile already in use" }],
			};

			return res.status(400).json(errorResponse);
		}

		const customerCreated = await prisma.customer.create({
			data: { name, mobile, companyId },
		});

		res.send(customerCreated);
	} catch (err) {
		if (err instanceof yup.ValidationError) {
			const errorResponse: ErrorResponse = {
				errors: err.inner.map((error) => ({
					path: error.path,
					message: error.message,
				})),
			};
			return res.status(400).json(errorResponse);
		} else {
			res.status(500).json({ message: "Internal server error" });
		}
	}
});

app.put("/customers/:id", async (req: CustomerRequest, res: Response) => {
	const { id } = req.params;
	const { name, mobile, companyId } = req.body;

	try {
		await customerSchema.validate(req.body, { abortEarly: false });

		const customerId = await prisma.customer.findUnique({
			where: { id: parseInt(id) },
		});

		if (!customerId)
			return res.status(400).send({ error: "Customer not found" });

		const existingCustomer = await prisma.customer.findFirst({
			where: { name, mobile },
		});

		if (existingCustomer?.name && existingCustomer.companyId) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Customer name already in use" }],
			};

			return res.status(400).json(errorResponse);
		}

		if (existingCustomer?.mobile && existingCustomer.companyId) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Customer mobile already in use" }],
			};

			return res.status(400).json(errorResponse);
		}
		const customer = await prisma.customer.update({
			where: { id: parseInt(id) },
			data: { name, mobile, companyId },
		});

		res.send(customer);
	} catch (err) {
		if (err instanceof yup.ValidationError) {
			const errorResponse: ErrorResponse = {
				errors: err.inner.map((error) => ({
					path: error.path,
					message: error.message,
				})),
			};
			return res.status(400).json(errorResponse);
		} else {
			res.status(500).json({ message: "Internal server error" });
		}
	}
});

app.delete("/customers/:id", async (req: Request, res: Response) => {
	const { id } = req.params;

	const customerId = await prisma.customer.findUnique({
		where: { id: parseInt(id) },
	});

	if (!customerId) return res.status(400).send({ error: "Customer not found" });

	const customerDeleted = await prisma.customer.delete({
		where: { id: parseInt(id) },
	});

	res.send(customerDeleted);
});

app.get("/avaliable-times", async (req: Request, res: Response) => {
	const page = parseInt(req.query.page as string) || 1;
	const limit = parseInt(req.query.limit as string) || 10;
	const skip = (page - 1) * limit;

	const times = await prisma.avaliableTime.findMany({
		skip: skip,
		take: limit,
	});

	res.send(times);
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
	body: AvaliableData;
}

app.post("/avaliable-times", async (req: AvaliableRequest, res: Response) => {
	const { day, startTime, endTime, interval, companyId } = req.body;

	try {
		await avaliableSchema.validate(req.body, { abortEarly: false });

		const existingDay = await prisma.avaliableTime.findFirst({
			where: {
				day,
			},
		});
		if (existingDay?.day && existingDay.companyId) {
			const errorResponse: ErrorResponse = {
				errors: [{ message: "Day already in use" }],
			};

			return res.status(400).json(errorResponse);
		}

		const avaliableCreated = await prisma.avaliableTime.create({
			data: { day, startTime, endTime, interval, companyId },
		});

		res.send(avaliableCreated);
	} catch (err) {
		if (err instanceof yup.ValidationError) {
			const errorResponse: ErrorResponse = {
				errors: err.inner.map((error) => ({
					path: error.path,
					message: error.message,
				})),
			};
			return res.status(400).json(errorResponse);
		} else {
			res.status(500).json({ message: "Internal server error" });
		}
	}
});

app.put(
	"/avaliable-times/:id",
	async (req: AvaliableRequest, res: Response) => {
		const { id } = req.params;
		const { day, startTime, endTime, interval, companyId } = req.body;

		try {
			await avaliableSchema.validate(req.body, { abortEarly: false });

			const avaliableTimeId = await prisma.avaliableTime.findUnique({
				where: { id: parseInt(id) },
			});

			if (!avaliableTimeId)
				return res.status(400).send({ error: "Available time not found" });

			const existingDay = await prisma.avaliableTime.findFirst({
				where: {
					day,
				},
			});
			if (existingDay?.day && existingDay.companyId) {
				const errorResponse: ErrorResponse = {
					errors: [{ message: "Day already in use" }],
				};

				return res.status(400).json(errorResponse);
			}

			const avaliableUpdated = await prisma.avaliableTime.update({
				where: { id: parseInt(id) },
				data: { startTime, endTime, interval, companyId },
			});

			res.send(avaliableUpdated);
		} catch (err) {
			if (err instanceof yup.ValidationError) {
				const errorResponse: ErrorResponse = {
					errors: err.inner.map((error) => ({
						path: error.path,
						message: error.message,
					})),
				};
				return res.status(400).json(errorResponse);
			} else {
				res.status(500).json({ message: "Internal server error" });
			}
		}
	}
);

app.delete("/avalible-times/:id", async (req: Request, res: Response) => {
	const { id } = req.params;

	const avaliableId = await prisma.avaliableTime.findUnique({
		where: { id: parseInt(id) },
	});

	if (!avaliableId) return res.status(400).send({ error: "Time not found" });

	const avaliableDeleted = await prisma.avaliableTime.delete({
		where: { id: parseInt(id) },
	});

	res.send(avaliableDeleted);
});

app.get("/unavailable-times", async (req: Request, res: Response) => {
	const page = parseInt(req.query.page as string) || 1;
	const limit = parseInt(req.query.limit as string) || 10;
	const skip = (page - 1) * limit;

	const unavailableTimes = await prisma.unavailableTime.findMany({
		skip: skip,
		take: limit,
	});

	res.send(unavailableTimes);
});

app.get("/unavailable-times/:id", async (req: Request, res: Response) => {
	const { id } = req.params;

	const unavailableTimeId = await prisma.unavailableTime.findUnique({
		where: { id: parseInt(id) },
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
		const { date, startTime, endTime, companyId } = req.body;

		try {
			await unavaliableSchema.validate(req.body, { abortEarly: false });

			const existingDate = await prisma.unavailableTime.findFirst({
				where: {
					date,
				},
			});

			if (existingDate?.date && existingDate.companyId) {
				const errorResponse: ErrorResponse = {
					errors: [{ message: "Date already in use" }],
				};

				return res.status(400).json(errorResponse);
			}

			const unavailableTimeCreated = await prisma.unavailableTime.create({
				data: { date, startTime, endTime, companyId },
			});

			res.send(unavailableTimeCreated);
		} catch (err) {
			if (err instanceof yup.ValidationError) {
				const errorResponse: ErrorResponse = {
					errors: err.inner.map((error) => ({
						path: error.path,
						message: error.message,
					})),
				};
				return res.status(400).json(errorResponse);
			} else {
				res.status(500).json({ message: "Internal server error" });
			}
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

			const unavailableTimeId = await prisma.unavailableTime.findUnique({
				where: { id: parseInt(id) },
			});

			if (!unavailableTimeId)
				return res.status(400).send({ error: "Unavaliable time not found" });

			const existingDate = await prisma.unavailableTime.findFirst({
				where: {
					date,
				},
			});

			if (existingDate?.date && existingDate.companyId) {
				const errorResponse: ErrorResponse = {
					errors: [{ message: "Date already in use" }],
				};

				return res.status(400).json(errorResponse);
			}

			const unavailableUpdated = await prisma.unavailableTime.update({
				where: { id: parseInt(id) },
				data: { startTime, endTime, companyId },
			});

			res.send(unavailableUpdated);
		} catch (err) {
			if (err instanceof yup.ValidationError) {
				const errorResponse: ErrorResponse = {
					errors: err.inner.map((error) => ({
						path: error.path,
						message: error.message,
					})),
				};
				return res.status(400).json(errorResponse);
			} else {
				res.status(500).json({ message: "Internal server error" });
			}
		}
	}
);

app.delete("/unavailable-times/:id", async (req: Request, res: Response) => {
	const { id } = req.params;

	const unavailableTimeId = await prisma.unavailableTime.findUnique({
		where: { id: parseInt(id) },
	});

	if (!unavailableTimeId)
		return res.status(400).send({ error: "Unavaliable time not found" });

	const unavailableDeleted = await prisma.unavailableTime.delete({
		where: { id: parseInt(id) },
	});

	res.send(unavailableDeleted);
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
