import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus } from "lucide-react";

interface Task {
  id: string;
  description: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  due_date?: string;
}

interface Props {
  tasks: Task[];
  onTaskAdd?: (description: string, priority: string) => void;
  onTaskToggle?: (taskId: string) => void;
  onTaskDelete?: (taskId: string) => void;
  disabled?: boolean;
}

const PRIORITY_COLORS = {
  low: "text-blue-500 bg-blue-50",
  medium: "text-yellow-500 bg-yellow-50",
  high: "text-red-500 bg-red-50",
};

export function TasksPanel({
  tasks,
  onTaskAdd,
  onTaskToggle,
  onTaskDelete,
  disabled,
}: Props) {
  const { t } = useTranslation();
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");

  const handleAddTask = () => {
    if (newTaskDescription.trim() && onTaskAdd) {
      onTaskAdd(newTaskDescription.trim(), newTaskPriority);
      setNewTaskDescription("");
      setNewTaskPriority("medium");
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {t("section.tasks")} ({completedCount}/{tasks.length})
        </h3>
      </div>

      {/* Add Task */}
      {!disabled && (
        <Card className="p-3 space-y-2">
          <Input
            placeholder={t("task.newTask")}
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
            className="text-sm h-9"
          />
          <div className="flex gap-2">
            <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">{t("task.low")}</SelectItem>
                <SelectItem value="medium">{t("task.medium")}</SelectItem>
                <SelectItem value="high">{t("task.high")}</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleAddTask}
              size="sm"
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </Card>
      )}

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("section.noTasks")}</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <Card
              key={task.id}
              className={`p-3 ${task.completed ? "opacity-50" : ""}`}
            >
              <div className="flex items-start gap-2">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() =>
                    onTaskToggle && onTaskToggle(task.id)
                  }
                  className="mt-1"
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm ${
                      task.completed ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {task.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        PRIORITY_COLORS[task.priority]
                      }`}
                    >
                      {task.priority === "low"
                        ? "Baixa"
                        : task.priority === "medium"
                          ? "Média"
                          : "Alta"}
                    </span>
                    {task.due_date && (
                      <span className="text-xs text-muted-foreground">
                        Vencimento: {task.due_date}
                      </span>
                    )}
                  </div>
                </div>
                {!disabled && (
                  <button
                    onClick={() =>
                      onTaskDelete && onTaskDelete(task.id)
                    }
                    className="p-1 hover:bg-destructive/10 rounded transition-colors"
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
