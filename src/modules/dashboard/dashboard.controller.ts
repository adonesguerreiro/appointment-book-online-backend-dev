import { Request, Response } from "express";
import * as dashboardBusinessServices from "./dashboard-business.services";

export const dashboardPerMonthAndYear = async (req: Request, res: Response) => {
	try {
		const { month, year } = req.params;

		const scheduleByStatus =
			await dashboardBusinessServices.dashboardPerMonthAndYear(
				month,
				year,
				Number(req.companyId)
			);

		return res.send({scheduleByStatus});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal server error" });
	}
};
