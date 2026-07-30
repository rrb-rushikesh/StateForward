import { create } from "zustand";
import type { Project, ArchitectureNode, ArchitectureEdge } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;

  // Project CRUD
  createProject: (name: string, description: string, stack: Project["stack"]) => string;
  deleteProject: (id: string) => void;
  loadProject: (id: string) => void;
  updateProject: (updates: Partial<Project>) => void;

  // Node operations
  addNode: (node: Omit<ArchitectureNode, "id">) => string;
  updateNode: (id: string, updates: Partial<ArchitectureNode>) => void;
  removeNode: (id: string) => void;
  moveNode: (id: string, position: { x: number; y: number }) => void;

  // Edge operations
  addEdge: (edge: Omit<ArchitectureEdge, "id">) => string;
  removeEdge: (id: string) => void;

  // Persistence
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
}

const STORAGE_KEY = "stateforward-projects";

// Seed with a demo project for first-time users
function createDemoProject(): Project {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name: "My Web App",
    description: "A full-stack web application with authentication",
    stack: { frontend: "nextjs", backend: "express", database: "postgresql" },
    nodes: [
      {
        id: "node-1",
        type: "frontend",
        label: "Web App",
        configuration: { framework: "nextjs", port: 3000, ssr: true },
        position: { x: 50, y: 200 },
      },
      {
        id: "node-2",
        type: "backend",
        label: "API Server",
        configuration: { framework: "express", port: 4000 },
        position: { x: 400, y: 200 },
      },
      {
        id: "node-3",
        type: "database",
        label: "Database",
        configuration: { type: "postgresql", port: 5432, databaseName: "myapp_db" },
        position: { x: 750, y: 200 },
      },
      {
        id: "node-4",
        type: "auth",
        label: "Auth Service",
        configuration: { provider: "jwt", sessionDuration: 3600 },
        position: { x: 400, y: 0 },
      },
    ],
    edges: [
      { id: "edge-1", source: "node-1", target: "node-2", type: "api-call", label: "API Requests" },
      { id: "edge-2", source: "node-2", target: "node-3", type: "database-query", label: "Queries" },
      { id: "edge-3", source: "node-4", target: "node-2", type: "auth", label: "Validates" },
      { id: "edge-4", source: "node-1", target: "node-4", type: "auth", label: "Login" },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,

  createProject: (name, description, stack) => {
    const id = generateId();
    const now = new Date().toISOString();
    const project: Project = {
      id,
      name,
      description,
      stack,
      nodes: [],
      edges: [],
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      projects: [...state.projects, project],
      currentProject: project,
    }));
    get().saveToLocalStorage();
    return id;
  },

  deleteProject: (id) => {
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    }));
    get().saveToLocalStorage();
  },

  loadProject: (id) => {
    const project = get().projects.find((p) => p.id === id) || null;
    set({ currentProject: project });
  },

  updateProject: (updates) => {
    set((state) => {
      if (!state.currentProject) return state;
      const updated = { ...state.currentProject, ...updates, updatedAt: new Date().toISOString() };
      return {
        currentProject: updated,
        projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
      };
    });
    get().saveToLocalStorage();
  },

  addNode: (node) => {
    const id = `node-${generateId().slice(0, 8)}`;
    set((state) => {
      if (!state.currentProject) return state;
      const updated = {
        ...state.currentProject,
        nodes: [...state.currentProject.nodes, { ...node, id }],
        updatedAt: new Date().toISOString(),
      };
      return {
        currentProject: updated,
        projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
      };
    });
    get().saveToLocalStorage();
    return id;
  },

  updateNode: (id, updates) => {
    set((state) => {
      if (!state.currentProject) return state;
      const updated = {
        ...state.currentProject,
        nodes: state.currentProject.nodes.map((n) =>
          n.id === id ? { ...n, ...updates } : n
        ),
        updatedAt: new Date().toISOString(),
      };
      return {
        currentProject: updated,
        projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
      };
    });
    get().saveToLocalStorage();
  },

  removeNode: (id) => {
    set((state) => {
      if (!state.currentProject) return state;
      const updated = {
        ...state.currentProject,
        nodes: state.currentProject.nodes.filter((n) => n.id !== id),
        edges: state.currentProject.edges.filter((e) => e.source !== id && e.target !== id),
        updatedAt: new Date().toISOString(),
      };
      return {
        currentProject: updated,
        projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
      };
    });
    get().saveToLocalStorage();
  },

  moveNode: (id, position) => {
    set((state) => {
      if (!state.currentProject) return state;
      return {
        currentProject: {
          ...state.currentProject,
          nodes: state.currentProject.nodes.map((n) =>
            n.id === id ? { ...n, position } : n
          ),
        },
      };
    });
  },

  addEdge: (edge) => {
    const id = `edge-${generateId().slice(0, 8)}`;
    set((state) => {
      if (!state.currentProject) return state;
      const updated = {
        ...state.currentProject,
        edges: [...state.currentProject.edges, { ...edge, id }],
        updatedAt: new Date().toISOString(),
      };
      return {
        currentProject: updated,
        projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
      };
    });
    get().saveToLocalStorage();
    return id;
  },

  removeEdge: (id) => {
    set((state) => {
      if (!state.currentProject) return state;
      const updated = {
        ...state.currentProject,
        edges: state.currentProject.edges.filter((e) => e.id !== id),
        updatedAt: new Date().toISOString(),
      };
      return {
        currentProject: updated,
        projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
      };
    });
    get().saveToLocalStorage();
  },

  saveToLocalStorage: () => {
    if (typeof window === "undefined") return;
    const { projects, currentProject } = get();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ projects, currentProjectId: currentProject?.id || null })
    );
  },

  loadFromLocalStorage: () => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { projects, currentProjectId } = JSON.parse(stored);
        set({
          projects: projects || [],
          currentProject: projects?.find((p: Project) => p.id === currentProjectId) || null,
        });
      } else {
        // Seed with demo project for first visit
        const demo = createDemoProject();
        set({ projects: [demo], currentProject: demo });
        get().saveToLocalStorage();
      }
    } catch {
      // On error, set demo project
      const demo = createDemoProject();
      set({ projects: [demo], currentProject: demo });
    }
  },
}));
