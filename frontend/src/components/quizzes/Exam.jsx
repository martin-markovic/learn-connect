import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { getExam, updateExam } from "../../features/quizzes/exam/examSlice.js";

function Exam() {
  const { examData, setExamData } = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!examData) {
      dispatch(getExam());
    }
  }, [examData, dispatch]);


  return <div>{examData ? <p>ExamData</p> : <p>No exam</p>}</div>;
}

export default Exam;
