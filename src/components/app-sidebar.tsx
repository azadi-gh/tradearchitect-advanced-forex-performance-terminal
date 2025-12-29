import React from "react";
import { LayoutDashboard, BookOpen, Calculator, Target, Settings, PlusCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/" },
    { title: "Journal", icon: BookOpen, path: "/journal" },
    { title: "Risk Lab", icon: Calculator, path: "/risk" },
    { title: "Strategies", icon: Target, path: "/strategies" },
  ];
  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            TA
          </div>
          <span className="text-lg font-bold tracking-tight">TradeArchitect</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton asChild isActive={location.pathname === item.path}>
                  <Link to={item.path} className="flex items-center gap-3 px-3 py-2">
                    <item.icon className="h-4 w-4" />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border">
        <Button variant="outline" className="w-full justify-start gap-2" asChild>
          <Link to="/journal">
            <PlusCircle className="h-4 w-4" />
            <span>New Trade</span>
          </Link>
        </Button>
        <div className="mt-4 flex items-center gap-2 px-2 py-1">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">v1.0.0 Foundation</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}