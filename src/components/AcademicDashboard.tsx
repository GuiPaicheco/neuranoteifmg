import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useStore, type Priority } from "@/store/useStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle2, Circle, ListTodo, Plus, Trash2, CalendarDays, 
  FileText, Award, BookOpen, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface Goal {
  id: string;
  description: string;
  completed: boolean;
  type: "daily" | "weekly" | "monthly";
}

const priorityStyles: Record<Priority, string> = {
  low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  medium: "bg-warning/15 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30",
  high: "bg-destructive/15 text-destructive border-destructive/30",
};

export function AcademicDashboard() {
  const { t } = useTranslation();
  const { notes, select, toggleTask } = useStore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalDesc, setNewGoalDesc] = useState("");
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "monthly">("daily");

  // Load goals from local storage
  useEffect(() => {
    const saved = localStorage.getItem("neuranote_goals");
    if (saved) {
      try {
        setGoals(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save goals
  const saveGoals = (updated: Goal[]) => {
    setGoals(updated);
    localStorage.setItem("neuranote_goals", JSON.stringify(updated));
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalDesc.trim()) return;

    const newGoal: Goal = {
      id: Math.random().toString(36).substring(2, 9),
      description: newGoalDesc.trim(),
      completed: false,
      type: activeTab,
    };

    saveGoals([...goals, newGoal]);
    setNewGoalDesc("");
    toast.success("Meta adicionada!");
  };

  const handleToggleGoal = (id: string) => {
    const updated = goals.map((g) =>
      g.id === id ? { ...g, completed: !g.completed } : g
    );
    saveGoals(updated);
  };

  const handleDeleteGoal = (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    saveGoals(updated);
    toast.success("Meta removida");
  };

  // Aggregate all tasks from all notes
  const allTasks = notes.flatMap((note) =>
    note.tasks.map((task) => ({
      ...task,
      noteId: note.id,
      noteTitle: note.title,
    }))
  );

  const pendingTasks = allTasks
    .filter((t) => !t.completed)
    .sort((a, b) => {
      // Sort priority high -> medium -> low
      const weights = { high: 3, medium: 2, low: 1 };
      return weights[b.priority] - weights[a.priority];
    });

  const totalCompletedTasks = allTasks.filter((t) => t.completed).length;
  const totalPendingTasks = allTasks.filter((t) => !t.completed).length;

  const currentTabGoals = goals.filter((g) => g.type === activeTab);

  return (
    <div className="h-full flex flex-col overflow-y-auto p-6 md:p-8 space-y-8 bg-background animate-fade-up">
      {/* Welcome Banner */}
      <header className="flex flex-col gap-2 border-b border-border/40 pb-6">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase font-mono">
            SaaS IFMG Sabará
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {t("dashboard.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe suas metas de estudos, trabalhos pendentes e gerencie suas notas acadêmicas de forma visual.
        </p>
      </header>

      {/* Metrics Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-muted/40 border-border/60 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono">{notes.length}</div>
            <div className="text-xs text-muted-foreground">{t("dashboard.totalNotes")}</div>
          </div>
        </Card>

        <Card className="p-4 bg-muted/40 border-border/60 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 grid place-items-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono">{totalCompletedTasks}</div>
            <div className="text-xs text-muted-foreground">{t("dashboard.completedTasks")}</div>
          </div>
        </Card>

        <Card className="p-4 bg-muted/40 border-border/60 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-destructive/10 text-destructive grid place-items-center">
            <ListTodo className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono">{totalPendingTasks}</div>
            <div className="text-xs text-muted-foreground">{t("dashboard.openTasks")}</div>
          </div>
        </Card>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Metas / Goals Section */}
        <section className="space-y-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-400" />
              {t("dashboard.goals")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.goalsDescription")}
            </p>
          </div>

          <Tabs
            defaultValue="daily"
            onValueChange={(v) => setActiveTab(v as any)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 bg-muted/40 p-1">
              <TabsTrigger value="daily" className="text-xs py-2">{t("dashboard.daily")}</TabsTrigger>
              <TabsTrigger value="weekly" className="text-xs py-2">{t("dashboard.weekly")}</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs py-2">{t("dashboard.monthly")}</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 pt-4">
              {/* Add Goal Form */}
              <form onSubmit={handleAddGoal} className="flex gap-2">
                <Input
                  value={newGoalDesc}
                  onChange={(e) => setNewGoalDesc(e.target.value)}
                  placeholder={t("dashboard.goalPlaceholder")}
                  className="bg-muted/30 text-sm"
                />
                <Button type="submit" size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white flex gap-1">
                  <Plus className="h-4 w-4" />
                  {t("dashboard.addGoal")}
                </Button>
              </form>

              {/* Goals List */}
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {currentTabGoals.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic py-6 text-center">
                    {t("dashboard.noGoals")}
                  </p>
                ) : (
                  currentTabGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/30 transition-smooth group ${
                        goal.completed ? "opacity-60" : ""
                      }`}
                    >
                      <button onClick={() => handleToggleGoal(goal.id)} className="text-muted-foreground hover:text-foreground">
                        {goal.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>
                      <span className={`text-sm flex-1 ${goal.completed ? "line-through text-muted-foreground" : ""}`}>
                        {goal.description}
                      </span>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-opacity text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Pending Deliverables from all notes */}
        <section className="space-y-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              {t("dashboard.pendingTasks")}
            </h2>
            <p className="text-xs text-muted-foreground">
              Tarefas extraídas automaticamente de todas as suas matérias e aulas.
            </p>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {pendingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 bg-muted/20 rounded-xl border border-dashed border-border/80 text-center">
                <AlertCircle className="h-8 w-8 text-emerald-400 mb-2" />
                <p className="text-sm font-medium text-foreground">{t("dashboard.noTasks")}</p>
              </div>
            ) : (
              pendingTasks.map((task) => (
                <Card
                  key={task.id}
                  className="p-3 bg-muted/25 border-border/50 flex items-start gap-3 hover:border-border transition-colors"
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.noteId, task.id)}
                    className="mt-0.5"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {task.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={`text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full border ${priorityStyles[task.priority]}`}>
                        {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Média" : "Baixa"}
                      </span>
                      <span className="text-muted-foreground font-medium">
                        Matéria:
                      </span>
                      <button
                        onClick={() => select(task.noteId)}
                        className="text-primary hover:underline truncate max-w-[140px] text-left"
                      >
                        {task.noteTitle}
                      </button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => select(task.noteId)}
                    className="h-8 text-xs font-medium text-primary"
                  >
                    {t("dashboard.noteLink")}
                  </Button>
                </Card>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
