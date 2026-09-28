import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { Role } from "../types";
import type { ReactNode } from "react";

export function Protected({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: Role[];
}) {
  
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="grid min-h-screen place-items-center bg-paper text-olive">
        Loading command console…
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
}
