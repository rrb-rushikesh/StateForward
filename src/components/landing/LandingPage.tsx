"use client";

import { useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Box, Code2, Cpu, GitBranch, Layers, Shield, Zap, Menu, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

const FEATURES = [
  {
    icon: Layers,
    title: "Visual Architecture",
    description: "Design your system on a canvas. Drag components, wire connections, build your architecture visually.",
    color: "text-indigo-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
  },
  {
    icon: Code2,
    title: "Real Code Generation",
    description: "Every design compiles into production-quality code. Validated structure, real frameworks, no lock-in.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    icon: Cpu,
    title: "Multi-Layer Design",
    description: "Zoom from system-level view down to individual components. C4-inspired, infinitely scalable.",
    color: "text-violet-500",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
  },
  {
    icon: Shield,
    title: "You Own the Code",
    description: "Not no-code. Not a black box. Every line of generated code is yours — portable, readable, editable.",
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950/30",
  },
  {
    icon: GitBranch,
    title: "Three Build Modes",
    description: "Vibe Mode (AI-driven), Dev Mode (AI-guided), Manual Mode (full control). Same output, different process.",
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    icon: Zap,
    title: "Connected Structure",
    description: "Your diagram IS the source of truth. Change the architecture, the code follows. No drift, no stale docs.",
    color: "text-cyan-500",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Design Your System",
    description: "Drag components onto the canvas from our library. Configure each node — framework, port, database type.",
  },
  {
    step: "02",
    title: "Wire the Connections",
    description: "Connect services, databases, and APIs. Define data flow, auth boundaries, and event streams visually.",
  },
  {
    step: "03",
    title: "Generate Real Code",
    description: "With one click, compile your architecture into a full project structure with package.json, configs, API clients, and more.",
  },
  {
    step: "04",
    title: "Ship What You Own",
    description: "Export as a zip or push to GitHub. You own every line — no runtime, no lock-in, no constraints.",
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Box className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">StateForward</span>
            </div>
            
            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Features</Link>
              <Link href="#how-it-works" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">How It Works</Link>
              <a href="https://github.com/rrb-rushikesh/StateForward" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">GitHub</a>
              <Link href="/app">
                <Button>
                  Launch App
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-950">
            <div className="flex flex-col gap-3">
              <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm text-zinc-600 dark:text-zinc-400 py-2">Features</Link>
              <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-sm text-zinc-600 dark:text-zinc-400 py-2">How It Works</Link>
              <Link href="/app" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">Launch App</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 via-transparent to-transparent dark:from-indigo-950/20" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                Architecture-first development
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-[1.1]">
              The diagram isn't documentation.
              <span className="block mt-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">It IS the app.</span>
            </h1>
            
            <p className="mt-6 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              Design your system architecture on a visual canvas. Get real, production-quality code you own. 
              No lock-in. No black box. The architecture is the constraint, and the code follows.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/app">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Designing
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  How It Works
                </Button>
              </Link>
            </div>

            {/* Tech stack badges */}
            <div className="mt-12 flex flex-wrap gap-2">
              {["Next.js", "React", "Express", "PostgreSQL", "MongoDB", "Redis", "Prisma"].map((tech) => (
                <span key={tech} className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 sm:py-32 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100">
              Architecture, not prompting
            </h2>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
              Most AI tools compete on better prompts. StateForward competes on structure and control.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 transition-all duration-200 hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700"
                >
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", feature.bgColor)}>
                    <Icon className={cn("w-6 h-6", feature.color)} />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 sm:py-32 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100">
              From design to code in 4 steps
            </h2>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
              The compiler pipeline turns your visual architecture into real, runnable code.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="relative">
                <div className="text-4xl font-bold text-indigo-200 dark:text-indigo-900 mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
            Architecture is the next abstraction layer
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10">
            Binary → Assembly → High-Level Languages → Architecture.
            The bigger and more complex your codebase gets, the more valuable it becomes
            to see and steer the system instead of prompting blindly.
          </p>
          <Link href="/app">
            <Button size="lg">
              Start Building
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Box className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">StateForward</span>
          </div>
          <p className="text-xs text-zinc-500">
            Architecture-first development. You own the code.
          </p>
        </div>
      </footer>
    </div>
  );
}
