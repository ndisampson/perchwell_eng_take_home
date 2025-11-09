import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import PageToolbar from "./PageToolbar";

describe("PageToolbar", () => {
  it("renders title and link action", () => {
    render(
      <MemoryRouter>
        <PageToolbar title="Buildings" actionLabel="New" actionUrl="/buildings/new" />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Buildings" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "New" })).toHaveAttribute("href", "/buildings/new");
  });

  it("invokes callback when action button without url is clicked", async () => {
    const user = userEvent.setup();
    const onActionClick = jest.fn();

    render(
      <MemoryRouter>
        <PageToolbar title="Custom Fields" actionLabel="Create" actionUrl={null} onActionClick={onActionClick} />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Create" }));
    expect(onActionClick).toHaveBeenCalledTimes(1);
  });

  it("omits action area when no label provided", () => {
    render(
      <MemoryRouter>
        <PageToolbar title="No Action" />
      </MemoryRouter>
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "No Action" })).toBeInTheDocument();
  });
});


