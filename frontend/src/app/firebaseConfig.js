import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDlyc0oRPpBs5JQzlH_C1dpVoOrogHQ7I4",
  authDomain: "martin-portfolio-app.firebaseapp.com",
  projectId: "martin-portfolio-app",
  storageBucket: "martin-portfolio-app.appspot.com",
  messagingSenderId: "781194994635",
  appId: "1:781194994635:web:fc3018007738f3b5e50c4e",
  measurementId: "G-0BR6BZJCPF",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

export { auth };
