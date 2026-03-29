import { Link } from "wouter";
import { useAuth } from "@/lib/authContext";
import { Button } from "@/components/ui/button";

export function Header() {
  const { logout, isAuthenticated } = useAuth();

  // Auth screens have their own branding — suppress the shell header
  if (!isAuthenticated) return null;

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/">
            <h1 className="font-headline font-black italic tracking-tighter text-xl text-primary-dark hover:opacity-70 transition-opacity">
              KINETIC
            </h1>
          </Link>
          <div className="flex items-center gap-3">
            <Button onClick={logout} variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
