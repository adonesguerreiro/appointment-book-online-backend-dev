import { prisma } from "../src/config/prisma";
import bcrypt from "bcrypt";
import slugify from "slugify";

async function main() {
	await prisma.$connect();

	const companyCreated = await prisma.company.upsert({
		where: {
			slugCompany: slugify("Adtha Software", { lower: true, strict: true }),
		},
		update: {},
		create: {
			name: "Adtha Software",
			mobile: "65996731038",
			email: "adthasoftware@gmail.com",
			cnpj: "12.345.678/0001-91",
			slugCompany: slugify("Adtha Software", { lower: true, strict: true }),
		},
	});

	await prisma.address.upsert({
		where: { companyId: companyCreated.id },
		update: {},
		create: {
			street: "57250 Stoney Laneaaaa",
			number: "4400000",
			complement: "",
			neighborhood: "Modulo 1",
			city: "Juina",
			state: "MT",
			postalCode: "78320000",
			companyId: 1,
		},
	});

	const password = "75315968";
	const passwordHash = await bcrypt.hash(password, 10);
	await prisma.user.upsert({
		where: { email: "adoneslori@gmail.com" },
		update: {},
		create: {
			name: "Adones Lori",
			email: "adoneslori@gmail.com",
			password: passwordHash,
			specialty: "Desenvolvedor",
			companyId: companyCreated.id,
		},
	});
}

main()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
