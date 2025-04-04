import cloudinary from "../../config/cloudinary";
import fs from "fs";
import * as userServices from "../users/users.services";
import * as uploadServices from "./uploadAvatar.services";
import { UserData } from "../../interfaces/UserData";

export const uploadProfilePhoto = async (
	id: number,
	file: any,
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

		const cloudinaryResponse = await cloudinary.uploader.upload(file?.path!, {
			folder: "profilePhotoUsers",
			overwrite: true,
			format: "webp",
		});

		data.avatarUrl = cloudinaryResponse.secure_url;
		data.avatarPublicId = cloudinaryResponse.public_id;

		fs.unlinkSync(file?.path!);

		const upload = await uploadServices.uploadProfilePhoto(id, data);

		return upload;
	} catch (err) {
		throw err;
	}
};
