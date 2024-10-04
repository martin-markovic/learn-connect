import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getAllClassrooms,
  joinClassroom,
  leaveClassroom,
} from "../../features/classroom/classroomSlice.js";
import { useSocketContext } from "../../features/socket/socketContext.js";
import { toast } from "react-toastify";

function Classroom() {
  const [selectedClassroom, setSelectedClassroom] = useState("");

  const dispatch = useDispatch();

  const {
    allClassrooms = [],
    isLoading,
    isError,
    errorMessage,
  } = useSelector((state) => state.classroom);

  useEffect(() => {
    if (allClassrooms.length === 0) {
      dispatch(getAllClassrooms());
    }
  }, [dispatch, allClassrooms.length]);

  useEffect(() => {
    if (isError && errorMessage) {
      console.error("Error :", errorMessage);
    }
  }, [isError, errorMessage]);

  const handleChange = (e) => {
    setSelectedClassroom(e.target.value);
  };

  const handleJoinClassroom = async () => {
    try {
      if (selectedClassroom) {
        const result = await dispatch(joinClassroom(selectedClassroom));

        if (result.error) {
          console.error("Error:", result.error.message);
        } else {
          toast.success("Successfully joined classroom:", result.payload);
          dispatch(getAllClassrooms());
          setSelectedClassroom("");
        }
      } else {
        toast.error("Please select a classroom");
      }
    } catch (error) {
      console.error("handleJoinClassroom Error: ", error.message);
      toast.error("Failed to join classroom.");
    }
  };

  const handleLeaveClassroom = async () => {
    try {
      if (selectedClassroom) {
        const result = await dispatch(leaveClassroom(selectedClassroom));

        if (result.error) {
          console.error("Error:", result.error.message);
        } else {
          toast.success(`Successfully left the classroom: ${result.payload}`);

          await dispatch(getAllClassrooms());
        }
      } else {
        toast.error("Please select a classroom");
      }
    } catch (error) {
      console.error("leaveClassroom Error: ", error.message);
      toast.error("Failed to leave the classroom.");
    }
  };

  return (
    <div>
      <div>
        {isLoading ? (
          <p>Loading classrooms...</p>
        ) : allClassrooms.length === 0 ? (
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
              {allClassrooms.map((classroom) => (
                <option
                  key={`classroom-${classroom._id}`}
                  value={classroom._id}
                >
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
