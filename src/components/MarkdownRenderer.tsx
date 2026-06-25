import { useStore } from "@/store/useStore";
import { Link2 } from "lucide-react";
import React from "react";

interface Props {
  content: string;
}

export function MarkdownRenderer({ content }: Props) {
  const { notes, select } = useStore();

  if (!content) return null;

  const lines = content.split("\n");
  
  const renderTextWithLinks = (text: string) => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const regex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index;
      const targetTitle = match[1].trim();
      const alias = match[2] ? match[2].trim() : targetTitle;

      if (matchIndex > lastIndex) {
        parts.push(renderInlineMarkdown(text.substring(lastIndex, matchIndex)));
      }

      const referencedNote = notes.find(
        (n) => n.title.toLowerCase().trim() === targetTitle.toLowerCase()
      );

      if (referencedNote) {
        parts.push(
          <button
            key={`link-${matchIndex}`}
            onClick={() => select(referencedNote.id)}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary border border-primary/20 font-medium transition-colors align-baseline text-[0.95em] mx-0.5"
          >
            <Link2 className="h-3 w-3 inline shrink-0" />
            {alias}
          </button>
        );
      } else {
        parts.push(
          <span
            key={`link-stub-${matchIndex}`}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 align-baseline text-[0.95em] mx-0.5 cursor-help"
            title="Nota referenciada (stub criado no backend)"
          >
            <Link2 className="h-3 w-3 inline shrink-0 text-emerald-400/70" />
            {alias} (stub)
          </span>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(renderInlineMarkdown(text.substring(lastIndex)));
    }

    return parts.length > 0 ? <span className="inline">{parts}</span> : text;
  };

  const renderInlineMarkdown = (text: string) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const italicRegex = /\*(.*?)\*/g;
    const codeRegex = /`(.*?)`/g;

    let elements: React.ReactNode[] = [text];

    const replacePatterns = (
      inputElements: React.ReactNode[],
      regex: RegExp,
      renderFn: (matchText: string, index: number) => React.ReactNode
    ): React.ReactNode[] => {
      const output: React.ReactNode[] = [];
      inputElements.forEach((el) => {
        if (typeof el !== "string") {
          output.push(el);
          return;
        }

        let match;
        let lastIdx = 0;
        let localIdx = 0;
        const newEls: React.ReactNode[] = [];

        while ((match = regex.exec(el)) !== null) {
          if (match.index > lastIdx) {
            newEls.push(el.substring(lastIdx, match.index));
          }
          newEls.push(renderFn(match[1], localIdx++));
          lastIdx = regex.lastIndex;
        }

        if (lastIdx < el.length) {
          newEls.push(el.substring(lastIdx));
        }

        output.push(...(newEls.length > 0 ? newEls : [el]));
      });
      return output;
    };

    elements = replacePatterns(elements, codeRegex, (m, idx) => (
      <code key={`code-${idx}`} className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-[0.875em] border border-border">
        {m}
      </code>
    ));

    elements = replacePatterns(elements, boldRegex, (m, idx) => (
      <strong key={`bold-${idx}`} className="font-bold text-foreground">
        {m}
      </strong>
    ));

    elements = replacePatterns(elements, italicRegex, (m, idx) => (
      <em key={`italic-${idx}`} className="italic">
        {m}
      </em>
    ));

    return <React.Fragment key={Math.random()}>{elements}</React.Fragment>;
  };

  const renderedLines: React.ReactNode[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = (key: number) => {
    if (listItems.length > 0) {
      renderedLines.push(
        <ul key={`list-${key}`} className="list-disc pl-6 my-2 space-y-1 text-muted-foreground">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("### ")) {
      flushList(idx);
      renderedLines.push(
        <h3 key={idx} className="font-display font-bold text-base text-foreground mt-4 mb-2">
          {renderTextWithLinks(line.substring(4))}
        </h3>
      );
    } else if (trimmed.startsWith("## ")) {
      flushList(idx);
      renderedLines.push(
        <h2 key={idx} className="font-display font-semibold text-lg text-foreground mt-5 mb-2 border-b border-border/40 pb-1">
          {renderTextWithLinks(line.substring(3))}
        </h2>
      );
    } else if (trimmed.startsWith("# ")) {
      flushList(idx);
      renderedLines.push(
        <h1 key={idx} className="font-display font-bold text-xl text-foreground mt-6 mb-3">
          {renderTextWithLinks(line.substring(2))}
        </h1>
      );
    } else if (trimmed.startsWith("> ")) {
      flushList(idx);
      renderedLines.push(
        <blockquote key={idx} className="pl-4 border-l-4 border-emerald-500/50 my-3 italic text-muted-foreground bg-emerald-500/5 py-2 rounded-r">
          {renderTextWithLinks(line.substring(2))}
        </blockquote>
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      inList = true;
      listItems.push(
        <li key={`li-${idx}`} className="text-sm my-0.5">
          {renderTextWithLinks(line.substring(2))}
        </li>
      );
    } else if (trimmed === "") {
      flushList(idx);
      renderedLines.push(<div key={idx} className="h-2" />);
    } else {
      flushList(idx);
      renderedLines.push(
        <p key={idx} className="text-foreground/90 text-sm leading-relaxed my-2">
          {renderTextWithLinks(line)}
        </p>
      );
    }
  });

  flushList(lines.length);

  return <div className="space-y-1">{renderedLines}</div>;
}
