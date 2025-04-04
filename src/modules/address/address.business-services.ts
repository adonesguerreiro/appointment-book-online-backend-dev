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
