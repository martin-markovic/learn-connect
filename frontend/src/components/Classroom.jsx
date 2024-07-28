import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

function Classroom() {
  const [roomList, setRoomList] = useState([]);

  const { classrooms = [] } = useSelector((state) => state.auth.user);

  useEffect(() => {
    setRoomList(classrooms);
  }, []);

  return (
    <div>
      <div>
        <label htmlFor="classroom-select">Select Classroom:</label>
        <select id="classroom-select">
          <option value="">Select a classroom</option>
          {roomList.map((classroom) => (
            <option key={classroom._id} value={classroom._id}>
              {classroom.name}
            </option>
          ))}
        </select>
      </div>
      <button type="button">Enroll</button>
    </div>
  );
}

export default Classroom;
