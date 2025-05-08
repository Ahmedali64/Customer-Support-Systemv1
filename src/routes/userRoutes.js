import express from "express";
import { listUsers, getUser ,editUser, deleteUser ,updateProfile } from "../controllers/userController.js";
import { authorizedRoles } from "../middlewares/roleMiddleware.js";
import { upload, processAvatar } from "../middlewares/uploadMiddleware.js";
import { validate } from "../middlewares/validationMiddleware.js";
import { profileUpdateValidation } from "../utils/userValidation.js";
const router = express.Router();

// List all users (Admin only)
router.get("/", authorizedRoles("admin"), listUsers);

router.route('/:id')
  .get(authorizedRoles('admin'), getUser)
  .patch(authorizedRoles('admin'), editUser)
  .delete(authorizedRoles('admin'), deleteUser);

router.patch("/profile",
  authorizedRoles("customer", "agent", "admin"),
  upload.single("avatar"),
  processAvatar,
  validate(profileUpdateValidation),
  updateProfile);


export default router;