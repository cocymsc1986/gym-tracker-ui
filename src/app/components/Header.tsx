import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/authContext";
import { Button } from "@/components/ui/button";

export function Header() {
  const { logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const isLoginPage = location.pathname === "/login";

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Gym Tracker</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Button variant="link" size="sm">
                  <Link href="/">Dashboard</Link>
                </Button>
                <Button variant="outline" size="sm">
                  <Link href="/workout">Add Workout</Link>
                </Button>
                <Button onClick={logout} variant="outline" size="sm">
                  Logout
                </Button>
              </>
            ) : !isLoginPage ? (
              <Button asChild variant="default" size="sm">
                <Link href="/login">Login</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
