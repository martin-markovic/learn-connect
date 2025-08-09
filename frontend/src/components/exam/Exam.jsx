import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  updateExam,
  finishExam,
  getExam,
} from "../../features/quizzes/exam/examSlice.js";
import socketEventManager from "../../features/socket/socket.eventManager.js";
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";

import ExamTimer from "./ExamTimer.jsx";

function Exam() {
  const [currQuestion, setCurrQuestion] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const { isLoading, examData, examFeedback } = useSelector(
    (state) => state.exam
  );
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getExam());
  }, [dispatch]);

  useEffect(() => {
    if (!isLoading) {
      if (!examData?._id) {
        setErrorMessage("No exam is currently in progress");
      }

      if (examData?._id && examData?.studentId !== user?._id) {
        setErrorMessage("User id does not match this exam student id");
      }

      const examExpireDate = new Date(examData?.examFinish).getTime();

      const isExamValid = examExpireDate - Date.now() > 0;

      if (examData?._id && !isExamValid) {
        setErrorMessage("Exam has expired");
      }
    }
  }, [
    isLoading,
    navigate,
    examData?._id,
    examData?.studentId,
    user?._id,
    errorMessage,
    examData?.examFinish,
  ]);

  useEffect(() => {
    if (errorMessage) {
      console.error(errorMessage);
      navigate("/quizzes");
    }
  }, [errorMessage, navigate]);

  useEffect(() => {
    socketEventManager.subscribe("exam updated", (data) => {
      dispatch(updateExam(data));
    });

    return () => {
      socketEventManager.unsubscribe("exam updated");
    };
  }, [dispatch, navigate]);

  useEffect(() => {
    if (examFeedback?.quizId && !isProcessing) {
      setIsProcessing(true);

      socketEventManager.handleEmitEvent("new notification", {
        senderId: examFeedback?.scorePayload?.user,
        quizScore: examFeedback?.scorePayload?.highScore,
        quizId: examFeedback?.scorePayload?.quiz,
        notificationName: "quiz graded",
      });

      setIsProcessing(false);
      navigate("/");
    }
  }, [
    isProcessing,
    navigate,
    examFeedback?.quizId,
    examFeedback?.scorePayload?.highScore,
    examFeedback?.scorePayload?.quiz,
    examFeedback?.scorePayload?.user,
  ]);

  const handleChange = (e) => {
    try {
      const userData = {
        senderId: user?._id,
        receiverId: examData?._id,
        examData: {
          choiceIndex: currQuestion,
          choiceData: e.target.id,
        },
      };

      socketEventManager.handleEmitEvent("update exam", userData);
    } catch (error) {
      console.error("Error selecting option: ", error.message);
    }
  };

  const handleSubmit = () => {
    try {
      socketEventManager.handleEmitEvent("finish exam", {
        senderId: user?._id,
        quizId: examData?.quizId,
      });
    } catch (error) {
      console.error("Error finishing exam: ", error.message);
    }
  };

  return (
    <div className="exam-container">
      <ExamTimer examFinish={examData?.examFinish} />
      {examData ? (
        <div className="exam__data-container">
          {examData?.shuffledQuestions?.length &&
            examData?.shuffledQuestions.find(
              (_, index) => index === currQuestion
            ) && (
              <div className="exam-data">
                <p>
                  <span style={{ fontWeight: "bold", fontSize: "larger" }}>
                    {currQuestion + 1}.{" "}
                  </span>
                  <span style={{ fontSize: "large" }}>
                    {examData?.shuffledQuestions[currQuestion]?.question}
                  </span>
                </p>
                <div className="exam__choices-container">
                  {examData?.shuffledQuestions[currQuestion]?.choices.map(
                    (choice, choiceIndex) => {
                      return (
                        <div
                          className="exam__choice-entry"
                          key={`choice-${choiceIndex}`}
                        >
                          <input
                            className="clickable"
                            name="choice"
                            type="radio"
                            id={choice}
                            onChange={handleChange}
                            checked={examData.answers[currQuestion] === choice}
                          />
                          <label
                            className="clickable"
                            htmlFor="choice"
                            id={choice}
                          >
                            {choice}
                          </label>
                        </div>
                      );
                    }
                  )}
                </div>
                <div className="exam__choices-pagination">
                  <span>
                    {currQuestion > 0 && (
                      <FaArrowAltCircleLeft
                        className="pagination-button clickable"
                        title="Previous Question"
                        onClick={() => {
                          setCurrQuestion((prevState) => prevState - 1);
                        }}
                      />
                    )}
                  </span>
                  <span>
                    {currQuestion < examData.shuffledQuestions.length - 1 && (
                      <FaArrowAltCircleRight
                        className="pagination-button clickable"
                        title=" Next Question"
                        onClick={() => {
                          setCurrQuestion(() => currQuestion + 1);
                        }}
                      />
                    )}
                  </span>
                </div>

                <button
                  style={{
                    alignSelf: "center",
                    marginTop: "2em",
                    marginLeft: "2em",
                    height: "3em",
                    width: "8em",
                  }}
                  type="button"
                  onClick={handleSubmit}
                >
                  Finish Exam
                </button>
              </div>
            )}
        </div>
      ) : (
        <p>No exam</p>
      )}
    </div>
  );
}

export default Exam;
