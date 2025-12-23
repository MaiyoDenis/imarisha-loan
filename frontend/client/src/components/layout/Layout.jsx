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
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Menu, Bell, MessageSquare, User, LogOut, ChevronDown } from "lucide-react";
import React, { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
export default function Layout(_a) {
    var _this = this;
    var _b, _c;
    var children = _a.children;
    var _d = useState(false), showProfileMenu = _d[0], setShowProfileMenu = _d[1];
    var _e = useLocation(), setLocation = _e[1];
    var toast = useToast().toast;
    var userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    var user = userStr ? JSON.parse(userStr) : null;
    var userInitials = user ? "".concat(((_b = user.firstName) === null || _b === void 0 ? void 0 : _b[0]) || '').concat(((_c = user.lastName) === null || _c === void 0 ? void 0 : _c[0]) || '').toUpperCase() : 'A';
    var userName = user ? "".concat(user.firstName, " ").concat(user.lastName) : 'Admin';
    var notifications = [
        { id: 1, message: 'Low stock alert: Product X', time: '5 min ago', read: false },
        { id: 2, message: 'Loan repayment due', time: '1 hour ago', read: false },
        { id: 3, message: 'System maintenance scheduled', time: '2 hours ago', read: true }
    ];
    var messages = [
        { id: 1, sender: 'John Doe', message: 'Can you review the report?', time: '10 min ago', unread: true },
        { id: 2, sender: 'Jane Smith', message: 'Meeting at 3 PM', time: '30 min ago', unread: false }
    ];
    var unreadNotifications = notifications.filter(function (n) { return !n.read; }).length;
    var unreadMessages = messages.filter(function (m) { return m.unread; }).length;
    var handleLogout = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
                toast({
                    title: "Logged out",
                    description: "You have been logged out successfully",
                });
                setLocation('/');
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
    return (<SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 md:h-16 shrink-0 items-center justify-between px-3 md:px-4 sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
          <SidebarTrigger className="-ml-1 md:-ml-2 p-1 md:p-0">
            <Menu className="h-5 w-5 md:h-6 md:w-6"/>
          </SidebarTrigger>
          
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-background rounded-lg transition">
                <Bell size={20}/>
                {unreadNotifications > 0 && (<span className="absolute top-1 right-1 bg-destructive/100 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>)}
              </button>
            </div>

            {/* Messages */}
            <div className="relative">
              <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-background rounded-lg transition">
                <MessageSquare size={20}/>
                {unreadMessages > 0 && (<span className="absolute top-1 right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadMessages}
                  </span>)}
              </button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button onClick={function () { return setShowProfileMenu(!showProfileMenu); }} className="flex items-center gap-2 px-3 py-2 text-foreground hover:bg-background rounded-lg transition">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white font-bold text-sm">
                  {userInitials}
                </div>
                <span className="text-sm font-medium hidden sm:inline">{userName}</span>
                <ChevronDown size={16} className={"transition ".concat(showProfileMenu ? 'rotate-180' : '')}/>
              </button>

              {/* Profile Menu Dropdown */}
              {showProfileMenu && (<div className="absolute right-0 mt-2 w-48 bg-card rounded-lg border border-border shadow-lg z-50">
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-foreground hover:bg-background transition border-b border-border">
                    <User size={16}/>
                    <span>Profile Settings</span>
                  </button>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-destructive hover:bg-destructive/10 transition">
                    <LogOut size={16}/>
                    <span>Logout</span>
                  </button>
                </div>)}
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-3 md:gap-4 p-3 md:p-4 pt-0 overflow-y-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>);
}
