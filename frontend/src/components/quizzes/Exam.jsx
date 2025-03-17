import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getExam,
  updateExam,
  finishExam,
  resetExam,
} from "../../features/quizzes/exam/examSlice.js";
import socketEventManager from "../../features/socket/socket.eventManager.js";

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

    return () => {
      dispatch(resetExam());
    };
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
  }, [isProcessing, navigate, examFeedback?.quizId]);

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
      dispatch(finishExam(examData?.quizId));
    } catch (error) {
      console.error("Error finishing exam: ", error.message);
    }
  };

  return (
    <div>
      {examData ? (
        <div>
          {examData?.shuffledQuestions?.length &&
            examData?.shuffledQuestions.find(
              (_, index) => index === currQuestion
            ) && (
              <div>
                <h1>{examData?.shuffledQuestions[currQuestion]?.question}</h1>

                <div>
                  {examData?.shuffledQuestions[currQuestion]?.choices.map(
                    (choice, choiceIndex) => {
                      return (
                        <div key={`choice-${choiceIndex}`}>
                          <input
                            name="choice"
                            type="radio"
                            id={choice}
                            onChange={handleChange}
                            checked={examData.answers[currQuestion] === choice}
                          />
                          <label htmlFor="choice" id={choice}>
                            {choice}
                          </label>
                        </div>
                      );
                    }
                  )}
                </div>
                {currQuestion > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrQuestion((prevState) => prevState - 1);
                    }}
                  >
                    Previous Question
                  </button>
                )}
                {currQuestion < examData.shuffledQuestions.length - 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrQuestion(() => currQuestion + 1);
                    }}
                  >
                    Next Question
                  </button>
                )}
                <button type="button" onClick={handleSubmit}>
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
