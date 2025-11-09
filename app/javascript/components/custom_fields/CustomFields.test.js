import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CustomFields from "./CustomFields";

const mockShowError = jest.fn();
const mockShowSuccess = jest.fn();

jest.mock("../shared/PageToolbar", () => (props) => (
  <div>
    <span data-testid="toolbar-title">{props.title}</span>
    {props.actionLabel && (
      <button type="button" onClick={props.onActionClick} disabled={props.disabled}>
        {props.actionLabel}
      </button>
    )}
  </div>
));

jest.mock("./EditCustomFields", () => (props) =>
  props.open ? <div data-testid="edit-custom-field-dialog" /> : null
);

jest.mock("../../context/AlertContext", () => ({
  useAlert: () => ({
    showError: mockShowError,
    showSuccess: mockShowSuccess
  })
}));

const userContextMock = {
  userId: "10",
  isAdmin: true,
  isClient: false,
  isExternalUser: false
};

jest.mock("../../context/UserContext", () => ({
  useUser: () => userContextMock
}));

jest.mock("../../utils/api", () => ({
  getApiData: jest.fn(),
  apiRequest: jest.fn()
}));

import { getApiData, apiRequest } from "../../utils/api";

const originalConfirm = window.confirm;

describe("CustomFields", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    userContextMock.isAdmin = true;
    userContextMock.isClient = false;
    userContextMock.isExternalUser = false;
    window.confirm = originalConfirm;
  });

  it("renders client list and custom fields table", async () => {
    getApiData
      .mockResolvedValueOnce({
        data: {
          clients: [
            {
              id: "10",
              name: "Acme",
              custom_fields: [
                { id: "1", name: "nickname", display_name: "Nickname", data_type: "freeform" }
              ]
            }
          ]
        }
      })
      .mockResolvedValueOnce({
        data: {
          custom_fields: [
            { id: "1", name: "nickname", display_name: "Nickname", data_type: "freeform" }
          ]
        }
      });

    render(<CustomFields />);

    await waitFor(() => {
      expect(screen.getByText("Custom Fields")).toBeInTheDocument();
    });

    expect(getApiData).toHaveBeenCalledWith("/api/clients", {}, "10");
    expect(screen.getByText("Nickname")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New Custom Field" })).toBeEnabled();
  });

  it("deletes a custom field after confirmation", async () => {
    window.confirm = jest.fn().mockReturnValue(true);
    getApiData
      .mockResolvedValueOnce({
        data: {
          clients: [
            {
              id: "10",
              name: "Acme",
              custom_fields: [
                { id: "1", name: "nickname", display_name: "Nickname", data_type: "freeform" }
              ]
            }
          ]
        }
      })
      .mockResolvedValueOnce({
        data: {
          custom_fields: [
            { id: "1", name: "nickname", display_name: "Nickname", data_type: "freeform" }
          ]
        }
      })
      .mockResolvedValueOnce({
        data: {
          custom_fields: []
        }
      });

    apiRequest.mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    });

    render(<CustomFields />);

    const deleteButton = await screen.findByRole("button", { name: "Delete" });
    await userEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        "/api/custom_fields/1",
        expect.objectContaining({ method: "DELETE" }),
        "10"
      );
    });
    expect(mockShowSuccess).toHaveBeenCalled();
  });

  it("shows error when failing to fetch clients", async () => {
    getApiData.mockRejectedValueOnce(new Error("boom"));

    render(<CustomFields />);

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith("Failed to load clients: boom");
    });
  });
});


