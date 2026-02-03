"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MotionButton, ToastHint } from "../../components/ui";

export function DashboardClient({ services, orderId, existingItems }) {
  const [selected, setSelected] = useState(() => new Set(existingItems.map((x) => x.serviceId)));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const toggle = (service) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(service.id)) n.delete(service.id);
      else n.add(service.id);
      return n;
    });
  };

  const save = async () => {
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/cart/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, serviceIds: Array.from(selected) })
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setMsg(data?.error || "Failed to save"); return; }
    setMsg("Saved to cart ✅");
  };

  return (
    <div className="mt-5 grid md:grid-cols-3 gap-4">
      {services.map((s) => {
        const on = selected.has(s.id);
        return (
          <motion.div
            key={s.id}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
            className={`rounded-2xl p-[1px] ${on ? "bg-gradient-to-tr from-sky-400/60 via-indigo-400/30 to-emerald-400/30" : "bg-white/10"}`}
          >
            <div className={`rounded-2xl p-4 h-full ${on ? "glass" : "bg-white/5 border border-white/10 backdrop-blur-xl"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-white font-extrabold leading-snug">{s.title}</div>
                  <div className="text-white/70 text-sm mt-1">
                    €{(s.priceCents/100).toFixed(0)} <span className="text-white/50">({s.period})</span>
                  </div>
                </div>
                <span className={`badge ${on ? "border-emerald-300/40 text-emerald-200 bg-emerald-400/10" : "border-white/15 text-white/60 bg-white/5"}`}>
                  {on ? "Selected" : "Select"}
                </span>
              </div>

              <ul className="mt-3 text-white/70 text-sm list-disc pl-5 space-y-1">
                {s.bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>

              <MotionButton
                className={`${on ? "btn-secondary" : "btn-primary"} w-full mt-4`}
                onClick={() => toggle(s)}
              >
                {on ? "Remove" : "Add to cart"}
              </MotionButton>
            </div>
          </motion.div>
        );
      })}

      <div className="md:col-span-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center mt-2">
          <MotionButton className="btn-primary" onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save selections"}
          </MotionButton>
          <div className="text-white/60 text-sm">Your selections are saved to your current draft cart.</div>
        </div>
        {msg ? <ToastHint>{msg}</ToastHint> : null}
      </div>
    </div>
  );
}
