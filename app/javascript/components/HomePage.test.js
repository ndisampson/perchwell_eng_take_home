import React from "react";
import { render, screen } from "@testing-library/react";
import HomePage from "./HomePage";

jest.mock("./auth/Login", () => () => <div data-testid="login-component">Login Component</div>);

describe("HomePage", () => {
  it("renders the Login component", () => {
    render(<HomePage />);
    expect(screen.getByTestId("login-component")).toBeInTheDocument();
  });
});


