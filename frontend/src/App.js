import { useSelector, useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";

import useSocket from "./hooks/useSocket.js";
import { BrowserRouter as Router } from "react-router-dom";

import AppContent from "./app/appContent.js";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const token = user?.token;
  const socketInstance = useSocket(token);

  return (
    <Router>
      <AppContent
        token={token}
        dispatch={dispatch}
        user={user}
        socketInstance={socketInstance}
      />
      <ToastContainer />
    </Router>
  );
}

export default App;
