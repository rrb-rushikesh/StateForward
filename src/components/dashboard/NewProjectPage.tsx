"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Box, Code, Database, Server, Check } from "lucide-react";
import { useProjectStore } from "@/lib/store/project-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FRAMEWORK_OPTIONS = {
  frontend: [
    { value: "nextjs", label: "Next.js", description: "React framework with SSR/SSG" },
    { value: "react", label: "React (Vite)", description: "SPA with Vite bundler" },
    { value: "vue", label: "Vue (Nuxt)", description: "Vue framework with SSR" },
  ],
  backend: [
    { value: "express", label: "Express.js", description: "Node.js web framework" },
    { value: "fastify", label: "Fastify", description: "Fast Node.js framework" },
    { value: "nestjs", label: "NestJS", description: "Structured Node.js framework" },
    { value: "django", label: "Django", description: "Python web framework" },
    { value: "flask", label: "Flask", description: "Lightweight Python framework" },
    { value: "go", label: "Go (Gin)", description: "Go HTTP framework" },
  ],
  database: [
    { value: "postgresql", label: "PostgreSQL", description: "Relational SQL database" },
    { value: "mongodb", label: "MongoDB", description: "NoSQL document database" },
    { value: "mysql", label: "MySQL", description: "Relational SQL database" },
    { value: "sqlite", label: "SQLite", description: "Embedded SQL database" },
    { value: "redis", label: "Redis", description: "In-memory data store" },
  ],
};

type StackCategory = "frontend" | "backend" | "database";

export default function NewProjectPage() {
  const router = useRouter();
  const { createProject } = useProjectStore();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [stack, setStack] = useState<Record<StackCategory, string | null>>({
    frontend: null,
    backend: null,
    database: null,
  });
  const [stackCategory, setStackCategory] = useState<StackCategory>("frontend");

  const handleSelectStack = (category: StackCategory, value: string) => {
    setStack((prev) => ({ ...prev, [category]: value }));
    const categories: StackCategory[] = ["frontend", "backend", "database"];
    const currentIndex = categories.indexOf(category);
    if (currentIndex < categories.length - 1) {
      setStackCategory(categories[currentIndex + 1]);
    }
  };

  const handleCreate = useCallback(() => {
    if (!name.trim()) return;
    const finalStack = {
      frontend: stack.frontend || undefined,
      backend: stack.backend || undefined,
      database: stack.database || undefined,
    } as { frontend?: string; backend?: string; database?: string };
    
    const id = createProject(
      name.trim(),
      description.trim(),
      finalStack as any
    );
    router.push(`/app/projects/${id}`);
  }, [name, description, stack, createProject, router]);

  const steps = [
    { label: "Name", completed: !!name },
    { label: "Stack", completed: !!stack.frontend },
    { label: "Review", completed: false },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Top bar */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/app" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Box className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">New Project</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.label} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  i === step
                    ? "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300"
                    : s.completed
                    ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                    : "text-zinc-400"
                )}
              >
                {s.completed ? <Check className="w-3 h-3" /> : <span className="w-3 h-3 rounded-full border border-current" />}
                {s.label}
              </div>
              {i < steps.length - 1 && (
                <div className="w-8 h-px bg-zinc-200 dark:bg-zinc-800" />
              )}
            </div>
          ))}
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My SaaS App"
                className="w-full h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 text-lg font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                Description <span className="text-zinc-400">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description of your project..."
                className="w-full h-24 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(1)} disabled={!name.trim()}>
                Choose Stack
              </Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-6">
                {(["frontend", "backend", "database"] as StackCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setStackCategory(cat)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                      stackCategory === cat
                        ? "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 border border-transparent"
                    )}
                  >
                    {cat === "frontend" && <Code className="w-4 h-4" />}
                    {cat === "backend" && <Server className="w-4 h-4" />}
                    {cat === "database" && <Database className="w-4 h-4" />}
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    {stack[cat] && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </button>
                ))}
              </div>

              <div className="grid gap-3">
                {FRAMEWORK_OPTIONS[stackCategory].map((opt) => {
                  const isSelected = stack[stackCategory] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSelectStack(stackCategory, opt.value)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border text-left transition-all",
                        isSelected
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950"
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          stackCategory === "frontend" && "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600",
                          stackCategory === "backend" && "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600",
                          stackCategory === "database" && "bg-amber-100 dark:bg-amber-950/50 text-amber-600"
                        )}
                      >
                        {stackCategory === "frontend" && <Code className="w-5 h-5" />}
                        {stackCategory === "backend" && <Server className="w-5 h-5" />}
                        {stackCategory === "database" && <Database className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {opt.label}
                        </div>
                        <div className="text-xs text-zinc-500">{opt.description}</div>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-indigo-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button
                onClick={() => setStep(2)}
              >
                Review
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Project Name</label>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-1">{name}</p>
                </div>
                {description && (
                  <div>
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Description</label>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{description}</p>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Stack</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {stack.frontend && (
                      <span className="text-xs px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-mono">
                        {stack.frontend}
                      </span>
                    )}
                    {stack.backend && (
                      <span className="text-xs px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-mono">
                        {stack.backend}
                      </span>
                    )}
                    {stack.database && (
                      <span className="text-xs px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-mono">
                        {stack.database}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleCreate}>
                Create Project
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
