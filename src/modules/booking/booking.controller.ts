import { Request, Response } from "express";
import * as bookingBusinessService from "./booking.business-service";
import * as bookingServices from "./booking.services";
import * as customerServices from "../customer/customer.services";
import dayjs from "dayjs";

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
	try {
		const {
			calendar,
			customerName,
			mobile,
			serviceId: serviceName,
			timeSlotAvaliable,
		} = req.body;

		const companyBySlug = await bookingServices.findSlugCompanyByName(
			req.params.slugCompany
		);

		if (!companyBySlug) {
			return res.status(404).send({ message: "Company not found" });
		}

		const customerExists = await customerServices.findCustomerByMobile(
			mobile,
			Number(companyBySlug.id)
		);

		if (!customerExists) {
			return res.status(404).send({ message: "Customer not found" });
		}



		const booking = await bookingBusinessService.createBooking(req.body);

		res.send(booking);
	} catch (err) {
		res.status(500).json({ error: err });
	}
};
