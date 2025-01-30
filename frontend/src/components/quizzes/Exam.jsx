import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getExam,
  updateExam,
  finishExam,
  resetExam,
} from "../../features/quizzes/exam/examSlice.js";
import socketEventManager from "../../features/socket/socket.eventManager.js";

function Exam() {
  const [currQuestion, setCurrQuestion] = useState(0);
  const { isLoading, examData } = useSelector((state) => state.exam);
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getExam());

    return () => {
      dispatch(resetExam());
    };
  }, [dispatch]);


  useEffect(() => {
    if (!examData) {
      dispatch(getExam());
  useEffect(() => {
    socketEventManager.subscribe("exam updated", (data) => {
      dispatch(updateExam(data));
    });

    socketEventManager.subscribe("exam finished", (data) => {
      dispatch(finishExam(data));

      navigate(`/quizzes/${data?.scorePayload?.quiz}`);
    });

    return () => {
      socketEventManager.unsubscribe("exam updated");
      socketEventManager.unsubscribe("exam finished");
    };
  }, [dispatch, navigate]);

  const handleChange = (e) => {
    try {
      const userData = {
        senderId: user?._id,
        receiverId: examData?._id,
        examData: {
          choiceIndex: currQuestion,
          choiceData: e.target.id,
        },
      };

      socketEventManager.handleEmitEvent("update exam", userData);
    } catch (error) {
      console.error("Error selecting option: ", error.message);
    }
  };

  const handleSubmit = () => {
    try {
      socketEventManager.handleEmitEvent("finish exam", {
        senderId: user?._id,
      });
    } catch (error) {
      console.error("Error finishing exam: ", error.message);
    }
  };


  return <div>{examData ? <p>ExamData</p> : <p>No exam</p>}</div>;
}

export default Exam;
