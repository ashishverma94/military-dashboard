import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { PageHeader } from "../components/PageHeader";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";

function dateTime() {
  return new Date().toISOString().slice(0, 16);
}

export function Purchases() {
  return (
    <Operation
      kind="purchase"
      title="Purchases"
      description="Record procurement and increase base inventory."
    />
  );
}

export function Transfers() {
  return (
    <Operation
      kind="transfer"
      title="Transfers"
      description="Move quantities between bases with an immutable movement history."
    />
  );
}

export function Assignments() {
  return (
    <Operation
      kind="assignment"
      title="Assignments"
      description="Issue available assets to personnel or units."
    />
  );
}

export function Expenditures() {
  return (
    <Operation
      kind="expenditure"
      title="Expenditures"
      description="Record consumed, damaged, destroyed or expired stock."
    />
  );
}

function Operation({
  kind,
  title,
  description,
}: {
  kind: "purchase" | "transfer" | "assignment" | "expenditure";
  title: string;
  description: string;
}) {
  const { user } = useAuth();

  const [assets, setAssets] = useState<any[]>([]);
  const [bases, setBases] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState<any>({
    assetId: "",
    baseId: user?.baseId || "",
    fromBaseId: user?.baseId || "",
    toBaseId: "",
    quantity: 1,
    purchaseDate: dateTime(),
    transferDate: dateTime(),
    assignmentDate: dateTime(),
    expenditureDate: dateTime(),
    supplier: "",
    assignedTo: "",
    reason: "Used",
    remarks: "",
  });

  useEffect(() => {
    Promise.all([api.assets(), api.bases()]).then(([a, b]) => {
      setAssets(a);
      setBases(b);

      if (!form.assetId && a[0]) {
        setForm((f: any) => ({
          ...f,
          assetId: a[0].id,
        }));
      }

      if (!form.toBaseId && b[1]) {
        setForm((f: any) => ({
          ...f,
          toBaseId: b[1].id,
        }));
      }
    });

    load();
  }, [kind]);

  async function load() {
    const r =
      kind === "purchase"
        ? await api.purchases()
        : kind === "transfer"
          ? await api.transfers()
          : kind === "assignment"
            ? await api.assignments()
            : await api.expenditures();

    setRows(r);
  }

  const set = (key: string, value: any) => {
    setForm((f: any) => ({
      ...f,
      [key]: value,
    }));
  };

  async function submit(e: FormEvent) {
    e.preventDefault();

    setBusy(true);
    setMessage("");

    try {
      if (kind === "purchase") {
        await api.createPurchase({
          ...form,
          quantity: Number(form.quantity),
        });
      }

      if (kind === "transfer") {
        await api.createTransfer({
          ...form,
          quantity: Number(form.quantity),
        });
      }

      if (kind === "assignment") {
        await api.createAssignment({
          ...form,
          quantity: Number(form.quantity),
        });
      }

      if (kind === "expenditure") {
        await api.createExpenditure({
          ...form,
          quantity: Number(form.quantity),
        });
      }

      setMessage("Transaction recorded successfully.");

      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Transaction failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title={title} description={description} />

      <div className="grid w-full min-w-0 gap-6 xl:grid-cols-[390px_minmax(0,1fr)]">
        {/* FORM */}
        <Card className="min-w-0">
          <CardContent className="w-full">
            <h3 className="mb-5 font-bold">New {title.slice(0, -1)}</h3>

            <form onSubmit={submit} className="space-y-4">
              {/* EQUIPMENT */}
              <Field label="Equipment">
                <select
                  value={form.assetId}
                  onChange={(e) => set("assetId", e.target.value)}
                  className="field"
                >
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} · {asset.unit}
                    </option>
                  ))}
                </select>
              </Field>

              {/* TRANSFER BASES */}
              {kind === "transfer" ? (
                <>
                  <Field label="From base">
                    <select
                      value={form.fromBaseId}
                      onChange={(e) => set("fromBaseId", e.target.value)}
                      className="field"
                    >
                      {bases.map((base) => (
                        <option key={base.id} value={base.id}>
                          {base.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="To base">
                    <select
                      value={form.toBaseId}
                      onChange={(e) => set("toBaseId", e.target.value)}
                      className="field"
                    >
                      {bases.map((base) => (
                        <option key={base.id} value={base.id}>
                          {base.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                </>
              ) : (
                /* NORMAL BASE */
                <Field label="Base">
                  <select
                    value={form.baseId}
                    onChange={(e) => set("baseId", e.target.value)}
                    className="field"
                  >
                    {bases.map((base) => (
                      <option key={base.id} value={base.id}>
                        {base.name}
                      </option>
                    ))}
                  </select>
                </Field>
              )}

              {/* QUANTITY */}
              <Field label="Quantity">
                <Input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => set("quantity", e.target.value)}
                />
              </Field>

              {/* SUPPLIER */}
              {kind === "purchase" && (
                <Field label="Supplier">
                  <Input
                    value={form.supplier}
                    onChange={(e) => set("supplier", e.target.value)}
                  />
                </Field>
              )}

              {/* ASSIGNED TO */}
              {kind === "assignment" && (
                <Field label="Assigned to">
                  <Input
                    required
                    value={form.assignedTo}
                    onChange={(e) => set("assignedTo", e.target.value)}
                    placeholder="Personnel / unit"
                  />
                </Field>
              )}

              {/* EXPENDITURE REASON */}
              {kind === "expenditure" && (
                <Field label="Reason">
                  <select
                    value={form.reason}
                    onChange={(e) => set("reason", e.target.value)}
                    className="field"
                  >
                    <option>Used</option>
                    <option>Damaged</option>
                    <option>Destroyed</option>
                    <option>Expired</option>
                  </select>
                </Field>
              )}

              {/* REMARKS */}
              <Field label="Remarks">
                <Input
                  value={form.remarks}
                  onChange={(e) => set("remarks", e.target.value)}
                />
              </Field>

              {/* SUBMIT */}
              <Button disabled={busy} className="w-full">
                {busy ? "Saving…" : "Record transaction"}
              </Button>

              {/* MESSAGE */}
              {message && (
                <p className="rounded-lg bg-olive/10 p-3 text-sm text-olive">
                  {message}
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        {/* HISTORY */}
        <Card className="min-w-0">
          <CardContent className="min-w-0">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-bold">History</h3>

              <Badge>{rows.length} records</Badge>
            </div>

            {/* MOBILE HORIZONTAL SCROLL */}
            <div className="w-full min-w-0 overflow-x-auto">
              <table className="min-w-175 w-full text-left text-sm">
                <thead className="border-b border-olive/10 text-xs uppercase text-forest/40">
                  <tr>
                    <th className="whitespace-nowrap py-3 pr-4">Date</th>

                    <th className="whitespace-nowrap py-3 pr-4">Asset</th>

                    <th className="whitespace-nowrap py-3 pr-4">
                      Base / Route
                    </th>

                    <th className="whitespace-nowrap py-3">Qty</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-olive/5">
                      <td className="whitespace-nowrap py-3 pr-4">
                        {new Date(
                          row.purchaseDate ||
                            row.transferDate ||
                            row.assignmentDate ||
                            row.expenditureDate,
                        ).toLocaleString()}
                      </td>

                      <td className="whitespace-nowrap py-3 pr-4 font-semibold">
                        {row.asset?.name}
                      </td>

                      <td className="whitespace-nowrap py-3 pr-4">
                        {kind === "transfer"
                          ? `${row.fromBase?.name} → ${row.toBase?.name}`
                          : row.base?.name}
                      </td>

                      <td className="whitespace-nowrap py-3 font-bold">
                        {row.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!rows.length && (
                <div className="py-12 text-center text-sm text-forest/40">
                  No transactions yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <style>{`
        .field {
          width: 100%;
          border: 1px solid rgb(48 71 53 / 0.2);
          background: white;
          border-radius: 0.5rem;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }

        .field:focus {
          border-color: #304735;
          box-shadow: 0 0 0 2px rgb(48 71 53 / 0.1);
        }
      `}</style>
    </>
  );
}

function Field({ label, children }: { label: string; children: any }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-forest/50">
        {label}
      </span>

      {children}
    </label>
  );
}
