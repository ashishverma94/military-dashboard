import { useEffect, useState } from "react";
import { Eye, EyeOff, Plus, ShieldCheck, UserPlus, X } from "lucide-react";
import { api } from "../lib/api";
import { PageHeader } from "../components/PageHeader";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Dialog, DialogContent, DialogTitle } from "../components/ui/Dialog";

type Role = "ADMIN" | "BASE_COMMANDER" | "LOGISTICS_OFFICER";

type Base = {
  id: string;
  name: string;
  location?: string;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  baseId: string | null;
  base?: {
    name: string;
  } | null;
  createdAt?: string;
};

type FormData = {
  name: string;
  email: string;
  password: string;
  role: Role;
  baseId: string;
};

const initialForm: FormData = {
  name: "",
  email: "",
  password: "",
  role: "BASE_COMMANDER",
  baseId: "",
};

function formatRole(role: Role) {
  return role
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getRoleBadgeClass(role: Role) {
  if (role === "ADMIN") {
    return "bg-forest text-white";
  }

  if (role === "BASE_COMMANDER") {
    return "bg-olive text-white";
  }

  return "bg-coyote text-forest";
}

export function Users() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [bases, setBases] = useState<Base[]>([]);

  const [open, setOpen] = useState(false);

  const [form, setForm] = useState<FormData>(initialForm);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  async function loadData() {
    try {
      setLoadingData(true);

      const [users, baseList] = await Promise.all([api.users(), api.bases()]);

      setRows(users);
      setBases(baseList);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load users.";

      setError(message);
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openAddUser() {
    setForm(initialForm);
    setError("");
    setSuccess("");
    setShowPassword(false);
    setOpen(true);
  }

  function closeAddUser() {
    if (loading) return;

    setOpen(false);
    setForm(initialForm);
    setError("");
    setShowPassword(false);
  }

  function updateField(field: keyof FormData, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleCreateUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (name.length < 2) {
      setError("Please enter a valid name.");
      return;
    }

    if (!email) {
      setError("Please enter an email address.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.role !== "ADMIN" && !form.baseId) {
      setError("Please select a base for this user.");
      return;
    }

    try {
      setLoading(true);

      await api.createUser({
        name,
        email,
        password: form.password,
        role: form.role,
        baseId: form.role === "ADMIN" ? null : form.baseId,
      });

      setSuccess(`User ${email} was created successfully.`);

      setForm(initialForm);

      await loadData();

      setTimeout(() => {
        setOpen(false);
        setSuccess("");
      }, 900);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create user.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Users & Access"
        description="Create command identities and manage their assigned access scope."
        action={
          <button
            type="button"
            onClick={openAddUser}
            className="inline-flex items-center gap-2 rounded-xl bg-olive px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-olive-2"
          >
            <Plus size={17} />
            Add New User
          </button>
        }
      />

      <Card>
        <CardContent>
          {loadingData ? (
            <div className="flex min-h-55 items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-forest/50">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-olive/20 border-t-olive" />
                Loading users...
              </div>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex min-h-55 flex-col items-center justify-center text-center">
              <div className="mb-3 rounded-full bg-olive/10 p-3 text-olive">
                <UserPlus size={22} />
              </div>

              <h3 className="font-bold text-forest">No users found</h3>

              <p className="mt-1 text-sm text-forest/50">
                Create the first user using the button above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-olive/10 text-xs uppercase text-forest/40">
                  <tr>
                    <th className="py-3">Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Base</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-olive/5 last:border-0"
                    >
                      <td className="py-4 text-nowrap pr-2 font-semibold text-forest">
                        {row.name}
                      </td>

                      <td className="text-forest/70 text-nowrap pr-2">{row.email}</td>

                      <td>
                        <span
                          className={`text-nowrap pr-2 mr-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${getRoleBadgeClass(
                            row.role,
                          )}`}
                        >
                          {formatRole(row.role)}
                        </span>
                      </td>

                      <td className="text-forest/70 text-nowrap pr-2">
                        {row.base?.name || "Global"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ADD USER MODAL */}
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value) {
            closeAddUser();
          }
        }}
      >
        <DialogContent>
          <div className="pr-8">
            <DialogTitle>Add New User</DialogTitle>

            <p className="mt-1 text-sm text-forest/50">
              Create a user account and define its role and base access.
            </p>
          </div>

          <form onSubmit={handleCreateUser} className="mt-6 space-y-5">
            {/* NAME */}
            <div>
              <label
                htmlFor="user-name"
                className="mb-1.5 block text-sm font-semibold text-forest"
              >
                Full Name
              </label>

              <input
                id="user-name"
                type="text"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="e.g. Rahul Sharma"
                autoComplete="name"
                disabled={loading}
                className="w-full rounded-xl border border-olive/20 bg-white px-3.5 py-2.5 text-sm text-forest outline-none transition placeholder:text-forest/30 focus:border-olive focus:ring-2 focus:ring-olive/15 disabled:bg-olive/5"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label
                htmlFor="user-email"
                className="mb-1.5 block text-sm font-semibold text-forest"
              >
                Email Address
              </label>

              <input
                id="user-email"
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="user@example.com"
                autoComplete="email"
                disabled={loading}
                className="w-full rounded-xl border border-olive/20 bg-white px-3.5 py-2.5 text-sm text-forest outline-none transition placeholder:text-forest/30 focus:border-olive focus:ring-2 focus:ring-olive/15 disabled:bg-olive/5"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="user-password"
                className="mb-1.5 block text-sm font-semibold text-forest"
              >
                Temporary Password
              </label>

              <div className="relative">
                <input
                  id="user-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) =>
                    updateField("password", event.target.value)
                  }
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full rounded-xl border border-olive/20 bg-white px-3.5 py-2.5 pr-11 text-sm text-forest outline-none transition placeholder:text-forest/30 focus:border-olive focus:ring-2 focus:ring-olive/15 disabled:bg-olive/5"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-forest/40 transition hover:text-forest"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <p className="mt-1.5 text-xs text-forest/40">
                The user can use this password to sign in.
              </p>
            </div>

            {/* ROLE + BASE */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* ROLE */}
              <div>
                <label
                  htmlFor="user-role"
                  className="mb-1.5 block text-sm font-semibold text-forest"
                >
                  Role
                </label>

                <select
                  id="user-role"
                  value={form.role}
                  onChange={(event) => {
                    const role = event.target.value as Role;

                    setForm((previous) => ({
                      ...previous,
                      role,
                      baseId: role === "ADMIN" ? "" : previous.baseId,
                    }));
                  }}
                  disabled={loading}
                  className="w-full rounded-xl border border-olive/20 bg-white px-3.5 py-2.5 text-sm text-forest outline-none focus:border-olive focus:ring-2 focus:ring-olive/15 disabled:bg-olive/5"
                >
                  <option value="ADMIN">Admin</option>

                  <option value="BASE_COMMANDER">Base Commander</option>

                  <option value="LOGISTICS_OFFICER">Logistics Officer</option>
                </select>
              </div>

              {/* BASE */}
              <div>
                <label
                  htmlFor="user-base"
                  className="mb-1.5 block text-sm font-semibold text-forest"
                >
                  Assigned Base
                </label>

                <select
                  id="user-base"
                  value={form.baseId}
                  onChange={(event) =>
                    updateField("baseId", event.target.value)
                  }
                  disabled={loading || form.role === "ADMIN"}
                  className="w-full rounded-xl border border-olive/20 bg-white px-3.5 py-2.5 text-sm text-forest outline-none focus:border-olive focus:ring-2 focus:ring-olive/15 disabled:cursor-not-allowed disabled:bg-olive/10 disabled:text-forest/40"
                >
                  <option value="">
                    {form.role === "ADMIN"
                      ? "Not required for Admin"
                      : "Select a base"}
                  </option>

                  {bases.map((base) => (
                    <option key={base.id} value={base.id}>
                      {base.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ROLE INFORMATION */}
            <div className="rounded-xl border border-olive/10 bg-khaki/20 p-4">
              <div className="flex gap-3">
                <div className="mt-0.5 text-olive">
                  <ShieldCheck size={18} />
                </div>

                <div>
                  <p className="text-sm font-bold text-forest">
                    {formatRole(form.role)}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-forest/55">
                    {form.role === "ADMIN" &&
                      "Full system access across all bases, users, assets, operations and audit records."}

                    {form.role === "BASE_COMMANDER" &&
                      "Can manage and view operational data belonging to the selected base."}

                    {form.role === "LOGISTICS_OFFICER" &&
                      "Can manage purchases and transfers according to the assigned base access."}
                  </p>
                </div>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            {/* BUTTONS */}
            <div className="flex justify-end gap-3 border-t border-olive/10 pt-5">
              <button
                type="button"
                onClick={closeAddUser}
                disabled={loading}
                className="rounded-xl border border-olive/15 px-4 py-2.5 text-sm font-semibold text-forest transition hover:bg-olive/5 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-olive px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-olive-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus size={17} />
                    Create User
                  </>
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function AuditLogs() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    api.audit().then(setRows);
  }, []);

  return (
    <>
      <PageHeader
        title="Audit Logs"
        description="Administrative transaction trail for accountability and review."
      />

      <Card className="">
        <CardContent>
          <div className="overflow-x-auto ">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-olive/10 text-xs uppercase text-forest/40">
                <tr>
                  <th className="py-3">Timestamp</th>

                  <th>Actor</th>

                  <th>Module</th>

                  <th>Action</th>

                  <th>Description</th>
                </tr>
              </thead>

              <tbody className="">
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-olive/5">
                    <td className="py-3 text-nowrap mr-5">
                      {new Date(row.timestamp).toLocaleString()}
                    </td>

                    <td className="text-nowrap mr-5">{row.user?.name || "System"}</td>

                    <td className="text-nowrap mr-5">
                      <Badge>{row.module}</Badge>
                    </td>

                    <td className="font-bold text-nowrap mr-5">{row.action}</td>

                    <td className="min-w-50">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
