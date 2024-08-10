import mongoose from "mongoose";

const classroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  limit: {
    type: Number,
    required: true,
  },
  students: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },
  quizzes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
    },
  ],
  scores: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Score",
    },
  ],
  chat: [
    {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Chat",
      default: [],
    },
  ],
});

const Classroom = mongoose.model("Classroom", classroomSchema);

export default Classroom;
