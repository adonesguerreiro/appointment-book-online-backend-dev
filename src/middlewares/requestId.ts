import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from "express";
import { logger, requestContext } from "../config/logger";

declare module "express-serve-static-core" {
	interface Request {
		requestId: string;
		log: typeof logger;
	}
}

export default (req: Request, res: Response, next: NextFunction) => {
	const requestId = (req.headers["x-request-id"] as string) || randomUUID();
	req.requestId = requestId;
	req.log = logger.child({ requestId });

	requestContext.run({ requestId }, () => {
		req.log.info({ method: req.method, path: req.path }, "request started");
		next();
	});
};
