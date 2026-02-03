"use client";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

export function Card({ className, children }) {
  return <div className={cn("glass rounded-2xl p-5", className)}>{children}</div>;
}

export function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl md:text-3xl font-extrabold text-white">{title}</h1>
      {subtitle ? <p className="text-white/70 mt-2">{subtitle}</p> : null}
    </div>
  );
}

export function MotionButton({ className, children, ...props }) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function ToastHint({ children }) {
  return <div className="mt-3 text-sm text-white/60">{children}</div>;
}
