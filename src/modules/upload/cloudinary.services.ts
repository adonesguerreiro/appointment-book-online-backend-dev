import cloudinary from "../../config/cloudinary";

export const uploadToCloudinary = async (
	file: Express.Multer.File
): Promise<any> => {
	return new Promise((resolve, reject) => {
		const stream = cloudinary.uploader.upload_stream(
			{
				folder: "profilePhotoUsers",
				overwrite: true,
				format: "webp",
			},
			(error, result) => {
				if (error) {
					console.error("Error uploading file:", error);
					return reject(error);
				}
				if (!result) {
					return reject(new Error("Resultado de upload vazio"));
				}
				resolve(result);
			}
		);

		stream.end(file.buffer);
	});
};
