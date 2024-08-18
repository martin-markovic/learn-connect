import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getClassrooms,
  joinClassroom,
  leaveClassroom,
} from "../features/classroom/classroomSlice.js";
import { toast } from "react-toastify";

function Classroom() {
  const [selectedClassroom, setSelectedClassroom] = useState("");

  const dispatch = useDispatch();

  const {
    classrooms = [],
    isLoading,
    isError,
    errorMessage,
  } = useSelector((state) => state.classroom);

  useEffect(() => {
    if (classrooms.length === 0) {
      dispatch(getClassrooms());
    }
  }, [dispatch, classrooms.length]);

  useEffect(() => {
    if (isError && errorMessage) {
      console.error("Error :", errorMessage);
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
          console.error("handleJoinClassroom Error: ", error.message);
          toast.error("Failed to join classroom.");
        });
    } else {
      toast.error("Please select a classroom to join");
    }
  };

  const handleLeaveClassroom = () => {
    if (selectedClassroom) {
      dispatch(leaveClassroom(selectedClassroom))
        .unwrap()
        .then(() => {
          toast.success("Successfully left the classroom!");
          dispatch(getClassrooms());
          setSelectedClassroom("");
        })
        .catch((error) => {
          console.error("leaveClassroom Error: ", error.message);
          toast.error("Failed to leave the classroom.");
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
            <p>Select a Classroom:</p>
            <select
              id="classroom-select"
              value={selectedClassroom}
              onChange={handleChange}
            >
              <option value="" disabled></option>
              {classrooms.map((classroom) => (
                <option key={classroom._id} value={classroom._id}>
                  {classroom.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div>
        <button type="button" onClick={handleJoinClassroom}>
          Enroll into classroom
        </button>
        <button type="button" onClick={handleLeaveClassroom}>
          Leave classroom
        </button>
      </div>
    </div>
  );
}

export default Classroom;
