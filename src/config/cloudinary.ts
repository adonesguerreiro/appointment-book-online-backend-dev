import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
	cloud_name: `${process.env.CLOUD_NAME_CLOUDNARY}`,
	api_key: `${process.env.API_KEY_CLOUDNARY}`,
	api_secret: `${process.env.API_SECRET_KEY_CLOUDNARY}`,
});

export default cloudinary;
