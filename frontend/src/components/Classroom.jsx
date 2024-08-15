import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getClassrooms, joinClassroom } from "../features/chat/chatSlice.js";
import { toast } from "react-toastify";

function Classroom() {
  const [selectedClassroom, setSelectedClassroom] = useState("");

  const dispatch = useDispatch();

  const {
    classrooms = [],
    isLoading,
    isError,
    errorMessage,
  } = useSelector((state) => state.chat);

  useEffect(() => {
    if (classrooms.length === 0) {
      dispatch(getClassrooms());
    }
  }, [dispatch, classrooms.length]);

  useEffect(() => {
    if (isError && errorMessage) {
      console.log("Error in Classroom component: ", errorMessage);
    }
  }, [isError, errorMessage]);

  const handleChange = (e) => {
    setSelectedClassroom(e.target.value);
  };

  const handleJoinClassroom = () => {
    if (selectedClassroom) {
      dispatch(joinClassroom(selectedClassroom))
        .unwrap()
        .then(() => {
          toast.success("Successfully joined the classroom!");
          dispatch(getClassrooms());
          setSelectedClassroom("");
        })
        .catch((error) => {
          console.error(`Classroom Error: ${error.message}`);
          toast.error("Failed to join classroom.");
        });
    } else {
      toast.error("Please select a classroom to join");
    }
  };

  return (
    <div>
      <div>
        {isLoading ? (
          <p>Loading classrooms...</p>
        ) : classrooms.length === 0 ? (
          <p>No classrooms available.</p>
        ) : (
          <div>
            <label htmlFor="classroom-select">Select a Classroom:</label>
            <select
              id="classroom-select"
              value={selectedClassroom}
              onChange={handleChange}
            >
              <option value="" disabled></option>
              {classrooms.map((classroom) => (
                <option key={classroom.name} value={classroom.name}>
                  {classroom.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <button type="button" onClick={handleJoinClassroom}>
        Enroll
      </button>
    </div>
  );
}

export default Classroom;
