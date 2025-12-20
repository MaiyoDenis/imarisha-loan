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
  Store
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
  { icon: LayoutDashboard, label: "Main Dashboard", href: "/dashboard", roles: ["admin", "executive", "operations_manager", "risk_manager", "field_officer", "loan_officer", "customer"] },
  { icon: BarChart3, label: "System Analytics", href: "/dashboards/admin", roles: ["admin"] },
  { icon: Building2, label: "Branch Dashboard", href: "/dashboards/branch-manager", roles: ["branch_manager"] },
  { icon: Users, label: "Staff", href: "/users", roles: ["branch_manager"] },
  { icon: CreditCard, label: "Loans", href: "/loans", roles: ["branch_manager", "admin", "executive", "operations_manager", "procurement_officer"] },
  { icon: Package, label: "Products", href: "/products", roles: ["branch_manager", "admin"] },
  { icon: Store, label: "Store", href: "/store", roles: ["branch_manager", "admin", "procurement_officer"] },
  { icon: BarChart3, label: "Procurement Dashboard", href: "/procurement", roles: ["procurement_officer"] },
  { icon: Brain, label: "AI Analytics", href: "/dashboards/ai-analytics", roles: ["admin", "executive"] },
  { icon: BarChart3, label: "Executive Dashboard", href: "/dashboards/executive", roles: ["admin", "executive"] },
  { icon: Zap, label: "Operations Dashboard", href: "/dashboards/operations", roles: ["admin", "operations_manager"] },
  { icon: TrendingUp, label: "Risk Assessment", href: "/dashboards/risk", roles: ["admin", "risk_manager"] },
  { icon: Users2, label: "Member Analytics", href: "/dashboards/member-analytics", roles: ["admin", "executive", "operations_manager"] },
  { icon: TrendingUp, label: "Demand Forecast", href: "/dashboards/forecast", roles: ["admin", "executive"] },
  { icon: Gamepad2, label: "Gamification", href: "/gamification", roles: ["admin", "executive"] },
  { icon: MapPin, label: "Field Operations", href: "/field-operations", roles: ["admin", "field_officer"] },
  { icon: Building2, label: "Branches", href: "/branches", roles: ["admin"] },
  { icon: Users, label: "Staff & Users", href: "/users", roles: ["admin"] },
  { icon: Users, label: "Groups", href: "/groups", roles: ["admin", "executive", "operations_manager"] },
  { icon: Users, label: "Members", href: "/members", roles: ["admin", "executive", "operations_manager"] },
  { icon: Wallet, label: "Savings", href: "/savings", roles: ["admin", "executive", "operations_manager"] },
  { icon: BarChart3, label: "Reports", href: "/reports", roles: ["admin", "executive", "operations_manager"] },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function AppSidebar() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  const userInitials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'U';
  const userName = user ? `${user.firstName} ${user.lastName}` : 'User';
  const userRole = user?.role ? user.role.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'User';

  const filteredItems = allSidebarItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role);
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
      <SidebarContent>
        <SidebarMenu role="navigation" aria-label="Main menu">
          {filteredItems.map((item) => {
            const isActive = location === item.href;
            return (
              <SidebarMenuItem key={item.href}>
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
          <div className="flex items-center gap-3 px-2 py-3 mb-2 rounded-md bg-sidebar-accent/50">
            <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-xs flex-shrink-0">
              {userInitials}
            </div>
            <div className="flex-1 overflow-hidden min-w-0">
              <p className="text-xs md:text-sm font-medium truncate">{userName}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">{userRole}</p>
            </div>
          </div>
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
