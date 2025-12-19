import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import Layout from '@/components/layout/Layout';
import { AlertCircle, Download, RefreshCw, Filter, Users, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { api } from '@/lib/api';
import KPICard from '@/components/dashboards/KPICard';

interface DashboardData {
  timestamp: string;
  portfolio_health: {
    total_aum: number;
    active_members: number;
    active_loans: number;
    total_loans: number;
    par_ratio: number;
    average_loan_term: number;
    default_rate: number;
  };
  revenue_metrics: {
    mtd_interest_income: number;
    ytd_interest_income: number;
    total_processing_fees: number;
    total_revenue: number;
    revenue_per_member: number;
    profit_margin: number;
  };
  growth_metrics: {
    new_members_mtd: number;
    member_growth_rate: number;
    new_loans_mtd: number;
    loan_volume_growth: number;
    total_loan_amount: number;
    repeat_loan_rate: number;
  };
  risk_metrics: {
    par_ratio: number;
    npl_ratio: number;
    default_rate: number;
    early_warning_count: number;
    risk_concentration: string;
    fraud_incidents: number;
  };
  operational_metrics: {
    avg_processing_time_days: number;
    approval_rate: number;
    disbursement_speed_days: number;
    repayment_rate: number;
    nps_score: number;
    staff_productivity: string;
  };
  key_alerts: Array<{
    severity: string;
    title: string;
    message: string;
    action_url: string;
  }>;
}

function generateTrendData(currentPar: number) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const trend = currentPar > 10 ? -0.2 : 0.1;
  const baseValue = Math.max(currentPar - (trend * 2.5), 0);
  
  return months.map((month, idx) => ({
    month,
    par: parseFloat((baseValue + (idx * trend)).toFixed(2))
  }));
}

function generateRevenueData(revenue?: any) {
  if (!revenue) {
    return [];
  }
  
  const total = (revenue.mtd_interest_income || 0) + (revenue.total_processing_fees || 0);
  const interestPercent = total > 0 ? ((revenue.mtd_interest_income || 0) / total * 100) : 0;
  const feesPercent = total > 0 ? ((revenue.total_processing_fees || 0) / total * 100) : 0;
  const otherPercent = 100 - interestPercent - feesPercent;
  
  const data = [];
  if (interestPercent > 0) {
    data.push({ name: 'Interest Income', value: Math.round(interestPercent) });
  }
  if (feesPercent > 0) {
    data.push({ name: 'Processing Fees', value: Math.round(feesPercent) });
  }
  if (otherPercent > 0) {
    data.push({ name: 'Other Fees', value: Math.round(otherPercent) });
  }
  
  return data.length > 0 ? data : [{ name: 'No Data', value: 100 }];
}

function generateGrowthData(growth?: any) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  if (!growth) {
    return [];
  }
  
  const totalMembers = growth.active_members || 0;
  const totalLoans = growth.total_loan_amount || 0;
  
  const memberGrowth = growth.new_members_mtd || 0;
  const loanGrowth = growth.new_loans_mtd || 0;
  
  if (memberGrowth === 0 && loanGrowth === 0) {
    return [];
  }
  
  return months.map((month, idx) => ({
    month,
    members: Math.max(Math.floor(totalMembers * (0.7 + (idx * 0.05))), 0),
    loans: Math.max(Math.floor(totalLoans * (0.7 + (idx * 0.05))), 0)
  }));
}

export default function ExecutiveDashboard() {
  const [branchId, setBranchId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState('mtd');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: dashboard, isLoading, isError, refetch } = useQuery<DashboardData>({
    queryKey: ['executiveDashboard', branchId, dateRange],
    queryFn: async () => {
      return api.getExecutiveDashboard(branchId || undefined);
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000
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
    
    const csvContent = [
      ['Executive Dashboard Export'],
      ['Generated:', new Date(dashboard.timestamp).toLocaleString()],
      [''],
      ['Portfolio Health'],
      ['Metric', 'Value'],
      ['Total AUM', dashboard.portfolio_health.total_aum],
      ['Active Members', dashboard.portfolio_health.active_members],
      ['Active Loans', dashboard.portfolio_health.active_loans],
      ['Portfolio at Risk (%)', dashboard.portfolio_health.par_ratio],
      ['Default Rate (%)', dashboard.portfolio_health.default_rate],
      [''],
      ['Revenue Metrics'],
      ['Metric', 'Value'],
      ['MTD Interest Income', dashboard.revenue_metrics.mtd_interest_income],
      ['YTD Interest Income', dashboard.revenue_metrics.ytd_interest_income],
      ['Processing Fees', dashboard.revenue_metrics.total_processing_fees],
      ['Total Revenue', dashboard.revenue_metrics.total_revenue],
      ['Profit Margin (%)', dashboard.revenue_metrics.profit_margin],
      [''],
      ['Growth Metrics'],
      ['Metric', 'Value'],
      ['New Members (MTD)', dashboard.growth_metrics.new_members_mtd],
      ['Member Growth Rate (%)', dashboard.growth_metrics.member_growth_rate],
      ['New Loans (MTD)', dashboard.growth_metrics.new_loans_mtd],
      ['Repeat Loan Rate (%)', dashboard.growth_metrics.repeat_loan_rate],
    ]
      .map(row => row.map(val => `"${val}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `executive-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading executive dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (isError || !dashboard || !dashboard.portfolio_health) {
    const errorMsg = (dashboard as any)?.error || 'Unknown error occurred';
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">Failed to load dashboard</h3>
                <p className="text-sm text-red-700 mt-1">There was an error loading your dashboard data.</p>
                {(dashboard as any)?.error && (
                  <p className="text-xs text-red-600 mt-2">Details: {errorMsg}</p>
                )}
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
                >
                  {isRefreshing ? 'Retrying...' : 'Retry'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <Layout>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tight text-gradient">Executive Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Real-time overview of key metrics and performance indicators</p>
            {dashboard?.timestamp && (
              <p className="text-xs text-muted-foreground mt-2">
                Last updated: {new Date(dashboard.timestamp).toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`btn-neon px-4 py-2 rounded-lg ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <RefreshCw 
                size={18}
                className={isRefreshing ? 'animate-spin' : ''}
              />
              <span className="text-sm font-medium">
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </span>
            </button>
            <button
              onClick={handleExport}
              className="btn-neon px-4 py-2 rounded-lg cursor-pointer"
            >
              <Download size={18} />
              <span className="text-sm font-medium">Export</span>
            </button>
          </div>
        </div>

        {/* Alerts */}
        {dashboard.key_alerts && dashboard.key_alerts.length > 0 && (
          <div className="mb-6 space-y-3">
            {dashboard.key_alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border flex items-start gap-3 cursor-pointer transition glass-card gradient-border hover-tilt`}
              >
                <span className="aura"></span>
                <AlertCircle
                  size={20}
                  className={alert.severity === 'high' ? 'text-red-500' : 'text-yellow-500'}
                />
                <div className="flex-1">
                  <h3 className={`font-semibold ${alert.severity === 'high' ? 'text-red-600' : 'text-yellow-600'}`}>
                    {alert.title}
                  </h3>
                  <p className={`text-sm mt-1 ${alert.severity === 'high' ? 'text-red-500/90' : 'text-yellow-600/90'}`}>
                    {alert.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Portfolio Health KPIs */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Portfolio Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Total AUM"
              value={formatCurrency(dashboard.portfolio_health.total_aum)}
              icon={<DollarSign size={24} />}
              status="success"
            />
            <KPICard
              title="Active Members"
              value={formatNumber(dashboard.portfolio_health.active_members)}
              icon={<Users size={24} />}
              status="success"
            />
            <KPICard
              title="Active Loans"
              value={formatNumber(dashboard.portfolio_health.active_loans)}
              icon={<Activity size={24} />}
            />
            <KPICard
              title="Portfolio at Risk"
              value={`${dashboard.portfolio_health.par_ratio.toFixed(2)}%`}
              status={dashboard.portfolio_health.par_ratio > 10 ? 'warning' : 'normal'}
              icon={<TrendingUp size={24} />}
            />
          </div>
        </div>

        {/* Revenue Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="MTD Interest Income"
              value={formatCurrency(dashboard.revenue_metrics.mtd_interest_income)}
              change={{ value: 5.2, isPositive: true }}
            />
            <KPICard
              title="YTD Interest Income"
              value={formatCurrency(dashboard.revenue_metrics.ytd_interest_income)}
            />
            <KPICard
              title="Processing Fees"
              value={formatCurrency(dashboard.revenue_metrics.total_processing_fees)}
            />
            <KPICard
              title="Profit Margin"
              value={`${dashboard.revenue_metrics.profit_margin.toFixed(1)}%`}
              status="success"
            />
          </div>
        </div>

        {/* Growth Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Growth Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="New Members (MTD)"
              value={formatNumber(dashboard.growth_metrics.new_members_mtd)}
              change={{ value: 12.5, isPositive: true }}
            />
            <KPICard
              title="Member Growth Rate"
              value={`${dashboard.growth_metrics.member_growth_rate.toFixed(2)}%`}
            />
            <KPICard
              title="New Loans (MTD)"
              value={formatNumber(dashboard.growth_metrics.new_loans_mtd)}
            />
            <KPICard
              title="Repeat Loan Rate"
              value={`${dashboard.growth_metrics.repeat_loan_rate.toFixed(1)}%`}
              status="success"
            />
          </div>
        </div>

        {/* Risk Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Risk Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="PAR Ratio"
              value={`${dashboard.risk_metrics.par_ratio.toFixed(2)}%`}
              status={dashboard.risk_metrics.par_ratio > 10 ? 'critical' : 'warning'}
            />
            <KPICard
              title="NPL Ratio"
              value={`${dashboard.risk_metrics.npl_ratio.toFixed(2)}%`}
              status={dashboard.risk_metrics.npl_ratio > 5 ? 'warning' : 'normal'}
            />
            <KPICard
              title="Default Rate"
              value={`${dashboard.risk_metrics.default_rate.toFixed(2)}%`}
            />
            <KPICard
              title="Early Warnings"
              value={formatNumber(dashboard.risk_metrics.early_warning_count)}
              status={dashboard.risk_metrics.early_warning_count > 5 ? 'warning' : 'normal'}
            />
          </div>
        </div>

        {/* Operational Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Operational Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Avg Processing Time"
              value={`${dashboard.operational_metrics.avg_processing_time_days.toFixed(1)}`}
              unit="days"
            />
            <KPICard
              title="Approval Rate"
              value={`${dashboard.operational_metrics.approval_rate.toFixed(1)}%`}
              status="success"
            />
            <KPICard
              title="Repayment Rate"
              value={`${dashboard.operational_metrics.repayment_rate.toFixed(1)}%`}
              status="success"
            />
            <KPICard
              title="NPS Score"
              value={`${dashboard.operational_metrics.nps_score.toFixed(0)}`}
              unit="/100"
              status="success"
            />
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* PAR Trend */}
          <div className="glass-card gradient-border hover-tilt p-6 relative overflow-hidden">
            <span className="aura"></span>
            <h3 className="font-heading font-semibold text-foreground mb-4">Portfolio at Risk Trend</h3>
            <div style={{ width: "100%", height: "300px", minWidth: 0, overflow: "hidden" }}>
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              <LineChart data={generateTrendData(dashboard?.risk_metrics?.par_ratio || 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="par" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue by Source */}
          <div className="glass-card gradient-border hover-tilt p-6 relative overflow-hidden">
            <span className="aura"></span>
            <h3 className="font-heading font-semibold text-foreground mb-4">Revenue by Source</h3>
            <div style={{ width: "100%", height: "300px", minWidth: 0, overflow: "hidden" }}>
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              <PieChart>
                <Pie
                  data={generateRevenueData(dashboard?.revenue_metrics)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Growth Comparison */}
        <div className="glass-card gradient-border hover-tilt p-6 mb-8 relative overflow-hidden">
          <span className="aura"></span>
          <h3 className="font-heading font-semibold text-foreground mb-4">Member & Loan Growth</h3>
          <div style={{ width: "100%", height: "300px", minWidth: 0, overflow: "hidden" }}>
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
            <BarChart data={generateGrowthData(dashboard?.growth_metrics)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="members" fill="#3b82f6" />
              <Bar dataKey="loans" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
            </div>
        </div>

        {/* Last Updated */}
        <div className="text-center text-sm text-gray-500">
          Last updated: {new Date(dashboard.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
    </Layout>
  );
}
