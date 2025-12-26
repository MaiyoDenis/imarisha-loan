var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator["throw"](value));
        }
        catch (e) {
            reject(e);
        } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1)
            throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f)
            throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _)
            try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                    return t;
                if (y = 0, t)
                    op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0:
                    case 1:
                        t = op;
                        break;
                    case 4:
                        _.label++;
                        return { value: op[1], done: false };
                    case 5:
                        _.label++;
                        y = op[1];
                        op = [0];
                        continue;
                    case 7:
                        op = _.ops.pop();
                        _.trys.pop();
                        continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                            _ = 0;
                            continue;
                        }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                            _.label = op[1];
                            break;
                        }
                        if (op[0] === 6 && _.label < t[1]) {
                            _.label = t[1];
                            t = op;
                            break;
                        }
                        if (t && _.label < t[2]) {
                            _.label = t[2];
                            _.ops.push(op);
                            break;
                        }
                        if (t[2])
                            _.ops.pop();
                        _.trys.pop();
                        continue;
                }
                op = body.call(thisArg, _);
            }
            catch (e) {
                op = [6, e];
                y = 0;
            }
            finally {
                f = t = 0;
            }
        if (op[0] & 5)
            throw op[1];
        return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Menu, Bell, MessageSquare, User, LogOut, ChevronDown, Check, Clock } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Layout(_a) {
    var _this = this;
    var _b, _c;
    var children = _a.children, _d = _a.noSidebar, noSidebar = _d === void 0 ? false : _d;
    var _d = useState(false), showProfileMenu = _d[0], setShowProfileMenu = _d[1];
    var _e = useLocation(), location = _e[0], setLocation = _e[1];
    var scrollPositions = useRef({});
    var contentRef = useRef(null);
    var toast = useToast().toast;
    var userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    var user = userStr ? JSON.parse(userStr) : null;
    var userId = (user === null || user === void 0 ? void 0 : user.id) || 0;
    var userInitials = user ? "".concat(((_b = user.firstName) === null || _b === void 0 ? void 0 : _b[0]) || '').concat(((_c = user.lastName) === null || _c === void 0 ? void 0 : _c[0]) || '').toUpperCase() : 'A';
    var userName = user ? "".concat(user.firstName, " ").concat(user.lastName) : 'Admin';

    // Fetch notifications
    var _f = useQuery({
        queryKey: ["notifications", userId],
        queryFn: function () { return api.getNotifications(userId); },
        enabled: !!userId,
        refetchInterval: 30000, // Poll every 30 seconds
    }), notificationData = _f.data, refetchNotifications = _f.refetch;
    var notifications = (notificationData === null || notificationData === void 0 ? void 0 : notificationData.notifications) || [];

    // Fetch unread message count
    var unreadMessageQuery = useQuery({
        queryKey: ["unread-message-count"],
        queryFn: api.getUnreadMessageCount,
        enabled: !!userId,
        refetchInterval: 30000,
    });
    var unreadMessages = ((_b = unreadMessageQuery.data) === null || _b === void 0 ? void 0 : _b.count) || 0;

    // Check meeting reminders for field officers
    useEffect(function () {
        if (user && user.role === 'field_officer') {
            api.checkMeetingReminders();
        }
    }, [user === null || user === void 0 ? void 0 : user.id]);

    // Save scroll position before navigation
    useEffect(function () {
        var container = contentRef.current;
        if (!container) return;
        var handleScroll = function () {
            scrollPositions.current[location] = container.scrollTop;
        };
        container.addEventListener('scroll', handleScroll);
        return function () { return container.removeEventListener('scroll', handleScroll); };
    }, [location]);

    // Restore scroll position on location change
    useEffect(function () {
        if (contentRef.current) {
            var savedPosition = scrollPositions.current[location];
            if (typeof savedPosition === 'number') {
                contentRef.current.scrollTop = savedPosition;
            }
        }
    }, [location]);

    var markReadMutation = useMutation({
        mutationFn: function (notificationId) { return api.markNotificationRead(notificationId, userId); },
        onSuccess: function () {
            refetchNotifications();
        },
    });

    var unreadNotifications = notifications.filter(function (n) { return n.status !== 'read'; }).length;

    var handleLogout = function () {
        return __awaiter(_this, void 0, void 0, function () {
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
        });
    };
    if (noSidebar) {
        return (<div className="min-h-screen">
          {children}
        </div>);
    }
    return (<SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 md:h-16 shrink-0 items-center justify-between px-3 md:px-4 sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
          <SidebarTrigger className="-ml-1 md:-ml-2 p-1 md:p-0">
            <Menu className="h-5 w-5 md:h-6 md:w-6"/>
          </SidebarTrigger>
          
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-background rounded-lg transition">
                  <Bell size={20}/>
                  {unreadNotifications > 0 && (<span className="absolute top-1 right-1 bg-destructive/100 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {unreadNotifications}
                    </span>)}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                  <h4 className="font-semibold text-sm">Notifications</h4>
                  {unreadNotifications > 0 && (
                    <Badge variant="secondary" className="text-xs">{unreadNotifications} New</Badge>
                  )}
                </div>
                <ScrollArea className="h-80">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      No notifications yet
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notifications.map((n) => (
                        <div key={n.notification_id} className={"p-4 text-sm hover:bg-muted/50 transition cursor-pointer ".concat(n.status !== 'read' ? 'bg-primary/5' : '')} onClick={() => n.status !== 'read' && markReadMutation.mutate(n.notification_id)}>
                          <div className="flex justify-between gap-2 mb-1">
                            <span className="font-medium text-xs text-primary uppercase tracking-wider">{n.category}</span>
                            <span className="text-[10px] text-muted-foreground">{n.sent_at ? format(new Date(n.sent_at), 'HH:mm') : ''}</span>
                          </div>
                          <p className={"text-sm ".concat(n.status !== 'read' ? 'font-medium' : 'text-muted-foreground')}>{n.message}</p>
                          {n.status !== 'read' && (
                            <div className="flex justify-end mt-2">
                              <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={(e) => {
                                e.stopPropagation();
                                markReadMutation.mutate(n.notification_id);
                              }}>
                                <Check className="h-3 w-3 mr-1" /> Mark read
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>

            {/* Messages */}
            <div className="relative">
              <button 
                onClick={() => setLocation('/messages')}
                className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-background rounded-lg transition"
              >
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
        <div ref={contentRef} className="flex flex-1 flex-col gap-3 md:gap-4 p-3 md:p-4 pt-0 overflow-y-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>);
}
