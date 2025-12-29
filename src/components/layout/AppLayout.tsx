import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useDirection } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};
export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): JSX.Element {
  const direction = useDirection();
  return (
    <div dir={direction} className="min-h-screen bg-background">
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset className={cn("relative", className)}>
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur">
            <SidebarTrigger />
            <div className="flex-1" />
            <ThemeToggle className="static" />
          </header>
          {container ? (
            <main className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", contentClassName)}>
              {children}
            </main>
          ) : (
            <main className={contentClassName}>{children}</main>
          )}
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}