"use client";

import { useState, useMemo, useCallback } from "react";
import { X, Download, FileCode, FolderTree, ChevronRight, ChevronDown, File } from "lucide-react";
import { useProjectStore } from "@/lib/store/project-store";
import { generateProject, type GeneratedFile } from "@/lib/generators";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CodePreviewPanelProps {
  onClose: () => void;
}

interface FileTreeNode {
  name: string;
  type: "file" | "folder";
  children?: FileTreeNode[];
  file?: GeneratedFile;
}

function buildFileTree(files: GeneratedFile[]): FileTreeNode {
  const root: FileTreeNode = { name: "project", type: "folder", children: [] };

  for (const file of files) {
    const parts = file.path.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (isLast) {
        current.children!.push({ name: part, type: "file", file });
      } else {
        let existing = current.children!.find((c) => c.name === part && c.type === "folder");
        if (!existing) {
          existing = { name: part, type: "folder", children: [] };
          current.children!.push(existing);
        }
        current = existing;
      }
    }
  }

  return root;
}

function FileTreeView({
  node,
  depth = 0,
  selectedFile,
  onSelectFile,
}: {
  node: FileTreeNode;
  depth?: number;
  selectedFile: string | null;
  onSelectFile: (file: GeneratedFile) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 2);

  if (node.type === "file" && node.file) {
    return (
      <button
        onClick={() => onSelectFile(node.file!)}
        className={cn(
          "flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-lg transition-colors text-left",
          selectedFile === node.file.path
            ? "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300"
            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <File className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="truncate">{node.name}</span>
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 w-full px-2 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-left"
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
      >
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        )}
        <FolderTree className="w-3.5 h-3.5 text-amber-500" />
        <span>{node.name}</span>
        <span className="text-zinc-400 ml-1">({node.children?.length})</span>
      </button>
      {expanded && node.children?.map((child, i) => (
        <FileTreeView
          key={`${child.name}-${i}`}
          node={child}
          depth={depth + 1}
          selectedFile={selectedFile}
          onSelectFile={onSelectFile}
        />
      ))}
    </div>
  );
}

export default function CodePreviewPanel({ onClose }: CodePreviewPanelProps) {
  const { currentProject } = useProjectStore();
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);

  const generated = useMemo(() => {
    if (!currentProject) return null;
    return generateProject(currentProject);
  }, [currentProject]);

  const fileTree = useMemo(() => {
    if (!generated) return null;
    return buildFileTree(generated.files);
  }, [generated]);

  const selectedFile = useMemo(() => {
    if (!generated || !selectedFilePath) return generated?.files[0] || null;
    return generated.files.find((f) => f.path === selectedFilePath) || generated.files[0];
  }, [generated, selectedFilePath]);

  const handleSelectFile = useCallback((file: GeneratedFile) => {
    setSelectedFilePath(file.path);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!generated) return;
    
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    for (const file of generated.files) {
      zip.file(file.path, file.content);
    }

    zip.file("README.md", generated.readme);

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${generated.name.toLowerCase().replace(/\s+/g, "-")}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [generated]);

  if (!generated || !fileTree) {
    return (
      <div className="w-96 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-center">
        <p className="text-sm text-zinc-500">No project to generate from</p>
      </div>
    );
  }

  return (
    <div className="w-96 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Generated Code
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="h-7 px-2 text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* File tree */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 max-h-48 overflow-y-auto p-2">
        <FileTreeView
          node={fileTree}
          selectedFile={selectedFilePath}
          onSelectFile={handleSelectFile}
        />
      </div>

      {/* Code viewer */}
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
          <span className="text-xs text-zinc-500 font-mono truncate">
            {selectedFile?.path}
          </span>
          <span className="text-xs text-zinc-400 uppercase">{selectedFile?.language}</span>
        </div>
        <div className="overflow-auto h-full p-4">
          <pre className="text-xs font-mono leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
            <code>{selectedFile?.content || "// No file selected"}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
