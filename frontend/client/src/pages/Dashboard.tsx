import { useQuery } from "@tanstack/react-query";
import { Sparkles, TrendingDown, AlertCircle, RefreshCw } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/lib/api";

function generateDashboardChartData(stats?: any) {
  if (!stats) {
    return [
      { name: "Jan", loans: 4000, repayments: 2400 },
      { name: "Feb", loans: 3000, repayments: 1398 },
      { name: "Mar", loans: 2000, repayments: 9800 },
      { name: "Apr", loans: 2780, repayments: 3908 },
      { name: "May", loans: 1890, repayments: 4800 },
      { name: "Jun", loans: 2390, repayments: 3800 },
      { name: "Jul", loans: 3490, repayments: 4300 },
    ];
  }

  const avgLoan = (stats.totalActiveLoans ? stats.totalActiveLoans / Math.max(stats.activeMembers, 1) : 5000);
  const avgRepayment = avgLoan * 0.6;

  return [
    { name: "Jan", loans: avgLoan * 0.8, repayments: avgRepayment * 0.7 },
    { name: "Feb", loans: avgLoan * 0.7, repayments: avgRepayment * 0.6 },
    { name: "Mar", loans: avgLoan * 0.6, repayments: avgRepayment * 0.9 },
    { name: "Apr", loans: avgLoan * 0.9, repayments: avgRepayment * 0.75 },
    { name: "May", loans: avgLoan * 0.5, repayments: avgRepayment * 0.85 },
    { name: "Jun", loans: avgLoan * 0.8, repayments: avgRepayment * 0.65 },
    { name: "Jul", loans: avgLoan * 1.1, repayments: avgRepayment * 0.95 },
  ];
}

export default function Dashboard() {
  const { data: stats, refetch, isRefetching } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: api.getDashboardStats,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });

  return (
    <Layout>
        <div className="space-y-6 md:space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-foreground">Dashboard</h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">Overview of your branch performance and loan portfolio.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <button
                onClick={() => refetch()}
                disabled={isRefetching}
                className="flex items-center justify-center gap-2 px-3 py-2 text-xs md:text-sm rounded-lg border border-border hover:bg-muted transition disabled:opacity-50"
              >
                <RefreshCw size={16} className={isRefetching ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground bg-muted/50 px-3 py-2 md:py-1 rounded-full border border-border">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="hidden sm:inline">System Live</span>
                <span className="sm:hidden">Live</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-4">
            <Card className="hover:shadow-lg transition-all duration-200 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Total Active Loans</CardTitle>
                <CreditCard className="h-3 w-3 md:h-4 md:w-4 text-primary flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold font-heading truncate" data-testid="stat-total-loans">
                  KES {stats ? (parseFloat(stats.totalActiveLoans) / 1000000).toFixed(1) : "0"}M
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                  <span className="text-green-500 font-medium">Live</span>
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-all duration-200 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Total Savings</CardTitle>
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-secondary flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold font-heading truncate" data-testid="stat-total-savings">
                  KES {stats ? (parseFloat(stats.totalSavings) / 1000000).toFixed(1) : "0"}M
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                  <span className="text-green-500 font-medium">Deposits</span>
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-all duration-200 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Active Members</CardTitle>
                <Users className="h-3 w-3 md:h-4 md:w-4 text-blue-500 flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold font-heading" data-testid="stat-active-members">
                  {stats?.activeMembers || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Active customers</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-all duration-200 border-border/50 bg-red-50/50 dark:bg-red-900/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-destructive">Arrears Alert</CardTitle>
                <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-destructive flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold font-heading text-destructive" data-testid="stat-arrears">
                  {stats?.arrearsCount || 0}
                </div>
                <p className="text-xs text-destructive/80 mt-1">Overdue {'>'} 7 days</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-3 md:gap-4 md:grid-cols-7 auto-rows-max">
            <Card className="md:col-span-4 border-border/50 w-full overflow-hidden">
              <CardHeader>
                <CardTitle className="text-sm md:text-base font-heading">Loan Disbursement vs Repayment</CardTitle>
              </CardHeader>
              <CardContent className="pl-0 md:pl-0 pr-0 pb-0 w-full overflow-hidden">
                <div style={{ width: '100%', height: '300px', minWidth: 0, overflow: 'hidden' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={generateDashboardChartData(stats)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorLoans" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorRepayments" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `K${value}`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                      <Area type="monotone" dataKey="loans" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorLoans)" />
                      <Area type="monotone" dataKey="repayments" stroke="hsl(var(--secondary))" strokeWidth={2} fillOpacity={1} fill="url(#colorRepayments)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-3 border-border/50">
              <CardHeader>
                <CardTitle className="text-sm md:text-base font-heading">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 md:space-y-6">
                  {[
                    { user: "Sarah K.", action: "Applied for Business Loan", amount: "KES 50,000", time: "2m ago", icon: Activity, color: "text-blue-500" },
                    { user: "Group A", action: "Weekly Repayment", amount: "KES 12,000", time: "15m ago", icon: ArrowDownRight, color: "text-green-500" },
                    { user: "John D.", action: "New Member Registration", amount: "Fee Paid", time: "1h ago", icon: Users, color: "text-orange-500" },
                    { user: "Stock Alert", action: "Solar Batteries Low", amount: "5 units left", time: "2h ago", icon: AlertTriangle, color: "text-red-500" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start md:items-center gap-2 md:gap-4">
                      <div className={`h-8 w-8 md:h-9 md:w-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${item.color} bg-opacity-10`}>
                        <item.icon className={`h-4 w-4 md:h-5 md:w-5 ${item.color}`} />
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-medium leading-none truncate">{item.user}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{item.action}</p>
                      </div>
                      <div className="font-medium text-xs md:text-sm text-right flex-shrink-0">
                        <div className="truncate">{item.amount}</div>
                        <div className="text-xs text-muted-foreground font-normal whitespace-nowrap">{item.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-3">
            <Card className="border-border/50 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">AI Insights</CardTitle>
                <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-purple-600 flex-shrink-0" />
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

            <Card className="border-border/50 bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-900/20 dark:to-red-900/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">System Instructions</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-600" />
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

            <Card className="border-border/50 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Performance</CardTitle>
                <TrendingDown className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Loan Recovery</span>
                    <span className="font-bold text-green-600">94%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Member Retention</span>
                    <span className="font-bold text-blue-600">89%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </Layout>
  );
}
