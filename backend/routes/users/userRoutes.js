import { Router } from "express";
const userRouter = Router();

import {
  registerUser,
  loginUser,
} from "../../controller/users/userController.js";

userRouter.post("/", registerUser);
userRouter.post("/login", loginUser);

export default userRouter;
