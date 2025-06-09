import { useState } from "react";
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";

function QuizScore({ quizFeedback, setShowFeedback }) {
  const [currPage, setCurrPage] = useState(0);

  return (
    <>
      <div className="quiz__score-container">
        <h1>
          Highscore: {quizFeedback?.highScore}{" "}
          {quizFeedback?.highScore !== 1 ? "points" : "point"}
        </h1>
        <h2>
          Latest score: {quizFeedback?.latestScore}{" "}
          {quizFeedback?.latestScore !== 1 ? "points" : "point"}
        </h2>
        <div className="quiz__feedback-container">
          {quizFeedback &&
            quizFeedback?.examFeedback?.randomizedQuestions?.length > 0 &&
            quizFeedback?.examFeedback?.randomizedQuestions
              .filter((_, index) => index === currPage)
              .map((q, index) => {
                return (
                  <div className="quiz__feedback" key={`question-${index}`}>
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
        <div className="quiz__info-pagination">
          <span>
            {currPage > 0 && (
              <FaArrowAltCircleLeft
                title="Previous question"
                className="pagination-button clickable"
                onClick={() => {
                  setCurrPage((prevState) => (prevState -= 1));
                }}
              />
            )}
          </span>
          <span>
            {currPage <
              quizFeedback?.examFeedback?.randomizedQuestions?.length - 1 && (
              <FaArrowAltCircleRight
                title="Next question"
                className="pagination-button clickable"
                onClick={() => {
                  setCurrPage((prevState) => (prevState += 1));
                }}
              />
            )}
          </span>
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
