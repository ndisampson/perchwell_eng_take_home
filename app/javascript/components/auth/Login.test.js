import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "./Login";

const mockNavigate = jest.fn();
const mockLogin = jest.fn();
const mockLogout = jest.fn();
let mockUserState = null;
let consoleSpy;

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate
}));

jest.mock("../../context/UserContext", () => ({
  useUser: () => ({
    login: mockLogin,
    logout: mockLogout,
    user: mockUserState,
    isAdmin: false,
    isClient: false,
    isExternalUser: false
  })
}));

jest.mock("../../utils/api", () => ({
  getApiData: jest.fn()
}));

import { getApiData } from "../../utils/api";

describe("Login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserState = null;
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("loads clients and allows logging in", async () => {
    const user = userEvent.setup();
    getApiData.mockResolvedValueOnce({
      data: {
        clients: [{ id: "1", name: "Acme" }]
      }
    });

    render(<Login />);

    expect(getApiData).toHaveBeenCalledWith("/api/clients", {});

    const select = await screen.findByRole("combobox");
    await user.click(select);
    await user.click(await screen.findByRole("option", { name: "Acme" }));

    const button = screen.getByRole("button", { name: /log in/i });
    expect(button).toBeEnabled();

    await user.click(button);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledTimes(1);
    });
    expect(mockNavigate).toHaveBeenCalledWith("/buildings");
  });

  it("logs out when a user session exists", async () => {
    const user = userEvent.setup();
    mockUserState = { type: "admin", displayName: "Admin" };
    getApiData.mockResolvedValueOnce({ data: { clients: [] } });

    render(<Login />);

    const button = await screen.findByRole("button", { name: /log out/i });
    await user.click(button);

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("disables login button until a selection is made", async () => {
    getApiData.mockResolvedValueOnce({ data: { clients: [] } });

    render(<Login />);

    const button = await screen.findByRole("button", { name: /log in/i });
    expect(button).toBeDisabled();
  });
});


