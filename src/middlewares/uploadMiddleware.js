import multer from "multer";
import fs from "fs";
import { logger } from "../config/logger.js";

const p = "./src/uploads/avatars";
if(!fs.existsSync(p)){
    //fs.mkdirSync(p) fails if parent directories don't exist
    fs.mkdirSync(p,{ recursive: true });// Creates parent directories if needed
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, p); // Save files in the "uploads/avatars" directory
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
//save image to the Disk storage 
export const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!allowedTypes.includes(file.mimetype)) {
            logger.error(`user is uploading a non-image file`)
            return cb(new Error("Only images are allowed"));
        }
        cb(null, true);
    },
});
//so u can save that to data base 
export const processAvatar = (req, res, next) => {
    if (req.file) {
        req.body.avatar = `/uploads/avatars/${req.file.filename}`; // Save file path to req.body
    }
    next();
};