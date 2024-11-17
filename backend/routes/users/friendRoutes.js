import { Router } from "express";
const friendRouter = Router();

import {
  sendFriendRequest,
  handleFriendRequest,
  getFriendList,
  getUserList,
  removeFriend,
} from "../../controller/users/friendController.js";
import { protect } from "../../middleware/authMiddleware.js";

friendRouter.get("/", protect, getUserList);

friendRouter.post("/requests/:userId", protect, handleFriendRequest);

friendRouter
  .route("/:userId")
  .post(protect, sendFriendRequest)
  .delete(protect, removeFriend);

friendRouter.get("/me", protect, getFriendList);

export default friendRouter;
