import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  getClassQuizzes,
  resetQuizzes,
} from "../../features/quizzes/quizSlice";
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";

function ClassQuizList() {
  const [searchQuery, setSearchQuery] = useState("");
  const { classQuizzes = [] } = useSelector((state) => state.quizzes);
  const [curPage, setCurPage] = useState(1);

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
        <input
          type="search"
          id="quiz-search"
          name="quiz-search"
          value={searchQuery}
          onChange={handleChange}
          autoComplete="off"
        />
      </div>
      <div className="class__quiz__list-container">
        {filteredQuizzes.length === 0 ? (
          <p>No quizzes found</p>
        ) : (
          filteredQuizzes
            .slice((curPage - 1) * 9, curPage * 9)
            .map((quiz, index) => (
              <div key={index}>
                <p>{quiz.title}</p>
                <button onClick={() => handleClick(quiz?._id)}>Open</button>
              </div>
            ))
        )}
      </div>
      <div className="quiz__pagination-container pagination-classes">
        <div>
          {curPage > 1 && (
            <FaArrowAltCircleLeft
              className="clickable pagination-button"
              title="Previous Page"
              onClick={() => {
                setCurPage((prevState) => (prevState -= 1));
              }}
            />
          )}
        </div>
        <div>
          {filteredQuizzes.length - curPage * 9 > 0 && (
            <FaArrowAltCircleRight
              className="clickable pagination-button"
              title="Next Page"
              onClick={() => {
                setCurPage((prevState) => (prevState += 1));
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ClassQuizList;
