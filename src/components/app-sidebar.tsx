import React from "react";
import { LayoutDashboard, BookOpen, Calculator, Target, Search, PlusCircle, TrendingUp, ShieldCheck, HelpCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/", tooltip: "Terminal Overview" },
    { title: "Watchlist", icon: Search, path: "/watchlist", tooltip: "Market Directory" },
    { title: "Journal", icon: BookOpen, path: "/journal", tooltip: "Execution Ledger" },
    { title: "Risk Lab", icon: Calculator, path: "/risk", tooltip: "Position & Kelly Lab" },
    { title: "Growth Sim", icon: TrendingUp, path: "/simulator", tooltip: "Monte Carlo Projections" },
    { title: "Strategy Vault", icon: Target, path: "/strategies", tooltip: "System Management" },
    { title: "Manual", icon: HelpCircle, path: "/manual", tooltip: "Terminal Manual" },
  ];
  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-sm">TA</div>
          <span className="text-lg font-bold tracking-tight text-foreground">TradeArchitect</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <TooltipProvider>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton asChild isActive={location.pathname === item.path}>
                        <Link to={item.path} className="flex items-center gap-3 px-3 py-2">
                          <item.icon className={cn("h-4 w-4", location.pathname === item.path ? "text-primary" : "text-muted-foreground")} />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right"><p>{item.tooltip}</p></TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              ))}
            </TooltipProvider>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border bg-muted/20">
        <Button variant="default" className="w-full justify-start gap-2 shadow-primary hover:scale-[1.02] transition-transform" asChild>
          <Link to="/journal"><PlusCircle className="h-4 w-4" /><span className="font-bold uppercase text-[10px] tracking-widest">New Execution</span></Link>
        </Button>
        <div className="mt-4 flex flex-col gap-1 px-2">
          <div className="flex items-center gap-2"><ShieldCheck className="h-3 w-3 text-emerald-500" /><span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">System Integrity</span></div>
          <p className="text-[9px] text-emerald-500 font-bold uppercase ml-5">PRO v2.0 READY</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}