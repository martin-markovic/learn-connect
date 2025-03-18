import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  getExam,
  getExamFeedback,
  resetExam,
} from "../../features/quizzes/exam/examSlice";

function QuizScore({ setShowFeedback }) {
  const [currPage, setCurrPage] = useState(0);
  const { quizFeedback } = useSelector((state) => state.exam);

  const dispatch = useDispatch();
  const { quizId } = useParams();

  useEffect(() => {
    dispatch(getExamFeedback(quizId));
    dispatch(getExam());

    return () => {
      dispatch(resetExam);
    };
  }, [dispatch, quizId]);

  return (
    <>
      <div>
        <h1>
          Highscore: {quizFeedback?.highScore}{" "}
          {quizFeedback?.highScore !== 1 ? "points" : "point"}
        </h1>
        <h2>
          Latest score: {quizFeedback?.latestScore}{" "}
          {quizFeedback?.latestScore !== 1 ? "points" : "point"}
        </h2>
        <div>
          {quizFeedback &&
            quizFeedback?.examFeedback?.randomizedQuestions?.length > 0 &&
            quizFeedback?.examFeedback?.randomizedQuestions
              .filter((_, index) => index === currPage)
              .map((q, index) => {
                return (
                  <div key={`question-${index}`}>
                    <p>{q.question}</p>
                    <ul>
                      {q.choices.map((choice, choiceIndex) => (
                        <li
                          style={{
                            color:
                              choice ===
                              quizFeedback?.examFeedback?.userChoices?.[
                                currPage
                              ]?.correctAnswer
                                ? "green"
                                : choice ===
                                  quizFeedback?.examFeedback?.userChoices?.[
                                    currPage
                                  ]?.userAnswer
                                ? "red"
                                : "black",
                          }}
                          key={`feedback-${choiceIndex}`}
                        >
                          <span>{choice}</span>
                          {choice ===
                            quizFeedback?.examFeedback?.userChoices?.[currPage]
                              ?.correctAnswer &&
                            choice ===
                              quizFeedback?.examFeedback?.userChoices?.[
                                currPage
                              ]?.userAnswer && <span>{" +1 pt"}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
        </div>
        <div>
          {currPage > 0 && (
            <button
              type="button"
              onClick={() => {
                setCurrPage((prevState) => (prevState -= 1));
              }}
              disabled={currPage === 0}
            >
              Previous Question
            </button>
          )}

          {currPage <
            quizFeedback?.examFeedback?.randomizedQuestions?.length - 1 && (
            <button
              type="button"
              onClick={() => {
                setCurrPage((prevState) => (prevState += 1));
              }}
            >
              Next Question
            </button>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          setShowFeedback(false);
        }}
      >
        Go Back
      </button>
    </>
  );
}

export default QuizScore;
