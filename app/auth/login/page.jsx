"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { Card, SectionTitle, MotionButton } from "../../../components/ui";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const onCredentials = async (e) => {
    e.preventDefault();
    setErr("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/dashboard"
    });
    if (res?.error) setErr("Invalid credentials");
  };

  return (
    <div className="max-w-xl mx-auto">
      <SectionTitle title="Login" subtitle="Welcome back. Continue your HOPE_IRL journey." />
      <Card>
        <form onSubmit={onCredentials} className="space-y-4">
          <div>
            <div className="label mb-1">Email</div>
            <input className="input" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <div className="label mb-1">Password</div>
            <input className="input" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {err ? <div className="text-red-300 text-sm">{err}</div> : null}
          <MotionButton type="submit" className="btn-primary w-full">Login</MotionButton>
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
          Continue with Google
        </MotionButton>

        <p className="text-white/60 text-sm mt-4">
          No account? <Link className="text-sky-300 font-semibold" href="/auth/signup">Create one</Link>
        </p>
      </Card>
    </div>
  );
}
