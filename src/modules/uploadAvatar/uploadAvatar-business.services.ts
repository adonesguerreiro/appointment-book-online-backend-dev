import cloudinary from "../../config/cloudinary";
import fs from "fs";
import * as userServices from "../users/users.services";
import * as uploadServices from "./uploadAvatar.services";
import { UserData } from "../../interfaces/UserData";
import { uploadToCloudinary } from "./cloudinary.services";
import { passwordValid } from "../../utils/passwordValid";
import { ApiError } from "../../utils/apiError";
import { hashPassword } from "../../utils/hashPassword";

export const uploadProfilePhoto = async (
	id: number,
	file: Express.Multer.File,
	data: UserData
) => {
	const userExists = await userServices.findUserById(id);
	try {
		if (!userExists) {
			throw new Error("User not found");
		}

		if (userExists.avatarUrl && userExists.avatarPublicId) {
			await cloudinary.uploader.destroy(userExists.avatarPublicId!);
		}

		const cloudinaryResponse = await uploadToCloudinary(file!);

		const isPasswordValid = await passwordValid(
			data.password,
			userExists.password
		);

		if (!isPasswordValid) {
			throw new ApiError("Senha inválida", 400);
		}

		data.password = await hashPassword(data.password);
		data.avatarUrl = cloudinaryResponse.secure_url;
		data.avatarPublicId = cloudinaryResponse.public_id;

		const upload = await uploadServices.uploadProfilePhoto(id, data);

		return upload;
	} catch (err) {
		throw err;
	}
};
