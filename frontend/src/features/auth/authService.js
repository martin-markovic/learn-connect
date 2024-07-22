import axios from "axios";
import { auth } from "../../app/firebaseConfig.js";
import { signInWithCustomToken, signOut } from "firebase/auth";

const API_URL = "http://127.0.0.1:8000/api/users";

const registerUser = async (userData) => {
  try {
    const { email, password } = userData;

    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    const response = await axios.post(API_URL, userData);
    const { firebaseToken } = response.data;

    if (!firebaseToken) {
      throw new Error("Firebase token not found");
    }

    const userCredential = await signInWithCustomToken(auth, firebaseToken);
    const user = userCredential.user;

    if (!userCredential.user) {
      throw new Error("Failed to sign in anonymously");
    }

    if (response.data) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    console.log("Error during registration:", error.message);
    throw error;
  }
};

const loginUser = async (userData) => {
  try {
    const response = await axios.post(API_URL + "/login", userData);

    const { firebaseToken } = response.data;

    if (!firebaseToken) {
      throw new Error("Firebase token not found");
    }

    const userCredential = await signInWithCustomToken(auth, firebaseToken);

    const user = userCredential.user;

    if (response.data) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const logoutUser = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem("user");
  } catch (error) {
    console.error(error);
  }
};

const authService = {
  registerUser,
  loginUser,
  logoutUser,
};

export default authService;
