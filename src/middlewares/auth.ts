import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { authConfig } from "../config/auth";

interface TokenPayload {
	id: string;
	iat: number;
	exp: number;
}

declare module "express-serve-static-core" {
	interface Request {
		userId?: string;
	}
}

export default async (req: Request, res: Response, next: NextFunction) => {
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

		return next();
	} catch (error) {
		return res.status(401).json({ error: "Token invalid." });
	}
};
