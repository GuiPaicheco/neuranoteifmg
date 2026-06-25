import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "@/store/useStore";
import { MetadataPanel } from "./MetadataPanel";
import { TasksPanel } from "./TasksPanel";
import type { Priority } from "@/data/mockNotes";
import { CategoryBadge } from "./NotesList";
import {
  X, MapPin, Clock, Link2, Paperclip, FileText, Image as ImageIcon,
  Music, File, Plus, History, Pencil, Trash2, ArrowUpRight, ArrowDownLeft, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { AcademicDashboard } from "./AcademicDashboard";
import { toast } from "sonner";
import { getFileUrl } from "@/lib/api";

interface Props {
  onEdit: () => void;
  onClose: () => void;
}

const priorityStyles: Record<Priority, string> = {
  low: "bg-muted text-muted-foreground border-border",
  medium: "bg-warning/15 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30",
  high: "bg-destructive/15 text-destructive border-destructive/30",
};

const attachIcons = { pdf: FileText, image: ImageIcon, audio: Music, doc: File } as const;

export function NoteDetail({ onEdit, onClose }: Props) {
  const { t } = useTranslation();
  const { user, notes, selectedId, select, toggleTask, addTask, deleteNote, upsert } = useStore();
  const note = notes.find((n) => n.id === selectedId);
  const [taskDesc, setTaskDesc] = useState("");
  const [taskPrio, setTaskPrio] = useState<Priority>("medium");

  if (!note) {
    return <AcademicDashboard />;
  }

  // Outgoing Links (parsed from current note content)
  const outgoingLinks = notes.filter((n) => {
    if (n.id === note.id) return false;
    const regex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
    let match;
    const targets = new Set<string>();
    while ((match = regex.exec(note.content)) !== null) {
      targets.add(match[1].trim().toLowerCase());
    }
    return targets.has(n.title.toLowerCase().trim());
  });

  // Backlinks (notes referencing this note's title)
  const backlinks = notes.filter((n) => {
    if (n.id === note.id) return false;
    const regexExact = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
    let match;
    while ((match = regexExact.exec(n.content)) !== null) {
      if (match[1].trim().toLowerCase() === note.title.toLowerCase().trim()) {
        return true;
      }
    }
    return false;
  });

  // Image attachments for visual gallery
  const images = note.attachments.filter(
    (a) => a.type === "image" || a.name.match(/\.(png|jpe?g|gif|webp|svg)$/i)
  );

  return (
    <div className="h-full flex flex-col bg-card border-l border-border animate-fade-up">
      {/* Header */}
      <div className="p-6 border-b border-border flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <CategoryBadge category={note.category} />
            <span className="text-xs text-muted-foreground font-mono">{note.id}</span>
          </div>
          <h1 className="font-display text-2xl font-bold leading-tight">{note.title}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-emerald-400" />
              {t("note.lastModified")}: {note.updatedAt}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
              Local: {note.location}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-emerald-400" />
              Autor: {note.author === "user-ada-lovelace" ? "Ada Lovelace" : (note.author === user?.id ? "Você" : "Membro")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit} title="Editar Nota">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => deleteNote(note.id)} title="Excluir Nota" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} title="Fechar">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Content */}
        <section>
          <div className="prose prose-invert max-w-none">
            <MarkdownRenderer content={note.content} />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {note.keywords.map((k) => (
              <span key={k} className="text-xs font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                #{k}
              </span>
            ))}
          </div>
        </section>

        {/* Tasks */}
        <section>
          <SectionHeader>Pendências e Entregas</SectionHeader>
          <div className="space-y-2 mb-3">
            {note.tasks.length === 0 && (
              <p className="text-sm text-muted-foreground italic">Nenhuma pendência cadastrada.</p>
            )}
            {note.tasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border hover:border-border/80 transition-smooth group"
              >
                <Checkbox
                  checked={t.completed}
                  onCheckedChange={() => toggleTask(note.id, t.id)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className={`flex-1 text-sm ${t.completed ? "line-through text-muted-foreground" : ""}`}>
                  {t.description}
                </span>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${priorityStyles[t.priority]}`}>
                  {t.priority === "high" ? "Alta" : t.priority === "medium" ? "Média" : "Baixa"}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Adicionar tarefa/pendência..."
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && taskDesc.trim()) {
                  addTask(note.id, taskDesc.trim(), taskPrio);
                  setTaskDesc("");
                }
              }}
              className="bg-muted/40"
            />
            <Select value={taskPrio} onValueChange={(v) => setTaskPrio(v as Priority)}>
              <SelectTrigger className="w-32 bg-muted/40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                if (taskDesc.trim()) {
                  addTask(note.id, taskDesc.trim(), taskPrio);
                  setTaskDesc("");
                }
              }}
              size="icon"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </section>

        {/* Visual Attachment Gallery */}
        {images.length > 0 && (
          <section className="space-y-3">
            <SectionHeader icon={<ImageIcon className="h-3.5 w-3.5 text-emerald-400" />}>
              {t("note.attachmentsGallery")} ({images.length})
            </SectionHeader>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img) => (
                <div key={img.id} className="relative aspect-video rounded-lg overflow-hidden border border-border group bg-muted/40">
                  <img
                    src={getFileUrl(img.url || `/api/v1/files/download/${img.id}`)}
                    alt={img.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-200"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end text-[10px] text-white">
                    <span className="font-semibold truncate">{img.name}</span>
                    <span className="opacity-80">{img.size}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Attachments */}
        <section>
          <SectionHeader icon={<Paperclip className="h-3.5 w-3.5" />}>Todos os Anexos</SectionHeader>
          {note.attachments.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Nenhum anexo associado.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2">
              {note.attachments.map((a) => {
                const Icon = attachIcons[a.type] || File;
                const fileUrl = getFileUrl(a.url || `/api/v1/files/download/${a.id}`);
                return (
                  <a
                    key={a.id}
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border hover:border-border/80 hover:bg-muted/70 transition-smooth cursor-pointer text-card-foreground hover:text-card-foreground decoration-none"
                  >
                    <div className="h-9 w-9 rounded-md bg-secondary/20 grid place-items-center text-secondary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{a.name}</div>
                      <div className="text-xs text-muted-foreground">{a.size}</div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </section>

        {/* Manual Connections Link Dropdown */}
        <section className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
          <SectionHeader icon={<Link2 className="h-3.5 w-3.5 text-emerald-400" />}>
            {t("note.connectTo")}
          </SectionHeader>
          <div className="flex gap-2">
            <Select
              onValueChange={async (targetId) => {
                if (targetId && targetId !== note.id && !note.connections.includes(targetId)) {
                  const updatedConnections = [...note.connections, targetId];
                  await upsert({ ...note, connections: updatedConnections });
                  toast.success(t("note.connectedSuccess"));
                }
              }}
            >
              <SelectTrigger className="bg-muted/45 h-10 text-xs">
                <SelectValue placeholder="Selecione uma matéria/nota para vincular..." />
              </SelectTrigger>
              <SelectContent>
                {notes
                  .filter((n) => n.id !== note.id && !note.connections.includes(n.id))
                  .map((n) => (
                    <SelectItem key={n.id} value={n.id} className="text-xs">
                      {n.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Connected notes (Outgoing) */}
        <section>
          <SectionHeader icon={<ArrowUpRight className="h-3.5 w-3.5 text-primary" />}>
            Conexões de Saída ({outgoingLinks.length})
          </SectionHeader>
          {outgoingLinks.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Nenhum link de saída encontrado no texto.</p>
          ) : (
            <div className="grid gap-2">
              {outgoingLinks.map((c) => (
                <button
                  key={c.id}
                  onClick={() => select(c.id)}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border hover:border-primary/40 hover:bg-muted/70 transition-smooth text-left group"
                >
                  <div className="h-8 w-8 rounded-md bg-gradient-primary/20 grid place-items-center text-primary group-hover:scale-110 transition-smooth">
                    <Link2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{c.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{c.category} · {c.keywords.slice(0, 2).join(", ")}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Backlinks (Incoming) */}
        <section>
          <SectionHeader icon={<ArrowDownLeft className="h-3.5 w-3.5 text-emerald-400" />}>
            Backlinks / Referências ({backlinks.length})
          </SectionHeader>
          {backlinks.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Nenhum backlink encontrado.</p>
          ) : (
            <div className="grid gap-2">
              {backlinks.map((c) => (
                <button
                  key={c.id}
                  onClick={() => select(c.id)}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border hover:border-emerald-500/40 hover:bg-muted/70 transition-smooth text-left group"
                >
                  <div className="h-8 w-8 rounded-md bg-emerald-500/20 grid place-items-center text-emerald-400 group-hover:scale-110 transition-smooth border border-emerald-500/30">
                    <Link2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{c.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{c.category} · {c.keywords.slice(0, 2).join(", ")}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* History */}
        <section>
          <SectionHeader icon={<History className="h-3.5 w-3.5" />}>Histórico de Alterações</SectionHeader>
          <div className="relative pl-5">
            <div className="absolute left-1.5 top-1 bottom-1 w-px bg-border" />
            {note.history.map((h) => (
              <div key={h.id} className="relative pb-4 last:pb-0">
                <span className="absolute -left-3.5 top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                <div className="text-xs font-mono text-muted-foreground">{h.timestamp}</div>
                <div className="text-sm">
                  <span className="font-medium capitalize">
                    {h.action === "created" ? "Criada" : h.action === "edited" ? "Editada" : "Alterada"}
                  </span>
                  <span className="text-muted-foreground"> — {h.summary}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionHeader({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
      {icon}
      {children}
    </div>
  );
}
