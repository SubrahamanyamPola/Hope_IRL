"use client";

import { useState } from "react";
import { MotionButton, ToastHint } from "../../components/ui";

export function CartClient({ order }) {
  const [form, setForm] = useState({
    fullName: order?.fullName || "",
    phone: order?.phone || "",
    linkedinUrl: order?.linkedinUrl || "",
    paymentRef: order?.paymentRef || ""
  });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const onSubmit = async () => {
    setSaving(true); setMsg(""); setErr("");
    const fd = new FormData();
    fd.append("orderId", order?.id || "");
    fd.append("fullName", form.fullName);
    fd.append("phone", form.phone);
    fd.append("linkedinUrl", form.linkedinUrl);
    fd.append("paymentRef", form.paymentRef);
    if (file) fd.append("resume", file);

    const res = await fetch("/api/checkout/submit", { method: "POST", body: fd });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setErr(data?.error || "Failed"); return; }
    setMsg("Submitted ✅ Our team will connect with you soon.");
  };

  if (!order) {
    return (
      <div className="text-white/70">
        Your cart is empty. Please select services from the dashboard.
        <div className="mt-4">
          <a className="btn-primary" href="/dashboard">Go to Dashboard</a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-extrabold text-lg">Your services</h3>
        <div className="mt-3 space-y-2">
          {order.items?.length ? order.items.map((it) => (
            <div key={it.id} className="glass rounded-xl p-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-white font-semibold">{it.title}</div>
                <div className="text-white/60 text-sm">{it.period}</div>
              </div>
              <div className="text-white font-extrabold">€{(it.priceCents/100).toFixed(0)}</div>
            </div>
          )) : (
            <div className="text-white/60">No services selected yet.</div>
          )}
        </div>
        <div className="mt-3 text-right text-white/80">
          Total: <span className="text-white font-extrabold">€{((order.totalCents || 0)/100).toFixed(0)}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="label mb-1">Full name</div>
          <input className="input" value={form.fullName} onChange={(e)=>update("fullName", e.target.value)} placeholder="Your full name" />
        </div>
        <div>
          <div className="label mb-1">Phone number</div>
          <input className="input" value={form.phone} onChange={(e)=>update("phone", e.target.value)} placeholder="+353..." />
        </div>
      </div>

      <div>
        <div className="label mb-1">LinkedIn profile URL</div>
        <input className="input" value={form.linkedinUrl} onChange={(e)=>update("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/in/..." />
      </div>

      <div>
        <div className="label mb-1">Upload resume (PDF/DOCX)</div>
        <input
          className="input"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e)=>setFile(e.target.files?.[0] || null)}
        />
        <div className="text-white/50 text-xs mt-2">
          Stored locally for dev. For production (Vercel), connect S3/R2/Supabase Storage (README explains).
        </div>
      </div>

      <div>
        <div className="label mb-1">Payment reference (after Revolut payment)</div>
        <input className="input" value={form.paymentRef} onChange={(e)=>update("paymentRef", e.target.value)} placeholder="e.g., Revolut transfer reference" />
      </div>

      {err ? <div className="text-red-300 text-sm">{err}</div> : null}
      {msg ? <ToastHint>{msg}</ToastHint> : null}

      <MotionButton className="btn-primary w-full" onClick={onSubmit} disabled={saving}>
        {saving ? "Submitting..." : "Submit & Confirm"}
      </MotionButton>

      <div className="text-white/60 text-sm">
        After submission, the admin team receives your details in the Admin panel.
      </div>
    </div>
  );
}
