import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from "react";
import { type Note, type Priority } from "@/data/mockNotes";
import { api } from "@/lib/api";
import { toast } from "sonner";

export type { Note, Priority };
export type { Task } from "@/data/mockNotes";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  nickname?: string;
  loginType: "personal" | "corporate";
  corporationId?: string;
  role?: string;
}

interface Store {
  user: User | null;
  token: string | null;
  loading: boolean;
  loginPersonal: (email: string, password: string, name?: string) => Promise<void>;
  loginCorporate: (
    corporationName: string,
    userName: string,
    adminPassword?: string,
    isRegister?: boolean,
    adminEmail?: string,
    adminName?: string
  ) => Promise<void>;
  logout: () => void;

  notes: Note[];
  selectedId: string | null;
  select: (id: string | null) => void;
  upsert: (note: Note) => Promise<void>;
  toggleTask: (noteId: string, taskId: string) => Promise<void>;
  addTask: (noteId: string, description: string, priority: Priority) => Promise<void>;
  createNote: (data: { title: string; content: string; category: string; keywords: string[] }) => Promise<string>;
  deleteNote: (id: string) => Promise<void>;
}

const StoreCtx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("neuranote_token"));
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Sync user profile and notes whenever token changes
  useEffect(() => {
    if (token) {
      setLoading(true);
      Promise.all([
        api.get<any>("/auth/me"),
        api.get<any[]>("/notes")
      ])
        .then(([profileData, notesData]) => {
          // Map backend schemas (with possible snake_case fields) to client schema
          setUser({
            id: profileData.id || profileData._id,
            name: profileData.name,
            email: profileData.email,
            avatar: profileData.avatar,
            nickname: profileData.nickname,
            loginType: profileData.login_type || profileData.loginType,
            corporationId: profileData.corporation_id || profileData.corporationId,
            role: profileData.role
          });
          
          const mappedNotes = mapNotes(notesData);
          setNotes(mappedNotes);
          if (mappedNotes.length > 0) {
            setSelectedId(mappedNotes[0].id);
          } else {
            setSelectedId(null);
          }
        })
        .catch((err) => {
          console.error("Erro ao carregar sessão ativa:", err);
          // Token is invalid/expired
          localStorage.removeItem("neuranote_token");
          setToken(null);
          setUser(null);
          setNotes([]);
          setSelectedId(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setUser(null);
      setNotes([]);
      setSelectedId(null);
    }
  }, [token]);

  const mapNotes = (notesData: any[]): Note[] => {
    return notesData.map((note: any) => ({
      id: note._id || note.id,
      title: note.title,
      content: note.content,
      category: note.category,
      keywords: note.keywords || [],
      connections: note.connections || [],
      tasks: (note.tasks || []).map((t: any) => ({
        id: t.id,
        description: t.description,
        completed: t.completed,
        priority: t.priority
      })),
      attachments: (note.attachments || []).map((a: any) => ({
        id: a.id,
        name: a.name,
        type: a.file_type || a.type,
        size: a.size ? (a.size > 1024 * 1024 ? `${(a.size / (1024 * 1024)).toFixed(1)} MB` : `${(a.size / 1024).toFixed(0)} KB`) : "0 KB"
      })),
      history: (note.history || []).map((h: any) => ({
        id: h.id,
        timestamp: h.timestamp ? new Date(h.timestamp).toISOString().slice(0, 16).replace("T", " ") : "",
        action: h.action,
        summary: h.summary
      })),
      location: note.location || "Local",
      createdAt: note.created_at ? new Date(note.created_at).toISOString().slice(0, 10) : "",
      updatedAt: note.updated_at ? new Date(note.updated_at).toISOString().slice(0, 10) : ""
    }));
  };

  const value = useMemo<Store>(() => ({
    user,
    token,
    loading,
    loginPersonal: async (email, password, name) => {
      setLoading(true);
      try {
        let res;
        if (name) {
          // Register
          res = await api.post<{ access_token: string }>("/auth/register/personal", { email, password, name });
          toast.success("Conta criada com sucesso");
        } else {
          // Login
          res = await api.post<{ access_token: string }>("/auth/login", { email, password });
          toast.success("Entrada efetuada com sucesso");
        }
        localStorage.setItem("neuranote_token", res.access_token);
        setToken(res.access_token);
      } catch (err: any) {
        toast.error(err.message || "Erro na autenticação pessoal");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    loginCorporate: async (corpName, userName, adminPassword, isRegister, adminEmail, adminName) => {
      setLoading(true);
      try {
        let res;
        if (isRegister) {
          // Criar corporação
          res = await api.post<{ access_token: string }>("/auth/register/corporate", {
            name: corpName,
            admin_email: adminEmail,
            admin_password: adminPassword,
            admin_name: adminName
          });
          toast.success("Corporação criada e administrador registrado");
        } else {
          // Login na corporação
          res = await api.post<{ access_token: string }>("/auth/login/corporate", {
            corporation_name: corpName,
            user_name: userName,
            admin_password: adminPassword
          });
          toast.success("Entrada corporativa efetuada");
        }
        localStorage.setItem("neuranote_token", res.access_token);
        setToken(res.access_token);
      } catch (err: any) {
        toast.error(err.message || "Erro na autenticação corporativa");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    logout: () => {
      localStorage.removeItem("neuranote_token");
      setToken(null);
      setUser(null);
      setNotes([]);
      setSelectedId(null);
      toast.success("Sessão encerrada");
    },

    notes,
    selectedId,
    select: setSelectedId,
    upsert: async (note) => {
      try {
        const payload = {
          title: note.title,
          content: note.content,
          category: note.category,
          keywords: note.keywords,
          connections: note.connections,
          tasks: note.tasks.map((t) => ({
            id: t.id,
            description: t.description,
            completed: t.completed,
            priority: t.priority
          })),
          attachments: note.attachments.map((a) => ({
            id: a.id,
            name: a.name,
            file_type: a.type,
            size: a.size.includes("MB") ? parseFloat(a.size) * 1024 * 1024 : parseFloat(a.size) * 1024,
            url: `/api/v1/files/download/${a.id}`
          }))
        };

        const responseNote = await api.put<any>(`/notes/${note.id}`, payload);
        
        // Re-fetch notes list from backend to fetch any newly created stub notes
        const notesData = await api.get<any[]>("/notes");
        const mappedNotes = mapNotes(notesData);
        setNotes(mappedNotes);

        toast.success("Nota atualizada com sucesso");
      } catch (err: any) {
        toast.error("Erro ao atualizar nota: " + err.message);
      }
    },
    toggleTask: async (noteId, taskId) => {
      const note = notes.find((n) => n.id === noteId);
      if (!note) return;
      const updatedTasks = note.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
      try {
        const responseNote = await api.put<any>(`/notes/${noteId}`, {
          tasks: updatedTasks.map((t) => ({
            id: t.id,
            description: t.description,
            completed: t.completed,
            priority: t.priority
          }))
        });
        setNotes((prev) =>
          prev.map((n) =>
            n.id === noteId
              ? {
                  ...n,
                  tasks: (responseNote.tasks || []).map((t: any) => ({
                    id: t.id,
                    description: t.description,
                    completed: t.completed,
                    priority: t.priority
                  })),
                  history: (responseNote.history || []).map((h: any) => ({
                    id: h.id,
                    timestamp: h.timestamp ? new Date(h.timestamp).toISOString().slice(0, 16).replace("T", " ") : "",
                    action: h.action,
                    summary: h.summary
                  }))
                }
              : n
          )
        );
      } catch (err: any) {
        toast.error("Erro ao atualizar tarefa: " + err.message);
      }
    },
    addTask: async (noteId, description, priority) => {
      const note = notes.find((n) => n.id === noteId);
      if (!note) return;
      const newTask = {
        id: Math.random().toString(36).slice(2, 9),
        description,
        priority,
        completed: false,
      };
      const updatedTasks = [...note.tasks, newTask];
      try {
        const responseNote = await api.put<any>(`/notes/${noteId}`, {
          tasks: updatedTasks.map((t) => ({
            id: t.id,
            description: t.description,
            completed: t.completed,
            priority: t.priority
          }))
        });
        setNotes((prev) =>
          prev.map((n) =>
            n.id === noteId
              ? {
                  ...n,
                  tasks: (responseNote.tasks || []).map((t: any) => ({
                    id: t.id,
                    description: t.description,
                    completed: t.completed,
                    priority: t.priority
                  })),
                  history: (responseNote.history || []).map((h: any) => ({
                    id: h.id,
                    timestamp: h.timestamp ? new Date(h.timestamp).toISOString().slice(0, 16).replace("T", " ") : "",
                    action: h.action,
                    summary: h.summary
                  }))
                }
              : n
          )
        );
        toast.success("Tarefa adicionada");
      } catch (err: any) {
        toast.error("Erro ao adicionar tarefa: " + err.message);
      }
    },
    createNote: async (data) => {
      try {
        const responseNote = await api.post<any>("/notes", {
          title: data.title || "Untitled",
          content: data.content,
          category: data.category,
          keywords: data.keywords,
          connections: [],
          tasks: [],
          attachments: []
        });
        
        // Re-fetch notes list from backend to fetch any newly created stub notes
        const notesData = await api.get<any[]>("/notes");
        const mappedNotes = mapNotes(notesData);
        setNotes(mappedNotes);

        const newNoteId = responseNote._id || responseNote.id;
        setSelectedId(newNoteId);
        toast.success("Nota criada com sucesso");
        return newNoteId;
      } catch (err: any) {
        toast.error("Erro ao criar nota: " + err.message);
        throw err;
      }
    },
    deleteNote: async (id) => {
      try {
        await api.delete(`/notes/${id}`);
        setNotes((prev) => prev.filter((n) => n.id !== id));
        setSelectedId(null);
        toast.success("Nota excluída com sucesso");
      } catch (err: any) {
        toast.error("Erro ao excluir nota: " + err.message);
      }
    }
  }), [user, token, loading, notes, selectedId]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be inside StoreProvider");
  return ctx;
}
