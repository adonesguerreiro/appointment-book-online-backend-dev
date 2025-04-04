import * as dashboardServices from "./dashboard-services";

export const dashboardPerMonthAndYear = async (
	month: string,
	year: string,
	companyId: number
) => {
	try {
		const dashboard = await dashboardServices.getAllAppointmentsPerMonthAndYear(
			month,
			year,
			companyId
		);

		return dashboard;
	} catch (err) {
		console.error(err);
		throw new Error("Failed to fetch dashboard data.");
	}
};
