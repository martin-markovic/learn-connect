import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getClassQuizzes } from "../features/quizzes/quizSlice";
import { createExam } from "../features/quizzes/exam/examSlice.js";
import Exam from "../components/quizzes/Exam.jsx";

function Quiz() {
  const [quizData, setQuizData] = useState(null);
  const [isInProgress, setIsInProgress] = useState(false);
  const { classQuizzes = [] } = useSelector((state) => state.quizzes);
  const { quizId } = useParams();
  const dispatch = useDispatch();

  const { userScores = {} } = useSelector((state) => state.quizzes);

  const { examData = {} } = useSelector((state) => state.exam);

  useEffect(() => {
    if (!quizData) {
      dispatch(getClassQuizzes());
    }
  }, [dispatch, quizData]);

  useEffect(() => {
    const selectedQuiz = classQuizzes.find((quiz) => quiz._id === quizId);

    setQuizData(selectedQuiz);
  }, [classQuizzes, quizId]);

  useEffect(() => {
    if (examData._id) {
      console.log("examdata found: ", examData);
      setIsInProgress(true);
    } else {
      console.log("exam not found");
      setIsInProgress(false);
    }
  }, [examData]);

  return (
    <div>
      {quizData ? (
        <div>
          {isInProgress ? (
            <Exam />
          ) : (
            <div>
              <h1>{quizData?.title}</h1>
              <p>
                {userScores[quizId]
                  ? `Your highest score on this quiz: ${userScores[quizId]}`
                  : "You have not taken this quiz yet"}
              </p>
              <button
                type="button"
                disabled={isInProgress}
                onClick={() => {
                  dispatch(createExam(quizId));
                  setIsInProgress(true);
                }}
              >
                Start Exam
              </button>
            </div>
          )}
        </div>
      ) : (
        <p>No quiz data available</p>
      )}
    </div>
  );
}

export default Quiz;
