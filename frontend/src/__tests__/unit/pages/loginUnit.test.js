import { render, fireEvent, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Login from "../../../pages/Login.jsx";

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const { toast: mockToast } = require("react-toastify");

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (
        state = { user: null, isLoading: false, ...initialState },
        action
      ) => {
        return state;
      },
    },
  });
};

const renderWithStore = (component, initialState) => {
  const store = createMockStore(initialState);
  return render(<Provider store={store}>{component}</Provider>);
};

describe("Login Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render login form with email and password fields", () => {
    renderWithStore(<Login />);

    expect(screen.getByPlaceholderText(/your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your password/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/login/i)).toBeInTheDocument();
  });

  it("should show error toast when submitting empty form", async () => {
    renderWithStore(<Login />);

    const submitBtn = screen.getByDisplayValue(/login/i);
    fireEvent.click(submitBtn);

    expect(mockToast.error).toHaveBeenCalledWith("Please provide both fields");
  });

  it("should show error toast when submitting unauthorized request", async () => {
    renderWithStore(<Login />, {
      isError: true,
      errorMessage: "User not registered",
    });

    expect(mockToast.error).toHaveBeenCalledWith("User not registered");
  });

  it("should show error toast when submitting invalid password", async () => {
    renderWithStore(<Login />, {
      isError: true,
      errorMessage: "Invalid password",
    });

    expect(mockToast.error).toHaveBeenCalledWith("Invalid password");
  });

  it("should show error toast when email is missing in submitted form", async () => {
    renderWithStore(<Login />);

    const passwordInput = screen.getByPlaceholderText(/your password/i);
    const submitBtn = screen.getByDisplayValue(/login/i);

    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitBtn);

    expect(mockToast.error).toHaveBeenCalledWith("Please provide both fields");
  });

  it("should show error toast when password is missing in submitted form", async () => {
    renderWithStore(<Login />);

    const emailInput = screen.getByPlaceholderText(/your email/i);
    const submitBtn = screen.getByDisplayValue(/login/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(submitBtn);

    expect(mockToast.error).toHaveBeenCalledWith("Please provide both fields");
  });

  it("should update input values when user types", () => {
    renderWithStore(<Login />);

    const emailInput = screen.getByPlaceholderText(/your email/i);
    const passwordInput = screen.getByPlaceholderText(/your password/i);

    const mockEmail = "exampleEmail@gmail.com";
    const mockPassword = "password123";

    fireEvent.change(emailInput, { target: { value: mockEmail } });
    fireEvent.change(passwordInput, { target: { value: mockPassword } });

    expect(emailInput.value).toBe(mockEmail);
    expect(passwordInput.value).toBe(mockPassword);
  });

  it("should disable submit button when loading", () => {
    renderWithStore(<Login />, { isLoading: true });

    const submitBtn = screen.getByDisplayValue(/login/i);
    expect(submitBtn).toBeDisabled();
  });
});
