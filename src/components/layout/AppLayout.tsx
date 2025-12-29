import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useDirection, useLanguage, useToggleLanguage } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};
export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): JSX.Element {
  const direction = useDirection();
  const language = useLanguage();
  const toggleLanguage = useToggleLanguage();
  return (
    <div dir={direction} className="min-h-screen bg-background">
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset className={cn("relative flex flex-col h-screen", className)}>
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur shrink-0">
            <SidebarTrigger />
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleLanguage}
                className="gap-2 text-xs font-bold uppercase tracking-tight"
              >
                <Languages className="h-4 w-4" />
                {language === 'en' ? 'FA' : 'EN'}
              </Button>
              <ThemeToggle className="static" />
            </div>
          </header>
          <div className="flex-1 overflow-auto">
            {container ? (
              <main className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12", contentClassName)}>
                {children}
              </main>
            ) : (
              <main className={contentClassName}>{children}</main>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}