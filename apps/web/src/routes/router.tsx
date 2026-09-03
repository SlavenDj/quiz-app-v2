import { createBrowserRouter } from "react-router-dom";
import { RequireAdmin, RequireAuth } from "./guards";
import { LoginPage } from "../features/auth/LoginPage";
import { RegisterPage } from "../features/auth/RegisterPage";
import { VerifyPage } from "../features/auth/VerifyPage";
import { ModuleGrid } from "../features/quiz/ModuleGrid";
import { ModuleDetail } from "../features/quiz/ModuleDetail";
import { QuizStart } from "../features/quiz/QuizStart";
import { QuizPlay } from "../features/quiz/QuizPlay";
import { QuizResult } from "../features/quiz/QuizResult";
import { Leaderboard } from "../features/quiz/Leaderboard";

export const router = createBrowserRouter([
  { path: "/", element: <div>Landing — TODO</div> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/verify/:id", element: <VerifyPage /> },
  { path: "/forgot", element: <div>Forgot — Phase 1 polish</div> },
  {
    element: <RequireAuth />,
    children: [
      { path: "/home", element: <ModuleGrid /> },
      { path: "/modules/:id", element: <ModuleDetail /> },
      { path: "/quiz/:id", element: <QuizStart /> },
      { path: "/quiz/:id/play", element: <QuizPlay /> },
      { path: "/results/:attemptId", element: <QuizResult /> },
      { path: "/leaderboard", element: <Leaderboard /> },
    ],
  },
  {
    path: "/admin",
    element: <RequireAdmin />,
    children: [{ path: "modules", element: <div>Admin modules — Phase 3</div> }],
  },
  { path: "*", element: <div>404</div> },
]);
