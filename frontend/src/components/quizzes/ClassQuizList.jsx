import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  getClassQuizzes,
  resetQuizzes,
} from "../../features/quizzes/quizSlice";

function ClassQuizList() {
  const [searchQuery, setSearchQuery] = useState("");
  const { classQuizzes = [] } = useSelector((state) => state.quizzes);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getClassQuizzes());

    return () => {
      dispatch(resetQuizzes());
    };
  }, [dispatch]);

  const handleClick = (quizId) => {
    navigate(`/quizzes/${quizId}`);
  };

  const filteredQuizzes = useMemo(() => {
    const query = (searchQuery || "").trim().toLowerCase();

    if (!query) return classQuizzes;

    return classQuizzes.filter((quiz) => {
      const title = quiz.title?.toLowerCase() || "";
      const subject = quiz.subject?.toLowerCase() || "";
      return title.includes(query) || subject.includes(query);
    });
  }, [searchQuery, classQuizzes]);

  const handleChange = (e) => {
    setSearchQuery(e.target.value || "");
  };

  return (
    <div>
      <div>
        <span>Search for a quiz:</span>
        <input
          type="search"
          id="quiz-search"
          name="quiz-search"
          value={searchQuery}
          onChange={handleChange}
          autoComplete="off"
        />
      </div>
      {filteredQuizzes.length === 0 ? (
        <p>No quizzes found</p>
      ) : (
        filteredQuizzes.map((quiz, index) => (
          <div key={index}>
            <p>{quiz.title}</p>
            <p>{quiz.subject}</p>
            <button type="button" onClick={() => handleClick(quiz?._id)}>
              Open
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default ClassQuizList;
