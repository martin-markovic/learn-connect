import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
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
      get: (val) => {
        if (!val) return null;
        const date = val.toISOString();
        return date.slice(0, 10) + " " + date.slice(11, 16);
      },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      index: { expires: 0 },
    },
  },
  { timestamps: true, toJSON: { getters: true, virtuals: false } }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
