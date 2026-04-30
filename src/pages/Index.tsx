import { useMemo, useState } from "react";
import { useStore } from "@/store/useStore";
import { LoginScreen } from "@/components/LoginScreen";
import { Sidebar } from "@/components/Sidebar";
import { NotesList } from "@/components/NotesList";
import { NoteDetail } from "@/components/NoteDetail";
import { GraphView } from "@/components/GraphView";
import { NoteEditor } from "@/components/NoteEditor";
import type { Note } from "@/data/mockNotes";

const Index = () => {
  const { user, notes, selectedId, select } = useStore();
  const [view, setView] = useState<"dashboard" | "graph">("dashboard");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notes.filter((n) => {
      if (category && n.category !== category) return false;
      if (!q) return true;
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [notes, search, category]);

  if (!user) return <LoginScreen />;

  const selected = notes.find((n) => n.id === selectedId);
  const showDetail = view === "dashboard" && selected;

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar
        view={view}
        setView={setView}
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        onCreate={() => {
          setEditing(null);
          setEditorOpen(true);
        }}
      />

      <main className="flex-1 min-w-0 flex">
        {view === "dashboard" ? (
          <>
            <div className={`flex-1 min-w-0 overflow-y-auto ${showDetail ? "max-w-[60%] xl:max-w-[55%]" : ""}`}>
              <header className="px-8 pt-8 pb-6 sticky top-0 bg-background/80 backdrop-blur-xl z-10 border-b border-border/40">
                <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-1">
                  {category ?? "All"} · Dashboard
                </div>
                <h1 className="font-display text-3xl font-bold">
                  {category ? category : "Your knowledge base"}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {filtered.length} note{filtered.length === 1 ? "" : "s"}
                  {search && <> matching <span className="text-foreground">"{search}"</span></>}
                </p>
              </header>
              <div className="p-8">
                <NotesList notes={filtered} />
              </div>
            </div>
            {showDetail && (
              <div className="w-[40%] xl:w-[45%] min-w-[420px] h-screen sticky top-0">
                <NoteDetail
                  onEdit={() => {
                    setEditing(selected);
                    setEditorOpen(true);
                  }}
                  onClose={() => select(null)}
                />
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 p-8 flex flex-col">
            <header className="mb-6">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-1">
                Visualization
              </div>
              <h1 className="font-display text-3xl font-bold">Knowledge graph</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Click a node to focus a note. Hover to highlight its connections.
              </p>
            </header>
            <div className="flex-1 min-h-0">
              <GraphView />
            </div>
          </div>
        )}
      </main>

      <NoteEditor open={editorOpen} onOpenChange={setEditorOpen} editing={editing} />
    </div>
  );
};

export default Index;
