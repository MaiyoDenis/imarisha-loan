import { useQuery } from "@tanstack/react-query";
import { Sparkles, TrendingDown, AlertCircle, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/lib/api";
import { useRoleRedirect } from "@/hooks/use-role-redirect";
export default function Dashboard() {
    var _a = useLocation(), setLocation = _a[1];
    useEffect(function () {
        var userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                var user = JSON.parse(userStr);
                if (user.role === 'procurement_officer') {
                    setLocation('/procurement');
                }
                else if (user.role === 'branch_manager') {
                    setLocation('/dashboards/branch-manager');
                }
            }
            catch (e) {
                console.error('Failed to parse user from localStorage', e);
            }
        }
    }, [setLocation]);
    useRoleRedirect({
        allowedRoles: ['admin', 'branch_manager', 'loan_officer', 'procurement_officer', 'customer'],
        fallbackPath: '/field-officer'
    });
    var _b = useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: api.getDashboardStats,
        staleTime: 5 * 60 * 1000,
        refetchInterval: 30 * 1000,
    }), stats = _b.data, refetch = _b.refetch, isRefetching = _b.isRefetching;
    return (<Layout>
        <div className="space-y-6 md:space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tight text-foreground">Dashboard</h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">Overview of your branch performance and loan portfolio.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <button onClick={function () { return refetch(); }} disabled={isRefetching} className="button-primary px-4 py-2 text-xs md:text-sm rounded-lg disabled:opacity-50" aria-label={isRefetching ? "Refreshing dashboard data" : "Refresh dashboard data"}>
                <RefreshCw size={16} className={isRefetching ? 'animate-spin' : ''} aria-hidden="true"/>
                <span className="hidden sm:inline ml-2">Refresh</span>
              </button>
              <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-foreground bg-card border border-border px-3 py-2 md:py-1 rounded-full shadow-sm">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="hidden sm:inline">System Live</span>
                <span className="sm:hidden">Live</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-4">
            <Card className="stat-card" role="region" aria-label="Total active loans">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Total Active Loans</CardTitle>
                <CreditCard className="h-3 w-3 md:h-4 md:w-4 text-primary flex-shrink-0" aria-hidden="true"/>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold font-heading truncate" data-testid="stat-total-loans">
                  KES {stats ? (parseFloat(stats.totalActiveLoans) / 1000000).toFixed(1) : "0"}M
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" aria-hidden="true"/>
                  <span className="text-green-500 font-medium">Live</span>
                </p>
              </CardContent>
            </Card>
            <Card className="stat-card" role="region" aria-label="Total savings">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Total Savings</CardTitle>
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-secondary flex-shrink-0" aria-hidden="true"/>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold font-heading truncate" data-testid="stat-total-savings">
                  KES {stats ? (parseFloat(stats.totalSavings) / 1000000).toFixed(1) : "0"}M
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1 flex-shrink-0"/>
                  <span className="text-green-500 font-medium">Deposits</span>
                </p>
              </CardContent>
            </Card>
            <Card className="stat-card" role="region" aria-label="Active members">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Active Members</CardTitle>
                <Users className="h-3 w-3 md:h-4 md:w-4 text-primary flex-shrink-0" aria-hidden="true"/>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold font-heading" data-testid="stat-active-members">
                  {(stats === null || stats === void 0 ? void 0 : stats.activeMembers) || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Active customers</p>
              </CardContent>
            </Card>
            <Card className="stat-card" role="region" aria-label="Arrears alert">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-destructive">Arrears Alert</CardTitle>
                <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-destructive flex-shrink-0" aria-hidden="true"/>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold font-heading text-destructive" data-testid="stat-arrears">
                  {(stats === null || stats === void 0 ? void 0 : stats.arrearsCount) || 0}
                </div>
                <p className="text-xs text-destructive/80 mt-1">Overdue {'>'} 7 days</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-3 md:gap-4 md:grid-cols-7 auto-rows-max">
            <Card className="md:col-span-7">
              <CardHeader>
                <CardTitle className="text-sm md:text-base font-heading">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 md:space-y-6">
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No recent activity to display.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">AI Insights</CardTitle>
                <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-primary flex-shrink-0"/>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="font-medium text-foreground">Risk Prediction</p>
                    <p className="text-xs text-muted-foreground mt-1">AI identified 12 members at medium risk for default</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-foreground">Trend Analysis</p>
                    <p className="text-xs text-muted-foreground mt-1">Loan disbursements trending up 8% this quarter</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">System Instructions</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-600"/>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-xs">
                    <span className="font-medium">📊 Dashboard:</span> View branch performance metrics
                  </p>
                  <p className="text-xs">
                    <span className="font-medium">🤖 AI Analytics:</span> Advanced insights & forecasting
                  </p>
                  <p className="text-xs">
                    <span className="font-medium">⚠️ Risk:</span> Monitor loan defaults & member health
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Performance</CardTitle>
                <TrendingDown className="h-4 w-4 text-secondary"/>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Loan Recovery</span>
                    <span className="font-bold text-secondary">94%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Member Retention</span>
                    <span className="font-bold text-primary">89%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </Layout>);
}
