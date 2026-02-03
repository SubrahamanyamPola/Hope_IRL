"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Card, SectionTitle, MotionButton } from "../../../components/ui";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", linkedinUrl: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setMsg("");
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) { setErr(data?.error || "Signup failed"); return; }
    setMsg("Account created. Logging you in...");
    await signIn("credentials", { email: form.email, password: form.password, callbackUrl: "/dashboard" });
  };

  return (
    <div className="max-w-xl mx-auto">
      <SectionTitle title="Create account" subtitle="Get started in less than a minute." />
      <Card>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <div className="label mb-1">Full name</div>
            <input className="input" value={form.name} onChange={(e)=>update("name", e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <div className="label mb-1">Email</div>
            <input className="input" value={form.email} onChange={(e)=>update("email", e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <div className="label mb-1">Password</div>
            <input className="input" type="password" value={form.password} onChange={(e)=>update("password", e.target.value)} placeholder="Min 8 characters" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="label mb-1">Phone</div>
              <input className="input" value={form.phone} onChange={(e)=>update("phone", e.target.value)} placeholder="+353..." />
            </div>
            <div>
              <div className="label mb-1">LinkedIn URL (optional)</div>
              <input className="input" value={form.linkedinUrl} onChange={(e)=>update("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/in/..." />
            </div>
          </div>

          {err ? <div className="text-red-300 text-sm">{err}</div> : null}
          {msg ? <div className="text-emerald-300 text-sm">{msg}</div> : null}

          <MotionButton type="submit" className="btn-primary w-full">Create account</MotionButton>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-white/40 text-xs">OR</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        <MotionButton
          className="btn-secondary w-full"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        >
          Sign up with Google
        </MotionButton>

        <p className="text-white/60 text-sm mt-4">
          Already have an account? <Link className="text-sky-300 font-semibold" href="/auth/login">Login</Link>
        </p>
      </Card>
    </div>
  );
}
