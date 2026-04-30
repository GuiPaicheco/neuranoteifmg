import { useState } from "react";
import { useStore } from "@/store/useStore";
import type { Priority } from "@/data/mockNotes";
import { CategoryBadge } from "./NotesList";
import {
  X, MapPin, Clock, Link2, Paperclip, FileText, Image as ImageIcon,
  Music, File, Plus, History, Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const { notes, selectedId, select, toggleTask, addTask } = useStore();
  const note = notes.find((n) => n.id === selectedId);
  const [taskDesc, setTaskDesc] = useState("");
  const [taskPrio, setTaskPrio] = useState<Priority>("medium");

  if (!note) {
    return (
      <div className="h-full grid place-items-center text-center p-12">
        <div>
          <div className="text-6xl mb-4 opacity-30">⊙</div>
          <p className="text-muted-foreground">Select a note to view details</p>
        </div>
      </div>
    );
  }

  const connected = note.connections
    .map((id) => notes.find((n) => n.id === id))
    .filter(Boolean) as typeof notes;

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
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Updated {note.updatedAt}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{note.location}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit} title="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} title="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Content */}
        <section>
          <p className="text-foreground/90 leading-relaxed whitespace-pre-line">{note.content}</p>
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
          <SectionHeader>Tasks</SectionHeader>
          <div className="space-y-2 mb-3">
            {note.tasks.length === 0 && (
              <p className="text-sm text-muted-foreground italic">No tasks yet.</p>
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
                  {t.priority}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="New task…"
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
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
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

        {/* Connected notes */}
        <section>
          <SectionHeader icon={<Link2 className="h-3.5 w-3.5" />}>
            Connected notes ({connected.length})
          </SectionHeader>
          {connected.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No connections.</p>
          ) : (
            <div className="grid gap-2">
              {connected.map((c) => (
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

        {/* Attachments */}
        <section>
          <SectionHeader icon={<Paperclip className="h-3.5 w-3.5" />}>Attachments</SectionHeader>
          {note.attachments.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No attachments.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2">
              {note.attachments.map((a) => {
                const Icon = attachIcons[a.type];
                return (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border hover:border-border/80 transition-smooth">
                    <div className="h-9 w-9 rounded-md bg-secondary/20 grid place-items-center text-secondary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{a.name}</div>
                      <div className="text-xs text-muted-foreground">{a.size}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* History */}
        <section>
          <SectionHeader icon={<History className="h-3.5 w-3.5" />}>Edit history</SectionHeader>
          <div className="relative pl-5">
            <div className="absolute left-1.5 top-1 bottom-1 w-px bg-border" />
            {note.history.map((h) => (
              <div key={h.id} className="relative pb-4 last:pb-0">
                <span className="absolute -left-3.5 top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                <div className="text-xs font-mono text-muted-foreground">{h.timestamp}</div>
                <div className="text-sm">
                  <span className="font-medium capitalize">{h.action}</span>
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
