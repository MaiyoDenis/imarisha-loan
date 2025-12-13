import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Package, 
  BarChart3, 
  Settings, 
  LogOut,
  Building2,
  Wallet
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import logo from "/image.png";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Building2, label: "Branches", href: "/branches" },
  { icon: Users, label: "Staff & Users", href: "/users" },
  { icon: Users, label: "Groups", href: "/groups" },
  { icon: Users, label: "Members", href: "/members" },
  { icon: CreditCard, label: "Loans", href: "/loans" },
  { icon: Package, label: "Loan Products", href: "/products" },
  { icon: Wallet, label: "Savings", href: "/savings" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function AppSidebar() {
  const [location, navigate] = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border/50">
        <img src={logo} alt="Imarisha" className="h-8 w-8 rounded-md" />
        <span className="text-xl font-heading font-bold tracking-tight">Imarisha</span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = location === item.href;
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70")} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-sidebar-border/50">
        <div className="flex items-center gap-3 px-2 py-3 mb-2 rounded-md bg-sidebar-accent/50">
          <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-xs">
            AD
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">Admin User</p>
            <p className="text-xs text-sidebar-foreground/50 truncate">Super Admin</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
          onClick={() => navigate("/")}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </div>
    </div>
  );
}
