import { Navigate } from "react-router-dom";
import { useAppState } from "../context/AppStateContext";
import type { Role } from "../types";

type PrivateRouteProps = {
  children: React.ReactNode;
  allowRoles?: Role[];
};

export function PrivateRoute({ children, allowRoles }: PrivateRouteProps) {
  const { currentUser, appReady } = useAppState();
  if (!appReady) {
    return (
      <div className="app-loading-screen">
        <p>Loading workspace…</p>
      </div>
    );
  }
  if (!currentUser) return <Navigate to="/login" replace />;
  if (allowRoles && !allowRoles.includes(currentUser.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
