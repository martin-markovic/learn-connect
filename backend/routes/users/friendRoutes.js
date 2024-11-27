import { Router } from "express";
const friendRouter = Router();

import {
  getFriendList,
  getUserList,
} from "../../controller/users/friendController.js";
import { protect } from "../../middleware/authMiddleware.js";

friendRouter.get("/", protect, getUserList);

friendRouter.get("/me", protect, getFriendList);

export default friendRouter;
