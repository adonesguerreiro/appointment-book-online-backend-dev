import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
	const companyCreated = await prisma.company.upsert({
		where: { slug: "adthasoftware" },
		update: {},
		create: {
			name: "Adtha Software",
			mobile: "65996731038",
			email: "adthasoftware@gmail.com",
			cnpj: "12.345.678/0001-91",
			slug: "adthasoftware",
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

	console.log("Seed de desenvolvimento executado com sucesso!");
}

main()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
