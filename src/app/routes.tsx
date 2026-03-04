import { createBrowserRouter } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { MoodTracking } from "./pages/MoodTracking";
import { PanicExercises } from "./pages/PanicExercises";
import { Community } from "./pages/Community";
import { Reports } from "./pages/Reports";
import { Settings } from "./pages/Settings";
import { AIChat } from "./pages/AIChat";
import { AnonymousChat } from "./pages/AnonymousChat";
import { Auth } from "./pages/Auth";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Auth,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        Component: () => (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "mood",
        Component: () => (
          <ProtectedRoute>
            <MoodTracking />
          </ProtectedRoute>
        ),
      },
      {
        path: "panic",
        Component: () => (
          <ProtectedRoute>
            <PanicExercises />
          </ProtectedRoute>
        ),
      },
      {
        path: "community",
        Component: () => (
          <ProtectedRoute>
            <Community />
          </ProtectedRoute>
        ),
      },
      {
        path: "ai-chat",
        Component: () => (
          <ProtectedRoute>
            <AIChat />
          </ProtectedRoute>
        ),
      },
      {
        path: "anonymous-chat",
        Component: () => (
          <ProtectedRoute>
            <AnonymousChat />
          </ProtectedRoute>
        ),
      },
      {
        path: "reports",
        Component: () => (
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        Component: () => (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);