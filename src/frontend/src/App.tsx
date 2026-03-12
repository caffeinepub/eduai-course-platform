import { Toaster } from "@/components/ui/sonner";
import { useCallback, useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import AdminPage from "./pages/AdminPage";
import AuthPage from "./pages/AuthPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import CreateCoursePage from "./pages/CreateCoursePage";
import HomePage from "./pages/HomePage";
import { applySeasonalTheme, getSeasonalTheme } from "./utils/seasonalTheme";

type PageId = "home" | "course" | "create-course" | "admin" | "auth";

interface NavState {
  page: PageId;
  params: Record<string, string>;
}

function parsePathToState(): NavState {
  const path = window.location.pathname;
  if (path.startsWith("/course/")) {
    const id = path.split("/course/")[1];
    return { page: "course", params: { id: id ?? "" } };
  }
  if (path === "/create-course") return { page: "create-course", params: {} };
  if (path === "/admin") return { page: "admin", params: {} };
  if (path === "/login" || path === "/auth")
    return { page: "auth", params: {} };
  return { page: "home", params: {} };
}

export default function App() {
  const theme = getSeasonalTheme();
  const { identity } = useInternetIdentity();
  const isLoggedIn = !!identity;

  const [navState, setNavState] = useState<NavState>(parsePathToState);

  useEffect(() => {
    applySeasonalTheme(theme);
  }, [theme]);

  // Sync URL on state change
  useEffect(() => {
    let path = "/";
    if (navState.page === "course")
      path = `/course/${navState.params.id ?? ""}`;
    else if (navState.page === "create-course") path = "/create-course";
    else if (navState.page === "admin") path = "/admin";
    else if (navState.page === "auth") path = "/login";
    if (window.location.pathname !== path) {
      window.history.pushState(null, "", path);
    }
  }, [navState]);

  // Handle browser back/forward
  useEffect(() => {
    const handler = () => setNavState(parsePathToState());
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  const navigate = useCallback(
    (page: string, params?: Record<string, string>) => {
      setNavState({ page: page as PageId, params: params ?? {} });
      window.scrollTo(0, 0);
    },
    [],
  );

  // Update document meta
  useEffect(() => {
    document.title = "EduAI — Free AI-Powered Learning Platform";
    const desc = document.querySelector("meta[name='description']");
    if (desc) {
      desc.setAttribute(
        "content",
        "Learn everything for free with AI-powered quizzes, doubt solving, and expert courses on EduAI.",
      );
    }
  }, []);

  const renderPage = () => {
    switch (navState.page) {
      case "course":
        return (
          <CourseDetailPage
            courseId={navState.params.id ?? "0"}
            theme={theme}
            onNavigate={navigate}
          />
        );
      case "create-course":
        return (
          <CreateCoursePage
            theme={theme}
            onNavigate={navigate}
            isLoggedIn={isLoggedIn}
          />
        );
      case "admin":
        return (
          <AdminPage
            theme={theme}
            onNavigate={navigate}
            isLoggedIn={isLoggedIn}
          />
        );
      case "auth":
        return <AuthPage theme={theme} onNavigate={navigate} />;
      default:
        return <HomePage theme={theme} onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar
        currentPage={navState.page}
        onNavigate={navigate}
        theme={theme}
        isLoggedIn={isLoggedIn}
      />
      {renderPage()}
      <Toaster richColors position="top-right" />
    </div>
  );
}
