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

const submitRegistration = async () => {
  await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
  await userEvent.type(screen.getByLabelText(/password/i), "password123");
  await userEvent.click(
    screen.getByRole("button", { name: /Create Account/i })
  );
};

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
    await submitRegistration();

    await waitFor(() => {
      expect(screen.getByText("Invalid email")).toBeInTheDocument();
    });
  });

  it("shows confirmation code screen after successful signup", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      status: 201,
      data: { message: "Check your email" },
    });

    render(<Register />);
    await submitRegistration();

    await waitFor(() => {
      expect(screen.getByText("Check your inbox")).toBeInTheDocument();
      expect(
        screen.getByText(/We sent a 6-digit code to/)
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/Confirmation Code/i)).toBeInTheDocument();
    });
  });

  it("submits confirmation code with correct payload", async () => {
    vi.mocked(apiClient.post)
      .mockResolvedValueOnce({ status: 201, data: {} })
      .mockResolvedValueOnce({ status: 200, data: {} });

    render(<Register />);
    await submitRegistration();

    await waitFor(() => {
      expect(screen.getByLabelText(/Confirmation Code/i)).toBeInTheDocument();
    });

    await userEvent.type(
      screen.getByLabelText(/Confirmation Code/i),
      "123456"
    );
    await userEvent.click(
      screen.getByRole("button", { name: /Confirm Account/i })
    );

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith("/auth/confirm", {
        Email: "test@example.com",
        Code: "123456",
      });
    });
  });

  it("shows success message after confirmation", async () => {
    vi.mocked(apiClient.post)
      .mockResolvedValueOnce({ status: 201, data: {} })
      .mockResolvedValueOnce({ status: 200, data: {} });

    render(<Register />);
    await submitRegistration();

    await waitFor(() => {
      expect(screen.getByLabelText(/Confirmation Code/i)).toBeInTheDocument();
    });

    await userEvent.type(
      screen.getByLabelText(/Confirmation Code/i),
      "123456"
    );
    await userEvent.click(
      screen.getByRole("button", { name: /Confirm Account/i })
    );

    await waitFor(() => {
      expect(screen.getByText("You're in.")).toBeInTheDocument();
      expect(screen.getByText("Start Session ⚡")).toBeInTheDocument();
    });
  });

  it("displays error when confirmation fails", async () => {
    vi.mocked(apiClient.post)
      .mockResolvedValueOnce({ status: 201, data: {} })
      .mockRejectedValueOnce({
        response: { data: { error: "Invalid code" } },
      });

    render(<Register />);
    await submitRegistration();

    await waitFor(() => {
      expect(screen.getByLabelText(/Confirmation Code/i)).toBeInTheDocument();
    });

    await userEvent.type(
      screen.getByLabelText(/Confirmation Code/i),
      "000000"
    );
    await userEvent.click(
      screen.getByRole("button", { name: /Confirm Account/i })
    );

    await waitFor(() => {
      expect(screen.getByText("Invalid code")).toBeInTheDocument();
    });
  });
});
