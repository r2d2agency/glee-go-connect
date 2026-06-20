import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, CreditCard, Users, BarChart3, LogOut, Sparkles, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/cards", label: "Meus cartões", icon: CreditCard },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/company", label: "Empresa", icon: Building2 },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex w-64 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="px-6 py-6 border-b border-sidebar-border">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="size-9 rounded-xl grid place-items-center" style={{ background: "var(--gradient-primary)" }}>
              <Sparkles className="size-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">Glee-go ID</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map((item) => {
            const active = path === item.to || path.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleSignOut}>
            <LogOut className="size-4" /> Sair
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-sidebar border-b border-sidebar-border px-4 h-14 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="size-7 rounded-lg grid place-items-center" style={{ background: "var(--gradient-primary)" }}>
            <Sparkles className="size-4 text-primary-foreground" />
          </div>
          <span className="font-bold">Glee-go ID</span>
        </Link>
        <Button size="sm" variant="ghost" onClick={handleSignOut}><LogOut className="size-4" /></Button>
      </div>

      <main className="flex-1 min-w-0 pt-14 md:pt-0 pb-20 md:pb-0">
        {children}
        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-sidebar border-t border-sidebar-border grid grid-cols-5">
          {nav.map((item) => {
            const active = path === item.to || path.startsWith(item.to + "/");
            return (
              <Link key={item.to} to={item.to} className={cn("flex flex-col items-center gap-0.5 py-2 text-[10px]", active ? "text-primary" : "text-muted-foreground")}>
                <item.icon className="size-5" />
                {item.label.split(" ")[0]}
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}