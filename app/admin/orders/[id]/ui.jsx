"use client";

import { useState } from "react";
import { MotionButton, ToastHint } from "../../../../components/ui";

export function AdminOrderClient({ order, consultants }) {
  const [status, setStatus] = useState(order?.status || "payment_submitted");
  const [consultantId, setConsultantId] = useState(order?.consultantId || "");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  if (!order) return <div className="text-white/70">Order not found.</div>;

  const addNote = async () => {
  setSaving(true); setMsg(""); setErr("");
  const res = await fetch("/api/admin/order/note", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId: order.id, content: note })
  });
  const data = await res.json();
  setSaving(false);
  if (!res.ok) { setErr(data?.error || "Failed"); return; }
  setMsg("Note added ✅ Refresh page to see it.");
  setNote("");
};

const save = async () => {
    setSaving(true); setMsg(""); setErr("");
    const res = await fetch("/api/admin/order/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, status, consultantId: consultantId || null })
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setErr(data?.error || "Failed"); return; }
    setMsg("Updated ✅");
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="text-white/60 text-sm">Customer</div>
          <div className="text-white font-extrabold">{order.fullName || order.user?.name || "—"}</div>
          <div className="text-white/70 text-sm mt-1">{order.user?.email}</div>
          <div className="text-white/70 text-sm mt-1">Phone: {order.phone || order.user?.phone || "—"}</div>
          <div className="text-white/70 text-sm mt-1">LinkedIn: {order.linkedinUrl || order.user?.linkedinUrl || "—"}</div>
        </div>

        <div className="glass rounded-xl p-4">
          <div className="text-white/60 text-sm">Payment</div>
          <div className="text-white font-extrabold">€{(order.totalCents/100).toFixed(0)} {order.currency}</div>
          <div className="text-white/70 text-sm mt-1">Ref: {order.paymentRef || "—"}</div>
          <div className="text-white/70 text-sm mt-1">Provider: {order.paymentProvider || "revolut"}</div>
        </div>
      </div>

      <div className="glass rounded-xl p-4">
        <div className="text-white font-extrabold">Services</div>
        <ul className="mt-2 text-white/70 list-disc pl-5 space-y-1">
          {order.items.map((it) => <li key={it.id}>{it.title} (€{(it.priceCents/100).toFixed(0)} / {it.period})</li>)}
        </ul>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="label mb-1">Assign consultant</div>
          <select className="input" value={consultantId} onChange={(e)=>setConsultantId(e.target.value)}>
            <option value="">Unassigned</option>
            {consultants?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="text-white/50 text-xs mt-2">Assign a team member to this order.</div>
        </div>
        <div>
          <div className="label mb-1">Update status</div>
          <select className="input" value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="awaiting_payment">awaiting_payment</option>
            <option value="payment_submitted">payment_submitted</option>
            <option value="paid">paid</option>
            <option value="in_progress">in_progress</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
        <div className="flex items-end">
          <MotionButton className="btn-primary w-full" onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </MotionButton>
        </div>
      </div>

      {err ? <div className="text-red-300 text-sm">{err}</div> : null}
      {msg ? <ToastHint>{msg}</ToastHint> : null}

      <div className="glass rounded-xl p-4">
  <div className="text-white font-extrabold">Internal notes</div>
  <p className="text-white/60 text-sm mt-1">Add updates that the customer can see on their Order Status page.</p>

  <div className="mt-3 space-y-3">
    <textarea
      className="input min-h-[90px]"
      value={note}
      onChange={(e)=>setNote(e.target.value)}
      placeholder="Write an update for the customer..."
    />
    <MotionButton className="btn-secondary w-full" onClick={addNote} disabled={saving || note.trim().length < 2}>
      {saving ? "Saving..." : "Add note"}
    </MotionButton>
  </div>

  <div className="mt-4 space-y-2">
    {order.notes?.length ? order.notes.map((n) => (
      <div key={n.id} className="bg-white/5 border border-white/10 rounded-xl p-3">
        <div className="text-white/60 text-xs">{new Date(n.createdAt).toLocaleString()} • {n.author?.name || "Admin"}</div>
        <div className="text-white mt-1">{n.content}</div>
      </div>
    )) : (
      <div className="text-white/50 text-sm">No notes yet.</div>
    )}
  </div>
</div>

{order.resumeFileUrl ? (
        <a className="btn-secondary w-full" href={order.resumeFileUrl} target="_blank">Download Resume</a>
      ) : (
        <div className="text-white/50 text-sm">No resume uploaded.</div>
      )}
    </div>
  );
}
