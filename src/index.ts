import dotenv from "dotenv";
import cors from "cors";

import express, { Express, Request, Response } from "express";
import auth from "./middlewares/auth";
import {
	createPassword,
	logout,
	refreshToken,
	sessionMe,
	sessions,
} from "./modules/auth/auth.controller";
import { forgotPassword } from "./modules/auth/forgotPassword.controller";
import { resetPassword } from "./modules/auth/resetPassword.controller";
import * as usersControllers from "./modules/users/users.controller";
import * as dashboardController from "./modules/dashboard/dashboard.controller";
import * as companiesControllers from "./modules/companies/companies.controller";
import * as addressesControllers from "./modules/address/address.controller";
import * as servicesControllers from "./modules/services/services.controller";
import * as schedulesControllers from "./modules/schedule/schedule.controller";
import * as customersControllers from "./modules/customer/customer.controller";
import * as avaliableTimesControllers from "./modules/avaliableTimes/avaliableTimes.controller";
import * as unavaliableTimesControllers from "./modules/unavaliableTimes/unavaliableTimes.controller";
import * as uploadAvatarControllers from "./modules/uploadAvatar/uploadAvatar.controller";
import * as bookingControllers from "./modules/booking/booking.controller";
import * as avaliableTimesSlotsControllers from "./modules/timeSlots/timeSlots.controller";
import { upload } from "./middlewares/upload";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import * as Sentry from "@sentry/node";
import requestId from "./middlewares/requestId";
import { prisma } from "./config/prisma";

dotenv.config();

const app: Express = express();
Sentry.setupExpressErrorHandler(app);
Sentry.init({
	dsn: process.env.SENTRY_DSN,
});

const port = process.env.PORT || 3000;

app.use(requestId);

app.use(
	express.json(),
	express.urlencoded({ extended: true }),
	cors({
		origin: process.env.FRONTEND_URL,
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE"],
		allowedHeaders: ["Content-Type", "Authorization"],
	}),
	helmet(),
	cookieParser(),
);

const globalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	standardHeaders: true,
	legacyHeaders: false,
	message: "Too many requests, please try again later.",
});

const authLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 5,
	standardHeaders: true,
	legacyHeaders: false,
	message: "Too many login attempts, please try again in 1 minute.",
});

app.get("/health", (_req: Request, res: Response) => {
	return res.status(200).json({ message: "OK" });
});

// Autenticação - Login, Esqueci minha senha e Reset de senha

app.post("/sessions", authLimiter, sessions);
app.post("/refresh-token", globalLimiter, refreshToken);
app.post("/forgot-password", authLimiter, forgotPassword);
app.post("/reset-password", globalLimiter, resetPassword);
app.post("/create-password", globalLimiter, createPassword);

// Lista agenda da empresa
app.get(
	"/public/:slugCompany",
	globalLimiter,
	bookingControllers.getAllTimeSlotBySlugCompany,
);

app.get(
	"/public/service/:slugCompany",
	globalLimiter,
	servicesControllers.getAllServicesBySlugCompany,
);

app.get(
	"/public/user/:slugCompany",
	globalLimiter,
	usersControllers.getUserBySlugCompany,
);

app.post(
	"/public/booking/:slugCompany",
	globalLimiter,
	bookingControllers.createBooking,
);

app.use(auth);

app.get("/session-me", sessionMe);
app.post("/logout", logout);

// Usuário
app.get("/users", usersControllers.getAllUsers);
app.get("/users/:id", usersControllers.getUserById);
app.post("/users", usersControllers.createUser);
app.put("/users", usersControllers.updateUser);

// Upload de imagem perfil
app.put(
	"/upload",
	upload.single("avatarUrl"),
	uploadAvatarControllers.uploadProfilePhoto,
);

// Dashboard por mês e ano
app.get(
	"/dashboard/month/:month/year/:year",
	dashboardController.dashboardPerMonthAndYear,
);

// Empresa
app.get("/companies", companiesControllers.getAllCompanies);
app.get("/companies/:id", companiesControllers.getCompaniesById);
app.post("/companies", companiesControllers.createCompany);
app.put("/companies", companiesControllers.updateCompany);

//Endereço
app.get("/addresses", addressesControllers.getAllAddresses);
app.get("/addresses/:id", addressesControllers.getAddressById);
app.post("/addresses", addressesControllers.createAddress);
app.put("/addresses/:id", addressesControllers.updateAddress);

// Serviços

app.get("/services", servicesControllers.getAllServicesByCompanyId);
app.get("/services/:id", servicesControllers.getServiceById);
app.post("/services", servicesControllers.createService);
app.put("/services/:id", servicesControllers.updateService);
app.delete("/services/:id", servicesControllers.deleteService);

//Agenda
app.get("/schedules", auth, schedulesControllers.getAllSchedulesByCompanyId);
app.get("/schedules/:id", schedulesControllers.getScheduleById);
app.post("/schedules", schedulesControllers.createSchedule);
app.put("/schedules/:id", schedulesControllers.updateSchedule);

// Cliente
app.get("/customers", customersControllers.getAllSchedulesByCompanyId);
app.get("/customers/:id", customersControllers.getCustomerById);
app.post("/customers", customersControllers.createCustomer);
app.put("/customers/:id", customersControllers.updateCustomer);
app.delete("/customers/:id", customersControllers.deleteCustomer);

// Horários por data
app.get(
	"/avaliable-times/:date",
	avaliableTimesSlotsControllers.getTimeSlotsByDayAndCompanyId,
);

// Horário disponível
app.get(
	"/avaliable-times",
	avaliableTimesControllers.getAllAvaliableTimesByCompanyId,
);
app.get("/avaliable-times/:id", avaliableTimesControllers.getAvaliableTimeById);
app.post("/avaliable-times", avaliableTimesControllers.createAvaliableTime);
app.put("/avaliable-times/:id", avaliableTimesControllers.updateAvaliableTime);
app.delete(
	"/avaliable-times/:id",
	avaliableTimesControllers.deleteAvaliableTime,
);

// Horário indisponível
app.get(
	"/unavaliable-times",
	unavaliableTimesControllers.getAllAvaliableTimesByCompanyId,
);
app.get(
	"/unavaliable-times/:id",
	unavaliableTimesControllers.getUnavaliableTimeById,
);
app.post(
	"/unavaliable-times",
	unavaliableTimesControllers.createUnavaliableTime,
);
app.put(
	"/unavaliable-times/:id",
	unavaliableTimesControllers.updateUnavaliableTime,
);
app.delete(
	"/unavaliable-times/:id",
	unavaliableTimesControllers.deleteUnavaliableTime,
);

app.use(
	(
		err: any,
		req: express.Request,
		res: express.Response,
		_next: express.NextFunction,
	) => {
		req.log.error({ err, path: req.path }, "unhandled error");
		res.status(500).json({ error: "Internal server error" });
	},
);

const server = app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});

const gracefulShutdown = async (signal: string) => {
	try {
		console.log(`Received ${signal}. Closing database connection...`);
		server.close(async () => {
			await prisma.$disconnect();
			console.log("Database connection closed. Exiting process.");
			process.exit(0);
		});
		setTimeout(() => process.exit(1), 10_000).unref();
	} catch (error) {
		console.error("Error during graceful shutdown:", error);
		process.exit(1);
	}
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
