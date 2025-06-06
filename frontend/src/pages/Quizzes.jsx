import { useState, useEffect } from "react";
import ClassQuizList from "../components/quizzes/ClassQuizList";
import UserQuizList from "../components/quizzes/UserQuizList";

function Quizzes() {
  const [listOpen, setListOpen] = useState(null);

  useEffect(() => {
    setListOpen(null);
  }, []);

  const handleClick = (e) => {
    setListOpen(e.target.id);
  };

  return (
    <div className="quiz__list-container">
      <div className="quiz__list-controller">
        <button
          type="button"
          id="classroom"
          onClick={handleClick}
          disabled={listOpen === "classroom"}
        >
          Class quizzes
        </button>
        <button
          type="button"
          id="user"
          onClick={handleClick}
          disabled={listOpen === "user"}
        >
          User quizzes
        </button>
      </div>
      <div className="quiz__list-display">
        {listOpen ? (
          listOpen === "classroom" ? (
            <ClassQuizList />
          ) : (
            <UserQuizList />
          )
        ) : null}
      </div>
    </div>
  );
}

export default Quizzes;
