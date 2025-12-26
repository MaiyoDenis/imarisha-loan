import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LayoutGrid,
  CreditCard,
  Users,
  FileText,
  BarChart3,
  LogOut,
  Bell,
  Settings,
  ChevronRight,
  Loader,
  AlertCircle,
  Lightbulb,
  Activity,
  Circle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { api } from '@/lib/api';

const neon = {
  bg: 'from-[#06142A] via-[#0B1E3A] to-[#101735]',
  panel: 'bg-[rgba(14,24,44,0.55)] backdrop-blur-xl border border-[rgba(99,102,241,0.25)]',
  border: 'border-[rgba(99,102,241,0.35)]',
  cyan: '#22D3EE',
  blue: '#60A5FA',
  violet: '#8B5CF6',
  magenta: '#EC4899',
};

export default function AdminDashboardNeon() {
  const [activityPeriod, setActivityPeriod] = useState('daily');

  const { data: dashboard, isLoading, isError } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => api.getAdminDashboard(),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });

  const { data: aiInsights, isLoading: insightsLoading } = useQuery({
    queryKey: ['aiInsights'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/ai-insights');
      return response.json();
    },
    staleTime: 10 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['dashboardActivities', activityPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/activities?period=${activityPeriod}&limit=5`);
      return response.json();
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });

  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const user = userStr ? JSON.parse(userStr) : null;
  const userName = user ? `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}` : 'Admin';
  const userInitials = user ? `${(user.first_name || user.firstName || '')[0] || ''}${(user.last_name || user.lastName || '')[0] || ''}`.toUpperCase() : 'A';

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const gridBg = useMemo(
    () => ({
      backgroundImage:
        'radial-gradient(circle at 20% -10%, rgba(82, 97, 255, 0.35), transparent 35%), radial-gradient(circle at 90% 10%, rgba(236, 72, 153, 0.25), transparent 40%), radial-gradient(1000px 600px at 50% 110%, rgba(34, 211, 238, 0.15), transparent 60%)',
    }),
    []
  );

  const kpis = useMemo(() => {
    if (!dashboard?.lending_analytics) {
      return [
        { label: 'Total Loan Balance', value: '$0', delta: '+0.0%' },
        { label: 'Outstanding Loans', value: '$0', delta: '+0.0%' },
        { label: 'Active Loans', value: '0', delta: '+0.0%' },
      ];
    }

    return [
      {
        label: 'Total Loan Balance',
        value: formatCurrency(dashboard.lending_analytics.total_borrowed_amount || 0),
        delta: dashboard.lending_analytics.portfolio_growth ? `+${dashboard.lending_analytics.portfolio_growth.toFixed(1)}%` : '+0.0%',
      },
      {
        label: 'Outstanding Loans',
        value: formatCurrency(dashboard.lending_analytics.total_outstanding || 0),
        delta: dashboard.lending_analytics.outstanding_change ? `+${dashboard.lending_analytics.outstanding_change.toFixed(1)}%` : '+0.0%',
      },
      {
        label: 'Active Loans',
        value: (dashboard.lending_analytics.total_loans_active || 0).toLocaleString(),
        delta: dashboard.lending_analytics.active_loans_growth ? `+${dashboard.lending_analytics.active_loans_growth.toFixed(1)}%` : '+0.0%',
      },
    ];
  }, [dashboard]);

  const loanOverview = useMemo(() => {
    return dashboard?.loan_trends || [];
  }, [dashboard]);

  const upcomingPayments = useMemo(() => {
    return (dashboard?.upcoming_payments || []).slice(0, 4);
  }, [dashboard]);

  const recoveryRate = useMemo(() => {
    if (!dashboard?.repayment_tracking) return 76;
    const { total_completed = 0, total_disbursed = 0 } = dashboard.repayment_tracking;
    return total_disbursed > 0 ? ((total_completed / total_disbursed) * 100).toFixed(0) : 76;
  }, [dashboard]);

  const performanceMetrics = useMemo(() => {
    if (!dashboard?.lending_analytics) {
      return [
        { k: 'Disbursed', v: '$0' },
        { k: 'Repaid', v: '$0' },
        { k: 'Defaults', v: '$0' },
        { k: 'At Risk', v: '$0' },
      ];
    }

    return [
      { k: 'Disbursed', v: formatCurrency(dashboard.lending_analytics.total_borrowed_amount || 0) },
      { k: 'Repaid', v: formatCurrency(dashboard.lending_analytics.total_paid_amount || 0) },
      { k: 'Defaults', v: formatCurrency(dashboard.lending_analytics.default_amount || 0) },
      { k: 'At Risk', v: formatCurrency(dashboard.lending_analytics.at_risk_amount || 0) },
    ];
  }, [dashboard]);

  if (isLoading) {
    return (
      <Layout>
        <div className={`min-h-screen relative px-4 sm:px-6 lg:px-10 py-6 bg-gradient-to-br ${neon.bg}`} style={gridBg}>
          <div className="max-w-[1400px] mx-auto flex items-center justify-center h-screen">
            <div className="text-center">
              <Loader className="h-12 w-12 animate-spin text-sky-300 mx-auto mb-4" />
              <p className="text-slate-300">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div className={`min-h-screen relative px-4 sm:px-6 lg:px-10 py-6 bg-gradient-to-br ${neon.bg}`} style={gridBg}>
          <div className="max-w-[1400px] mx-auto">
            <Card className={`${neon.panel} rounded-2xl`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <AlertCircle className="h-8 w-8 text-red-400" />
                  <div>
                    <h3 className="text-red-400 font-semibold">Failed to load dashboard</h3>
                    <p className="text-slate-300 text-sm">There was an error loading your dashboard data.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

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
            <div className={`rounded-2xl ${neon.panel} p-4 md:p-5 flex items-center justify-between`}>
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-white">Dashboard</h1>
                <p className="text-[13px] text-slate-300/80 mt-1">Overview of portfolio and repayments</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 ring-2 ring-white/20 flex items-center justify-center text-white font-semibold text-sm">
                  {userInitials}
                </div>
                <div className="text-right">
                  <p className="text-sm text-white/90">{userName}</p>
                  <p className="text-xs text-slate-300/70">Admin</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {kpis.map((k) => (
                <Card key={k.label} className={`${neon.panel} rounded-2xl`}>
                  <CardContent className="p-4">
                    <p className="text-[13px] text-slate-300/80">{k.label}</p>
                    <div className="mt-2 flex items-end justify-between">
                      <p className="text-2xl md:text-3xl font-semibold text-white">{k.value}</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">{k.delta}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
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

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Card className={`xl:col-span-2 ${neon.panel} rounded-2xl`}>
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-sky-300"/>
                      <p className="text-sm text-white/90 font-semibold">Loan Overview</p>
                    </div>
                    <span className="text-xs text-emerald-300">
                      {dashboard?.lending_analytics?.portfolio_growth ? `+${dashboard.lending_analytics.portfolio_growth.toFixed(1)}%` : '+0.0%'} This Month
                    </span>
                  </div>
                  <div className="h-[280px]">
                    {loanOverview.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={loanOverview} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={neon.cyan} stopOpacity={0.6} />
                              <stop offset="100%" stopColor={neon.cyan} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="rgba(148,163,184,0.15)" strokeDasharray="4 4" />
                          <XAxis dataKey="month" stroke="rgba(226,232,240,0.5)" tick={{ fontSize: 12 }} />
                          <YAxis stroke="rgba(226,232,240,0.5)" tick={{ fontSize: 12 }} />
                          <Tooltip contentStyle={{ background: 'rgba(2,6,23,0.9)', border: '1px solid rgba(99,102,241,0.35)', borderRadius: 12, color: 'white' }} />
                          <Area type="monotone" dataKey="value" stroke={neon.cyan} fill="url(#gradA)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-300">
                        No data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className={`${neon.panel} rounded-2xl`}>
                  <CardContent className="p-5">
                    <p className="text-sm text-white/90 font-semibold">Loan Performance</p>
                    <div className="mt-4 flex items-center gap-5">
                      <div className="relative h-28 w-28">
                        <svg viewBox="0 0 36 36" className="h-28 w-28 transform -rotate-90">
                          <path className="text-white/10" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32" />
                          <path stroke={neon.cyan} strokeWidth="3" fill="none" strokeLinecap="round"
                            d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32" strokeDasharray={`${recoveryRate},100`} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-white">{recoveryRate}%</p>
                            <p className="text-[11px] text-slate-300">Recovery Rate</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="grid grid-cols-2 gap-3">
                          {performanceMetrics.map((i) => (
                            <div key={i.k} className="rounded-lg px-3 py-2 bg-white/5 border border-white/10">
                              <p className="text-[11px] text-slate-300/80">{i.k}</p>
                              <p className="text-sm text-white font-semibold">{i.v}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`${neon.panel} rounded-2xl`}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-white/90 font-semibold">Upcoming Payments</p>
                      <Button variant="ghost" className="h-8 text-xs text-slate-300 hover:bg-white/10">
                        View all <ChevronRight className="h-3.5 w-3.5 ml-1"/>
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {upcomingPayments.length > 0 ? (
                        upcomingPayments.map((u, idx) => (
                          <div key={idx} className="flex items-center justify-between rounded-xl px-3 py-2 bg-white/5 border border-white/10">
                            <div>
                              <p className="text-[13px] text-slate-100">{u.member_name || u.name || 'N/A'}</p>
                              <p className="text-[11px] text-slate-300/80">{u.due_date || u.date || 'N/A'}</p>
                            </div>
                            <span className="text-sm text-sky-300 font-semibold">{formatCurrency(u.amount)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-300 text-sm text-center py-4">No upcoming payments</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
