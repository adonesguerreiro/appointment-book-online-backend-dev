import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
	const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(
			new Error("Invalid file type. Only JPEG, PNG, WEBP and GIF are allowed."),
			false,
		);
	}
};

export const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 5 * 1024 * 1024,
	},
});
