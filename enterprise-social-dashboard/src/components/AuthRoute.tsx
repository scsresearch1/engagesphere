import { Navigate } from "react-router-dom";
import { useAppState } from "../context/AppStateContext";

export function AuthRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, appReady } = useAppState();
  if (!appReady) {
    return (
      <div className="app-loading-screen">
        <p>Loading…</p>
      </div>
    );
  }
  if (currentUser) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
