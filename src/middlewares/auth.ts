import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { authConfig } from "../config/auth";

interface TokenPayload {
	id: string;
	iat: number;
	exp: number;
	companyId: number;
}

declare module "express-serve-static-core" {
	interface Request {
		userId: string;
		companyId: number;
	}
}

export default async (req: Request, res: Response, next: NextFunction) => {
	const publicRoutes = ["/", "/forgot-password", "/reset-password"];
	const isPublicRoute =
		publicRoutes.includes(req.path) || req.path.startsWith("/public/");

	if (isPublicRoute) {
		return next();
	}

	const token = req.cookies.token;

	if (!token) {
		return res.status(401).json({ error: "Token was not provided." });
	}

	try {
		const decoded = await new Promise<TokenPayload>((resolve, reject) => {
			jwt.verify(
				token,
				authConfig.secret as string,
				(err: any, decoded: any) => {
					if (err) {
						return reject(err);
					}
					resolve(decoded);
				}
			);
		});

		req.userId = decoded.id;
		req.companyId = decoded.companyId;

		return next();
	} catch (error) {
		return res.status(401).json({ error: "Token invalid." });
	}
};
