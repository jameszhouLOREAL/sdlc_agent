import { Outlet, Link, useLocation } from "react-router";
import { Activity, Settings, Cpu, Moon } from "lucide-react";
import { cn } from "./ui/utils";

const navItems = [
  { path: "/", label: "Pipeline", icon: Activity },
  { path: "/settings", label: "Settings", icon: Settings },
];

export function AppLayout() {
  const { pathname } = useLocation();

  return (
    <div className="h-screen flex flex-col bg-white text-zinc-900 overflow-hidden">
      {/* Top Nav */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-200 bg-white/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-600">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <span className="text-zinc-900 tracking-tight">Agentic SDLC</span>
            <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full border border-indigo-200">
              MCP
            </span>
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors",
                    isActive
                      ? "bg-zinc-100 text-zinc-900"
                      : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Moon className="w-4 h-4 text-zinc-400" />
          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-[11px] text-white">
            OP
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}