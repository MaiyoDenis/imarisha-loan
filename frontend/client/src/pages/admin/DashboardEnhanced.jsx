import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { api } from '@/lib/api';
import {
  AlertCircle, Download, RefreshCw, TrendingUp, TrendingDown,
  DollarSign, Activity, Users, Loader, CheckCheck, Lightbulb, Circle,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const neon = {
  bg: 'from-[#06142A] via-[#0B1E3A] to-[#101735]',
  panel: 'bg-[rgba(14,24,44,0.55)] backdrop-blur-xl border border-[rgba(99,102,241,0.25)]',
  border: 'border-[rgba(99,102,241,0.35)]',
  cyan: '#22D3EE',
  blue: '#60A5FA',
  violet: '#8B5CF6',
  magenta: '#EC4899',
};

const KPICard = ({ title, value, icon: Icon, subtitle }) => (
  <Card className={`${neon.panel} rounded-2xl`}>
    <CardContent className="p-4">
      <p className="text-[13px] text-slate-300/80">{title}</p>
      <div className="mt-2 flex items-end justify-between">
        <p className="text-2xl md:text-3xl font-semibold text-white">{value}</p>
        <Icon className="h-5 w-5 text-cyan-300" />
      </div>
      {subtitle && <p className="text-xs text-slate-400 mt-2">{subtitle}</p>}
    </CardContent>
  </Card>
);

export default function AdminDashboardEnhanced() {
  const [activityPeriod, setActivityPeriod] = useState('daily');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-KE').format(value);
  };

  const gridBg = useMemo(
    () => ({
      backgroundImage:
        'radial-gradient(circle at 20% -10%, rgba(82, 97, 255, 0.35), transparent 35%), radial-gradient(circle at 90% 10%, rgba(236, 72, 153, 0.25), transparent 40%), radial-gradient(1000px 600px at 50% 110%, rgba(34, 211, 238, 0.15), transparent 60%)',
    }),
    []
  );

  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const user = userStr ? JSON.parse(userStr) : null;
  const userName = user ? `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}` : 'Admin';
  const userInitials = user ? `${(user.first_name || user.firstName || '')[0] || ''}${(user.last_name || user.lastName || '')[0] || ''}`.toUpperCase() : 'A';
  const userBranchId = (user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'it_support') ? null : user?.branch_id || user?.branchId;
  
  const { data: dashboard, isLoading, refetch } = useQuery({
    queryKey: ['adminDashboard_v2', userBranchId],
    queryFn: () => api.getAdminDashboard(userBranchId),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });

  if (typeof window !== 'undefined') {
    console.log('[Dashboard] User Data:', { role: user?.role, branchId: userBranchId, fullUser: user });
    if (dashboard) {
        console.log('[Dashboard] Metrics:', dashboard.member_metrics);
    }
  }

  const { data: aiInsights, isLoading: insightsLoading } = useQuery({
    queryKey: ['aiInsights'],
    queryFn: () => api.getDashboardAIInsights(),
    staleTime: 10 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['dashboardActivities', activityPeriod],
    queryFn: () => api.getDashboardActivities(activityPeriod, 10),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    if (!dashboard) return;
    const csvContent = `Dashboard Export\nGenerated: ${new Date().toLocaleString()}\n\nKey Metrics\n${JSON.stringify(dashboard, null, 2)}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className={`min-h-screen relative px-4 sm:px-6 lg:px-10 py-6 bg-gradient-to-br ${neon.bg}`} style={gridBg}>
          <div className="max-w-[1400px] mx-auto flex items-center justify-center h-screen">
            <div className="text-center">
              <Loader className="h-12 w-12 animate-spin text-cyan-300 mx-auto mb-4" />
              <p className="text-slate-300">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const loanVsRepaymentData = (dashboard?.loan_trends || []).map(item => ({
    month: item.month,
    disbursed: item.disbursed || 0,
    repaid: item.repaid || 0,
  }));

  return (
    <Layout>
      <div className={`min-h-screen relative px-4 sm:px-6 lg:px-10 py-6 bg-gradient-to-br ${neon.bg}`} style={gridBg}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-10 rounded-3xl" style={{
            boxShadow:
              '0 0 80px rgba(99,102,241,0.25), inset 0 0 40px rgba(99,102,241,0.08)'
          }}/>
        </div>

        <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-6 relative">
          <section className="col-span-12 space-y-6">
            {/* Header */}
            <div className={`rounded-2xl ${neon.panel} p-4 md:p-5 flex items-center justify-between`}>
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-white">Dashboard</h1>
                <p className="text-[13px] text-slate-300/80 mt-1">Overview of portfolio and repayments</p>
              </div>
              <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={handleRefresh} 
                    disabled={isRefreshing}
                    className="text-slate-300 hover:text-cyan-300 hover:bg-white/5"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={handleExport}
                    className="text-slate-300 hover:text-cyan-300 hover:bg-white/5"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <KPICard
                title="Total Outstanding"
                value={formatCurrency(dashboard?.lending_analytics?.total_outstanding || 0)}
                icon={CheckCheck}
                subtitle="Active Portfolio"
              />
              <KPICard
                title="Total Savings"
                value={formatCurrency(dashboard?.member_metrics?.lifetime_value || 0)}
                icon={DollarSign}
                subtitle="Deposits"
              />
              <KPICard
                title="Active Members"
                value={formatNumber(dashboard?.member_metrics?.active_members || 0)}
                icon={Users}
                subtitle="Active customers"
              />
              <KPICard
                title="Arrears Alert"
                value={formatNumber(dashboard?.risk_metrics?.at_risk_loans || 0)}
                icon={AlertCircle}
                subtitle="Overdue > 7 days"
              />
            </div>

            {/* Loans vs Repayments Chart */}
            <Card className={`${neon.panel} rounded-2xl`}>
              <CardContent className="p-4 md:p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-sky-300"/>
                    <p className="text-sm text-white/90 font-semibold">Loans vs Repayments</p>
                  </div>
                </div>
                <div className="h-[300px]">
                  {loanVsRepaymentData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={loanVsRepaymentData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                        <YAxis stroke="rgba(255,255,255,0.5)" />
                        <Tooltip 
                          formatter={(value) => formatCurrency(value)}
                          contentStyle={{ backgroundColor: 'rgba(14,24,44,0.9)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px' }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="disbursed" 
                          stroke="#60A5FA" 
                          name="Loans Disbursed"
                          strokeWidth={2}
                          dot={{ fill: '#60A5FA', r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="repaid" 
                          stroke="#10B981" 
                          name="Repayments"
                          strokeWidth={2}
                          dot={{ fill: '#10B981', r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-300">
                      No data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* System Instructions & Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className={`${neon.panel} rounded-2xl`}>
                <CardHeader>
                  <CardTitle className="text-white">System Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <p className="font-semibold text-sm text-white">Dashboard</p>
                      <p className="text-xs text-slate-300">View branch performance metrics</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">🤖</span>
                    <div>
                      <p className="font-semibold text-sm text-white">AI Analytics</p>
                      <p className="text-xs text-slate-300">Advanced insights & forecasting</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="font-semibold text-sm text-white">Risk</p>
                      <p className="text-xs text-slate-300">Monitor loan defaults & member health</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${neon.panel} rounded-2xl`}>
                <CardHeader>
                  <CardTitle className="text-white">Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-medium text-slate-300">Loan Recovery</span>
                    </div>
                    <span className="text-2xl font-bold text-emerald-400">94%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-slate-300">Member Retention</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-400">89%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Risk Prediction & Trend Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className={`${neon.panel} rounded-2xl`}>
                <CardHeader>
                  <CardTitle className="text-sm text-white">Risk Prediction</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300">
                    AI identified {dashboard?.risk_metrics?.at_risk_loans || 12} members at medium risk for default
                  </p>
                </CardContent>
              </Card>

              <Card className={`${neon.panel} rounded-2xl`}>
                <CardHeader>
                  <CardTitle className="text-sm text-white">Trend Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300">
                    Loan disbursements trending {dashboard?.lending_analytics?.portfolio_growth > 0 ? 'up' : 'down'} {Math.abs(dashboard?.lending_analytics?.portfolio_growth || 8).toFixed(1)}% this quarter
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-cyan-300" />
                <h2 className="text-lg font-semibold text-white">AI Daily Insights</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                {insightsLoading ? (
                  <div className="col-span-full flex items-center justify-center py-6">
                    <Loader className="h-6 w-6 animate-spin text-cyan-300" />
                  </div>
                ) : aiInsights?.insights && aiInsights.insights.length > 0 ? (
                  aiInsights.insights.map((insight, idx) => (
                    <Card key={idx} className={`${neon.panel} rounded-2xl border-l-4 ${
                      insight.type === 'warning' ? 'border-l-amber-400' :
                      insight.type === 'success' ? 'border-l-emerald-400' :
                      insight.type === 'info' ? 'border-l-cyan-400' :
                      'border-l-red-400'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2 mb-2">
                          <Lightbulb className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                            insight.type === 'warning' ? 'text-amber-400' :
                            insight.type === 'success' ? 'text-emerald-400' :
                            insight.type === 'info' ? 'text-cyan-300' :
                            'text-red-400'
                          }`} />
                          <p className="text-sm font-semibold text-white">{insight.title}</p>
                        </div>
                        <p className="text-xs text-slate-300 mb-3">{insight.description}</p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-medium px-2 py-1 rounded border ${
                            insight.priority === 'high' ? 'bg-red-500/15 text-red-300 border-red-400/30' :
                            insight.priority === 'medium' ? 'bg-amber-500/15 text-amber-300 border-amber-400/30' :
                            'bg-cyan-500/15 text-cyan-300 border-cyan-400/30'
                          }`}>
                            {insight.priority}
                          </span>
                          <Button size="sm" variant="ghost" className="h-auto p-0 text-xs text-slate-300 hover:text-cyan-300">
                            {insight.action}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className={`col-span-full ${neon.panel} rounded-2xl`}>
                    <CardContent className="p-4">
                      <p className="text-slate-300 text-center text-sm">No insights available</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Activities Section */}
            <Card className={`${neon.panel} rounded-2xl`}>
              <CardContent className="p-4 md:p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-magenta-400"/>
                    <p className="text-sm text-white/90 font-semibold">Recent Admin Activities</p>
                  </div>
                  <select
                    value={activityPeriod}
                    onChange={(e) => setActivityPeriod(e.target.value)}
                    className="text-xs bg-white/5 border border-white/10 text-white rounded px-2 py-1 cursor-pointer"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="space-y-3">
                  {activitiesLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader className="h-4 w-4 animate-spin text-cyan-300" />
                    </div>
                  ) : activities?.activities && activities.activities.length > 0 ? (
                    activities.activities.map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-3 pb-3 border-b border-white/10 last:border-b-0">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                            <Users className="w-3.5 h-3.5 text-cyan-300" />
                          </div>
                          <Circle className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 ${
                            activity.status === 'online' ? 'fill-emerald-400 text-emerald-400' : 'fill-slate-500 text-slate-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{activity.userName}</p>
                          <p className="text-xs text-slate-300 truncate">{activity.description}</p>
                          <p className="text-xs text-slate-400 mt-1">{activity.timeAgo}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-300 text-xs text-center py-4">No activities in this period</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </Layout>
  );
}
