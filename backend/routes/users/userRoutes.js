import multer from "multer";
import storage from "../../config/multerStorage.js";
import { Router } from "express";
const userRouter = Router();

import {
  registerUser,
  loginUser,
} from "../../controller/users/userController.js";

const upload = multer({ storage });

userRouter.post("/", upload.single("avatar"), registerUser);
userRouter.post("/login", loginUser);

export default userRouter;
