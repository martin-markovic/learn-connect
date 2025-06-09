import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getClassQuizzes, resetQuizzes } from "../features/quizzes/quizSlice";
import {
  createExam,
  getExam,
  getExamFeedback,
  resetExam,
} from "../features/quizzes/exam/examSlice.js";
import QuizScore from "../components/exam/QuizScore.jsx";
import socketEventManager from "../features/socket/socket.eventManager.js";

function Quiz() {
  const [isInProgress, setIsInProgress] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const { classQuizzes = [] } = useSelector((state) => state.quizzes);
  const { user } = useSelector((state) => state.auth);
  const { quizId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { examData, quizFeedback } = useSelector((state) => state.exam);

  useEffect(() => {
    socketEventManager.subscribe("exam created", (data) => {
      dispatch(createExam(data));
      if (data?._id) {
        navigate(`/exam/${data?._id}`);
      }
    });

    return () => {
      socketEventManager.unsubscribe("exam created");
      dispatch(resetQuizzes());
    };
  }, [dispatch, navigate]);

  useEffect(() => {
    dispatch(getClassQuizzes());

    dispatch(getExamFeedback(quizId));

    dispatch(getExam());

    return () => {
      dispatch(resetExam());
    };
  }, [dispatch, quizId]);

  useEffect(() => {
    if (examData?._id) {
      setIsInProgress(examData?.isInProgress);
    }
  }, [examData]);

  const handleStartQuiz = () => {
    socketEventManager.handleEmitEvent("create exam", {
      senderId: user?._id,
      quizId,
    });
  };

  return (
    <div className="quiz__info-container">
      {showFeedback ? (
        <QuizScore
          quizFeedback={quizFeedback}
          setShowFeedback={setShowFeedback}
        />
      ) : (
        <>
          <div className="quiz__info-list-container">
            {classQuizzes?.length > 0 ? (
              classQuizzes
                ?.filter((quiz) => quiz._id === quizId)
                .map((item, index) => (
                  <div
                    className="quiz__info-entry"
                    key={`quiz__description-${index}`}
                  >
                    <h1>{item.title}</h1>
                    <span>{`Time limit: ${item.timeLimit} minutes`}</span>
                    <span>{`${item.questions.length} questions`}</span>
                  </div>
                ))
            ) : (
              <p>Loading quizzes, please wait...</p>
            )}
          </div>
          {quizFeedback?._id ? (
            <div className="quiz__info-result-container">
              <span>
                Your highest score: {quizFeedback?.highScore}{" "}
                {quizFeedback?.highScore === 1 ? "point" : "points"}
              </span>
              <span>
                See the latest result{" "}
                <button
                  type="button"
                  onClick={() => {
                    setShowFeedback(true);
                  }}
                  title="Show latest result"
                >
                  Here
                </button>
              </span>
            </div>
          ) : (
            <p>You have not taken this quiz yet</p>
          )}
          {!showFeedback &&
            (isInProgress ? (
              <div>
                <p>
                  Exam is currently in progress{" "}
                  <span>
                    Click
                    <button
                      type="button"
                      onClick={() => {
                        navigate(`/exam/${examData?._id}`);
                      }}
                      disabled={!isInProgress}
                    >
                      Here
                    </button>
                  </span>{" "}
                  to navigate to the exam page
                </p>
              </div>
            ) : (
              <button
                style={{ width: "6.5em", height: "2.1em", marginTop: "2em" }}
                type="button"
                onClick={handleStartQuiz}
                disabled={isInProgress}
              >
                Start Exam
              </button>
            ))}
        </>
      )}
    </div>
  );
}

export default Quiz;
