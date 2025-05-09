import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { authConfig } from "../config/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface TokenPayload {
	id: string;
	iat: number;
	exp: number;
}

declare module "express-serve-static-core" {
	interface Request {
		userId?: string;
		companyId?: number;
	}
}

export default async (req: Request, res: Response, next: NextFunction) => {
	const publicRoutes = ["/", "/forgot-password", "/reset-password"];
	const isPublicRoute =
		publicRoutes.includes(req.path) || req.path.startsWith("/public/");

	if (isPublicRoute) {
		return next();
	}

	const authHeader = req.headers.authorization;

	if (!authHeader) {
		return res.status(401).json({ error: "Token was not provided." });
	}

	const [, token] = authHeader.split(" ");

	try {
		const decoded = await new Promise<TokenPayload>((resolve, reject) => {
			jwt.verify(token, authConfig.secret as string, (err, decoded) => {
				if (err) {
					return reject(err);
				}
				resolve(decoded as TokenPayload);
			});
		});

		req.userId = decoded.id;

		const user = await prisma.user.findUnique({
			where: { id: Number(req.userId) },
			select: { companyId: true },
		});

		if (user && user.companyId) {
			req.companyId = user.companyId;
		} else {
			return res.status(401).json({ error: "User not found." });
		}

		return next();
	} catch (error) {
		return res.status(401).json({ error: "Token invalid." });
	}
};
