import React from "react";
import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useDirection, useLanguage, useToggleLanguage } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TimezoneSelector } from "@/components/timezone-selector";
import { Button } from "@/components/ui/button";
import { Languages, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  const location = useLocation();
  const handleExport = () => {
    window.print();
  };
  return (
    <div dir={direction || 'ltr'} className="min-h-screen bg-background relative overflow-hidden selection:bg-primary/20">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] print:hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#3b82f6_0%,transparent_50%)] animate-float" />
        <div className="absolute inset-0 bg-[grid_32px_32px_rgba(0,0,0,0.1)] dark:bg-[grid_32px_32px_rgba(255,255,255,0.05)]" />
      </div>
      <SidebarProvider defaultOpen={true}>
        <div className="print:hidden"><AppSidebar /></div>
        <SidebarInset className={cn("relative flex flex-col h-screen overflow-hidden bg-transparent", className)}>
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/40 bg-background/60 px-6 backdrop-blur-xl shrink-0 print:hidden">
            <SidebarTrigger className="hover:bg-primary/5 transition-colors" />
            <div className="flex-1" />
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden md:block">
                <TimezoneSelector />
              </div>
              <Button variant="outline" size="sm" onClick={handleExport} className="hidden sm:flex gap-2 font-black uppercase text-[10px] tracking-widest bg-primary/5 border-primary/20 hover:bg-primary/10">
                <FileText className="h-4 w-4" />
                Terminal Report
              </Button>
              <div className="h-6 w-px bg-border/50 mx-1 sm:mx-2" />
              <Button variant="ghost" size="sm" onClick={() => toggleLanguage?.()} className="gap-2 text-xs font-black uppercase tracking-widest hover:bg-primary/5">
                <Languages className="h-4 w-4 text-primary" />
                {language === 'fa' ? 'EN' : 'FA'}
              </Button>
              <ThemeToggle className="static" />
            </div>
          </header>
          <div className="flex-1 overflow-auto print:overflow-visible">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: direction === 'rtl' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction === 'rtl' ? -20 : 20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {container ? (
                  <main className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 min-h-full print:p-0", contentClassName)}>
                    {children}
                  </main>
                ) : (
                  <main className={cn("h-full", contentClassName)}>{children}</main>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </SidebarInset>
      </SidebarProvider>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; color: black !important; }
          .print\\:hidden { display: none !important; }
          main { width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .card { border: 1px solid #ccc !important; break-inside: avoid; }
        }
      `}} />
    </div>
  );
}