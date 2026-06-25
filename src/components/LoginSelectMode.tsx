import { useTranslation } from "react-i18next";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { User, Building2 } from "lucide-react";

interface Props {
  onSelectPersonal: () => void;
  onSelectCorporate: () => void;
}

export function LoginSelectMode({ onSelectPersonal, onSelectCorporate }: Props) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-aurora opacity-90" />
        <div className="absolute inset-0 [background-image:radial-gradient(hsl(var(--primary)/0.15)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="relative">
          <Logo />
        </div>
        <div className="relative space-y-8 max-w-md">
          <h1 className="font-display text-5xl font-bold leading-tight">
            Seu segundo cérebro acadêmico conectado.
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Organize suas notas de aula, projetos de pesquisa e extensão em um grafo de conhecimento interativo.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            SaaS gratuito custeado pelo IFMG
          </div>
        </div>
        <div className="relative text-xs text-muted-foreground font-mono">
          {t("app.version")} · IFMG - Campus Ibirité
        </div>
      </div>

      {/* Right — mode selection */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-8 animate-fade-up">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-3xl font-semibold">
              Portal NeuraNote
            </h2>
            <p className="text-sm text-muted-foreground">
              Escolha seu espaço de trabalho acadêmico
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={onSelectPersonal}
              className="w-full h-12 bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold shadow-glow flex items-center justify-center gap-2"
            >
              <User className="h-5 w-5" />
              Espaço Pessoal (Anotações Privadas e Pessoais)
            </Button>

            <Button
              onClick={onSelectCorporate}
              variant="outline"
              className="w-full h-12 font-semibold flex items-center justify-center gap-2 border-border/80 hover:bg-muted"
            >
              <Building2 className="h-5 w-5 text-emerald-400" />
              Espaço Compartilhado (Anotações em Grupo)
            </Button>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-center text-xs text-emerald-400/90 font-mono">
            Infraestrutura Acadêmica Criada por Estudantes do IFMG.
          </div>

          <p className="text-xs text-center text-muted-foreground">
            {t("auth.terms")}
          </p>
        </div>
      </div>
    </div>
  );
}
