import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Boxes,
  ClipboardCheck,
  ArrowLeftRight,
  PackagePlus,
  ShieldCheck,
  ScrollText,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../lib/utils";

const items = [
  {
    to: "/",
    label: "Dashboard",
    icon: BarChart3,
    roles: ["ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"],
  },
  {
    to: "/purchases",
    label: "Purchases",
    icon: PackagePlus,
    roles: ["ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"],
  },
  {
    to: "/transfers",
    label: "Transfers",
    icon: ArrowLeftRight,
    roles: ["ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"],
  },
  {
    to: "/assignments",
    label: "Assignments",
    icon: ClipboardCheck,
    roles: ["ADMIN", "BASE_COMMANDER"],
  },
  {
    to: "/expenditures",
    label: "Expenditures",
    icon: Boxes,
    roles: ["ADMIN", "BASE_COMMANDER"],
  },
  {
    to: "/audit-logs",
    label: "Audit Logs",
    icon: ScrollText,
    roles: ["ADMIN"],
  },
  {
    to: "/users",
    label: "Users & Access",
    icon: ShieldCheck,
    roles: ["ADMIN"],
  },
];

export function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const nav = useNavigate();
  const links = items.filter((i) => i.roles.includes(user!.role));

  return (
    <div className="min-h-screen bg-paper camouflage-grid">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-forest text-white transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <div>
            <div className="text-lg font-black tracking-wide">
              FIELD<span className="text-khaki">OPS</span>
            </div>
            <div className="text-[10px] uppercase tracking-[.25em] text-white/50">
              Asset Command
            </div>
          </div>
          <button className="lg:hidden" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="space-y-1 p-3">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white",
                  isActive && "bg-khaki/15 text-khaki",
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-white/10 p-4">
          <div className="mb-3 text-xs text-white/50">
            Signed in as
            <br />
            <span className="font-semibold text-white">{user?.name}</span>
          </div>
          <button
            onClick={() => {
              logout();
              nav("/login");
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
      
      <main className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-olive/10 bg-paper/90 px-4 backdrop-blur lg:px-8">
          <button className="lg:hidden" onClick={() => setOpen(true)}>
            <Menu />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-semibold">{user?.name}</div>
              <div className="text-[11px] uppercase tracking-wide text-olive/60">
                {user?.role.replaceAll("_", " ")}
              </div>
            </div>
            <div className="grid size-9 place-items-center rounded-full bg-olive text-sm font-bold text-white">
              {user?.name?.slice(0, 1)}
            </div>
          </div>
        </header>
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
