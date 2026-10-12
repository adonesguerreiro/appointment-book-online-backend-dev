import pino from "pino";
import { AsyncLocalStorage } from "async_hooks";

export const logger = pino({
	level: process.env.LOG_LEVEL || "info",

	formatters: {
		level: (label) => ({ level: label }),
	},

	transport:
		process.env.NODE_ENV !== "production"
			? { target: "pino-pretty", options: { colorize: true } }
			: undefined,
});

export const requestContext = new AsyncLocalStorage<{ requestId: string }>();

export function log() {
	const ctx = requestContext.getStore();
	return ctx ? logger.child({ requestId: ctx.requestId }) : logger;
}
