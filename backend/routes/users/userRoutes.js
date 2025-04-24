import multer from "multer";
import storage from "../../config/multerStorage.js";
import { Router } from "express";
const userRouter = Router();

import {
  registerUser,
  loginUser,
  updateUser,
} from "../../controller/users/userController.js";

import { protect } from "../../middleware/authMiddleware.js";

const upload = multer({ storage });

userRouter.post("/", upload.single("avatar"), registerUser);
userRouter.post("/login", loginUser);
userRouter.put("/", protect, upload.single("avatar"), updateUser);

export default userRouter;
