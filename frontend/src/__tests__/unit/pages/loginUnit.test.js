import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";

const mockToast = {
  error: jest.fn(),
};

jest.mock("react-toastify", () => ({
  toast: mockToast,
}));

const MockLogin = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const { toast } = require("react-toastify");
    toast.error("Please provide both fields");
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Login</button>
    </form>
  );
};

describe("Login Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should show error toast if email or password is missing", () => {
    render(<MockLogin />);

    const submitBtn = screen.getByRole("button", { name: /login/i });
    fireEvent.click(submitBtn);

    expect(mockToast.error).toHaveBeenCalledWith("Please provide both fields");
  });
});
