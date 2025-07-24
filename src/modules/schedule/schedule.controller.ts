import { scheduleSchema } from "../../schemas/scheduleSchema";
import { handleYupError } from "../../utils/handleYupError";
import * as scheduleBussinessServices from "./schedule.business-services";
import * as scheduleServices from "./schedule.services";
import * as customerServices from "../customer/customer.services";
import * as services from "../services/services";
import { Request, Response } from "express";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { start } from "repl";

dayjs.extend(utc);

export const getAllSchedulesByCompanyId = async (
	req: Request,
	res: Response
) => {
	try {
		const page = Math.max(1, parseInt(req.query.page as string) || 1);
		const limit = Math.min(
			100,
			Math.max(1, parseInt(req.query.limit as string) || 10)
		);

		const schedules =
			await scheduleBussinessServices.getAllSchedulesByCompanyId(
				Number(page),
				Number(limit),
				Number(req.companyId)
			);

		if (!schedules) {
			throw new Error("Schedules not found");
		}

		res.status(200).send({
			schedules: schedules.schedulesExists,
			totalPages: schedules.totalPages,
			currentPage: page,
		});
	} catch (err) {
		const yupHandled = handleYupError(err, res);
		if (yupHandled) return;

		res.status(500).json({ error: err });
	}
};

export const getScheduleById = async (req: Request, res: Response) => {
	try {
		const schedule = await scheduleBussinessServices.getScheduleById(
			Number(req.params.id),
			Number(req.companyId)
		);

		if (!schedule) {
			throw new Error("Schedule not found");
		}

		res.status(200).send(schedule);
	} catch (err) {
		const yupHandled = handleYupError(err, res);
		if (yupHandled) return;

		res.status(500).json({ error: err });
	}
};

export const createSchedule = async (req: Request, res: Response) => {
	const { date, timeSlotAvaliable, status, customerId, serviceId } = req.body;

	try {
		await scheduleSchema.validate(req.body, { abortEarly: false });

		let unavaliableExists = await scheduleServices.findUnavaliableTimeByDate(
			date,
			Number(req.companyId)
		);

		let startOfDayDate =
			dayjs
				.utc(`${date.split("T")[0]}T${unavaliableExists?.startTime}:00`)
				.toDate() || null;
		let endOfDayDate = dayjs
			.utc(`${date.split("T")[0]}T${unavaliableExists?.endTime}:00`)
			.toDate();

		if (isNaN(startOfDayDate.getTime()) || isNaN(endOfDayDate.getTime())) {
			startOfDayDate = new Date(0);
			endOfDayDate = new Date(0);
		}

		const existingScheduleTime =
			await scheduleBussinessServices.getScheduleTimeUnavaliable(
				startOfDayDate,
				endOfDayDate,
				Number(req.companyId)
			);

		if (existingScheduleTime) {
			return res.status(400).json({
				message:
					"Já existe horário indisponível para este período, não será possível agendar.",
			});
		}

		const customerIdExists = await customerServices.findCustomerById(
			Number(customerId),
			Number(req.companyId)
		);

		if (!customerIdExists) {
			return res.status(400).json({
				message: "Este cliente não existe, verifique o ID e tente novamente.",
			});
		}

		const serviceIdExists = await services.findServiceById(
			Number(serviceId),
			Number(req.companyId)
		);

		if (!serviceIdExists) {
			return res.status(400).json({
				message: "Este serviço não existe, verifique o ID e tente novamente.",
			});
		}

		const timeSlotIdExists =
			await scheduleBussinessServices.getTimeSlotByCompanyId(
				timeSlotAvaliable,
				Number(req.companyId)
			);

		if (!timeSlotIdExists) {
			return res.status(400).json({
				message: "Este intervalo de tempo não existe.",
			});
		}

		const formattedDate = date.split("T")[0] + `T${timeSlotAvaliable}:00.000Z`;

		const scheduleCreated = await scheduleBussinessServices.createSchedule({
			customerId: customerIdExists.id,
			customerName: customerIdExists.customerName,
			customerPhone: customerIdExists.mobile,
			serviceId: serviceIdExists.id,
			serviceName: serviceIdExists.serviceName,
			duration: serviceIdExists.duration,
			price: serviceIdExists.price.toNumber(),
			timeSlotId: timeSlotIdExists.id,
			date: formattedDate,
			status,
			companyId: Number(req.companyId),
		});

		res.send(scheduleCreated);
	} catch (err) {
		const yupHandled = handleYupError(err, res);
		console.error(err);
		if (yupHandled) return;

		res.status(500).json({ error: err });
	}
};

export const updateSchedule = async (req: Request, res: Response) => {
	const { date, timeSlotAvaliable, status, customerId, serviceId } = req.body;

	try {
		await scheduleSchema.validate(req.body, { abortEarly: false });

		const startOfDayDate = date.split("T")[0] + `T00:00:00.000Z`;
		const endOfDayDate = date.split("T")[0] + `T23:59:59.000Z`;

		const existingScheduleTime =
			await scheduleBussinessServices.getScheduleTimeUnavaliable(
				new Date(startOfDayDate),
				new Date(endOfDayDate),
				Number(req.companyId)
			);

		if (existingScheduleTime) {
			return res.status(400).json({
				message:
					"Já existe horário indisponível para este período, não será possível agendar.",
			});
		}

		const customerIdExists = await customerServices.findCustomerById(
			Number(customerId),
			Number(req.companyId)
		);

		if (!customerIdExists) {
			return res.status(400).json({
				message: "Este cliente não existe, verifique o ID e tente novamente.",
			});
		}

		const serviceIdExists = await services.findServiceById(
			Number(serviceId),
			Number(req.companyId)
		);

		if (!serviceIdExists) {
			return res.status(400).json({
				message: "Este serviço não existe, verifique o ID e tente novamente.",
			});
		}

		const timeSlotIdExists =
			await scheduleBussinessServices.getTimeSlotByCompanyId(
				timeSlotAvaliable,
				Number(req.companyId)
			);

		if (!timeSlotIdExists) {
			return res.status(400).json({
				message: "Este intervalo de tempo não existe.",
			});
		}

		const formattedDate = date.split("T")[0] + `T${timeSlotAvaliable}:00.000Z`;

		const scheduleUpdated = await scheduleBussinessServices.updateSchedule(
			Number(req.params.id),
			{
				customerId: customerIdExists.id,
				customerName: customerIdExists.customerName,
				customerPhone: customerIdExists.mobile,
				serviceId: serviceIdExists.id,
				serviceName: serviceIdExists.serviceName,
				duration: serviceIdExists.duration,
				price: serviceIdExists.price.toNumber(),
				timeSlotId: timeSlotIdExists.id,
				date: formattedDate,
				status,
				companyId: Number(req.companyId),
			}
		);

		res.send(scheduleUpdated);
	} catch (err) {
		const yupHandled = handleYupError(err, res);
		console.error(err);
		if (yupHandled) return;

		res.status(500).json({ error: err });
	}
};
