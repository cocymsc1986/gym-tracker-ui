import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Login } from "./Login";

// Create mock functions
const mockNavigate = vi.fn();
const mockSetTokens = vi.fn();
const mockUseFetcher = vi.fn();
const mockUseAuth = vi.fn();

// Mock react-router hooks
vi.mock("react-router", () => ({
  useFetcher: () => mockUseFetcher(),
  useNavigate: () => mockNavigate,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

// Mock auth context
vi.mock("@/lib/authContext", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("Login", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Default mock implementations
    mockUseFetcher.mockReturnValue({
      data: null,
      state: "idle",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    });

    mockUseAuth.mockReturnValue({
      setTokens: mockSetTokens,
      isAuthenticated: false,
    });
  });

  it("renders username and password fields", () => {
    render(<Login />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("displays error when fetcher returns error", () => {
    mockUseFetcher.mockReturnValue({
      data: { error: "Invalid credentials" },
      state: "idle",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    });

    render(<Login />);

    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  it("calls setTokens and navigate when successful response is returned", () => {
    const tokenData = {
      token: "test-token",
      refreshToken: "test-refresh-token",
      expiresAt: Date.now() + 3600000,
    };

    mockUseFetcher.mockReturnValue({
      data: { status: 200, tokenData },
      state: "idle",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    });

    render(<Login />);

    expect(mockSetTokens).toHaveBeenCalledWith(tokenData);
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });

  it("redirects when user is already authenticated", () => {
    mockUseAuth.mockReturnValue({
      setTokens: mockSetTokens,
      isAuthenticated: true,
    });

    render(<Login />);

    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });
});
