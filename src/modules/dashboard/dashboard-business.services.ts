import { log } from "../../config/logger";
import * as dashboardServices from "./dashboard-services";

export const dashboardPerMonthAndYear = async (
	month: string,
	year: string,
	companyId: number,
) => {
	try {
		const dashboard = await dashboardServices.getAllAppointmentsPerMonthAndYear(
			month,
			year,
			companyId,
		);

		return dashboard;
	} catch (err) {
		log().error(
			{ err, month: month, year: year, companyId: companyId },
			"Error while fetching dashboard data",
		);
		throw new Error("Failed to fetch dashboard data.");
	}
};
