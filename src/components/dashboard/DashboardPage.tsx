"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, FolderOpen, Trash2, Box, ArrowRight, Code, Layers } from "lucide-react";
import { useProjectStore } from "@/lib/store/project-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";

const stackIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  nextjs: Code,
  react: Code,
  express: Code,
  fastify: Code,
  postgresql: Layers,
  mongodb: Layers,
};

export default function DashboardPage() {
  const router = useRouter();
  const { projects, deleteProject, loadProject, loadFromLocalStorage } = useProjectStore();

  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  const handleOpenProject = (id: string) => {
    loadProject(id);
    router.push(`/app/projects/${id}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Top bar */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Box className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">StateForward</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/app/projects/new">
                <Button>
                  <Plus className="w-4 h-4 mr-1" />
                  New Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Your Projects</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Design, build, and ship from architecture.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">No projects yet</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm mx-auto">
              Create your first project to start designing your system architecture visually.
            </p>
            <Link href="/app/projects/new">
              <Button>
                <Plus className="w-4 h-4 mr-1" />
                Create Project
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700"
                onClick={() => handleOpenProject(project.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Box className="w-5 h-5 text-white" />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject(project.id);
                      }}
                      className="h-8 w-8 p-0 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-base mt-3">{project.name}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2">
                    {project.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {project.stack.frontend && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-mono uppercase">
                          {project.stack.frontend}
                        </span>
                      )}
                      {project.stack.backend && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-mono uppercase">
                          {project.stack.backend}
                        </span>
                      )}
                      {project.stack.database && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-mono uppercase">
                          {project.stack.database}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                      <span>{project.nodes.length} nodes</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
