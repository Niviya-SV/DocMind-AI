'use client';

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import AppLogo from "@/components/ui/AppLogo";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("reset") === "success") {
      setNotice("Password reset successfully. Please log in with your new password.");
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to log in");
      }

      if (typeof data.token !== "string" || !data.token.trim()) {
        throw new Error("Login succeeded but the server did not return an authentication token.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("accessToken", data.token);
      localStorage.setItem("docmind_user", JSON.stringify(data.user));

      const profileResponse = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      if (!profileResponse.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        throw new Error("Login succeeded, but the session could not be verified. Please restart the backend and try again.");
      }

      window.location.assign("/workspace");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to log in");
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
            <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-primary">Welcome back</p>
            <h1 className="text-3xl font-black tracking-tight">Log in to DocMind</h1>
            <p className="mt-3 text-sm text-muted-foreground">Continue working with your private documents.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block text-sm font-semibold">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-primary"
              />
            </label>

            <label className="block text-sm font-semibold">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-primary"
              />
            </label>

            {notice && <p className="rounded-lg border border-green-400/30 bg-green-400/10 px-4 py-3 text-sm text-green-300">{notice}</p>}
            {error && <p className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-black uppercase tracking-widest text-primary-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link href="/forgot-password" className="text-sm font-bold text-primary hover:text-accent">
              Forgot password?
            </Link>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            New to DocMind?{" "}
            <Link href="/signup" className="font-bold text-primary hover:text-accent">Create an account</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
