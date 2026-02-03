import Link from "next/link";
import { requireUser } from "../../lib/requireAuth";
import { prisma } from "../../lib/prisma";
import { Card, SectionTitle } from "../../components/ui";

function statusColor(status) {
  if (status === "paid") return "border-emerald-300/40 text-emerald-200 bg-emerald-400/10";
  if (status === "in_progress") return "border-sky-300/40 text-sky-200 bg-sky-400/10";
  if (status === "completed") return "border-indigo-300/40 text-indigo-200 bg-indigo-400/10";
  if (status === "payment_submitted") return "border-amber-300/40 text-amber-200 bg-amber-400/10";
  return "border-white/15 text-white/60 bg-white/5";
}

export default async function OrdersPage() {
  const session = await requireUser();
  const user = await prisma.user.findUnique({ where: { email: session.user.email }});

  const orders = await prisma.order.findMany({
    where: { userId: user.id, status: { not: "draft" } },
    include: { items: true, consultant: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <SectionTitle title="Your Orders" subtitle="Track progress here: paid → in progress → completed." />

      <div className="grid gap-4">
        {orders.length ? orders.map((o) => (
          <Card key={o.id} className="p-0 overflow-hidden">
            <div className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="min-w-0">
                <div className="text-white font-extrabold">
                  Order • <span className="text-white/70 text-sm">{o.id}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`badge ${statusColor(o.status)}`}>{o.status}</span>
                  {o.consultant?.name ? (
                    <span className="badge border-white/15 text-white/70 bg-white/5">
                      Assigned: {o.consultant.name}
                    </span>
                  ) : (
                    <span className="badge border-white/15 text-white/60 bg-white/5">
                      Not assigned yet
                    </span>
                  )}
                </div>
                <div className="mt-2 text-white/60 text-sm">
                  Services: {o.items.map(i => i.title).join(" • ")}
                </div>
                <div className="mt-1 text-white/60 text-sm">
                  Total: €{(o.totalCents/100).toFixed(0)} • Created: {new Date(o.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Link className="btn-primary" href={`/orders/${o.id}`}>Open status</Link>
                {o.resumeFileUrl ? <Link className="btn-secondary" href={o.resumeFileUrl} target="_blank">Resume</Link> : null}
              </div>
            </div>
          </Card>
        )) : (
          <Card>
            <div className="text-white/70">No orders yet. Start from the Dashboard.</div>
            <div className="mt-4">
              <Link className="btn-primary" href="/dashboard">Go to Dashboard</Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
