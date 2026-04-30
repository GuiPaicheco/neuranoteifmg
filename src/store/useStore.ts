import { create } from "zustand";
import { initialNotes, type Note, type Task, type Priority } from "@/data/mockNotes";

interface AuthState {
  user: { name: string; email: string } | null;
  login: (email: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  login: (email) =>
    set({
      user: {
        email,
        name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Explorer",
      },
    }),
  logout: () => set({ user: null }),
}));

interface NotesState {
  notes: Note[];
  selectedId: string | null;
  select: (id: string | null) => void;
  upsert: (note: Note) => void;
  toggleTask: (noteId: string, taskId: string) => void;
  addTask: (noteId: string, description: string, priority: Priority) => void;
  createNote: (data: { title: string; content: string; category: string; keywords: string[] }) => string;
}

const now = () => new Date().toISOString().slice(0, 10);
const ts = () => new Date().toISOString().slice(0, 16).replace("T", " ");
const uid = () => Math.random().toString(36).slice(2, 9);

export const useNotes = create<NotesState>((set, get) => ({
  notes: initialNotes,
  selectedId: initialNotes[0].id,
  select: (id) => set({ selectedId: id }),
  upsert: (note) =>
    set((s) => ({
      notes: s.notes.map((n) =>
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
    })),
  toggleTask: (noteId, taskId) =>
    set((s) => ({
      notes: s.notes.map((n) =>
        n.id === noteId
          ? {
              ...n,
              tasks: n.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
            }
          : n,
      ),
    })),
  addTask: (noteId, description, priority) =>
    set((s) => ({
      notes: s.notes.map((n) =>
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
    })),
  createNote: (data) => {
    const id = "n" + uid();
    const note: Note = {
      id,
      title: data.title,
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
    set((s) => ({ notes: [note, ...s.notes], selectedId: id }));
    return id;
  },
}));

export type { Note, Task, Priority };
