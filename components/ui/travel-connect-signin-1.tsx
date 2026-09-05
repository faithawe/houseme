"use client";

import React, { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { HouseMeLogo } from "@/components/brand/houseme-logo";
import { AuthSwitch, type AuthMode } from "@/components/ui/auth-switch";
import { RoleSelector } from "@/components/auth/role-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const STAMP = "#A6904A";
const STAMP_SOFT = "rgba(166, 144, 74, 0.45)";

type RoutePoint = { x: number; y: number; delay: number };

function DotMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const reduceMotion = useReducedMotion();

  const routes: { start: RoutePoint; end: RoutePoint; color: string }[] = [
    {
      start: { x: 100, y: 150, delay: 0 },
      end: { x: 200, y: 80, delay: 2 },
      color: STAMP,
    },
    {
      start: { x: 200, y: 80, delay: 2 },
      end: { x: 260, y: 120, delay: 4 },
      color: STAMP,
    },
    {
      start: { x: 50, y: 50, delay: 1 },
      end: { x: 150, y: 180, delay: 3 },
      color: STAMP,
    },
    {
      start: { x: 280, y: 60, delay: 0.5 },
      end: { x: 180, y: 180, delay: 2.5 },
      color: STAMP,
    },
  ];

  function generateDots(width: number, height: number) {
    const dots: { x: number; y: number; radius: number; opacity: number }[] = [];
    const gap = 12;
    const dotRadius = 1;

    for (let x = 0; x < width; x += gap) {
      for (let y = 0; y < height; y += gap) {
        const isInMapShape =
          (x < width * 0.25 && x > width * 0.05 && y < height * 0.4 && y > height * 0.1) ||
          (x < width * 0.25 && x > width * 0.15 && y < height * 0.8 && y > height * 0.4) ||
          (x < width * 0.45 && x > width * 0.3 && y < height * 0.35 && y > height * 0.15) ||
          (x < width * 0.5 && x > width * 0.35 && y < height * 0.65 && y > height * 0.35) ||
          (x < width * 0.7 && x > width * 0.45 && y < height * 0.5 && y > height * 0.1) ||
          (x < width * 0.8 && x > width * 0.65 && y < height * 0.8 && y > height * 0.6);

        if (isInMapShape && Math.random() > 0.3) {
          dots.push({
            x,
            y,
            radius: dotRadius,
            opacity: Math.random() * 0.5 + 0.25,
          });
        }
      }
    }
    return dots;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas?.parentElement) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
      canvas.width = width;
      canvas.height = height;
    });

    resizeObserver.observe(canvas.parentElement);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const maybeCtx = canvas.getContext("2d");
    if (!maybeCtx) return;
    const context: CanvasRenderingContext2D = maybeCtx;

    const dots = generateDots(dimensions.width, dimensions.height);
    let animationFrameId = 0;
    let startTime = Date.now();

    function drawDots() {
      context.clearRect(0, 0, dimensions.width, dimensions.height);
      dots.forEach((dot) => {
        context.beginPath();
        context.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(166, 144, 74, ${dot.opacity})`;
        context.fill();
      });
    }

    function drawRoutes() {
      const currentTime = (Date.now() - startTime) / 1000;

      routes.forEach((route) => {
        const elapsed = currentTime - route.start.delay;
        if (elapsed <= 0) return;

        const progress = reduceMotion ? 1 : Math.min(elapsed / 3, 1);
        const x = route.start.x + (route.end.x - route.start.x) * progress;
        const y = route.start.y + (route.end.y - route.start.y) * progress;

        context.beginPath();
        context.moveTo(route.start.x, route.start.y);
        context.lineTo(x, y);
        context.strokeStyle = route.color;
        context.lineWidth = 1.5;
        context.stroke();

        context.beginPath();
        context.arc(route.start.x, route.start.y, 3, 0, Math.PI * 2);
        context.fillStyle = route.color;
        context.fill();

        context.beginPath();
        context.arc(x, y, 3, 0, Math.PI * 2);
        context.fillStyle = STAMP;
        context.fill();

        context.beginPath();
        context.arc(x, y, 6, 0, Math.PI * 2);
        context.fillStyle = STAMP_SOFT;
        context.fill();

        if (progress === 1) {
          context.beginPath();
          context.arc(route.end.x, route.end.y, 3, 0, Math.PI * 2);
          context.fillStyle = route.color;
          context.fill();
        }
      });
    }

    function animate() {
      drawDots();
      drawRoutes();
      const currentTime = (Date.now() - startTime) / 1000;
      if (!reduceMotion && currentTime > 15) {
        startTime = Date.now();
      }
      if (!reduceMotion) {
        animationFrameId = requestAnimationFrame(animate);
      }
    }

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [dimensions, reduceMotion]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}

function loginErrorMessage(code?: string | null) {
  switch (code) {
    case "account_locked":
      return "Too many failed attempts. Try again in a few minutes.";
    case "email_not_verified":
      return "Verify your email before logging in.";
    case "Configuration":
      return "Auth is misconfigured. Check AUTH_SECRET and restart the server.";
    default:
      return "Invalid email or password.";
  }
}

function LoginPanel() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/auth/callback";
  const registered = searchParams.get("registered") === "1";
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (!result) {
        setError("Could not reach the auth server. Refresh and try again.");
        return;
      }
      if (result.error) {
        setError(loginErrorMessage(result.code ?? result.error));
        return;
      }
      window.location.assign(result.url ?? "/auth/callback");
    } catch {
      setError("Something went wrong signing in. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <h1 className="font-display text-2xl font-semibold text-ink md:text-3xl">
        Welcome back
      </h1>
      <p className="mt-1 text-sm text-navy-600">
        Sign in to save favorites, list a property, or manage reviews.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        {registered ? (
          <p className="rounded-xl border border-palm/30 bg-palm-100 px-3 py-2 text-sm text-ink">
            Account created. You can log in now.
          </p>
        ) : null}
        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-stamp/30 bg-stamp/10 px-3 py-2 text-sm text-ink"
          >
            {error}
          </p>
        ) : null}

        <div>
          <label htmlFor="auth-email" className="mb-1.5 block text-sm font-medium text-ink">
            Email <span className="text-stamp">*</span>
          </label>
          <Input
            id="auth-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="auth-password" className="mb-1.5 block text-sm font-medium text-ink">
            Password <span className="text-stamp">*</span>
          </label>
          <div className="relative">
            <Input
              id="auth-password"
              name="password"
              type={isPasswordVisible ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              required
              disabled={loading}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-navy-400 hover:text-ink"
              onClick={() => setIsPasswordVisible((v) => !v)}
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            >
              {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          className="pt-1"
        >
          <Button
            type="submit"
            variant="stamp"
            disabled={loading}
            className={cn(
              "relative w-full overflow-hidden",
              isHovered && "shadow-slip-hover",
            )}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? "Signing in…" : "Log in"}
              {!loading ? <ArrowRight className="h-4 w-4" /> : null}
            </span>
            <AnimatePresence>
              {isHovered && !loading ? (
                <motion.span
                  initial={{ left: "-100%" }}
                  animate={{ left: "100%" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: "easeInOut" }}
                  className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-transparent via-white/35 to-transparent"
                  style={{ filter: "blur(6px)" }}
                />
              ) : null}
            </AnimatePresence>
          </Button>
        </motion.div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <Link
            href="/auth/forgot-password"
            className="text-stamp hover:text-stamp-700"
          >
            Forgot password?
          </Link>
          <p className="text-xs text-navy-400">
            Demo tenant: tenant@houseme.ng / Tenant1!House
            <br />
            Demo landlord: landlord@houseme.ng / Landlord1!House
          </p>
        </div>
      </form>
    </motion.div>
  );
}

function formatAuthFields(fields?: Record<string, string[] | undefined>) {
  if (!fields) return null;
  const messages = Object.entries(fields)
    .flatMap(([key, value]) =>
      (value ?? []).map((msg) => `${key}: ${msg}`),
    )
    .slice(0, 3);
  return messages.length ? messages.join(" · ") : null;
}

function RegisterPanel() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/auth/callback";
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? ""),
      password: String(formData.get("password") ?? ""),
      role: String(formData.get("role") ?? "tenant"),
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();

      if (!response.ok) {
        setError(
          formatAuthFields(body?.error?.details?.fields) ??
            body?.error?.message ??
            "Registration failed.",
        );
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email: payload.email,
        password: payload.password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error || !result) {
        window.location.assign("/auth/login?registered=1");
        return;
      }

      window.location.assign(result.url ?? "/auth/callback");
    } catch {
      setError("Network error. Try again.");
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <h1 className="font-display text-2xl font-semibold text-ink md:text-3xl">
        Create account
      </h1>
      <p className="mt-1 text-sm text-navy-600">
        Tenant or landlord — one account for searching or listing verified housing.
      </p>

      <form className="mt-6 space-y-3.5" onSubmit={handleSubmit}>
        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-stamp/30 bg-stamp/10 px-3 py-2 text-sm text-ink"
          >
            {error}
          </p>
        ) : null}

        <RoleSelector />

        <div>
          <label htmlFor="reg-name" className="mb-1.5 block text-sm font-medium text-ink">
            Full name <span className="text-stamp">*</span>
          </label>
          <Input id="reg-name" name="name" placeholder="Full name" required disabled={loading} />
        </div>

        <div>
          <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-ink">
            Email <span className="text-stamp">*</span>
          </label>
          <Input
            id="reg-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="reg-phone" className="mb-1.5 block text-sm font-medium text-ink">
            Phone <span className="text-stamp">*</span>
          </label>
          <Input
            id="reg-phone"
            name="phone"
            type="tel"
            placeholder="Phone / WhatsApp"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium text-ink">
            Password <span className="text-stamp">*</span>
          </label>
          <div className="relative">
            <Input
              id="reg-password"
              name="password"
              type={isPasswordVisible ? "text" : "password"}
              autoComplete="new-password"
              placeholder="8+ chars, upper, number, symbol"
              required
              disabled={loading}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-navy-400 hover:text-ink"
              onClick={() => setIsPasswordVisible((v) => !v)}
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            >
              {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          className="pt-1"
        >
          <Button
            type="submit"
            variant="stamp"
            disabled={loading}
            className={cn(
              "relative w-full overflow-hidden",
              isHovered && "shadow-slip-hover",
            )}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? "Creating account…" : "Create account"}
              {!loading ? <ArrowRight className="h-4 w-4" /> : null}
            </span>
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}

export function TravelConnectSignIn({ mode = "login" }: { mode?: AuthMode }) {
  return (
    <div className="flex w-full items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="flex w-full max-w-4xl overflow-hidden rounded-2xl border border-line/80 bg-white shadow-[0_24px_80px_-20px_rgba(0,0,0,0.28),0_8px_24px_-8px_rgba(0,0,0,0.12)]"
      >
        <div className="relative hidden h-[min(640px,85vh)] w-1/2 overflow-hidden border-r border-line md:block">
          <div className="absolute inset-0 bg-gradient-to-br from-palm-100 via-white to-white">
            <DotMap />
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8">
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.45 }}
                className="mb-2"
              >
                <HouseMeLogo size="lg" />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.45 }}
                className="mt-2 max-w-xs text-center text-sm text-navy-600"
              >
                Verified rooms nationwide for students, NYSC corps members, and
                interns — without the agent fee.
              </motion.p>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col justify-center bg-white p-6 md:w-1/2 md:p-10">
          <AuthSwitch mode={mode} className="mb-6" />
          {mode === "login" ? <LoginPanel /> : <RegisterPanel />}
        </div>
      </motion.div>
    </div>
  );
}

export default function Index() {
  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center bg-gradient-to-br from-palm-100/80 via-white to-white p-4">
      <TravelConnectSignIn mode="login" />
    </div>
  );
}

export const Component = TravelConnectSignIn;
