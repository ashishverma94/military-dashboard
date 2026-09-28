import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Protected } from "./components/Protected";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import {
  Purchases,
  Transfers,
  Assignments,
  Expenditures,
} from "./pages/Operations";
import { Users, AuditLogs } from "./pages/AdminPages";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <Protected>
                <Layout />
              </Protected>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="transfers" element={<Transfers />} />
            <Route
              path="assignments"
              element={
                <Protected roles={["ADMIN", "BASE_COMMANDER"]}>
                  <Assignments />
                </Protected>
              }
            />
            <Route
              path="expenditures"
              element={
                <Protected roles={["ADMIN", "BASE_COMMANDER"]}>
                  <Expenditures />
                </Protected>
              }
            />
            <Route
              path="audit-logs"
              element={
                <Protected roles={["ADMIN"]}>
                  <AuditLogs />
                </Protected>
              }
            />
            <Route
              path="users"
              element={
                <Protected roles={["ADMIN"]}>
                  <Users />
                </Protected>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
