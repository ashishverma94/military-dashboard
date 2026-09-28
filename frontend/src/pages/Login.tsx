import { FormEvent, useState } from "react";
import { Shield, LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Eye, EyeOff } from "lucide-react";

export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email, password);
      nav("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-forest lg:flex">
      <section className="relative hidden w-1/2 overflow-hidden bg-forest lg:block">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 30%, #c5b58a 0 2px, transparent 2px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-14 text-white">
          <div>
            <div className="mb-16 flex items-center gap-3">
              <Shield className="text-khaki" size={30} />
              <span className="text-xl font-black tracking-widest">
                FIELDOPS
              </span>
            </div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[.35em] text-khaki">
              Military Asset Management
            </p>
            <h1 className="max-w-lg text-5xl font-black leading-tight">
              Command visibility.
              <br />
              <span className="text-sand">Accountable logistics.</span>
            </h1>
            <p className="mt-6 max-w-md text-white/60">
              Track stock, movements, assignments and expenditures across bases
              with role-controlled operational access.
            </p>
          </div>
          <div className="text-xs uppercase tracking-[.25em] text-white/30">
            Secure Operations Console · v1.0
          </div>
        </div>
      </section>
      <section className="flex min-h-screen w-full items-center justify-center bg-paper p-6 lg:w-1/2">
        <form onSubmit={submit} className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <div className="text-xl font-black text-forest">
              FIELD<span className="text-olive">OPS</span>
            </div>
          </div>
          <div className="mb-8">
            <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-olive/10 text-olive">
              <LockKeyhole />
            </div>
            <h2 className="mt-4 text-3xl font-black text-forest">
              Secure sign in
            </h2>
            <p className="mt-1 text-sm text-forest/50">
              Use your assigned command credentials.
            </p>
          </div>
          {error && (
            <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-800">
              {error}
            </div>
          )}
          <label className="mb-2 block text-sm font-semibold">Email</label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="mb-5"
          />
          <label className="mb-2 block text-sm font-semibold">Password</label>
          <div className="relative mb-6">
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              className="pr-10"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-forest/60 hover:text-forest"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <Button disabled={busy} className="w-full py-3">
            {busy ? "Authenticating…" : "Enter command console"}
          </Button>
          
        </form>
      </section>
    </div>
  );
}
