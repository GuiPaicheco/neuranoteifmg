import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/store/useStore";
import { CATEGORIES, type Note } from "@/data/mockNotes";
import { FileUploader } from "./FileUploader";
import { TasksPanel } from "./TasksPanel";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Note | null;
}

export function NoteEditor({ open, onOpenChange, editing }: Props) {
  const { t } = useTranslation();
  const { upsert, createNote } = useStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>("Study");
  const [keywords, setKeywords] = useState("");
  const [attachments, setAttachments] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      setTitle(editing?.title ?? "");
      setContent(editing?.content ?? "");
      setCategory(editing?.category ?? "Study");
      setKeywords(editing?.keywords.join(", ") ?? "");
      setAttachments(editing?.attachments ?? []);
      setTasks(editing?.tasks ?? []);
    }
  }, [open, editing]);

  const submit = () => {
    const kw = keywords.split(",").map((s) => s.trim()).filter(Boolean);
    if (editing) {
      upsert({ ...editing, title: title.trim() || "Untitled", content, category, keywords: kw, attachments, tasks });
    } else {
      createNote({ title: title.trim() || "Untitled", content, category, keywords: kw });
    }
    onOpenChange(false);
  };

  const handleAddTask = (description: string, priority: string) => {
    setTasks([
      ...tasks,
      {
        id: Math.random().toString(36).slice(2),
        description,
        completed: false,
        priority,
      },
    ]);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {editing ? t("note.edit") : t("note.newNote")}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="tasks">Tarefas</TabsTrigger>
            <TabsTrigger value="files">Arquivos</TabsTrigger>
          </TabsList>

          <div className="space-y-4 py-4">
            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t("note.title")}</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("note.titlePlaceholder")}
                  className="bg-muted/40 h-11 text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("note.category")}</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-muted/40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kw">{t("note.keywords")}</Label>
                  <Input
                    id="kw"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder={t("note.keywordsPlaceholder")}
                    className="bg-muted/40"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">{t("note.content")}</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  placeholder={t("note.contentPlaceholder")}
                  className="bg-muted/40 resize-none"
                />
              </div>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks">
              <TasksPanel
                tasks={tasks}
                onTaskAdd={handleAddTask}
                onTaskToggle={handleToggleTask}
                onTaskDelete={handleDeleteTask}
              />
            </TabsContent>

            {/* Files Tab */}
            <TabsContent value="files">
              <FileUploader
                attachments={attachments}
                onFileUpload={async (file) => {
                  const formData = new FormData();
                  formData.append("file", file);
                  try {
                    const meta = await api.post<any>("/files/upload", formData);
                    setAttachments([
                      ...attachments,
                      {
                        id: meta.id,
                        name: meta.name,
                        type: meta.file_type || meta.type,
                        size: meta.size > 1024 * 1024 ? `${(meta.size / (1024 * 1024)).toFixed(1)} MB` : `${(meta.size / 1024).toFixed(0)} KB`
                      }
                    ]);
                    toast.success(`Arquivo "${file.name}" anexado`);
                  } catch (err: any) {
                    toast.error("Falha no envio do arquivo: " + err.message);
                  }
                }}
                onFileDelete={async (fileId) => {
                  try {
                    await api.delete(`/files/${fileId}`);
                    setAttachments(attachments.filter((f) => f.id !== fileId));
                    toast.success("Anexo removido");
                  } catch (err: any) {
                    toast.error("Falha ao excluir anexo: " + err.message);
                  }
                }}
              />
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t("note.cancel")}
          </Button>
          <Button onClick={submit} className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow">
            {editing ? t("note.saveChanges") : t("note.createNote")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
