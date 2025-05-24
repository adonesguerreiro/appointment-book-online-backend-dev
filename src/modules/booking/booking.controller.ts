import { Request, Response } from "express";
import * as bookingBusinessService from "./booking.business-service";
import * as bookingServices from "./booking.services";
import * as customerServices from "../customer/customer.services";
import * as servicesBussinessServices from "../services/services-bussiness.services";
import dayjs from "dayjs";
import * as scheduleBussinessServices from "../schedule/schedule.business-services";
import { bookAppointmentSchema } from "../../schemas/bookAppointmentSchema";

export const getAllTimeSlotBySlugCompany = async (
	req: Request,
	res: Response
) => {
	try {
		const page = Math.max(1, parseInt(req.query.page as string) || 1);
		const limit = Math.min(
			100,
			Math.max(1, parseInt(req.query.limit as string) || 10)
		);

		const { slugCompany } = req.params;
		const { date } = req.query;

		if (!date) return;

		const formattedDate =
			dayjs(date as string).isValid() &&
			dayjs(date as string).format("YYYY-MM-DD");

		if (!formattedDate) {
			return res.status(404).send({ message: "Date is not found" });
		}

		const startTimeDate = dayjs(date as string)
			.startOf("day")
			.toDate();
		const endTimeDate = dayjs(date as string)
			.endOf("day")
			.toDate();

		const findCompanyBySlug = await bookingServices.findSlugCompanyByName(
			slugCompany
		);

		if (!findCompanyBySlug) {
			return res.status(404).send({ message: "Company not found" });
		}

		const timeSlot = await bookingBusinessService.getAllTimeSlotByCompanyId(
			slugCompany,
			Number(findCompanyBySlug!.id),
			formattedDate,
			startTimeDate,
			endTimeDate,
			page,
			limit
		);

		res.send(timeSlot);
	} catch (err) {
		res.status(500).json({ error: err });
	}
};

export const createBooking = async (req: Request, res: Response) => {
	const { customerName, customerPhone, serviceId, calendar, time } = req.body;
	const { slugCompany } = req.params;

	try {
		await bookAppointmentSchema.validate(req.body, { abortEarly: false });
		const date = calendar.split("T")[0] + `T${time}:00.000Z`;

		if (!date) {
			return res.status(404).send({ message: "Date is not found" });
		}

		const companyBySlug = await bookingServices.findSlugCompanyByName(
			slugCompany
		);

		if (!companyBySlug) {
			return res.status(404).send({ message: "Company not found" });
		}

		const customerExists = await customerServices.findCustomerByMobile(
			customerPhone,
			Number(companyBySlug.id)
		);

		let customerCreated = null;
		if (!customerExists) {
			customerCreated = await customerServices.createCustomer({
				customerName,
				mobile: customerPhone,
				companyId: Number(companyBySlug.id),
			});
		} else {
			customerCreated = customerExists;
		}

		if (!customerCreated) {
			return res.status(400).send({ message: "Customer creation failed" });
		}

		const serviceExists = await servicesBussinessServices.getServiceById(
			Number(serviceId),
			Number(companyBySlug.id)
		);

		if (!serviceExists) {
			return res.status(404).send({ message: "Service not found" });
		}

		const timeSlotExists =
			await scheduleBussinessServices.getTimeSlotByCompanyId(
				time,
				Number(companyBySlug.id)
			);

		if (!timeSlotExists) {
			return res.status(404).send({ message: "Time slot not found" });
		}

		const booking = await bookingBusinessService.createBooking({
			customerId: customerCreated.id,
			serviceId: Number(serviceId),
			companyId: Number(companyBySlug.id),
			date,
			customerName: customerCreated.customerName,
			customerPhone: customerCreated.mobile,
			serviceName: serviceExists.serviceName,
			duration: serviceExists.duration,
			price: serviceExists.price.toNumber(),
			status: "SCHEDULED",
			timeSlotId: timeSlotExists.id,
		});

		res.send(booking);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err });
	}
};
