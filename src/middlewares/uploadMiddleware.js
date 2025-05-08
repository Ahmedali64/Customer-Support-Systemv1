import multer from "multer";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/avatars"); // Save files in the "uploads/avatars" directory
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

export const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("Only images are allowed"));
        }
        cb(null, true);
    },
});

export const processAvatar = (req, res, next) => {
    if (req.file) {
        req.body.avatar = `/uploads/avatars/${req.file.filename}`; // Save file path to req.body
    }
    next();
};