import { Toaster } from "@/components/ui/sonner";
import { useCallback, useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import AdminPage from "./pages/AdminPage";
import AuthPage from "./pages/AuthPage";
import CommunityPage from "./pages/CommunityPage";
import CommunityPostPage from "./pages/CommunityPostPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import CreateCoursePage from "./pages/CreateCoursePage";
import CreatorDashboardPage from "./pages/CreatorDashboardPage";
import HomePage from "./pages/HomePage";
import { applySeasonalTheme, getSeasonalTheme } from "./utils/seasonalTheme";

type PageId =
  | "home"
  | "course"
  | "create-course"
  | "admin"
  | "auth"
  | "community"
  | "community-post"
  | "my-dashboard";

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
  if (path.startsWith("/community/post/")) {
    const id = path.split("/community/post/")[1];
    return { page: "community-post", params: { id: id ?? "0" } };
  }
  if (path === "/community") return { page: "community", params: {} };
  if (path === "/create-course") return { page: "create-course", params: {} };
  if (path === "/admin") return { page: "admin", params: {} };
  if (path === "/my-dashboard") return { page: "my-dashboard", params: {} };
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
    else if (navState.page === "community-post")
      path = `/community/post/${navState.params.id ?? "0"}`;
    else if (navState.page === "community") path = "/community";
    else if (navState.page === "create-course") path = "/create-course";
    else if (navState.page === "admin") path = "/admin";
    else if (navState.page === "my-dashboard") path = "/my-dashboard";
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
      case "community":
        return (
          <CommunityPage
            theme={theme}
            onNavigate={navigate}
            isLoggedIn={isLoggedIn}
          />
        );
      case "community-post":
        return (
          <CommunityPostPage
            postId={navState.params.id ?? "0"}
            theme={theme}
            onNavigate={navigate}
            isLoggedIn={isLoggedIn}
          />
        );
      case "my-dashboard":
        return (
          <CreatorDashboardPage
            theme={theme}
            onNavigate={navigate}
            isLoggedIn={isLoggedIn}
          />
        );
      default:
        return (
          <HomePage
            theme={theme}
            onNavigate={navigate}
            isLoggedIn={isLoggedIn}
          />
        );
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
