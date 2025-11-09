import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditBuilding from "./EditBuilding";

const mockNavigate = jest.fn();
const mockShowError = jest.fn();
const mockClearAll = jest.fn();
let mockParams = {};

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => mockParams
}));

jest.mock("../../context/AlertContext", () => ({
  useAlert: () => ({
    showError: mockShowError,
    clearAll: mockClearAll
  })
}));

jest.mock("../../context/UserContext", () => ({
  useUser: () => ({
    userId: "10",
    isExternalUser: false,
    isClient: false
  })
}));

jest.mock("../../utils/api", () => ({
  getApiData: jest.fn(),
  apiRequest: jest.fn()
}));

import { getApiData, apiRequest } from "../../utils/api";

describe("EditBuilding", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = {};
  });

  const buildResponses = ({
    address = "100 Main St",
    city = "New York",
    state = "NY",
    zip = "10001",
    customFieldVals = { nickname: "HQ" }
  } = {}) => {
    const buildingPayload = {
      id: "1",
      address,
      city,
      state,
      zip,
      custom_field_vals: customFieldVals,
      client: {
        id: "10",
        name: "Acme",
        custom_field_defs: [
          { name: "nickname", display_name: "Nickname", data_type: "freeform" }
        ]
      }
    };

    const clientPayload = {
      id: "10",
      name: "Acme",
      custom_fields: [
        { id: "1", name: "nickname", display_name: "Nickname", data_type: "freeform" }
      ]
    };

    getApiData.mockImplementation((url) => {
      if (url.startsWith("/api/buildings/")) {
        return Promise.resolve({ data: { building: buildingPayload } });
      }
      if (url.startsWith("/api/clients/")) {
        return Promise.resolve({ data: { client: clientPayload } });
      }
      return Promise.resolve({});
    });
  };

  it("loads existing building data and submits updates", async () => {
    mockParams = { id: "1" };
    buildResponses();

    apiRequest.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { building: { id: "1" } }
      })
    });

    render(<EditBuilding />);

    const addressInput = await screen.findByDisplayValue("100 Main St");
    fireEvent.change(addressInput, { target: { value: "200 Updated Ave" } });

    const nicknameInput = await screen.findByDisplayValue("HQ");
    fireEvent.change(nicknameInput, { target: { value: "HQ2" } });

    const submitButton = screen.getByRole("button", { name: /update/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        "/api/buildings/1",
        expect.objectContaining({
          method: "PUT"
        }),
        "10"
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith("/buildings", expect.objectContaining({ state: expect.any(Object) }));
  });

  it("surfaces API validation errors to the user", async () => {
    mockParams = { id: "1" };
    buildResponses();

    apiRequest.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        errors: ["Custom field must be numeric"]
      })
    });

    render(<EditBuilding />);

    const submitButton = await screen.findByRole("button", { name: /update/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith("Custom field must be numeric");
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("renders a loading indicator while fetching", () => {
    mockParams = { id: "1" };
    getApiData.mockReturnValue(new Promise(() => {}));

    render(<EditBuilding />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});


