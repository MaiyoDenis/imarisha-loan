var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { LayoutDashboard, Users, CreditCard, Package, BarChart3, Settings, LogOut, Building2, Wallet, Brain, Zap, TrendingUp, Users2, Gamepad2, MapPin, Store, Calendar, Smartphone } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import logo from "/image.png";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, } from "@/components/ui/sidebar";
var allSidebarItems = [
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
    var _this = this;
    var _a = useLocation(), location = _a[0], navigate = _a[1];
    var toast = useToast().toast;
    var userStr = localStorage.getItem('user');
    var user = userStr ? JSON.parse(userStr) : null;
    var normalizeRole = function (role) {
        if (!role)
            return '';
        return role.toLowerCase().replace(/[\s-]+/g, '_').trim();
    };
    var userRole = normalizeRole(user === null || user === void 0 ? void 0 : user.role);
    var filteredItems = allSidebarItems.filter(function (item) {
        if (!item.roles)
            return true;
        // Check if any of the allowed roles matches the user's normalized role
        // We also normalize the allowed roles to be safe
        return item.roles.some(function (r) { return normalizeRole(r) === userRole; });
    });
    var handleLogout = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
                toast({
                    title: "Logged out",
                    description: "You have been logged out successfully",
                });
                navigate("/");
            }
            catch (error) {
                console.error('Logout error:', error);
                toast({
                    title: "Error",
                    description: "Failed to logout",
                    variant: "destructive",
                });
            }
            return [2 /*return*/];
        });
    }); };
    return (<Sidebar collapsible="icon" className="md:sticky md:top-0 md:h-screen border-r border-sidebar-border bg-sidebar text-sidebar-foreground" aria-label="Main navigation">
      <SidebarHeader>
        <div className="relative flex items-center gap-3 px-2 py-2">
          <img src={logo} alt="Imarisha Logo" className="h-7 w-7 md:h-8 md:w-8 rounded-md shadow-sm"/>
          <span className="text-lg md:text-xl font-heading font-bold tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden" aria-label="Imarisha">Imarisha</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="overflow-y-auto">
        <SidebarMenu role="navigation" aria-label="Main menu">
          {filteredItems.map(function (item) {
            var isActive = location === item.href;
            return (<SidebarMenuItem key={"".concat(item.href, "-").concat(item.label)}>
                <SidebarMenuButton isActive={isActive} onClick={function () { return navigate(item.href); }} tooltip={item.label} className="h-9 md:h-10 text-xs md:text-sm focus-ring-enhanced" aria-current={isActive ? "page" : undefined} aria-label={item.label}>
                  <item.icon className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" aria-hidden="true"/>
                  <span className="truncate">{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>);
        })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-2 group-data-[collapsible=icon]:hidden">
          <Button variant="ghost" className="w-full justify-start text-xs md:text-sm text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 h-9 md:h-10 focus-ring-enhanced" onClick={handleLogout} aria-label="Log out of your account">
            <LogOut className="mr-2 h-4 w-4 flex-shrink-0" aria-hidden="true"/>
            <span className="truncate">Log Out</span>
          </Button>
        </div>
        <div className="hidden group-data-[collapsible=icon]:flex justify-center p-2">
          <Button variant="ghost" size="icon" className="text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 h-9 w-9 md:h-10 md:w-10 focus-ring-enhanced" onClick={handleLogout} aria-label="Log out of your account">
            <LogOut className="h-4 w-4" aria-hidden="true"/>
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>);
}
