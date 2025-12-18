import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Menu } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 md:h-16 shrink-0 items-center gap-2 px-3 md:px-4 sticky top-0 z-40 glass-card gradient-border hover-tilt">
          <SidebarTrigger className="-ml-1 md:-ml-2 p-1 md:p-0">
            <Menu className="h-5 w-5 md:h-6 md:w-6" />
          </SidebarTrigger>
        </header>
        <div className="flex flex-1 flex-col gap-3 md:gap-4 p-3 md:p-4 pt-0 overflow-y-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
