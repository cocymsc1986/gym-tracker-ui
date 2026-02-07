import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Login } from "./Login";

const mockSetLocation = vi.fn();
const mockSetTokens = vi.fn();
let mockIsAuthenticated = false;

vi.mock("wouter", () => ({
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useLocation: () => ["/login", mockSetLocation],
}));

vi.mock("@/lib/authContext", () => ({
  useAuth: () => ({
    setTokens: mockSetTokens,
    isAuthenticated: mockIsAuthenticated,
  }),
}));

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

import { apiClient } from "@/lib/apiClient";

describe("Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthenticated = false;
  });

  it("renders email and password fields", () => {
    render(<Login />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("displays error when login fails", async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce({
      response: { data: { error: "Invalid credentials" } },
    });

    render(<Login />);

    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  it("calls setTokens when login succeeds", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      status: 200,
      data: {
        access_token: "test-token",
        refresh_token: "test-refresh-token",
        expires_in: 3600,
      },
    });

    render(<Login />);

    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockSetTokens).toHaveBeenCalledWith(
        expect.objectContaining({
          token: "test-token",
          refreshToken: "test-refresh-token",
        })
      );
    });
  });

  it("redirects when user is already authenticated", () => {
    mockIsAuthenticated = true;

    render(<Login />);

    expect(mockSetLocation).toHaveBeenCalledWith("/");
  });
});
