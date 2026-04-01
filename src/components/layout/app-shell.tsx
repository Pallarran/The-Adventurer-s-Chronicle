import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { PageHeaderProvider } from "./page-header-context";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <PageHeaderProvider>
      <div className="min-h-screen">
        <Sidebar />
        <div className="md:pl-60">
          <Topbar />
          <main className="animate-in fade-in-0 duration-200 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </PageHeaderProvider>
  );
}
