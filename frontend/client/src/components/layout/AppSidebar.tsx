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
  Smartphone
} from "lucide-react";
import { useLocation } from "wouter";
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

interface MenuItem {
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
  roles?: string[];
}

const allSidebarItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Admin Dashboard", href: "/dashboard", roles: ["admin", "executive", "operations_manager", "risk_manager", "loan_officer", "customer"] },
  { icon: LayoutDashboard, label: "Field Officer Dashboard", href: "/field-officer", roles: ["field_officer"] },
  { icon: MapPin, label: "Field Operations", href: "/field-operations", roles: ["admin", "field_officer"] },
  { icon: Calendar, label: "Schedules", href: "/field-officer/schedule", roles: ["field_officer"] },
  { icon: Users, label: "Groups", href: "/groups", roles: ["admin", "executive", "operations_manager"] },
  { icon: Users, label: "My Groups", href: "/groups", roles: ["field_officer"] },
  { icon: Smartphone, label: "Mobile Tools", href: "/mobile-features", roles: ["admin", "executive", "field_officer"] },
  { icon: BarChart3, label: "Reports & Analytics", href: "/dashboards/admin", roles: ["admin"] },
  { icon: CreditCard, label: "Loans", href: "/loans", roles: ["branch_manager", "admin", "executive", "operations_manager", "procurement_officer"] },
  { icon: Package, label: "Loan Products", href: "/products", roles: ["branch_manager", "admin"] },
  { icon: Store, label: "Store & Inventory", href: "/store", roles: ["branch_manager", "admin", "procurement_officer"] },
  { icon: Building2, label: "Branches", href: "/branches", roles: ["admin"] },
  { icon: Users, label: "Staff & Users", href: "/users", roles: ["admin"] },
  { icon: Users, label: "Members", href: "/members", roles: ["admin", "executive", "operations_manager"] },
  { icon: Brain, label: "AI Analytics Dashboard", href: "/dashboards/ai-analytics", roles: ["admin", "executive"] },
  { icon: BarChart3, label: "Executive Dashboard", href: "/dashboards/executive", roles: ["admin", "executive"] },
  { icon: Zap, label: "Operations Dashboard", href: "/dashboards/operations", roles: ["admin", "operations_manager"] },
  { icon: TrendingUp, label: "Risk Management Dashboard", href: "/dashboards/risk", roles: ["admin", "risk_manager"] },
  { icon: Users2, label: "Member Analytics Dashboard", href: "/dashboards/member-analytics", roles: ["admin", "executive", "operations_manager"] },
  { icon: TrendingUp, label: "Demand Forecast", href: "/dashboards/forecast", roles: ["admin", "executive"] },
  { icon: Building2, label: "Branch Dashboard", href: "/dashboards/branch-manager", roles: ["branch_manager"] },
  { icon: Users, label: "Staff", href: "/users", roles: ["branch_manager"] },
  { icon: BarChart3, label: "Procurement Dashboard", href: "/procurement", roles: ["procurement_officer"] },
  { icon: Gamepad2, label: "Gamification", href: "/gamification", roles: ["admin", "executive"] },
  { icon: Wallet, label: "Savings", href: "/savings", roles: ["admin", "executive", "operations_manager"] },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function AppSidebar() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const normalizeRole = (role: string | undefined) => {
    if (!role) return '';
    return role.toLowerCase().replace(/[\s-]+/g, '_').trim();
  };

  const userRole = normalizeRole(user?.role);

  const filteredItems = allSidebarItems.filter((item) => {
    if (!item.roles) return true;
    // Check if any of the allowed roles matches the user's normalized role
    // We also normalize the allowed roles to be safe
    return item.roles.some(r => normalizeRole(r) === userRole);
  });

  const handleLogout = async () => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      navigate("/");
    } catch (error) {
      console.error('Logout error:', error);
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
        <div className="relative flex items-center gap-3 px-2 py-2">
          <img src={logo} alt="Imarisha Logo" className="h-7 w-7 md:h-8 md:w-8 rounded-md shadow-sm" />
          <span className="text-lg md:text-xl font-heading font-bold tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden" aria-label="Imarisha">Imarisha</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="overflow-y-auto">
        <SidebarMenu role="navigation" aria-label="Main menu">
          {filteredItems.map((item) => {
            const isActive = location === item.href;
            return (
              <SidebarMenuItem key={`${item.href}-${item.label}`}>
                <SidebarMenuButton 
                  isActive={isActive} 
                  onClick={() => navigate(item.href)}
                  tooltip={item.label}
                  className="h-9 md:h-10 text-xs md:text-sm focus-ring-enhanced"
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
      </SidebarContent>
      <SidebarFooter>
        <div className="p-2 group-data-[collapsible=icon]:hidden">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-xs md:text-sm text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 h-9 md:h-10 focus-ring-enhanced"
            onClick={handleLogout}
            aria-label="Log out of your account"
          >
            <LogOut className="mr-2 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">Log Out</span>
          </Button>
        </div>
        <div className="hidden group-data-[collapsible=icon]:flex justify-center p-2">
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
