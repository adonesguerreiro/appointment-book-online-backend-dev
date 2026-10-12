import cloudinary from "../../config/cloudinary";
import * as userServices from "../users/users.services";
import * as uploadServices from "./uploadAvatar.services";
import { UserData } from "../../interfaces/UserData";
import { uploadToCloudinary } from "./cloudinary.services";
import { passwordValid } from "../../utils/passwordValid";
import { ApiError } from "../../utils/apiError";
import { hashPassword } from "../../utils/hashPassword";
import { log } from "../../config/logger";

export const uploadProfilePhoto = async (
	id: number,
	file: Express.Multer.File,
	data: UserData,
) => {
	const userExists = await userServices.findUserById(id);
	try {
		if (!userExists) {
			throw new Error("User not found");
		}

		if (userExists.avatarUrl && userExists.avatarPublicId) {
			await cloudinary.uploader.destroy(userExists.avatarPublicId!);
		}

		if (!userExists.password) {
			throw new ApiError("Usuário precisa criar senha primeiro", 400);
		}

		const cloudinaryResponse = await uploadToCloudinary(file!);

		const isPasswordValid = await passwordValid(
			data.password!,
			userExists.password,
		);

		if (!isPasswordValid) {
			throw new ApiError("Senha inválida", 400);
		}

		data.password = await hashPassword(data.password!);
		data.avatarUrl = cloudinaryResponse.secure_url;
		data.avatarPublicId = cloudinaryResponse.public_id;

		const upload = await uploadServices.uploadProfilePhoto(id, data);

		log().info(
			{ upload: upload },
			"Upload profile photo completed successfully",
		);

		return upload;
	} catch (err) {
		log().error(
			{ err, id: id, data: data },
			"Error while uploading profile photo",
		);
		throw err;
	}
};
