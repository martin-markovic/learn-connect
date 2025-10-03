import { render, fireEvent, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Register from "../../../pages/Register.jsx";
import { registerUser } from "../../../features/auth/authSlice.js";

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const { toast: mockToast } = require("react-toastify");

const mockUser = {
  name: "John Doe",
  email: "johndoe@gmail.com",
  password: "password123",
  validPassword2: "password123",
  invalidPassword2: "password12",
};

jest.mock("../../../features/auth/authSlice", () => ({
  registerUser: jest.fn((credentials) => ({
    type: "auth/registerUser",
    payload: credentials,
  })),
}));

const initialState = { isLoading: false, isError: false, user: null };

const createMockStore = (initState = initialState) => {
  return configureStore({
    reducer: {
      auth: (state = initState, action) => {
        return state;
      },
    },
  });
};

const renderWithStore = (component, initialState) => {
  const store = createMockStore(initialState);

  return render(<Provider store={store}>{component}</Provider>);
};

describe("Register Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render register form with fields", () => {
    renderWithStore(<Register />);

    expect(screen.getByPlaceholderText(/your name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your password/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/confirm password/i)
    ).toBeInTheDocument();
  });

  it("should successfully register user", () => {
    renderWithStore(<Register />);

    const nameInput = screen.getByPlaceholderText(/your name/i);
    const emailInput = screen.getByPlaceholderText(/your email/i);
    const passwordInput = screen.getByPlaceholderText(/your password/i);
    const confirmPasswordInput =
      screen.getByPlaceholderText(/confirm password/i);
    const submitBtn = screen.getByDisplayValue(/register/i);

    const { name, email, password, validPassword2 } = mockUser;

    fireEvent.change(nameInput, { target: { value: name } });
    fireEvent.change(emailInput, { target: { value: email } });
    fireEvent.change(passwordInput, { target: { value: password } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: validPassword2 },
    });
    fireEvent.click(submitBtn);

    expect(registerUser).toHaveBeenCalledWith({
      name,
      email,
      password,
      password2: validPassword2,
    });
  });

  it("should update input values when user types", () => {
    renderWithStore(<Register />);

    const nameInput = screen.getByPlaceholderText(/your name/i);
    fireEvent.change(nameInput, { target: { value: "John" } });
    expect(nameInput.value).toBe("John");
  });
