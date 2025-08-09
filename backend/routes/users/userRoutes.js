import multer from "multer";
import storage from "../../config/multerStorage.js";
import { Router } from "express";
const userRouter = Router();

import {
  registerUser,
  loginUser,
  updateUser,
} from "../../controller/users/userController.js";
import { User } from "../../models/users/userModel.js";

import User from "../../models/users/userModel.js";

import { protect } from "../../middleware/authMiddleware.js";

const upload = multer({ storage });

const handleRegisterUser = registerUser(User);
const handleLoginUser = loginUser(User);
const handleUpdateUser = updateUser(User);

userRouter.post("/", handleRegisterUser);
userRouter.post("/login", handleLoginUser);
userRouter.put("/", protect, upload.single("avatar"), handleUpdateUser);

export default userRouter;
