import { useMemo, useRef, useState, useEffect } from "react";
import { useStore } from "@/store/useStore";

interface Pos { x: number; y: number }

export function GraphView() {
  const { notes, selectedId, select } = useStore();
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [hover, setHover] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      if (ref.current) {
        const r = ref.current.getBoundingClientRect();
        setSize({ w: r.width, h: r.height });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Simple deterministic radial layout
  const positions = useMemo<Record<string, Pos>>(() => {
    const cx = size.w / 2;
    const cy = size.h / 2;
    const radius = Math.min(size.w, size.h) * 0.34;
    const map: Record<string, Pos> = {};
    notes.forEach((n, i) => {
      const angle = (i / notes.length) * Math.PI * 2 - Math.PI / 2;
      map[n.id] = { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
    });
    return map;
  }, [notes, size]);

  // Build unique edges
  const edges = useMemo(() => {
    const seen = new Set<string>();
    const list: { from: string; to: string }[] = [];
    notes.forEach((n) => {
      n.connections.forEach((c) => {
        const k = [n.id, c].sort().join("-");
        if (!seen.has(k) && positions[c]) {
          seen.add(k);
          list.push({ from: n.id, to: c });
        }
      });
    });
    return list;
  }, [notes, positions]);

  const categoryColor: Record<string, string> = {
    Study: "hsl(var(--primary))",
    Work: "hsl(var(--secondary))",
    Personal: "hsl(var(--accent))",
    Research: "hsl(var(--success))",
    Ideas: "hsl(var(--warning))",
  };

  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden bg-card/40 rounded-xl border border-border">
      <div className="absolute top-4 left-4 z-10 glass rounded-lg px-3 py-2">
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">Knowledge graph</div>
        <div className="text-xs text-muted-foreground">{notes.length} notes · {edges.length} links</div>
      </div>
      <div className="absolute bottom-4 left-4 z-10 glass rounded-lg p-3 space-y-1">
        {Object.entries(categoryColor).map(([k, c]) => (
          <div key={k} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
            <span className="text-muted-foreground">{k}</span>
          </div>
        ))}
      </div>

      <svg width={size.w} height={size.h} className="absolute inset-0">
        <defs>
          <radialGradient id="node-glow">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>
        </defs>

        {edges.map((e, i) => {
          const a = positions[e.from];
          const b = positions[e.to];
          if (!a || !b) return null;
          const active = hover === e.from || hover === e.to || selectedId === e.from || selectedId === e.to;
          return (
            <line
              key={i}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={active ? "hsl(var(--primary))" : "hsl(var(--border))"}
              strokeWidth={active ? 1.6 : 1}
              opacity={active ? 0.9 : 0.5}
              className="transition-all duration-200"
            />
          );
        })}

        {notes.map((n) => {
          const p = positions[n.id];
          if (!p) return null;
          const active = selectedId === n.id;
          const isHover = hover === n.id;
          const r = active ? 14 : isHover ? 12 : 10;
          const color = categoryColor[n.category] || "hsl(var(--primary))";
          return (
            <g
              key={n.id}
              transform={`translate(${p.x} ${p.y})`}
              className="cursor-pointer"
              onMouseEnter={() => setHover(n.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => select(n.id)}
            >
              {active && <circle r={28} fill="url(#node-glow)" />}
              <circle
                r={r}
                fill={color}
                stroke="hsl(var(--background))"
                strokeWidth={3}
                className="transition-all duration-200"
                style={active ? { filter: "drop-shadow(0 0 12px " + color + ")" } : {}}
              />
              <text
                y={r + 16}
                textAnchor="middle"
                className="font-display fill-foreground"
                style={{ fontSize: 12, fontWeight: active ? 600 : 500 }}
              >
                {n.title.length > 24 ? n.title.slice(0, 22) + "…" : n.title}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
