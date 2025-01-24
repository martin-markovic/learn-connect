import Exam from "../../models/quizzes/examModel.js";
import Classroom from "../../models/classrooms/classroomModel.js";
import Quiz from "../../models/quizzes/quizModel.js";

export const createExam = async (req, res) => {
  try {
    const { quizId } = req.body;

    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authorized" });
    }

    const quizFound = await Quiz.findOne({ quizId: quizId });

    if (!quizFound) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const classroomFound = await Classroom.findOne({
      _id: quizFound?.classroom,
    });

    if (!classroomFound) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    const isEnrolled = classroomFound.students.some(
      (student) => String(student?._id) === String(userId)
    );

    if (!isEnrolled) {
      return res.status(401).json({
        message: `User is not enrolled in classroom ${classroomFound?._id}`,
      });
    }

    const examExists = await Exam.findOne({ studentId: userId });

    if (examExists) {
      return res.status(401).json({
        message: `User is already participating in an exam ${examExists?._id}`,
      });
    }

    const examStart = new Date();
    const examFinish = new Date(
      examStart.getTime() + quizFound.timeLimit * 60 * 1000
    );

    const newExam = new Exam({
      quizId: quizFound?._id,
      studentId: userId,
      examStart,
      examFinish,
    });

    const payloadExam = await newExam.save();

    return res.status(201).json(payloadExam);
  } catch (error) {
    console.error(`Error creating exam: ${error.message}`);
    return res.status(500).json({
      message: `Error creating exam: ${error.message}`,
    });
  }
};

export const getExam = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authorized" });
    }

    const examFound = await Exam.findOne({ studentId: userId });

    if (!examFound) {
      return res.status(404).json({ message: "Exam not found" });
    }

    return res.status(200).json(examFound);
  } catch (error) {
    console.error(`Error fetching exam: ${error.message}`);
    return res.status(500).json({
      message: `Error fetching exam: ${error.message}`,
    });
  }
};

export const getExamFeedback = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authorized" });
    }

    const { examId } = req.params;

    if (!examId) {
      return res.status(400).json({ message: "Missing exam id" });
    }

    const examFound = await Exam.findOne({ _id: examId });

    if (!examFound) {
      return res.status(404).json({ message: "Exam not found" });
    }

    return res.status(200).json(examFound);
  } catch (error) {
    console.error(`Error fetching exam: ${error.message}`);
    return res.status(500).json({
      message: `Error fetching exam: ${error.message}`,
    });
  }
};
