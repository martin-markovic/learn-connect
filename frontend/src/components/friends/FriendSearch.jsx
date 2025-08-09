import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getUserList, resetUserList } from "../../features/friend/friendSlice";

export default function FriendSearch() {
  const [input, setInput] = useState("");
  const [resultList, setResultList] = useState([]);

  const { isLoading: userStateLoading, userList } = useSelector(
    (state) => state.friends
  );
  const {
    isLoading: quizStateLoading,
    userQuizzes,
    classQuizzes,
  } = useSelector((state) => state.quizzes);
  const user = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getUserList(user?._id));
    dispatch(getUserQuizzes());
    dispatch(getClassQuizzes());

    return () => {
      dispatch(resetUserList());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    e.preventDefault();

    const query = e.target.value;
    setInput(query);

    if (query.trim().length < 2) {
      setResultList([]);
      return;
    }

    const results = userList.filter((user) =>
      user.name.toLowerCase().startsWith(query.trim().toLowerCase())
    );

    setResultList(results);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleVisit = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div>
      <div>
        <input
          type="search"
          id="search__users"
          name="search__users"
          value={input}
          onChange={handleChange}
          placeholder="Search users"
        />
        <button type="button" onClick={handleSubmit}>
          Search
        </button>
      </div>
      <div className="result-list">
        {input.length >= 2 && resultList.length === 0 ? (
          <p>No matching users found.</p>
        ) : (
          resultList.map((person) => (
            <p key={person._id} onClick={() => handleVisit(person._id)}>
              {person?.name}
            </p>
          ))
        )}
      </div>
    </div>
  );
}
