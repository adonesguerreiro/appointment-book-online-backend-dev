import { MailerSend, Sender } from "mailersend";

export const mailerSend = new MailerSend({
	apiKey: process.env.API_EMAIL_KEY || "",
});

export const sentFrom = new Sender(
	`${process.env.API_SMTP_KEY}`,
	"AdthaSoftware"
);
