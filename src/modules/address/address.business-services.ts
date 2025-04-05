import { AddressData } from "../../interfaces/AddressData";
import * as addressesServices from "./address.services";

export const getAllAddresses = async (page: number, limit: number) => {
	try {
		const skip = (page - 1) * limit;
		const addresses = await addressesServices.findAllAddresses(skip, limit);
		if (!addresses) {
			throw new Error("Addresses not found");
		}

		return addresses;
	} catch (err) {
		throw err;
	}
};

export const getAddressById = async (companyId: number) => {
	try {
		const address = await addressesServices.findAddressById(companyId);
		if (!address) {
			throw new Error("Address not found");
		}

		return address;
	} catch (err) {
		throw err;
	}
};

export const getAddressFindData = async (findAddress: AddressData) => {
	try {
		const { id, companyId, ...data } = findAddress;
		const address = await addressesServices.findAddressByData(
			data as AddressData
		);

		if (!address) {
			throw new Error("Address not found");
		}

		return address;
	} catch (err) {
		throw err;
	}
};

export const createAddress = async (createData: AddressData) => {
	try {
		const address = await addressesServices.createAddress(createData);
		if (!address) {
			throw new Error("Address not created");
		}

		return address;
	} catch (err) {
		throw err;
	}
};

export const updateAddress = async (updateData: AddressData) => {
	try {
		const address = await addressesServices.updateAddress(updateData);
		if (!address) {
			throw new Error("Address not updated");
		}

		return address;
	} catch (err) {
		throw err;
	}
};
