import express from "express";
import { listUsers, getUser ,editUserRole, deleteUser ,updateProfile } from "../controllers/userController.js";
import { authorizedRoles } from "../middlewares/roleMiddleware.js";
import {authCustomer} from "../middlewares/authMiddleware.js";
import { upload, processAvatar } from "../middlewares/uploadMiddleware.js";
const router = express.Router();

// List all users
router.get("/", authorizedRoles("admin"), listUsers);

//user can update his Avatar For now u can add more stuff later 
//some notes 
//Route Order: Make sure the /profile route is placed before the /:id route. Express matches routes in order, so 
// if /:id comes first, a request to /profile might be interpreted as /:id with "profile" as the ID.
router.put("/profile",
  authCustomer,
  authorizedRoles("customer"),
  upload.single("avatar"),
  processAvatar,
  updateProfile);

router.route('/:id')
  .get(authorizedRoles('admin'), getUser)
  .patch(authorizedRoles('admin'), editUserRole)
  .delete(authorizedRoles('admin'), deleteUser);




export default router;