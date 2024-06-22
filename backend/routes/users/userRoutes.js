import { Router } from "express";
const userRouter = Router();

import {
  registerUser,
  getUsers,
  updateUser,
  deleteUser,
} from "../../middleware/users/userFunctions.js";

userRouter.route("/").post(registerUser).get(getUsers);

userRouter.route("/:id").put(updateUser).delete(deleteUser);

export default userRouter;
