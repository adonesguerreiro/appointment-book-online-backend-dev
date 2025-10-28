import { config } from "dotenv";
config();
export const authConfig = {
	secret: process.env.APP_SECRET_KEY || "",
	expiresIn: "15m",
};

export const refreshConfig = {
	refreshSecret: process.env.APP_REFRESH_SECRET_KEY || "",
	expiresIn: "7d",
};
