import { Router } from "express";
const friendRouter = Router();

import {
  getFriendList,
  getUserList,
} from "../../controller/users/friendController.js";
import { protect } from "../../middleware/authMiddleware.js";
import User from "../../models/users/userModel.js";
import Friend from "../../models/users/friendModel.js";


import User from "../../models/users/userModel.js";
import Friend from "../../models/users/friendModel.js";

const handleGetFriendList = getFriendList(Friend);
const handleGetUserList = getUserList(User);


friendRouter.get("/", protect, handleGetUserList);

friendRouter.get("/:userId", protect, handleGetFriendList);

export default friendRouter;
