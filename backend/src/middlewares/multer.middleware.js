import multer from "multer";
import path from "path";
import fs from "fs";
import { ApiError } from "../utils/ApiError.js";

const tempDir = "./public/temp";
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
 
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "avatar" && !allowedImageTypes.includes(file.mimetype)) {
    return cb(new ApiError(400, "Only JPEG, PNG, or WEBP images are allowed for avatar"));
  }
  cb(null, true);
};

export const upload = multer({ storage ,fileFilter, limits: {fileSize: 5*1024*1024}});
