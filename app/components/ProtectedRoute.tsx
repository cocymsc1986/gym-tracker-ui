import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/lib/authContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isValidating } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated && !isValidating) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isValidating, navigate]);

  // Show loading while validating JWT
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Validating authentication...</p>
        </div>
      </div>
    );
  }

  // Show redirecting message while not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
