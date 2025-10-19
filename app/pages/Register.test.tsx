import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Register } from "./Register";

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

describe("Register", () => {
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
    render(<Register />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("displays error when fetcher returns error", () => {
    mockUseFetcher.mockReturnValue({
      data: { error: "Invalid email" },
      state: "idle",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    });

    render(<Register />);

    expect(screen.getByText("Invalid email")).toBeInTheDocument();
  });

  it("shows register successful message when response is successful", () => {
    mockUseFetcher.mockReturnValue({
      data: { status: 201, data: { message: "Check your email" } },
      state: "idle",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    });

    render(<Register />);
    expect(screen.getByText("Registration Successful")).toBeInTheDocument();
    expect(screen.getByText("Check your email")).toBeInTheDocument();
  });
});
