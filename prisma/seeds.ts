import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const companies = [
	{
		name: "Alice Smith",
		mobile: "555-1234",
		email: "alice.smith@example.com",
		cnpj: "12.345.678/0001-91",
	},
	{
		name: "Bob Johnson",
		mobile: "555-5678",
		email: "bob.johnson@example.com",
		cnpj: "23.456.789/0001-02",
	},
	{
		name: "Carol Williams",
		mobile: "555-9101",
		email: "carol.williams@example.com",
		cnpj: "34.567.890/0001-13",
	},
	{
		name: "David Brown",
		mobile: "555-1213",
		email: "david.brown@example.com",
		cnpj: "45.678.901/0001-24",
	},
	{
		name: "Emma Davis",
		mobile: "555-1415",
		email: "emma.davis@example.com",
		cnpj: "56.789.012/0001-35",
	},
	{
		name: "Frank Miller",
		mobile: "555-1617",
		email: "frank.miller@example.com",
		cnpj: "67.890.123/0001-46",
	},
	{
		name: "Grace Wilson",
		mobile: "555-1819",
		email: "grace.wilson@example.com",
		cnpj: "78.901.234/0001-57",
	},
	{
		name: "Henry Moore",
		mobile: "555-2021",
		email: "henry.moore@example.com",
		cnpj: "89.012.345/0001-68",
	},
	{
		name: "Ivy Taylor",
		mobile: "555-2223",
		email: "ivy.taylor@example.com",
		cnpj: "90.123.456/0001-79",
	},
	{
		name: "Jack Anderson",
		mobile: "555-2425",
		email: "jack.anderson@example.com",
		cnpj: "01.234.567/0001-80",
	},
];

const users = [
	{
		name: "Alice Smith",
		email: "alice.smith@example.com",
		password: "password123",
		specialty: "Dermatology",
		companyId: 1,
	},
	{
		name: "Bob Johnson",
		email: "bob.johnson@example.com",
		password: "password456",
		specialty: "Pediatrics",
		companyId: 2,
	},
	{
		name: "Carol Williams",
		email: "carol.williams@example.com",
		password: "password789",
		specialty: "Cardiology",
		companyId: 3,
	},
	{
		name: "David Brown",
		email: "david.brown@example.com",
		password: "password321",
		specialty: "Neurology",
		companyId: 4,
	},
	{
		name: "Emma Davis",
		email: "emma.davis@example.com",
		password: "password654",
		specialty: "Orthopedics",
		companyId: 5,
	},
	{
		name: "Frank Miller",
		email: "frank.miller@example.com",
		password: "password987",
		specialty: "Radiology",
		companyId: 6,
	},
	{
		name: "Grace Wilson",
		email: "grace.wilson@example.com",
		password: "password1234",
		specialty: "Oncology",
		companyId: 7,
	},
	{
		name: "Henry Moore",
		email: "henry.moore@example.com",
		password: "password5678",
		specialty: "Psychiatry",
		companyId: 8,
	},
	{
		name: "Ivy Taylor",
		email: "ivy.taylor@example.com",
		password: "password91011",
		specialty: "Endocrinology",
		companyId: 9,
	},
	{
		name: "Jack Anderson",
		email: "jack.anderson@example.com",
		password: "password1213",
		specialty: "Gastroenterology",
		companyId: 10,
	},
];

async function main() {
	await prisma.company.createMany({
		data: companies,
		skipDuplicates: true,
	});

	await prisma.user.createMany({
		data: users,
		skipDuplicates: true,
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
