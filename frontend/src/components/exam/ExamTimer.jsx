import { useState, useEffect } from "react";

function ExamTimer({ examFinish }) {
  const [examTimer, setExamTimer] = useState(0);

  useEffect(() => {
    if (!examFinish) return;

    const examFinishTime = new Date(examFinish).getTime();
    const timeLeft = examFinishTime - Date.now();

    if (timeLeft > 0) {
      setExamTimer(Math.floor(timeLeft / 1000));
    } else {
      setExamTimer(0);
    }
  }, [examFinish]);

  useEffect(() => {
    if (examTimer <= 0) return;

    const interval = setInterval(() => {
      setExamTimer((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [examTimer]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")} : ${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <div className="exam__timer-container">
      <p>
        <span
          style={{ fontWeight: "bold", fontSize: "large", marginRight: "1em" }}
        >
          Time Left:
        </span>
        {formatTime(examTimer)}
      </p>
    </div>
  );
}

export default ExamTimer;
