import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getClassroomList,
  getUserClassroom,
  joinClassroom,
  leaveClassroom,
  resetClassroom,
} from "../../features/classroom/classroomSlice.js";
import { toast } from "react-toastify";

function Classroom() {
  const [selectedClassroom, setSelectedClassroom] = useState("");

  const dispatch = useDispatch();

  const {
    classroomList = [],
    userClassroom,
    isLoading,
  } = useSelector((state) => state.classroom);

  useEffect(() => {
    dispatch(getClassroomList());
    dispatch(getUserClassroom());

    return () => {
      dispatch(resetClassroom());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setSelectedClassroom(e.target.value);
  };

  const handleJoinClassroom = () => {
    if (!selectedClassroom) {
      toast.error("Failed to join classroom.");
      return;
    }

    dispatch(joinClassroom(selectedClassroom))
      .unwrap()
      .then((payload) => {
        toast.success("Successfully joined classroom");
        dispatch(getClassroomList());
        setSelectedClassroom("");
      })
      .catch((error) => {
        console.error("Join classroom failed:", error.message);
      });
  };

  const handleLeaveClassroom = () => {
    if (!selectedClassroom) {
      toast.error("Please select a classroom");
      return;
    }

    dispatch(leaveClassroom(selectedClassroom))
      .unwrap()
      .then((payload) => {
        toast.success("Successfully left the classroom");
        dispatch(getClassroomList());
        dispatch(getUserClassroom());
        setSelectedClassroom("");
      })
      .catch((error) => {
        console.error("leaveClassroom Error:", error.message);
      });
  };

  const handleCancel = () => {
    setSelectedClassroom("");
  };

  return (
    <div className="classroom-container">
      <div className="classroom__enroll-dropdown">
        {isLoading ? (
          <p>Loading classrooms...</p>
        ) : (
          <div className="classroom__details-container">
            <div className="classroom-user">
              <h4>
                {userClassroom
                  ? `Classroom: ${userClassroom?.name}`
                  : "User is not enrolled in classroom"}
              </h4>

              {userClassroom && (
                <button type="button" onClick={handleLeaveClassroom}>
                  Leave Classroom
                </button>
              )}
            </div>

            {classroomList.length === 0 ? (
              <p>No classrooms available.</p>
            ) : (
              <div className="classroom__enroll__dropdown-items">
                <select
                  id="classroom-select"
                  value={selectedClassroom}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Select a Classroom
                  </option>
                  {classroomList.map((classroom) => (
                    <option
                      key={`classroom-${classroom?._id}`}
                      value={classroom?._id}
                    >
                      {classroom?.name}
                    </option>
                  ))}
                </select>
                {selectedClassroom && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="classroom__select-cancel"
                  >
                    X
                  </button>
                )}

                <div className="classroom__enroll-details">
                  {selectedClassroom &&
                    selectedClassroom !== userClassroom?._id && (
                      <div className="classroom__info-container">
                        {classroomList.map((classroom) => {
                          const remainingSits =
                            classroom?.limit - classroom?.students?.length;

                          const classroomQuizAmount =
                            classroom?.quizzes?.length;

                          if (classroom._id === selectedClassroom) {
                            return (
                              <div key={classroom?._id}>
                                <span
                                  style={{
                                    marginLeft: "1em",
                                  }}
                                >
                                  Subject: {classroom?.subject}
                                </span>
                                <span
                                  style={{
                                    marginLeft: "3em",
                                  }}
                                >
                                  {remainingSits > 0
                                    ? `${remainingSits} seat${
                                        remainingSits > 1 && "s"
                                      } left`
                                    : "Classroom is full"}
                                </span>
                                <span
                                  style={{
                                    marginLeft: "3em",
                                  }}
                                >
                                  {classroomQuizAmount
                                    ? `${classroomQuizAmount} ${
                                        classroomQuizAmount > 1
                                          ? "quizzes"
                                          : "quiz"
                                      } total`
                                    : "No quizzes"}
                                </span>
                              </div>
                            );
                          }

                          return null;
                        })}

                        <span className="classroom__enroll-buttons">
                          <button type="button" onClick={handleJoinClassroom}>
                            Enroll
                          </button>
                        </span>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Classroom;
