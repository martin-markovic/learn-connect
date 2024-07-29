import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ClassQuizList from "../components/ClassQuizList";
import UserQuizList from "../components/UserQuizList";

function Quizzes() {
  const [listOpen, setListOpen] = useState(null);

  useEffect(() => {
    setListOpen(null);
  }, []);

  const { user } = useSelector((state) => state.auth);

  const userName = user.name.split(" ")[0];

  const handleClick = (e) => {
    setListOpen(e.target.id);
  };

  return (
    <div className="container quiz__list">
      <div className="quiz__list-controller">
        <button
          type="button"
          id="classroom"
          onClick={handleClick}
          disabled={listOpen === "classroom"}
        >
          Classroom quizzes
        </button>
        <button
          type="button"
          id="user"
          onClick={handleClick}
          disabled={listOpen === "user"}
        >
          {`${userName}'s`} quizzes
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
