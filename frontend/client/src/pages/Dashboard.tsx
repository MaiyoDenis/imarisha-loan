import { useQuery } from "@tanstack/react-query";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/lib/api";

const data = [
  { name: "Jan", loans: 4000, repayments: 2400 },
  { name: "Feb", loans: 3000, repayments: 1398 },
  { name: "Mar", loans: 2000, repayments: 9800 },
  { name: "Apr", loans: 2780, repayments: 3908 },
  { name: "May", loans: 1890, repayments: 4800 },
  { name: "Jun", loans: 2390, repayments: 3800 },
  { name: "Jul", loans: 3490, repayments: 4300 },
];

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: api.getDashboardStats,
  });

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Overview of your branch performance and loan portfolio.</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              System Live
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-lg transition-all duration-200 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Active Loans</CardTitle>
                <CreditCard className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-heading" data-testid="stat-total-loans">
                  KES {stats ? parseFloat(stats.totalActiveLoans).toLocaleString() : "0"}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">Live data</span>
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-all duration-200 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Savings</CardTitle>
                <TrendingUp className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-heading" data-testid="stat-total-savings">
                  KES {stats ? parseFloat(stats.totalSavings).toLocaleString() : "0"}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">Deposits</span>
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-all duration-200 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Members</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-heading" data-testid="stat-active-members">
                  {stats?.activeMembers || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  Active customers
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-all duration-200 border-border/50 bg-red-50/50 dark:bg-red-900/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-destructive">Arrears Alert</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-heading text-destructive" data-testid="stat-arrears">
                  {stats?.arrearsCount || 0}
                </div>
                <p className="text-xs text-destructive/80 mt-1 flex items-center">
                  Loans overdue {'>'} 7 days
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-7">
            <Card className="col-span-4 border-border/50">
              <CardHeader>
                <CardTitle className="font-heading">Loan Disbursement vs Repayment</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
            
            <Card className="col-span-3 border-border/50">
              <CardHeader>
                <CardTitle className="font-heading">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {[
                    { user: "Sarah K.", action: "Applied for Business Loan", amount: "KES 50,000", time: "2m ago", icon: Activity, color: "text-blue-500" },
                    { user: "Group A", action: "Weekly Repayment", amount: "KES 12,000", time: "15m ago", icon: ArrowDownRight, color: "text-green-500" },
                    { user: "John D.", action: "New Member Registration", amount: "Fee Paid", time: "1h ago", icon: Users, color: "text-orange-500" },
                    { user: "Stock Alert", action: "Solar Batteries Low", amount: "5 units left", time: "2h ago", icon: AlertTriangle, color: "text-red-500" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center">
                      <div className={`h-9 w-9 rounded-full bg-muted flex items-center justify-center mr-4 ${item.color} bg-opacity-10`}>
                        <item.icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{item.user}</p>
                        <p className="text-xs text-muted-foreground">{item.action}</p>
                      </div>
                      <div className="ml-auto font-medium text-sm text-right">
                        <div>{item.amount}</div>
                        <div className="text-xs text-muted-foreground font-normal">{item.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
