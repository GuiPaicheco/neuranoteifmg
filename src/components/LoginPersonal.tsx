import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Sparkles, GitBranch, ListTodo } from "lucide-react";

interface Props {
  onBack: () => void;
  onLogin: (email: string, password: string, name?: string) => void;
  isLoading?: boolean;
}

export function LoginPersonal({ onBack, onLogin, isLoading }: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("ada.lovelace@neuranote.app");
  const [password, setPassword] = useState("ada");
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");

  const toggleMode = () => {
    if (!isRegister) {
      setIsRegister(true);
      setEmail("");
      setPassword("");
      setName("");
    } else {
      setIsRegister(false);
      setEmail("ada.lovelace@neuranote.app");
      setPassword("ada");
      setName("");
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      if (name.trim() && email.trim() && password.trim()) {
        onLogin(email.trim(), password.trim(), name.trim());
      }
    } else {
      if (email.trim() && password.trim()) {
        onLogin(email.trim(), password.trim());
      }
    }
  };

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
            Seu segundo cérebro acadêmico.
          </h1>
          <p className="text-muted-foreground text-lg">
            Um ambiente seguro e conectado custeado pelo IFMG para turbinar seu aprendizado e pesquisa.
          </p>
          <div className="space-y-3">
            <Feature icon={<Sparkles className="h-4 w-4 text-emerald-400" />} text="Conexões inteligentes por Wikilinks" />
            <Feature icon={<GitBranch className="h-4 w-4 text-emerald-400" />} text="Grafo de Conhecimento Dinâmico" />
            <Feature icon={<ListTodo className="h-4 w-4 text-emerald-400" />} text="Organização de tarefas integradas" />
          </div>
        </div>
        <div className="relative text-xs text-muted-foreground font-mono">
          {t("app.version")} · Campus Sabará
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-8 animate-fade-up">
          <div className="lg:hidden">
            <Logo />
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-3xl font-semibold">
              {isRegister ? "Criar Conta Acadêmica" : "Acessar Área Pessoal"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isRegister ? "Configure sua conta pessoal do NeuraNote IFMG" : "Insira seus dados ou utilize a conta de demonstração"}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="h-11 bg-muted/40 border-border/60"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-mail Acadêmico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@estudante.ifmg.edu.br"
                className="h-11 bg-muted/40 border-border/60"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-muted/40 border-border/60"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold shadow-glow group"
            >
              {isLoading ? "Processando..." : (isRegister ? "Registrar e Entrar" : "Entrar")}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">
                {isRegister ? "Já tem conta acadêmica?" : "Primeira vez aqui?"}
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={toggleMode}
            className="w-full"
          >
            {isRegister ? "Fazer Login" : "Criar Conta"}
          </Button>

          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>

          <p className="text-xs text-center text-muted-foreground">
            {t("auth.terms")}
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid place-items-center h-8 w-8 rounded-lg bg-primary/10 text-primary border border-primary/20">
        {icon}
      </span>
      <span className="text-sm">{text}</span>
    </div>
  );
}
