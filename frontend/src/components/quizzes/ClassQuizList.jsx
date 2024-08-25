import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { resetQuizzes } from "../../features/quizzes/quizSlice";

function ClassQuizList() {
  const [quizList, setQuizList] = useState([]);
  const { classQuizzes } = useSelector((state) => state.quizzes);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    setQuizList(classQuizzes);
  }, [classQuizzes]);

  useEffect(() => {
    return () => {
      dispatch(resetQuizzes());
    };
  }, [dispatch]);

  const handleClick = (id) => {
    navigate(`/${id}`);
  };

  const handleFilter = useCallback(
    (quizQuery) => {
      const formattedQuery = quizQuery.toLowerCase();

      return classQuizzes.filter((item) => {
        const formattedTitle = item.title.toLowerCase();
        const formattedSubject = item.subject.toLowerCase();
        return (
          formattedTitle.includes(formattedQuery) ||
          formattedSubject.includes(formattedQuery)
        );
      });
    },
    [classQuizzes]
  );

  const handleChange = (e) => {
    const newFilter = e.target.value;

    setQuizList(handleFilter(newFilter));
  };

  return (
    <div>
      <div>
        <span>Search for a quiz:</span>
        <input
          type="search"
          id="quiz-search"
          name="quiz-search"
          onChange={handleChange}
          autoComplete="off"
        />
      </div>
      {quizList.length === 0 ? (
        <p>No quizzes found</p>
      ) : (
        quizList.map((quiz, index) => (
          <div key={index}>
            <p>{quiz.title}</p>
            <p>{quiz.subject}</p>
            <button type="button" onClick={() => handleClick(quiz._id)}>
              Open
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default ClassQuizList;
