import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

// Ensure Next never tries to pre-render/collect data for this route at build time
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function csvEscape(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  // IMPORTANT: DB queries must be inside the handler (not at top-level)
  const orders = await prisma.order.findMany({
    include: {
      user: true,
      items: { include: { service: true } },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const header = [
    "orderId",
    "status",
    "createdAt",
    "customerEmail",
    "customerName",
    "itemsCount",
    "paymentProvider",
    "paymentReference",
  ];

  const rows = orders.map((o) => {
    const p = o.payments?.[0];
    return [
      o.id,
      o.status,
      o.createdAt?.toISOString?.() ?? "",
      o.user?.email ?? "",
      o.user?.name ?? "",
      o.items?.length ?? 0,
      p?.provider ?? "",
      p?.reference ?? "",
    ];
  });

  const csv = [header, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="hope_irl_export.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
