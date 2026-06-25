import { Brain } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative grid place-items-center h-9 w-9 rounded-xl bg-gradient-primary shadow-glow">
        <Brain className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
        <span className="absolute inset-0 rounded-xl ring-1 ring-primary/40" />
      </div>
      <div className="leading-tight">
        <div className="flex items-center gap-1.5">
          <div className="font-display font-bold text-lg tracking-tight">
            Neura<span className="text-gradient-primary">Note</span>
          </div>
          <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-wider rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            IFMG
          </span>
        </div>
        <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground -mt-0.5">
          SaaS Acadêmico
        </div>
      </div>
    </div>
  );
}
