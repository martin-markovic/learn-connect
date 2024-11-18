import Friend from "../../models/users/friendModel.js";
import User from "../../models/users/userModel.js";

export const handleFriendRequest = async (req, res) => {
  try {
    const userId = req.params.id;

    const { friendReqResponse } = req.body;

    const validStatuses = ["pending", "accepted", "declined"];

    if (!validStatuses.includes(friendReqResponse)) {
      return res.status(400).json({ message: "Invalid friend request status" });
    }

    if (friendReqResponse === "declined") {
      await Friend.deleteOne({ receiver: userId, status: "pending" });
      return res.status(200).json({ message: "Request declined" });
    }

    const friendRequest = await Friend.findOneAndUpdate(
      { receiver: userId, status: "pending" },
      { status: friendReqResponse },
      { new: true }
    );

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    return res.status(200).json(friendRequest);
  } catch (error) {
    console.error("Error processing friend request", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getFriendList = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const friendList = await Friend.find({
      $or: [{ sender: userId }, { receiver: userId }],
    });

    if (!friendList || friendList.length === 0) {
      return res.status(200).json({});
    }

    const adjacencyList = friendList.reduce((acc, friend) => {
      const { sender, receiver } = friend;
      if (!acc[sender]) acc[sender] = [];
      if (!acc[receiver]) acc[receiver] = [];
      acc[sender].push(receiver);
      acc[receiver].push(sender);
      return acc;
    }, {});

    return res.status(200).json(adjacencyList);
  } catch (error) {
    console.error("Error fetching friend list", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserList = async (req, res) => {
  try {
    const userList = await User.find().select("-password -email -classrooms");

    if (!userList || userList.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(userList);
  } catch (error) {
    console.error("Error fetching list of users", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const removeFriend = (req, res) => {
  try {
  } catch (error) {
    console.error("Error fetching list of users", error);
    return res.status(500).json({ message: "Server error" });
  }
};
