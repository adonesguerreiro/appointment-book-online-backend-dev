import { Request, Response } from "express";
import * as bookingBusinessService from "./booking.business-service";
import * as bookingServices from "./booking.services";
import * as customerServices from "../customer/customer.services";
import * as servicesBussinessServices from "../services/services-business.services";
import dayjs from "dayjs";
import { bookAppointmentSchema } from "../../schemas/bookAppointmentSchema";
import * as availabilityBusinessService from "../availability/availability.business-service";
import * as userServices from "../users/users.services";
import { ApiError } from "../../utils/apiError";

export const getAllTimeSlotBySlugCompany = async (
	req: Request,
	res: Response,
) => {
	try {
		const { slugCompany } = req.params;
		const { date } = req.query;

		if (!date) return;

		const formattedDate =
			dayjs(date as string).isValid() &&
			dayjs(date as string).format("YYYY-MM-DD");

		if (!formattedDate) {
			return res.status(404).send({ message: "Date is not found" });
		}

		const findCompanyBySlug =
			await bookingServices.findSlugCompanyByName(slugCompany);

		if (!findCompanyBySlug) {
			return res.status(404).send({ message: "Company not found" });
		}

		const findUserById = await userServices.findUserById(
			Number(findCompanyBySlug.id),
		);

		if (!findUserById) {
			return res.status(404).send({ message: "User not found" });
		}

		const slots = await availabilityBusinessService.getAvailableSlotsForDate(
			Number(findCompanyBySlug.id),
			formattedDate,
		);

		res.send({ slots, user: findUserById.blocked });
	} catch (err) {
		res.status(500).json({ err });
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

		const companyBySlug =
			await bookingServices.findSlugCompanyByName(slugCompany);

		if (!companyBySlug) {
			return res.status(404).send({ message: "Company not found" });
		}

		const customerExists = await customerServices.findCustomerByMobile(
			customerPhone,
			Number(companyBySlug.id),
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
			Number(companyBySlug.id),
		);

		if (!serviceExists) {
			return res.status(404).send({ message: "Service not found" });
		}

		await availabilityBusinessService.isSlotAvailable(
			Number(companyBySlug.id),
			date,
		);

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
		});

		res.send(booking);
	} catch (err) {
		if (err instanceof ApiError) {
			return res.status(err.statusCode).json({ message: err.message });
		}
		res.status(500).json({ err });
	}
};
