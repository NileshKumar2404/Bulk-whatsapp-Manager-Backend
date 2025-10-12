// middleware/upload.middleware.js
import multer from "multer";

const storage = multer.memoryStorage(); // or diskStorage if you prefer
export const upload = multer({ storage });

// Helpers you can reuse:
export const parseFormOnly = upload.none();           // for form-data with NO files
export const parseSingleFile = upload.single("file"); // for form-data with ONE file named "file"
