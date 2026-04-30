import { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { Logo } from "./Logo";
import { CATEGORIES } from "@/data/mockNotes";
import { Search, Plus, LogOut, LayoutDashboard, GitBranch, Tag, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  view: "dashboard" | "graph";
  setView: (v: "dashboard" | "graph") => void;
  search: string;
  setSearch: (v: string) => void;
  category: string | null;
  setCategory: (c: string | null) => void;
  onCreate: () => void;
}

export function Sidebar({ view, setView, search, setSearch, category, setCategory, onCreate }: Props) {
  const { user, logout, notes } = useStore();

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    notes.forEach((n) => (m[n.category] = (m[n.category] || 0) + 1));
    return m;
  }, [notes]);

  return (
    <aside className="w-72 shrink-0 h-screen sticky top-0 flex flex-col bg-sidebar border-r border-sidebar-border">
      <div className="p-5 border-b border-sidebar-border">
        <Logo />
      </div>

      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-sidebar-accent border-sidebar-border"
          />
        </div>
        <Button
          onClick={onCreate}
          className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-medium shadow-glow"
        >
          <Plus className="h-4 w-4 mr-2" /> New Note
        </Button>
      </div>

      <nav className="px-3 space-y-1">
        <NavItem
          active={view === "dashboard"}
          onClick={() => setView("dashboard")}
          icon={<LayoutDashboard className="h-4 w-4" />}
          label="Dashboard"
        />
        <NavItem
          active={view === "graph"}
          onClick={() => setView("graph")}
          icon={<GitBranch className="h-4 w-4" />}
          label="Graph view"
        />
      </nav>

      <div className="px-5 pt-6 pb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <FolderOpen className="h-3 w-3" /> Categories
      </div>
      <div className="px-3 space-y-0.5 overflow-y-auto flex-1">
        <CategoryItem
          label="All notes"
          count={notes.length}
          active={category === null}
          onClick={() => setCategory(null)}
        />
        {CATEGORIES.map((c) => (
          <CategoryItem
            key={c}
            label={c}
            count={counts[c] || 0}
            active={category === c}
            onClick={() => setCategory(c)}
          />
        ))}
      </div>

      <div className="p-4 border-t border-sidebar-border flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground font-semibold text-sm">
          {user?.name.charAt(0) || "U"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{user?.name}</div>
          <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
        </div>
        <button
          onClick={logout}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-smooth"
          title="Log out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-smooth ${
        active
          ? "bg-sidebar-accent text-foreground border border-sidebar-border shadow-sm"
          : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
      }`}
    >
      {icon}
      <span>{label}</span>
      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />}
    </button>
  );
}

function CategoryItem({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-smooth ${
        active
          ? "bg-primary/10 text-primary border border-primary/20"
          : "text-sidebar-foreground hover:bg-sidebar-accent/60"
      }`}
    >
      <Tag className="h-3.5 w-3.5 opacity-70" />
      <span className="flex-1 text-left">{label}</span>
      <span className="text-xs opacity-60 font-mono">{count}</span>
    </button>
  );
}
