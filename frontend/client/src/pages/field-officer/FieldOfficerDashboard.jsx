import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Layout from "@/components/layout/Layout";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading";
import { AlertCircle, TrendingUp, Users, DollarSign, Percent, Download } from "lucide-react";
import KPICard from "@/components/dashboards/KPICard";

import { ExportDataModal } from "@/components/field-officer/ExportDataModal";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function FieldOfficerDashboard() {
  const [, setLocation] = useLocation();
  const [showExportData, setShowExportData] = useState(false);

  const { data: groups, isLoading, error } = useQuery({
    queryKey: ["fieldOfficerGroups"],
    queryFn: () => api.getFieldOfficerGroups(),
  });

  const analytics = useMemo(() => {
    if (!groups || groups.length === 0) {
      return {
        totalGroups: 0,
        totalMembers: 0,
        totalSavings: 0,
        totalOutstanding: 0,
        averageRepayment: 0,
      };
    }

    return {
      totalGroups: groups.length,
      totalMembers: groups.reduce((sum, g) => sum + g.totalMembers, 0),
      totalSavings: groups.reduce(
        (sum, g) => sum + parseFloat(g.totalSavings || "0"),
        0
      ),
      totalOutstanding: groups.reduce(
        (sum, g) => sum + parseFloat(g.totalLoansOutstanding || "0"),
        0
      ),
      averageRepayment:
        groups.reduce((sum, g) => sum + g.repaymentRate, 0) /
        groups.length,
    };
  }, [groups]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <Layout>
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6 bg-gradient-to-br from-background via-background to-muted/20 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Field Officer Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Track your groups, manage visits, and monitor performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowExportData(true)}
            className="gap-2"
            variant="outline"
            size="lg"
          >
            <Download className="h-5 w-5" />
            Export
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-4 text-red-800">
          <AlertCircle className="h-5 w-5" />
          <span>{error.message}</span>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <KPICard
              title="Total Groups"
              value={analytics.totalGroups}
              icon={<Users size={24} />}
              status="normal"
            />

            <KPICard
              title="Total Members"
              value={analytics.totalMembers}
              icon={<Users size={24} />}
              status="normal"
            />

            <KPICard
              title="Total Savings"
              value={new Intl.NumberFormat('en-KE').format(analytics.totalSavings)}
              unit="KES"
              icon={<DollarSign size={24} />}
              status="success"
            />

            <KPICard
              title="Outstanding Loans"
              value={new Intl.NumberFormat('en-KE').format(analytics.totalOutstanding)}
              unit="KES"
              icon={<TrendingUp size={24} />}
              status="warning"
            />

            <KPICard
              title="Avg. Repayment Rate"
              value={analytics.averageRepayment.toFixed(1)}
              unit="%"
              icon={<Percent size={24} />}
              status={analytics.averageRepayment >= 90 ? 'success' : analytics.averageRepayment >= 70 ? 'warning' : 'critical'}
            />
          </div>

      {/* Charts Section */}
      {groups && groups.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Financial Overview Chart */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Financial Overview by Group</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={groups}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      formatter={(value) => `KES ${new Intl.NumberFormat('en-KE').format(value)}`}
                    />
                    <Legend />
                    <Bar dataKey="totalSavings" name="Total Savings" fill="#8884d8" />
                    <Bar dataKey="totalLoansOutstanding" name="Outstanding Loans" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Repayment Performance Chart */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Repayment Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={groups}
                    layout="vertical"
                    margin={{
                      top: 20,
                      right: 30,
                      left: 40,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      formatter={(value) => `${value}%`}
                    />
                    <Legend />
                    <Bar dataKey="repaymentRate" name="Repayment Rate (%)" fill="#ffc658">
                      {groups.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.repaymentRate >= 90 ? '#4ade80' : entry.repaymentRate >= 70 ? '#facc15' : '#f87171'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Member Distribution Chart */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Member Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={groups}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="totalMembers"
                      nameKey="name"
                    >
                      {groups.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mobile Tools Section - Moved to Sidebar */}

      <ExportDataModal
        open={showExportData}
        onOpenChange={setShowExportData}
        groups={groups || []}
      />
    </div>
    </Layout>
  );
}
