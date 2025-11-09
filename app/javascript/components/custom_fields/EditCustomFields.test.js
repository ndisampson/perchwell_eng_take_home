import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditCustomFields from "./EditCustomFields";

const mockShowError = jest.fn();
const mockShowSuccess = jest.fn();
const mockOnSuccess = jest.fn();
const mockOnClose = jest.fn();

jest.mock("../../context/AlertContext", () => ({
  useAlert: () => ({
    showError: mockShowError,
    showSuccess: mockShowSuccess
  })
}));

jest.mock("../../context/UserContext", () => ({
  useUser: () => ({
    clientId: "10",
    isExternalUser: false
  })
}));

jest.mock("../../utils/api", () => ({
  apiRequest: jest.fn()
}));

import { apiRequest } from "../../utils/api";

describe("EditCustomFields", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a new custom field", async () => {
    const user = userEvent.setup();
    apiRequest.mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    });

    render(
      <EditCustomFields
        open
        onClose={mockOnClose}
        editingField={null}
        selectedClient={{ id: "10" }}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = await screen.findByRole("textbox", { name: /^Name/i });
    const displayNameInput = screen.getByRole("textbox", { name: /Display Name/i });

    await user.type(nameInput, "nickname");
    await user.type(displayNameInput, "Nickname");

    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        "/api/clients/10/custom_fields",
        expect.objectContaining({ method: "POST" }),
        "10"
      );
    });

    expect(mockShowSuccess).toHaveBeenCalledWith("Custom field created successfully!");
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it("validates enum values when data type is enum", async () => {
    const user = userEvent.setup();
    render(
      <EditCustomFields
        open
        onClose={mockOnClose}
        editingField={null}
        selectedClient={{ id: "10" }}
        onSuccess={mockOnSuccess}
      />
    );

    const dataTypeSelect = await screen.findByRole("combobox");
    await user.click(dataTypeSelect);
    await user.click(screen.getByRole("option", { name: "Enum" }));

    const nameInput = screen.getByRole("textbox", { name: /^Name/i });
    const displayNameInput = screen.getByRole("textbox", { name: /Display Name/i });

    await user.type(nameInput, "status");
    await user.type(displayNameInput, "Status");

    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(mockShowError).toHaveBeenCalledWith("Please fix the errors in the form");
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it("pre-fills form fields when editing", async () => {
    render(
      <EditCustomFields
        open
        onClose={mockOnClose}
        editingField={{
          id: "5",
          name: "nickname",
          display_name: "Nickname",
          data_type: "freeform",
          client_id: "10"
        }}
        selectedClient={{ id: "10" }}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = await screen.findByDisplayValue("nickname");
    const displayNameInput = screen.getByDisplayValue("Nickname");
    const dataTypeSelect = screen.getByRole("combobox");

    expect(nameInput).toBeInTheDocument();
    expect(displayNameInput).toBeInTheDocument();
    expect(dataTypeSelect).toHaveTextContent(/Freeform/i);
  });
});


