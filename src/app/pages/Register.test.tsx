import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Register } from "./Register";

vi.mock("wouter", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

import { apiClient } from "@/lib/apiClient";

describe("Register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders email and password fields", () => {
    render(<Register />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("displays error when registration fails", async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce({
      response: { data: { error: "Invalid email" } },
    });

    render(<Register />);

    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    await userEvent.click(
      screen.getByRole("button", { name: /Create Account/i })
    );

    await waitFor(() => {
      expect(screen.getByText("Invalid email")).toBeInTheDocument();
    });
  });

  it("shows registration successful message when response is successful", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      status: 201,
      data: { message: "Check your email" },
    });

    render(<Register />);

    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    await userEvent.click(
      screen.getByRole("button", { name: /Create Account/i })
    );

    await waitFor(() => {
      expect(screen.getByText("Registration Successful")).toBeInTheDocument();
    });
  });
});
