function ExamScores(examData) {
  const { userId, examScores = [] } = examData;

  return (
    <>
      <div className="user__profile-bottom__box-content">
        <h2>Classroom Space</h2>
      </div>
      <div className="user__profile-bottom__box-content">
        <h4>Recent Quiz Scores</h4>
        <ul className="user__profile-list">
          {examScores[userId]?.length ? (
            examScores[userId]?.map((entry) => {
              return (
                <li
                  className="user__profile-list__entry list__item-quiz"
                  key={entry?.quiz?.quizId}
                >
                  <p className="quiz__entry-title">{entry?.quiz?.quizTitle}</p>
                  <div className="quiz__entry-scores">
                    <div className="quiz__entry-scores-item">
                      <div>Last score:</div>
                      <div>{entry?.latestScore}</div>
                    </div>
                    <div className="quiz__entry-scores-item">
                      <div>High score:</div>
                      <div>{entry?.highScore}</div>
                    </div>
                  </div>
                </li>
              );
            })
          ) : (
            <p>User has no quiz records</p>
          )}
        </ul>
      </div>
    </>
  );
}

export default ExamScores;
