import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Menu, Bell, MessageSquare, User, LogOut, ChevronDown } from "lucide-react";
import React, { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const user = userStr ? JSON.parse(userStr) : null;
  const userInitials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'A';
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Admin';

  const notifications = [
    { id: 1, message: 'Low stock alert: Product X', time: '5 min ago', read: false },
    { id: 2, message: 'Loan repayment due', time: '1 hour ago', read: false },
    { id: 3, message: 'System maintenance scheduled', time: '2 hours ago', read: true }
  ];
  const messages = [
    { id: 1, sender: 'John Doe', message: 'Can you review the report?', time: '10 min ago', unread: true },
    { id: 2, sender: 'Jane Smith', message: 'Meeting at 3 PM', time: '30 min ago', unread: false }
  ];

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const unreadMessages = messages.filter(m => m.unread).length;

  const handleLogout = async () => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      setLocation('/');
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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 md:h-16 shrink-0 items-center justify-between px-3 md:px-4 sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
          <SidebarTrigger className="-ml-1 md:-ml-2 p-1 md:p-0">
            <Menu className="h-5 w-5 md:h-6 md:w-6" />
          </SidebarTrigger>
          
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-background rounded-lg transition">
                <Bell size={20} />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 bg-destructive/100 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            </div>

            {/* Messages */}
            <div className="relative">
              <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-background rounded-lg transition">
                <MessageSquare size={20} />
                {unreadMessages > 0 && (
                  <span className="absolute top-1 right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-3 py-2 text-foreground hover:bg-background rounded-lg transition"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white font-bold text-sm">
                  {userInitials}
                </div>
                <span className="text-sm font-medium hidden sm:inline">{userName}</span>
                <ChevronDown size={16} className={`transition ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Menu Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg border border-border shadow-lg z-50">
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-foreground hover:bg-background transition border-b border-border">
                    <User size={16} />
                    <span>Profile Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-destructive hover:bg-destructive/10 transition"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-3 md:gap-4 p-3 md:p-4 pt-0 overflow-y-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
