import cors from "cors";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import auth from "./middlewares/auth";
import {
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
import { upload } from "./middlewares/upload";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import cookieParser from "cookie-parser";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(
	cors({
		origin: process.env.FRONTEND_URL,
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE"],
	})
);
app.use(helmet());
app.use(cookieParser());

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	standardHeaders: true,
	legacyHeaders: false,
	message: "Too many requests, please try again later.",
});

app.get("/", (req: Request, res: Response) => {
	const { message } = req.body;

	if (!message) return res.status(400).send({ error: "Message is required" });

	res.send({ message });
});

// Autenticação - Login, Esqueci minha senha e Reset de senha

app.post("/sessions", sessions, limiter);
app.post("/refresh-token", refreshToken, limiter);
app.post("/forgot-password", forgotPassword, limiter);
app.post("/reset-password", resetPassword, limiter);
// Lista agenda da empresa
app.get(
	"/public/:slugCompany",
	bookingControllers.getAllTimeSlotBySlugCompany,
	limiter
);
app.post(
	"/public/booking/:slugCompany",
	bookingControllers.createBooking,
	limiter
);

app.use(auth);

app.get("/session-me", sessionMe);
app.post("/logout", logout);

// Usuário
app.get("/users", usersControllers.getAllUsers);
app.get("/users/id", usersControllers.getUserById);
app.post("/users", usersControllers.createUser);
app.put("/users", usersControllers.updateUser);

app.get(
	"/dashboard/month/:month/year/:year",
	dashboardController.dashboardPerMonthAndYear
);

// Usuário
app.get("/users", usersControllers.getAllUsers);
app.get("/users/id", usersControllers.getUserById);
app.post("/users", usersControllers.createUser);
app.put("/users", usersControllers.updateUser);

// Upload de imagem perfil
app.put(
	"/upload",
	upload.single("avatarUrl"),
	uploadAvatarControllers.uploadProfilePhoto
);

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

// Horário indisponível
app.get(
	"/unavaliable-times",
	unavaliableTimesControllers.getAllAvaliableTimesByCompanyId
);
app.get(
	"/unavaliable-times/:id",
	unavaliableTimesControllers.getUnavaliableTimeById
);
app.post(
	"/unavaliable-times",
	unavaliableTimesControllers.createUnavaliableTime
);
app.put(
	"/unavaliable-times/:id",
	unavaliableTimesControllers.updateUnavaliableTime
);
app.delete(
	"/unavaliable-times/:id",
	unavaliableTimesControllers.deleteUnavaliableTime
);

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
