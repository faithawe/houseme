import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dash-workspace min-h-[calc(100vh-4rem)] border-t border-line/60">
      <div className="mx-auto flex w-full max-w-7xl flex-col md:flex-row">
        <Sidebar />
        <div className="min-w-0 flex-1 px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
          <div className="dash-enter mx-auto max-w-5xl">{children}</div>
        </div>
      </div>
    </div>
  );
}
