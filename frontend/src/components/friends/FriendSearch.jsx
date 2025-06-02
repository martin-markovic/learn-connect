import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getUserList, resetUserList } from "../../features/friend/friendSlice";
import { FaSearch } from "react-icons/fa";

export default function FriendSearch() {
  const [input, setInput] = useState("");
  const [resultList, setResultList] = useState([]);

  const { userList } = useSelector((state) => state.friends);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getUserList());

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
