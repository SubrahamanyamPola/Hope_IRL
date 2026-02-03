"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";

function NavLink({ href, children }) {
  const path = usePathname();
  const active = path === href;
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
        active ? "bg-white/10 border border-white/10" : "hover:bg-white/10"
      }`}
    >
      {children}
    </Link>
  );
}

export function Navbar() {
  const { data } = useSession();
  const role = data?.user?.role;

  return (
    <header className="relative z-20 border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <motion.div
            initial={{ rotate: -4, scale: 0.9, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="h-10 w-10 rounded-2xl bg-white/10 border border-white/10 grid place-items-center shadow-glow"
          >
            <span className="text-sky-300 font-black">H</span>
          </motion.div>
          <div className="leading-tight">
            <div className="text-white font-extrabold tracking-wide">HOPE_IRL</div>
            <div className="text-white/60 text-xs">Career Support • Ireland & EU</div>
          </div>
        </Link>

        <nav className="flex items-center gap-1 text-white">
          <NavLink href="/">Home</NavLink>
          {data?.user ? (
            <>
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/cart">Cart</NavLink>
              <NavLink href="/orders">Orders</NavLink>
              <NavLink href="/account">Account</NavLink>
              {role === "admin" && <NavLink href="/admin">Admin</NavLink>}
              <button
                className="ml-2 btn-secondary"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink href="/auth/login">Login</NavLink>
              <NavLink href="/auth/signup">Sign up</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
