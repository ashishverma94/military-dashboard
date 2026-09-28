import type { User } from "../types";

const API =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function getToken() {
  return localStorage.getItem("fieldops_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
      ...(options.headers || {}),
    },
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.message || "Request failed");
  }

  return body.data as T;
}

export const api = {
  // -----------------------------
  // AUTH
  // -----------------------------

  login: (email: string, password: string) =>
    request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    }),

  me: () => request<User>("/auth/me"),

  // -----------------------------
  // DASHBOARD
  // -----------------------------

  dashboard: (params: string) =>
    request<any>(`/dashboard${params}`),

  netMovement: (params: string) =>
    request<any>(`/dashboard/net-movement${params}`),

  // -----------------------------
  // MASTER DATA
  // -----------------------------

  assets: () =>
    request<any[]>("/assets"),

  bases: () =>
    request<any[]>("/bases"),

  // -----------------------------
  // USERS
  // -----------------------------

  users: () =>
    request<any[]>("/users"),

  createUser: (body: {
    name: string;
    email: string;
    password: string;
    role: "ADMIN" | "BASE_COMMANDER" | "LOGISTICS_OFFICER";
    baseId: string | null;
  }) =>
    request<any>("/users", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // -----------------------------
  // AUDIT
  // -----------------------------

  audit: () =>
    request<any[]>("/audit-logs"),

  // -----------------------------
  // OPERATIONS
  // -----------------------------

  purchases: () =>
    request<any[]>("/purchases"),

  transfers: () =>
    request<any[]>("/transfers"),

  assignments: () =>
    request<any[]>("/assignments"),

  expenditures: () =>
    request<any[]>("/expenditures"),

  createPurchase: (body: any) =>
    request("/purchases", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  createTransfer: (body: any) =>
    request("/transfers", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  createAssignment: (body: any) =>
    request("/assignments", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  createExpenditure: (body: any) =>
    request("/expenditures", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};