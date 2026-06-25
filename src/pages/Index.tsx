import { useMemo, useState } from "react";
import { useStore } from "@/store/useStore";
import { LoginSelectMode } from "@/components/LoginSelectMode";
import { LoginPersonal } from "@/components/LoginPersonal";
import { LoginCorporate } from "@/components/LoginCorporate";
import { Sidebar } from "@/components/Sidebar";
import { NotesList } from "@/components/NotesList";
import { NoteDetail } from "@/components/NoteDetail";
import { GraphView } from "@/components/GraphView";
import { NoteEditor } from "@/components/NoteEditor";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Menu, Plus } from "lucide-react";
import type { Note } from "@/data/mockNotes";

const Index = () => {
  const { user, token, loading, notes, selectedId, select, loginPersonal, loginCorporate } = useStore();
  const [loginMode, setLoginMode] = useState<"select" | "personal" | "corporate" | null>(
    user ? null : "select"
  );
  const [view, setView] = useState<"dashboard" | "graph">("dashboard");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  // If user is loaded but loginMode is still active, clear loginMode
  if (user && loginMode !== null) {
    setLoginMode(null);
  }

  // If user log out and loginMode is null, reset to select
  if (!user && loginMode === null) {
    setLoginMode("select");
  }

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

  if (!user) {
    if (loginMode === "select") {
      return (
        <LoginSelectMode
          onSelectPersonal={() => setLoginMode("personal")}
          onSelectCorporate={() => setLoginMode("corporate")}
        />
      );
    }
    if (loginMode === "personal") {
      return (
        <LoginPersonal
          isLoading={loading}
          onBack={() => setLoginMode("select")}
          onLogin={async (email, password, name) => {
            try {
              await loginPersonal(email, password, name);
              setLoginMode(null);
            } catch (_) {}
          }}
        />
      );
    }
    if (loginMode === "corporate") {
      return (
        <LoginCorporate
          isLoading={loading}
          onBack={() => setLoginMode("select")}
          onCreate={async (corpName, adminName, adminEmail, adminPass) => {
            try {
              await loginCorporate(corpName, adminName, adminPass, true, adminEmail, adminName);
              setLoginMode(null);
            } catch (_) {}
          }}
          onLogin={async (corpName, userName, adminPass) => {
            try {
              await loginCorporate(corpName, userName, adminPass, false);
              setLoginMode(null);
            } catch (_) {}
          }}
        />
      );
    }
  }

  const selected = notes.find((n) => n.id === selectedId);
  const showDetail = view === "dashboard" && selected;

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-background">
      {/* Sidebar for Desktop */}
      {!isMobile && (
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
      )}

      {/* Top Header for Mobile (only show when not viewing a note's details) */}
      {isMobile && !selected && (
        <header className="flex items-center justify-between px-4 py-3 bg-sidebar border-b border-sidebar-border sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-accent">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 bg-sidebar border-r border-sidebar-border">
                <Sidebar
                  view={view}
                  setView={(v) => {
                    setView(v);
                    setSidebarOpen(false);
                  }}
                  search={search}
                  setSearch={setSearch}
                  category={category}
                  setCategory={(c) => {
                    setCategory(c);
                    setSidebarOpen(false);
                  }}
                  onCreate={() => {
                    setEditing(null);
                    setEditorOpen(true);
                    setSidebarOpen(false);
                  }}
                />
              </SheetContent>
            </Sheet>
            <Logo />
          </div>
          <Button
            onClick={() => {
              setEditing(null);
              setEditorOpen(true);
            }}
            size="icon"
            className="h-9 w-9 bg-gradient-primary hover:opacity-90 text-primary-foreground font-medium shadow-glow"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </header>
      )}

      <main className="flex-1 min-w-0 flex flex-col md:flex-row">
        {view === "dashboard" ? (
          <>
            {/* Notes List Column */}
            {(!isMobile || !selected) && (
              <div className={`flex-1 min-w-0 overflow-y-auto ${showDetail ? "max-w-[60%] xl:max-w-[55%]" : ""}`}>
                <header className="px-6 md:px-8 pt-6 md:pt-8 pb-4 md:pb-6 sticky top-0 bg-background/80 backdrop-blur-xl z-10 border-b border-border/40">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-1">
                    {category ?? "Todas"} · Painel
                  </div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold">
                    {category ? category : "Seu segundo cérebro acadêmico"}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filtered.length} nota{filtered.length === 1 ? "" : "s"}
                    {search && <> correspondendo a <span className="text-foreground">"{search}"</span></>}
                  </p>
                </header>
                <div className="p-6 md:p-8">
                  <NotesList notes={filtered} />
                </div>
              </div>
            )}

            {/* Note Detail Panel */}
            {selected && (
              <div className={isMobile ? "flex-1 min-w-0 h-screen overflow-hidden" : "w-[40%] xl:w-[45%] min-w-[420px] h-screen sticky top-0"}>
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
          <div className="flex-1 p-6 md:p-8 flex flex-col min-h-[calc(100vh-53px)] md:h-screen">
            <header className="mb-4 md:mb-6">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-1">
                Visualização
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">Grafo de conhecimento</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Clique em um nó para focar na nota. Passe o mouse para destacar as conexões.
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
