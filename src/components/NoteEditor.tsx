import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/store/useStore";
import { CATEGORIES, type Note } from "@/data/mockNotes";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Note | null;
}

export function NoteEditor({ open, onOpenChange, editing }: Props) {
  const { upsert, createNote } = useStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>("Study");
  const [keywords, setKeywords] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(editing?.title ?? "");
      setContent(editing?.content ?? "");
      setCategory(editing?.category ?? "Study");
      setKeywords(editing?.keywords.join(", ") ?? "");
    }
  }, [open, editing]);

  const submit = () => {
    const kw = keywords.split(",").map((s) => s.trim()).filter(Boolean);
    if (editing) {
      upsert({ ...editing, title: title.trim() || "Untitled", content, category, keywords: kw });
    } else {
      createNote({ title: title.trim() || "Untitled", content, category, keywords: kw });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {editing ? "Edit note" : "New note"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="A clear, searchable title…"
              className="bg-muted/40 h-11 text-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
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
              <Label htmlFor="kw">Keywords (comma-separated)</Label>
              <Input
                id="kw"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="ai, retrieval, ideas"
                className="bg-muted/40"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Start writing…"
              className="bg-muted/40 resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow">
            {editing ? "Save changes" : "Create note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
