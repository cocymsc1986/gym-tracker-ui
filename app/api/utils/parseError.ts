export const parseError = (
  error: unknown
): { status: number; error: string } => {
  if (error instanceof Response) {
    return {
      status: error.status,
      error: error.statusText || "An error occurred",
    };
  }

  if (error instanceof Error) {
    return {
      status: 500,
      error: error.message || "An unexpected error occurred",
    };
  }
  if (typeof error === "string") {
    return {
      status: 500,
      error,
    };
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "error" in error
  ) {
    const { status, error: errorMessage } = error as {
      status: number;
      error: string;
    };

    return {
      status: status || 500,
      error: errorMessage || "An unexpected error occurred",
    };
  }
  return {
    status: 500,
    error: "An unexpected error occurred",
  };
};
