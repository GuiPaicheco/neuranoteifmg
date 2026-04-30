import { useState, type FormEvent } from "react";
import { useStore } from "@/store/useStore";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Sparkles, GitBranch, ListTodo } from "lucide-react";

export function LoginScreen() {
  const login = useStore((s) => s.login);
  const [email, setEmail] = useState("ada.lovelace@neuranote.app");
  const [password, setPassword] = useState("••••••••");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim()) login(email.trim());
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
            Your second brain, <span className="text-gradient-primary">finally</span> connected.
          </h1>
          <p className="text-muted-foreground text-lg">
            Notes that link to notes. Tasks that live where the thinking happens. A graph that shows you what
            you actually know.
          </p>
          <div className="space-y-3">
            <Feature icon={<Sparkles className="h-4 w-4" />} text="Smart linking & keywords" />
            <Feature icon={<GitBranch className="h-4 w-4" />} text="Visual knowledge graph" />
            <Feature icon={<ListTodo className="h-4 w-4" />} text="Tasks attached to context" />
          </div>
        </div>
        <div className="relative text-xs text-muted-foreground font-mono">v0.1 · prototype build</div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-8 animate-fade-up">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-3xl font-semibold">Welcome back</h2>
            <p className="text-sm text-muted-foreground">
              Any credentials work — this is a prototype demo.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-muted/40 border-border/60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-muted/40 border-border/60"
              />
            </div>
            <Button type="submit" className="w-full h-11 bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold shadow-glow group">
              Enter NeuraNote
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground">
            By continuing you accept the imaginary terms of an unreleased product.
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
