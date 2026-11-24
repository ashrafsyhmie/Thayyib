"use client";

import Hls from "hls.js";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Brain,
  Clock3,
  FileCheck2,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";

const heroVideoUrl =
  "https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8";

const navItems = [
  { label: "FEATURES", href: "#features" },
  { label: "AI ANALYZER", href: "/ai-analyzer" },
  { label: "AUDIT", href: "/audit-readiness" },
  { label: "DASHBOARD", href: "/dashboard" },
];

const featureCards = [
  {
    icon: ShieldCheck,
    label: "Supplier certificates",
    value: "Track expiry, evidence, and renewal priority.",
  },
  {
    icon: Brain,
    label: "AI risk assistance",
    value: "Flag potential ingredient and document risks with confidence.",
  },
  {
    icon: FileCheck2,
    label: "Audit readiness",
    value: "Organize documents around checklist gaps before inspection.",
  },
  {
    icon: Clock3,
    label: "Smart reminders",
    value: "Surface missing evidence before it becomes audit stress.",
  },
];

export function ThayyibLandingPage({
  fontClassName,
}: {
  fontClassName: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = heroVideoUrl;
      return;
    }

    if (!Hls.isSupported()) {
      return;
    }

    const hls = new Hls({ enableWorker: false });
    hls.loadSource(heroVideoUrl);
    hls.attachMedia(video);

    return () => {
      hls.destroy();
    };
  }, []);

  return (
    <main
      className={`${fontClassName} min-h-screen overflow-hidden bg-[#070b0a] text-white [font-family:var(--font-inter)]`}
    >
      <section className="relative isolate min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_58%_22%,rgba(94,210,156,0.22),transparent_28%),linear-gradient(120deg,rgba(94,210,156,0.10),transparent_34%),#070b0a]" />
        <video
          ref={videoRef}
          aria-hidden="true"
          autoPlay
          className="absolute inset-0 h-full w-full object-cover opacity-60"
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#070b0a_0%,rgba(7,11,10,0.86)_28%,rgba(7,11,10,0.28)_67%,rgba(7,11,10,0.72)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,#070b0a_0%,rgba(7,11,10,0.72)_16%,rgba(7,11,10,0)_48%)]" />
        <div className="pointer-events-none absolute inset-y-0 left-1/4 hidden w-px bg-white/10 lg:block" />
        <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px bg-white/10 lg:block" />
        <div className="pointer-events-none absolute inset-y-0 left-3/4 hidden w-px bg-white/10 lg:block" />

        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-20 h-56 w-[760px] -translate-x-1/2 opacity-80"
          viewBox="0 0 760 220"
        >
          <defs>
            <filter id="thayyib-glow" x="-20%" y="-80%" width="140%" height="260%">
              <feGaussianBlur stdDeviation="25" />
            </filter>
          </defs>
          <ellipse
            cx="380"
            cy="86"
            fill="#123f35"
            filter="url(#thayyib-glow)"
            rx="286"
            ry="42"
          />
          <ellipse
            cx="380"
            cy="84"
            fill="#5ed29c"
            filter="url(#thayyib-glow)"
            opacity="0.34"
            rx="210"
            ry="25"
          />
        </svg>

        <header className="absolute inset-x-0 top-0 z-30">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
            <Link
              className="flex items-center gap-3 text-white"
              href="/"
              aria-label="Thayyib landing page"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 p-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)] backdrop-blur-md">
                <Image
                  alt=""
                  className="h-full w-full object-contain"
                  height={445}
                  src="/brand/thayyib-mark.png"
                  width={652}
                />
              </span>
              <span className="text-lg font-extrabold tracking-tight">Thayyib</span>
            </Link>

            <nav className="hidden items-center gap-8 lg:flex">
              {navItems.map((item) => (
                <Link
                  className="text-base font-semibold text-white/80 transition hover:text-[#5ed29c]"
                  href={item.href}
                  key={item.label}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <button
              aria-expanded={menuOpen}
              aria-label="Open menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition hover:border-[#5ed29c]/60 hover:text-[#5ed29c] lg:hidden"
              onClick={() => setMenuOpen(true)}
              type="button"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>

        {menuOpen && (
          <div className="fixed inset-0 z-50 bg-[#070b0a]/96 px-5 py-5 backdrop-blur-xl lg:hidden">
            <div className="flex items-center justify-between">
              <span className="text-lg font-extrabold tracking-tight">Thayyib</span>
              <button
                aria-label="Close menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-[#5ed29c]/60 hover:text-[#5ed29c]"
                onClick={() => setMenuOpen(false)}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-16 grid gap-6">
              {navItems.map((item) => (
                <Link
                  className="border-b border-white/10 pb-5 text-3xl font-extrabold tracking-tight text-white transition hover:text-[#5ed29c]"
                  href={item.href}
                  key={item.label}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-5 pb-36 pt-32 sm:px-8 lg:pb-44">
          <div className="max-w-3xl">
            <div className="liquid-glass-card mb-1 flex h-[200px] w-[200px] translate-y-[-50px] flex-col justify-between p-5">
              <p className="text-[14px] font-semibold tracking-[0.22em] text-white/72">
                [ 2026 ]
              </p>
              <div>
                <p className="text-[18px] font-semibold leading-tight text-white">
                  Built for{" "}
                  <span className="[font-family:var(--font-instrument-serif)] italic">
                    Halal
                  </span>{" "}
                  Compliance Teams
                </p>
                <p className="mt-3 text-[11px] leading-5 text-white/60">
                  AI-assisted findings with sources, confidence, and human
                  verification built in.
                </p>
              </div>
            </div>

            <p className="[font-family:var(--font-plus-jakarta)] text-[11px] font-bold uppercase tracking-[0.24em] text-[#5ed29c]">
              Halal Compliance Intelligence
            </p>
            <h1 className="mt-5 max-w-4xl text-[40px] font-extrabold uppercase leading-[0.92] tracking-tight text-white sm:text-6xl lg:text-[72px]">
              Become audit-ready faster
              <span className="text-[#5ed29c]">.</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-white/70">
              Thayyib helps food manufacturers organize compliance documents,
              track supplier certificates, detect potential risks, and prepare
              for halal audits with confidence.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#5ed29c] px-6 text-sm font-extrabold uppercase tracking-[0.12em] text-[#070b0a] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#5ed29c] focus:ring-offset-2 focus:ring-offset-[#070b0a]"
                href="/login?redirectTo=/ai-analyzer"
              >
                Start Compliance Check
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/16 bg-white/8 px-6 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:border-[#5ed29c]/60 hover:text-[#5ed29c] focus:outline-none focus:ring-2 focus:ring-[#5ed29c] focus:ring-offset-2 focus:ring-offset-[#070b0a]"
                href="/dashboard"
              >
                View Demo
              </Link>
            </div>

            <p className="mt-6 max-w-lg text-xs leading-6 text-white/52">
              AI analysis is assistance only. Potential risk detected. Please
              verify with a qualified halal compliance officer.
            </p>
          </div>
        </div>

        <div
          id="features"
          className="relative inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#070b0a]/72 backdrop-blur-xl lg:absolute"
        >
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-px px-5 py-3 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
            {featureCards.map((feature) => (
              <div
                className="flex min-h-24 gap-3 border-white/10 py-3 sm:px-3 lg:border-l lg:first:border-l-0"
                key={feature.label}
              >
                <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#5ed29c]/12 text-[#5ed29c]">
                  <feature.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{feature.label}</p>
                  <p className="mt-1 text-xs leading-5 text-white/56">
                    {feature.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
