import React, { useState } from "react";
import { useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Building2,
  Wallet,
  Brain,
  Zap,
  TrendingUp,
  Users2,
  Gamepad2,
  MapPin,
  Store,
  Calendar,
  Smartphone,
  UserCheck,
  ChevronDown,
  Menu,
  X,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import logo from "/image.png";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const menuSections = [
  {
    title: "Main",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboards/admin", roles: ["admin"] },
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboards/executive", roles: ["executive"] },
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboards/operations", roles: ["operations_manager"] },
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboards/risk", roles: ["risk_manager"] },
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", roles: ["loan_officer", "customer"] },
      { icon: LayoutDashboard, label: "IT Support Dashboard", href: "/dashboards/it-support", roles: ["it_support"] },
      { icon: LayoutDashboard, label: "Field Officer Dashboard", href: "/field-officer", roles: ["field_officer"] },
    ]
  },
  {
    title: "Lending & Products",
    items: [
      { icon: CreditCard, label: "Loans", href: "/loans", roles: ["branch_manager", "admin", "executive", "operations_manager", "procurement_officer"] },
      { icon: Package, label: "Loan Products", href: "/products", roles: ["branch_manager", "admin"] },
      { icon: Wallet, label: "Savings Accounts", href: "/savings", roles: ["admin", "executive", "operations_manager"] },
    ]
  },
  {
    title: "Organization",
    items: [
      { icon: Building2, label: "Branches", href: "/branches", roles: ["admin"] },
      { icon: Users, label: "Staff & Users", href: "/users", roles: ["admin", "branch_manager"] },
      { icon: Users, label: "Members", href: "/members", roles: ["admin", "executive", "operations_manager"] },
      { icon: Users, label: "Groups", href: "/groups", roles: ["admin", "executive", "operations_manager"] },
      { icon: Users, label: "Groups", href: "/field-officer/groups", roles: ["field_officer"] },
      { icon: UserCheck, label: "Member Approval", href: "/member-approval", roles: ["procurement_officer", "branch_manager", "admin"] },
    ]
  },
  {
    title: "Operations & Inventory",
    items: [
      { icon: MapPin, label: "Field Operations", href: "/field-operations", roles: ["admin", "field_officer"] },
      { icon: Calendar, label: "Schedule", href: "/field-officer/schedule", roles: ["field_officer"] },
      { icon: Store, label: "Store & Inventory", href: "/store", roles: ["branch_manager", "admin", "procurement_officer"] },
      { icon: Smartphone, label: "Mobile Tools", href: "/mobile-features", roles: ["admin", "executive", "field_officer"] },
    ]
  },
  {
    title: "Analytics & Insights",
    items: [
      { icon: Brain, label: "AI Analytics", href: "/dashboards/ai-analytics", roles: ["admin", "executive"] },
      { icon: BarChart3, label: "Executive Dashboard", href: "/dashboards/executive", roles: ["admin"] },
      { icon: Zap, label: "Operations Analytics", href: "/dashboards/operations", roles: ["admin"] },
      { icon: TrendingUp, label: "Risk Management", href: "/dashboards/risk", roles: ["admin"] },
      { icon: Users2, label: "Member Analytics", href: "/dashboards/member-analytics", roles: ["admin", "executive", "operations_manager"] },
      { icon: TrendingUp, label: "Forecasting", href: "/dashboards/forecast", roles: ["admin", "executive"] },
      { icon: FileText, label: "Reports", href: "/reports", roles: ["admin", "executive", "operations_manager"] },
      { icon: BarChart3, label: "Procurement", href: "/procurement", roles: ["procurement_officer"] },
    ]
  },
  {
    title: "Engagement",
    items: [
      { icon: Gamepad2, label: "Gamification", href: "/gamification", roles: ["admin", "executive"] },
    ]
  },
];

function SidebarSection({ section, filteredItems, location, navigate }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const sectionItems = section.items.filter(item =>
    filteredItems.some(fi => fi.href === item.href && fi.label === item.label)
  );

  if (sectionItems.length === 0) return null;

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60 hover:text-sidebar-foreground/80 transition-colors group-data-[collapsible=icon]:hidden"
      >
        <span>{section.title}</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-0" : "-rotate-90"}`}
        />
      </button>
      {isExpanded && (
        <SidebarMenu className="space-y-1">
          {sectionItems.map((item) => {
            const isActive = location === item.href;
            return (
              <SidebarMenuItem key={`${item.href}-${item.label}`}>
                <SidebarMenuButton
                  isActive={isActive}
                  onClick={() => navigate(item.href)}
                  tooltip={item.label}
                  className={`h-9 md:h-10 text-xs md:text-sm focus-ring-enhanced transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-sidebar-accent/50"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={item.label}
                >
                  <item.icon className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      )}
    </div>
  );
}

export function AppSidebar() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const normalizeRole = (role) => {
    if (!role) return "";
    return role.toLowerCase().replace(/[\s-]+/g, "_").trim();
  };

  const userRole = normalizeRole(user?.role);

  const filteredItems = menuSections
    .flatMap(section => section.items)
    .filter((item) => {
      if (!item.roles) return true;
      return item.roles.some((r) => normalizeRole(r) === userRole);
    });

  const handleLogout = () => {
    try {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="md:sticky md:top-0 md:h-screen border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
      aria-label="Main navigation"
    >
      <SidebarHeader>
        <div className="relative flex items-center gap-3 px-2 py-3 border-b border-sidebar-border/50">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
            <img
              src={logo}
              alt="Imarisha Logo"
              className="h-6 w-6 rounded-md"
            />
          </div>
          <span className="text-sm md:text-base font-heading font-bold tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            Imarisha
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto px-3 py-6">
        {menuSections.map((section) => (
          <SidebarSection
            key={section.title}
            section={section}
            filteredItems={filteredItems}
            location={location}
            navigate={navigate}
          />
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50">
        <div className="p-3">
          <Button
            variant="ghost"
            className="w-full justify-start text-xs md:text-sm text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 h-9 md:h-10 focus-ring-enhanced group-data-[collapsible=icon]:hidden"
            onClick={handleLogout}
            aria-label="Log out of your account"
          >
            <LogOut className="mr-2 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">Log Out</span>
          </Button>
        </div>
        <div className="hidden group-data-[collapsible=icon]:flex justify-center p-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 h-9 w-9 md:h-10 md:w-10 focus-ring-enhanced"
            onClick={handleLogout}
            aria-label="Log out of your account"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
