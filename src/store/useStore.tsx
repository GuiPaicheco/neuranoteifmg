import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { initialNotes, type Note, type Priority } from "@/data/mockNotes";

export type { Note, Priority };
export type { Task } from "@/data/mockNotes";

interface User { name: string; email: string }

interface Store {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;

  notes: Note[];
  selectedId: string | null;
  select: (id: string | null) => void;
  upsert: (note: Note) => void;
  toggleTask: (noteId: string, taskId: string) => void;
  addTask: (noteId: string, description: string, priority: Priority) => void;
  createNote: (data: { title: string; content: string; category: string; keywords: string[] }) => string;
}

const StoreCtx = createContext<Store | null>(null);

const now = () => new Date().toISOString().slice(0, 10);
const ts = () => new Date().toISOString().slice(0, 16).replace("T", " ");
const uid = () => Math.random().toString(36).slice(2, 9);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [selectedId, setSelectedId] = useState<string | null>(initialNotes[0].id);

  const value = useMemo<Store>(() => ({
    user,
    login: (email) =>
      setUser({
        email,
        name:
          email.split("@")[0]?.replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Explorer",
      }),
    logout: () => setUser(null),

    notes,
    selectedId,
    select: setSelectedId,
    upsert: (note) =>
      setNotes((prev) =>
        prev.map((n) =>
          n.id === note.id
            ? {
                ...note,
                updatedAt: now(),
                history: [
                  { id: uid(), timestamp: ts(), action: "edited", summary: "Note updated" },
                  ...n.history,
                ],
              }
            : n,
        ),
      ),
    toggleTask: (noteId, taskId) =>
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId
            ? { ...n, tasks: n.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)) }
            : n,
        ),
      ),
    addTask: (noteId, description, priority) =>
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId
            ? {
                ...n,
                tasks: [...n.tasks, { id: uid(), description, priority, completed: false }],
                history: [
                  { id: uid(), timestamp: ts(), action: "task", summary: `Added task: ${description}` },
                  ...n.history,
                ],
              }
            : n,
        ),
      ),
    createNote: (data) => {
      const id = "n" + uid();
      const note: Note = {
        id,
        title: data.title || "Untitled",
        content: data.content,
        keywords: data.keywords,
        category: data.category,
        connections: [],
        tasks: [],
        attachments: [],
        history: [{ id: uid(), timestamp: ts(), action: "created", summary: "Note created" }],
        location: "Local",
        createdAt: now(),
        updatedAt: now(),
      };
      setNotes((prev) => [note, ...prev]);
      setSelectedId(id);
      return id;
    },
  }), [user, notes, selectedId]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be inside StoreProvider");
  return ctx;
}
