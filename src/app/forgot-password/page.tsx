'use client';

import Link from "next/link";
import { FormEvent, useState } from "react";
import AppLogo from "@/components/ui/AppLogo";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not send reset email.");
      }
      setMessage(data.message);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not send reset email.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md flex-col justify-center">
        <Link href="/" className="mb-10 flex items-center justify-center gap-3">
          <AppLogo />
          <span className="text-xl font-bold">DOCMIND AI</span>
        </Link>
        <section className="rounded-2xl border border-border/60 bg-card/70 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="mb-8 text-center">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-primary">Account recovery</p>
            <h1 className="text-3xl font-black tracking-tight">Forgot password?</h1>
            <p className="mt-3 text-sm text-muted-foreground">Enter your email and we&apos;ll send a reset link.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block text-sm font-semibold">
              Email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-primary" />
            </label>
            {error && <p className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</p>}
            {message && <p className="rounded-lg border border-green-400/30 bg-green-400/10 px-4 py-3 text-sm text-green-300">{message}</p>}
            <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-black uppercase tracking-widest text-primary-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? "Sending..." : "Send reset email"}
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Remembered your password?{" "}
            <Link href="/login" className="font-bold text-primary hover:text-accent">Log in</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
