const handleError = (error) => {
  if (error.response) {
    console.error("Server Error:", error.response.data);
  } else if (error.request) {
    console.error("No response received:", error.request);
  } else {
    console.error("Error setting up request:", error.message);
  }
};

export default handleError;
