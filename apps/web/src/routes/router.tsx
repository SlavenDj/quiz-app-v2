import { createBrowserRouter } from "react-router-dom";
import { RequireAdmin, RequireAuth } from "./guards";
import { RootLayout } from "./layout";
import { LoginPage } from "../features/auth/LoginPage";
import { RegisterPage } from "../features/auth/RegisterPage";
import { VerifyPage } from "../features/auth/VerifyPage";
import { ForgotPage } from "../features/auth/ForgotPage";
import { ResetPage } from "../features/auth/ResetPage";
import { LandingPage } from "../features/landing/LandingPage";
import { ModuleGrid } from "../features/quiz/ModuleGrid";
import { ModuleDetail } from "../features/quiz/ModuleDetail";
import { QuizStart } from "../features/quiz/QuizStart";
import { QuizPlay } from "../features/quiz/QuizPlay";
import { QuizResult } from "../features/quiz/QuizResult";
import { Leaderboard } from "../features/quiz/Leaderboard";
import { ProfilePage } from "../features/profile/ProfilePage";
import { AdminModules } from "../features/admin/AdminModules";
import { AdminQuizzes } from "../features/admin/AdminQuizzes";
import { EditQuiz } from "../features/admin/EditQuiz";
import NotFound from "../components/NotFound";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/verify/:id", element: <VerifyPage /> },
      { path: "/forgot", element: <ForgotPage /> },
      { path: "/reset/:id", element: <ResetPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: "/home", element: <ModuleGrid /> },
          { path: "/modules/:id", element: <ModuleDetail /> },
          { path: "/quiz/:id", element: <QuizStart /> },
          { path: "/quiz/:id/play", element: <QuizPlay /> },
          { path: "/results/:attemptId", element: <QuizResult /> },
          { path: "/leaderboard", element: <Leaderboard /> },
          { path: "/profile", element: <ProfilePage /> },
        ],
      },
      {
        path: "/admin",
        element: <RequireAdmin />,
        children: [
          { path: "modules", element: <AdminModules /> },
          { path: "modules/:id", element: <AdminQuizzes /> },
          { path: "quiz/:id/edit", element: <EditQuiz /> },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
