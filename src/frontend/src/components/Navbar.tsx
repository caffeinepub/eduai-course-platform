import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";
import type { ThemeConfig } from "../utils/seasonalTheme";

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  theme: ThemeConfig;
  isLoggedIn: boolean;
}

export default function Navbar({
  currentPage,
  onNavigate,
  theme,
  isLoggedIn,
}: NavbarProps) {
  const { login, clear, isLoggingIn } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md border-b border-border/50"
      style={{
        background: `linear-gradient(90deg, ${theme.heroBgFrom}ee, ${theme.heroBgTo}ee)`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2 group"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-glow"
              style={{ background: theme.primaryColor }}
            >
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              Edu<span style={{ color: theme.primaryColor }}>AI</span>
            </span>
          </button>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              type="button"
              data-ocid="nav.home_link"
              onClick={() => onNavigate("home")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === "home"
                  ? "text-foreground bg-white/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => onNavigate("home")}
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              Browse Courses
            </button>
            {isLoggedIn && (
              <button
                type="button"
                data-ocid="nav.create_course_link"
                onClick={() => onNavigate("create-course")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === "create-course"
                    ? "text-foreground bg-white/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                Create Course
              </button>
            )}
            {isAdmin && (
              <button
                type="button"
                data-ocid="nav.admin_link"
                onClick={() => onNavigate("admin")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === "admin"
                    ? "text-foreground bg-white/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                Admin
              </button>
            )}
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <Button
                data-ocid="nav.logout_button"
                variant="outline"
                size="sm"
                onClick={clear}
                className="border-border/50 text-foreground hover:bg-white/10"
              >
                Log Out
              </Button>
            ) : (
              <Button
                data-ocid="nav.login_button"
                size="sm"
                onClick={login}
                disabled={isLoggingIn}
                style={{ background: theme.primaryColor }}
                className="text-white border-0 hover:opacity-90"
              >
                {isLoggingIn ? "Connecting..." : "Sign In"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
