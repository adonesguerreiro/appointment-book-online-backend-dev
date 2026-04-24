import { AddressData } from "./../../interfaces/AddressData";
import { prisma } from "../../config/prisma";

export const findAllAddresses = async (skip: number, limit: number) => {
	return await prisma.address.findMany({
		where: { deletedAt: null },
		skip,
		take: limit,
	});
};

export const findAddressById = async (companyId: number) => {
	return await prisma.address.findFirst({
		where: { companyId, deletedAt: null },
	});
};

export const findAddressByData = async (data: AddressData) => {
	return await prisma.address.findUnique({
		where: data,
	});
};

export const createAddress = async (data: AddressData) => {
	return await prisma.address.create({
		data,
	});
};

export const updateAddress = async (data: AddressData) => {
	return await prisma.address.update({
		where: { id: data.id },
		data,
	});
};
