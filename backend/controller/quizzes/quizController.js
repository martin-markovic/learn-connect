// POST /api/quizzes
export const createQuiz = async (req, res) => {
  try {
    return res.status(201).json({
      message: "POST /api/quizzes/",
    });
  } catch (error) {
    return res.status(500).json({
      message: `${error.message}`,
    });
  }
};

// GET /api/quizzes/
export const getAllQuizzes = async (req, res) => {
  try {
    return res.status(200).json({
      message: "GET /api/quizzes/",
    });
  } catch (error) {
    return res.status(500).json({
      message: `${error.message}`,
    });
  }
};
// GET /api/quizzes/:id
export const getQuiz = async (req, res) => {
  try {
    return res.status(200).json({
      message: `GET /api/quizzes/${req.params.id}`,
    });
  } catch (error) {
    return res.status(500).json({
      message: `${error.message}`,
    });
  }
};

// PUT /api/quizzes/:id
export const updateQuiz = async (req, res) => {
  try {
    return res.status(200).json({
      message: `PUT /api/quizzes/${req.params.id}`,
    });
  } catch (error) {
    return res.status(500).json({
      message: `${error.message}`,
    });
  }
};

// DELETE /api/quizzes/:id
export const deleteQuiz = async (req, res) => {
  try {
    return res.status(200).json({
      message: `DELETE /api/quizzes/${req.params.id}`,
    });
  } catch (error) {
    return res.status(500).json({
      message: `${error.message}`,
    });
  }
};
