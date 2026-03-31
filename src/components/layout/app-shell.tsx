import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="pl-60">
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
