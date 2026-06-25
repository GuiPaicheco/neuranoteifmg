import { useState, type FormEvent } from "react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface Props {
  onBack: () => void;
  onCreate: (corporationName: string, adminName: string, adminEmail: string, adminPassword: string) => void;
  onLogin: (corporationName: string, userName: string, adminPassword?: string) => void;
  isLoading?: boolean;
}

export function LoginCorporate({ onBack, onCreate, onLogin, isLoading }: Props) {
  const [mode, setMode] = useState<"select" | "create" | "login">("select");
  const [corporationName, setCorporationName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [userName, setUserName] = useState("");

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (corporationName && adminName && adminEmail && adminPassword) {
      onCreate(corporationName, adminName, adminEmail, adminPassword);
    }
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (corporationName && userName) {
      onLogin(corporationName, userName, adminPassword);
    }
  };

  if (mode === "select") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8 animate-fade-up">
          <div className="text-center">
            <Logo />
          </div>
          <div className="space-y-2 text-center">
            <h2 className="font-display text-3xl font-semibold">
              Espaço Compartilhado
            </h2>
            <p className="text-sm text-muted-foreground">
              Colabore em grupos de pesquisa ou projetos integradores
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setMode("create")}
              className="w-full h-12 bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold shadow-glow flex items-center justify-center gap-2"
            >
              Criar Novo Grupo de Pesquisa
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              onClick={() => setMode("login")}
              variant="outline"
              className="w-full h-12 font-semibold flex items-center justify-center gap-2"
            >
              Entrar em Grupo Existente
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        </div>
      </div>
    );
  }

  if (mode === "create") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8 animate-fade-up">
          <div className="text-center">
            <Logo />
          </div>
          <div className="space-y-2 text-center">
            <h2 className="font-display text-3xl font-semibold">
              Criar Grupo de Pesquisa
            </h2>
            <p className="text-sm text-muted-foreground">
              Você será o coordenador deste espaço compartilhado
            </p>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="corp-name">Nome do Grupo / Laboratório</Label>
              <Input
                id="corp-name"
                type="text"
                value={corporationName}
                onChange={(e) => setCorporationName(e.target.value)}
                placeholder="Ex: Laboratório de IA e Grafos"
                className="h-11 bg-muted/40 border-border/60"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-name">Seu Nome (Coordenador)</Label>
              <Input
                id="admin-name"
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Ex: Prof. Silva"
                className="h-11 bg-muted/40 border-border/60"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-email">E-mail do Coordenador</Label>
              <Input
                id="admin-email"
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="coordenador@ifmg.edu.br"
                className="h-11 bg-muted/40 border-border/60"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-pass">Senha de Acesso do Coordenador</Label>
              <Input
                id="admin-pass"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="h-11 bg-muted/40 border-border/60"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold shadow-glow"
            >
              {isLoading ? "Criando..." : "Criar Espaço Compartilhado"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <button
            onClick={() => setMode("select")}
            className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8 animate-fade-up">
        <div className="text-center">
          <Logo />
        </div>
        <div className="space-y-2 text-center">
          <h2 className="font-display text-3xl font-semibold">
            Acessar Grupo Existente
          </h2>
          <p className="text-sm text-muted-foreground">
            Insira os dados do grupo de pesquisa
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="corp-name-login">Nome do Grupo / Laboratório</Label>
            <Input
              id="corp-name-login"
              type="text"
              value={corporationName}
              onChange={(e) => setCorporationName(e.target.value)}
              placeholder="Ex: Laboratório de IA e Grafos"
              className="h-11 bg-muted/40 border-border/60"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-name">Seu Nome (Membro)</Label>
            <Input
              id="user-name"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Nome de membro ou coordenador"
              className="h-11 bg-muted/40 border-border/60"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-pass-login">Senha de Acesso (Coordenador) (Opcional)</Label>
            <Input
              id="admin-pass-login"
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Senha se for o administrador"
              className="h-11 bg-muted/40 border-border/60"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold shadow-glow"
          >
            {isLoading ? "Entrando..." : "Entrar no Grupo"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <button
          onClick={() => setMode("select")}
          className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
      </div>
    </div>
  );
}
