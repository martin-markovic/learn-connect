import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getUserList, resetUserList } from "../../features/friend/friendSlice";
import { FaSearch } from "react-icons/fa";
import { FaSearch, FaUserCircle } from "react-icons/fa";
import {
  resetQuizzes,
  getClassQuizzes,
  getUserQuizzes,
} from "../../features/quizzes/quizSlice";

export default function FriendSearch() {
  const [input, setInput] = useState("");
  const [resultList, setResultList] = useState([]);
  const [resultMap, setResultMap] = useState({ users: [], quizzes: [] });
  const [showAllResults, setShowAllResults] = useState(false);

  const { isLoading: userStateLoading, userList } = useSelector(
    (state) => state.friends
  );
  const {
    isLoading: quizStateLoading,
    userQuizzes,
    classQuizzes,
  } = useSelector((state) => state.quizzes);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getUserList());
    dispatch(getUserQuizzes());
    dispatch(getClassQuizzes());

    return () => {
      dispatch(resetUserList());
      dispatch(resetQuizzes());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!userStateLoading) {
      setResultMap((prevState) => ({
        ...prevState,
        users: [...userList],
      }));
    }

    if (!quizStateLoading) {
      const quizList = [...userQuizzes, ...classQuizzes];
      const quizIdSet = new Set();
      const filteredList = [];

      for (const quiz of quizList) {
        const { _id } = quiz;

        if (!quizIdSet.has(_id)) {
          quizIdSet.add(_id);

          filteredList.push(quiz);
        }
      }

      setResultMap((prevState) => ({
        ...prevState,
        quizzes: filteredList,
      }));
    }
  }, [userStateLoading, quizStateLoading, userList, classQuizzes, userQuizzes]);

  const handleChange = (e) => {
    e.preventDefault();

    const query = e.target.value;
    setInput(query);

    if (query.trim().length < 2) {
      setResultList([]);
      return;
    }

    const userResults = resultMap?.users?.filter((user) =>
      user.name.toLowerCase().startsWith(query.trim().toLowerCase())
    );

    const quizResults = resultMap?.quizzes?.filter((quiz) =>
      quiz?.title?.toLowerCase().startsWith(query.trim().toLowerCase())
    );

    const results = [...userResults, ...quizResults];

    setResultList(results);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleVisit = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="friend__search-box">
      <div className="friend__search-container">
        <input
          type="search"
          id="search__users"
          name="search__users"
          value={input}
          onChange={handleChange}
          placeholder="Search users or quizzes"
          autoComplete="off"
        />
        <button type="button" onClick={handleSubmit}>
          Search
          <FaSearch />
        </button>
      </div>
      <div
        className="result-list"
        style={{
          border:
            input.length >= 2 && resultList.length !== 0
              ? "1px solid rgb(172, 172, 172)"
              : "1px solid transparent",
          borderRadius: "0 0 5% 5%",
        }}
      >
        {input.length >= 2 && resultList.length === 0 ? (
          <p>No matching users found.</p>
        ) : (
          resultList.map((person) => (
            <p
              className="clickable"
              key={person._id}
              onClick={() => handleVisit(person._id)}
            >
              {person?.name}
            </p>
          ))
        )}
      </div>
    </div>
  );
}
