import { Router } from "express";
const friendRouter = Router();

import {
  handleFriendRequest,
  getFriendList,
  getUserList,
  removeFriend,
} from "../../controller/users/friendController.js";
import { protect } from "../../middleware/authMiddleware.js";

friendRouter.get("/", protect, getUserList);

friendRouter.post("/requests/:userId", protect, handleFriendRequest);

  .delete(protect, removeFriend);
friendRouter.route("/:userId").delete(protect, removeFriend);

friendRouter.get("/me", protect, getFriendList);

export default friendRouter;
