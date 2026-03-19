import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900 text-white">
        <Sidebar />
      </div>
      <main className="md:pl-72 flex flex-col h-full bg-slate-50 min-h-screen">
        <Navbar />
        <div className="flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
}
