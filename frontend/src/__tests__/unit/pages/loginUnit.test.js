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

    const submitBtn = screen.getByRole("button", { name: /login/i });
    fireEvent.click(submitBtn);

    expect(mockToast.error).toHaveBeenCalledWith("Please provide both fields");
  });
});
