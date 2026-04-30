import { useStore } from "@/store/useStore";
import type { Note } from "@/data/mockNotes";
import { CheckCircle2, Link2, Calendar } from "lucide-react";

interface Props {
  notes: Note[];
}

export function NotesList({ notes }: Props) {
  const { selectedId, select } = useStore();

  if (notes.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        <div className="text-4xl mb-2">∅</div>
        No notes match your search.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {notes.map((n, i) => {
        const active = n.id === selectedId;
        const open = n.tasks.filter((t) => !t.completed).length;
        return (
          <button
            key={n.id}
            onClick={() => select(n.id)}
            style={{ animationDelay: `${i * 30}ms` }}
            className={`text-left p-5 rounded-xl border transition-smooth animate-fade-up group relative overflow-hidden ${
              active
                ? "border-primary/60 bg-card shadow-glow"
                : "border-border bg-card/60 hover:border-border/80 hover:bg-card hover:-translate-y-0.5"
            }`}
          >
            <div className="absolute top-0 right-0 h-20 w-20 bg-gradient-primary opacity-0 group-hover:opacity-10 blur-2xl transition-opacity" />
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-display font-semibold text-base leading-snug line-clamp-2">{n.title}</h3>
              <CategoryBadge category={n.category} />
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{n.content}</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {n.keywords.slice(0, 3).map((k) => (
                <span key={k} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  #{k}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Link2 className="h-3 w-3" />{n.connections.length}</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />{open} open</span>
              <span className="flex items-center gap-1 ml-auto"><Calendar className="h-3 w-3" />{n.updatedAt}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

const categoryStyles: Record<string, string> = {
  Study: "bg-primary/15 text-primary border-primary/30",
  Work: "bg-secondary/15 text-secondary border-secondary/30",
  Personal: "bg-accent/15 text-accent border-accent/30",
  Research: "bg-success/15 text-[hsl(var(--success))] border-[hsl(var(--success))]/30",
  Ideas: "bg-warning/15 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30",
};

export function CategoryBadge({ category }: { category: string }) {
  const cls = categoryStyles[category] || "bg-muted text-muted-foreground border-border";
  return (
    <span className={`shrink-0 text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border ${cls}`}>
      {category}
    </span>
  );
}
