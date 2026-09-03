import { createBrowserRouter } from "react-router-dom";
import { RequireAdmin, RequireAuth } from "./guards";
import { LoginPage } from "../features/auth/LoginPage";
import { RegisterPage } from "../features/auth/RegisterPage";
import { VerifyPage } from "../features/auth/VerifyPage";

export const router = createBrowserRouter([
  { path: "/", element: <div>Landing — TODO</div> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/verify/:id", element: <VerifyPage /> },
  { path: "/forgot", element: <div>Forgot — Phase 1 polish</div> },
  {
    element: <RequireAuth />,
    children: [
      { path: "/home", element: <div>Module grid — Phase 2</div> },
      { path: "/modules/:id", element: <div>Module detail — Phase 2</div> },
      { path: "/quiz/:id", element: <div>Quiz start — Phase 2</div> },
      { path: "/quiz/:id/play", element: <div>Quiz play — Phase 2</div> },
      { path: "/results/:attemptId", element: <div>Result — Phase 2</div> },
      { path: "/leaderboard", element: <div>Leaderboard — Phase 2</div> },
    ],
  },
  {
    path: "/admin",
    element: <RequireAdmin />,
    children: [{ path: "modules", element: <div>Admin modules — Phase 3</div> }],
  },
  { path: "*", element: <div>404</div> },
]);
