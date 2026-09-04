import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/auth";
import { useMe } from "../features/auth/hooks";
import { Loading } from "../components/Loading";

export function RequireAuth() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const me = useMe();
  useEffect(() => {
    if (user && me.isError) setUser(null);
  }, [user, me.isError, setUser]);
  if (!user) return <Navigate to="/login" replace />;
  if (me.isLoading) return <Loading />;
  if (me.isError) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function RequireAdmin() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const me = useMe();
  useEffect(() => {
    if (user && me.isError) setUser(null);
  }, [user, me.isError, setUser]);
  if (!user) return <Navigate to="/login" replace />;
  if (me.isLoading) return <Loading />;
  if (me.isError) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/home" replace />;
  return <Outlet />;
}
