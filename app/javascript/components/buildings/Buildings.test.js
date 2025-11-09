import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Buildings from "./Buildings";

jest.mock("../../context/AlertContext", () => ({
  useAlert: () => ({
    showSuccess: jest.fn()
  })
}));

jest.mock("../../context/UserContext", () => ({
  useUser: () => ({
    isClient: true,
    userId: "123"
  })
}));

jest.mock("../../utils/api", () => ({
  getApiData: jest.fn()
}));

import { getApiData } from "../../utils/api";

function renderBuildings(initialEntry = "/buildings") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Buildings />
    </MemoryRouter>
  );
}

describe("Buildings", () => {
  const successfulResponse = {
    buildings: [
      {
        id: "1",
        client_name: "Client One",
        address: "123 Main St",
        city: "New York",
        state: "NY",
        zip: "10001",
        custom_field_vals: {
          nickname: "HQ"
        },
        client: {
          custom_field_defs: [
            { name: "nickname", display_name: "Nickname" }
          ]
        }
      }
    ],
    pagination: {
      total_pages: 1
    }
  };

  beforeEach(() => {
    getApiData.mockReset();
  });

  it("matches snapshot after buildings load", async () => {
    getApiData.mockResolvedValueOnce(successfulResponse);

    const { asFragment } = renderBuildings();

    await waitFor(() => {
      expect(screen.getByText("Client One")).toBeInTheDocument();
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it("matches snapshot when an error occurs", async () => {
    getApiData.mockRejectedValueOnce(new Error("Network error"));

    const { asFragment } = renderBuildings();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Network error");
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it("renders buildings after loading completes", async () => {
    getApiData.mockResolvedValueOnce(successfulResponse);

    renderBuildings();

    expect(screen.getByText("Buildings")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Client One")).toBeInTheDocument();
    });

    expect(screen.getByText("Nickname")).toBeInTheDocument();
    expect(screen.getByText("HQ")).toBeInTheDocument();
    expect(getApiData).toHaveBeenCalledWith(
      "/api/buildings?page=1&per_page=10",
      {},
      "123"
    );
  });

  it("shows an error message when loading buildings fails", async () => {
    getApiData.mockRejectedValueOnce(new Error("Network error"));

    renderBuildings();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Network error");
    });
  });

  it("requests the next page when Next is clicked", async () => {
    getApiData
      .mockResolvedValueOnce({
        buildings: [
          {
            id: "1",
            client_name: "Client One",
            address: "123 Main St",
            city: "New York",
            state: "NY",
            zip: "10001",
            custom_field_vals: {},
            client: { custom_field_defs: [] }
          }
        ],
        pagination: { total_pages: 2 }
      })
      .mockResolvedValueOnce({
        buildings: [
          {
            id: "2",
            client_name: "Client Two",
            address: "456 Side St",
            city: "Boston",
            state: "MA",
            zip: "02108",
            custom_field_vals: {},
            client: { custom_field_defs: [] }
          }
        ],
        pagination: { total_pages: 2 }
      });

    const user = userEvent.setup();
    renderBuildings();

    await waitFor(() => {
      expect(screen.getByText("Client One")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() => {
      expect(getApiData).toHaveBeenCalledTimes(2);
    });

    expect(getApiData).toHaveBeenNthCalledWith(
      2,
      "/api/buildings?page=2&per_page=10",
      {},
      "123"
    );

    await waitFor(() => {
      expect(screen.getByText("Client Two")).toBeInTheDocument();
    });
  });
});


