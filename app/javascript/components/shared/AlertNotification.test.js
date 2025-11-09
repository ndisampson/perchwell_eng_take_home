import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AlertNotification from "./AlertNotification";

const mockClearError = jest.fn();
const mockClearSuccess = jest.fn();
const alertState = {
  error: "",
  success: ""
};

jest.mock("../../context/AlertContext", () => ({
  useAlert: () => ({
    error: alertState.error,
    success: alertState.success,
    clearError: mockClearError,
    clearSuccess: mockClearSuccess
  })
}));

describe("AlertNotification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    alertState.error = "";
    alertState.success = "";
  });

  it("renders error alert and clears on close", () => {
    alertState.error = "Something went wrong";

    render(<AlertNotification />);

    const alert = screen.getByText("Something went wrong");
    expect(alert).toBeInTheDocument();

    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockClearError).toHaveBeenCalledTimes(1);
  });

  it("renders success alert and clears on close", () => {
    alertState.success = "Saved!";

    render(<AlertNotification />);

    expect(screen.getByText("Saved!")).toBeInTheDocument();

    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockClearSuccess).toHaveBeenCalledTimes(1);
  });
});


