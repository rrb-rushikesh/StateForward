"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Box, Save, Download, Settings } from "lucide-react";
import { useProjectStore } from "@/lib/store/project-store";
import ArchitectureCanvas from "@/components/canvas/ArchitectureCanvas";
import { Button } from "@/components/ui/button";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const { currentProject, loadProject, loadFromLocalStorage } = useProjectStore();

  useEffect(() => {
    loadFromLocalStorage();
    if (params.id) {
      loadProject(params.id as string);
    }
  }, [params.id, loadProject, loadFromLocalStorage]);

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">Project not found</h2>
          <p className="text-sm text-zinc-500 mb-4">The project you're looking for doesn't exist.</p>
          <Link href="/app">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Editor top bar */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/app"
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Box className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {currentProject.name}
              </h1>
              <p className="text-xs text-zinc-500">
                {currentProject.nodes.length} nodes · {currentProject.edges.length} connections
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Save className="w-3.5 h-3.5 mr-1" />
            Auto-saved
          </Button>
          <Button size="sm" className="h-8 text-xs" onClick={() => router.push("/app")}>
            Exit
          </Button>
        </div>
      </header>

      {/* Canvas area */}
      <div className="flex-1 overflow-hidden">
        <ArchitectureCanvas />
      </div>
    </div>
  );
}
