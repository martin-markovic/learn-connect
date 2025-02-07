import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  readBy: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    index: { expires: 0 },
  },
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
