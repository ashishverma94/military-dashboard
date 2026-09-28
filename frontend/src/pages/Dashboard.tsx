import { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  ClipboardCheck,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Dialog, DialogContent, DialogTitle } from "../components/ui/Dialog";
import { PageHeader } from "../components/PageHeader";

const money = (n: number) => new Intl.NumberFormat("en-IN").format(n);

function Metric({
  label,
  value,
  icon: Icon,
  onClick,
}: {
  label: string;
  value: number;
  icon: any;
  onClick?: () => void;
}) {
  return (
    <Card
      className={
        onClick
          ? "cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md"
          : ""
      }
      onClick={onClick}
    >
      <CardContent>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-forest/45">
              {label}
            </p>
            <p className="mt-2 text-3xl font-black text-forest">
              {money(value)}
            </p>
          </div>
          <div className="rounded-xl bg-olive/10 p-2.5 text-olive">
            <Icon size={20} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [detail, setDetail] = useState(false);
  const [from, setFrom] = useState(new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .dashboard(`?from=${from}&to=${to}`)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [from, to]);

  if (error) return <div className="text-red-800">{error}</div>;

  return (
    <>
      <PageHeader
        title="Command Dashboard"
        description={`Operational inventory overview · ${user?.role.replaceAll("_", " ")}`}
        action={
          <div className="flex gap-2">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-lg border border-olive/20 bg-white px-2 md:px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border border-olive/20 bg-white px-2 md:px-3 py-2 text-sm"
            />
          </div>
        }
      />
      {!data ? (
        <div>Loading dashboard…</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <Metric
              label="Opening Balance"
              value={data.metrics.openingBalance}
              icon={Boxes}
            />
            <Metric
              label="Closing Balance"
              value={data.metrics.closingBalance}
              icon={WalletCards}
            />
            <Metric
              label="Net Movement"
              value={data.metrics.netMovement}
              icon={TrendingUp}
              onClick={() => setDetail(true)}
            />
            <Metric
              label="Assigned"
              value={data.metrics.assigned}
              icon={ClipboardCheck}
            />
            <Metric
              label="Expended"
              value={data.metrics.expended}
              icon={ArrowUpRight}
            />
          </div>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <Card>
              <CardContent className="max-md:p-2">
                <h3 className="font-bold text-forest">Movement breakdown</h3>
                <div className="mt-5 grid grid-cols-3 gap-1 md:gap-3">
                  <div className="rounded-xl bg-olive/5 p-2 md:p-4">
                    <ArrowDownLeft className="text-olive" size={18} />
                    <p className="mt-3 text-xs text-forest/50">Purchases</p>
                    <p className="text-xl font-black">
                      {money(data.metrics.purchases)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-olive/5 p-2 md:p-4">
                    <ArrowDownLeft className="text-olive" size={18} />
                    <p className="mt-3 text-xs text-forest/50 text-nowrap">Transfer In</p>
                    <p className="text-xl font-black">
                      {money(data.metrics.transferIn)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-coyote/10 p-2 md:p-4">
                    <ArrowUpRight className="text-coyote" size={18} />
                    <p className="mt-3 text-xs text-forest/50 text-nowrap">Transfer Out</p>
                    <p className="text-xl font-black">
                      {money(data.metrics.transferOut)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-forest">
                      Inventory snapshot
                    </h3>

                    <p className="mt-1 text-xs text-forest/45">
                      Current available stock by asset
                    </p>
                  </div>
                </div>

                <div className="mt-3 divide-y divide-olive/10">
                  {data.inventory.slice(0, 6).map((i: any) => (
                    <div
                      key={i.id}
                      className="flex items-center justify-between py-3 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-forest">
                          {i.asset?.name || i.assetId}
                        </p>

                        <p className="text-xs text-forest/45">
                          {i.base?.name || "All bases"}
                        </p>
                      </div>

                      <Badge>{i.currentStock} available</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <Dialog open={detail} onOpenChange={setDetail}>
            <DialogContent>
              <DialogTitle>Net Movement Detail</DialogTitle>
              <p className="mt-1 text-sm text-forest/50">
                Purchases + Transfer In − Transfer Out for the selected period.
              </p>
              <div className="mt-6 space-y-5">
                {[
                  ["Purchases", data.details.purchases],
                  ["Transfer In", data.details.transfersIn],
                  ["Transfer Out", data.details.transfersOut],
                ].map(([title, rows]: any) => (
                  <div key={title}>
                    <h4 className="mb-2 font-bold text-forest">{title}</h4>
                    <div className="overflow-hidden rounded-xl border border-olive/10">
                      {rows.length ? (
                        rows.map((r: any) => (
                          <div
                            key={r.id}
                            className="flex justify-between border-b border-olive/10 px-4 py-3 text-sm last:border-0"
                          >
                            <span>{r.asset?.name}</span>
                            <span className="font-bold">{r.quantity}</span>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-sm text-forest/40">
                          No records
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
}
