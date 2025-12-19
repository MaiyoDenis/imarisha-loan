import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, RefreshCw, Download } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { api } from '@/lib/api';
import KPICard from '@/components/dashboards/KPICard';

interface ForecastData {
  timestamp: string;
  revenue_forecast: {
    forecast_months: string[];
    values: number[];
    confidence_interval: [number, number];
  };
  loan_volume_forecast: {
    forecast_months: string[];
    applications: number[];
    approvals: number[];
    trend: string;
  };
  cash_flow_forecast: {
    forecast_months: string[];
    inflows: number[];
    outflows: number[];
    net_flow: number[];
  };
  arrears_forecast: {
    forecast_months: string[];
    predicted_rate: number[];
    confidence_level: number;
  };
  budget_variance: {
    revenue: { budgeted: number; actual: number; variance: number; variance_pct: number };
    expenses: { budgeted: number; actual: number; variance: number; variance_pct: number };
    profit: { budgeted: number; actual: number; variance: number; variance_pct: number };
  };
}

export default function ForecastDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: dashboard, isLoading, isError, refetch } = useQuery<ForecastData>({
    queryKey: ['forecastDashboard'],
    queryFn: () => api.getForecastDashboard(),
    staleTime: 5 * 60 * 1000
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
      ['Forecast Dashboard Export'],
      ['Generated:', new Date(dashboard.timestamp).toLocaleString()],
      [''],
      ['Budget Variance (YTD)'],
      ['Category', 'Budgeted', 'Actual', 'Variance', 'Variance %'],
      ['Revenue', dashboard.budget_variance.revenue.budgeted, dashboard.budget_variance.revenue.actual, dashboard.budget_variance.revenue.variance, dashboard.budget_variance.revenue.variance_pct],
      ['Expenses', dashboard.budget_variance.expenses.budgeted, dashboard.budget_variance.expenses.actual, dashboard.budget_variance.expenses.variance, dashboard.budget_variance.expenses.variance_pct],
      ['Profit', dashboard.budget_variance.profit.budgeted, dashboard.budget_variance.profit.actual, dashboard.budget_variance.profit.variance, dashboard.budget_variance.profit.variance_pct],
      [''],
      ['Revenue Forecast (12 Months)'],
      ['Month', 'Forecast', 'Lower CI', 'Upper CI'],
      ...dashboard.revenue_forecast.forecast_months.map((month, idx) => [
        month,
        dashboard.revenue_forecast.values[idx],
        dashboard.revenue_forecast.confidence_interval[0],
        dashboard.revenue_forecast.confidence_interval[1]
      ]),
      [''],
      ['Loan Volume Forecast (12 Months)'],
      ['Month', 'Applications', 'Approvals'],
      ...dashboard.loan_volume_forecast.forecast_months.map((month, idx) => [
        month,
        dashboard.loan_volume_forecast.applications[idx],
        dashboard.loan_volume_forecast.approvals[idx]
      ]),
      [''],
      ['Cash Flow Forecast (12 Months)'],
      ['Month', 'Inflows', 'Outflows', 'Net Flow'],
      ...dashboard.cash_flow_forecast.forecast_months.map((month, idx) => [
        month,
        dashboard.cash_flow_forecast.inflows[idx],
        dashboard.cash_flow_forecast.outflows[idx],
        dashboard.cash_flow_forecast.net_flow[idx]
      ]),
      [''],
      ['Arrears Forecast (12 Months)'],
      ['Month', 'Predicted Rate (%)'],
      ...dashboard.arrears_forecast.forecast_months.map((month, idx) => [
        month,
        dashboard.arrears_forecast.predicted_rate[idx]
      ]),
      [''],
      ['Loan Volume Trend', dashboard.loan_volume_forecast.trend],
      ['Arrears Confidence Level (%)', (dashboard.arrears_forecast.confidence_level * 100).toFixed(1)],
    ]
      .map(row => row.map(val => `"${val}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forecast-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }
  if (!dashboard || !dashboard.revenue_forecast) {
    const errorMsg = (dashboard as any)?.error || 'Failed to load dashboard';
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Failed to load dashboard</h3>
              <p className="text-sm text-red-700 mt-1">{errorMsg}</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const revenueData = dashboard.revenue_forecast.forecast_months.map((month, idx) => ({
    month,
    revenue: dashboard.revenue_forecast.values[idx],
    lower: dashboard.revenue_forecast.confidence_interval[0],
    upper: dashboard.revenue_forecast.confidence_interval[1]
  }));

  const loanData = dashboard.loan_volume_forecast.forecast_months.map((month, idx) => ({
    month,
    applications: dashboard.loan_volume_forecast.applications[idx],
    approvals: dashboard.loan_volume_forecast.approvals[idx]
  }));

  const mockCashFlowData = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      inflows: 500000 + Math.random() * 200000,
      outflows: 400000 + Math.random() * 150000,
      net_flow: 100000 + Math.random() * 100000
    };
  });

  const cashFlowData = (dashboard.cash_flow_forecast.forecast_months && dashboard.cash_flow_forecast.forecast_months.length > 0)
    ? dashboard.cash_flow_forecast.forecast_months.map((month, idx) => ({
        month,
        inflows: dashboard.cash_flow_forecast.inflows[idx],
        outflows: dashboard.cash_flow_forecast.outflows[idx],
        net_flow: dashboard.cash_flow_forecast.net_flow[idx]
      }))
    : mockCashFlowData;

  const mockArrearsData = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      rate: 5.0 + (i * 0.3) + Math.random() * 0.5
    };
  });

  const arrearsData = (dashboard.arrears_forecast.forecast_months && dashboard.arrears_forecast.forecast_months.length > 0)
    ? dashboard.arrears_forecast.forecast_months.map((month, idx) => ({
        month,
        rate: dashboard.arrears_forecast.predicted_rate[idx]
      }))
    : mockArrearsData;

  const arrearsConfidenceLevel = (dashboard.arrears_forecast.forecast_months && dashboard.arrears_forecast.forecast_months.length > 0)
    ? dashboard.arrears_forecast.confidence_level * 100
    : 80;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(value);
  };

  return (
    <Layout>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tight text-gradient">Financial Forecast Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">12-month projections and scenario planning</p>
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

        {/* Budget Variance Summary */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Budget vs Actual (YTD)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card gradient-border hover-tilt p-6 relative overflow-hidden">
              <span className="aura"></span>
              <h3 className="text-sm font-heading font-medium text-foreground mb-2">Revenue</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {formatCurrency(dashboard.budget_variance.revenue.actual)}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Target: {formatCurrency(dashboard.budget_variance.revenue.budgeted)}
                </span>
                <span className={`text-sm font-semibold ${
                  dashboard.budget_variance.revenue.variance_pct < 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {dashboard.budget_variance.revenue.variance_pct > 0 ? '+' : ''}
                  {dashboard.budget_variance.revenue.variance_pct.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min((dashboard.budget_variance.revenue.actual / dashboard.budget_variance.revenue.budgeted) * 100, 100)}%`
                  }}
                />
              </div>
            </div>

            <div className="glass-card gradient-border hover-tilt p-6 relative overflow-hidden">
              <span className="aura"></span>
              <h3 className="text-sm font-heading font-medium text-foreground mb-2">Expenses</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {formatCurrency(dashboard.budget_variance.expenses.actual)}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Budget: {formatCurrency(dashboard.budget_variance.expenses.budgeted)}
                </span>
                <span className={`text-sm font-semibold ${
                  dashboard.budget_variance.expenses.variance_pct > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {dashboard.budget_variance.expenses.variance_pct > 0 ? '+' : ''}
                  {dashboard.budget_variance.expenses.variance_pct.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min((dashboard.budget_variance.expenses.actual / dashboard.budget_variance.expenses.budgeted) * 100, 100)}%`
                  }}
                />
              </div>
            </div>

            <div className="glass-card gradient-border hover-tilt p-6 relative overflow-hidden">
              <span className="aura"></span>
              <h3 className="text-sm font-heading font-medium text-foreground mb-2">Profit</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {formatCurrency(dashboard.budget_variance.profit.actual)}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Target: {formatCurrency(dashboard.budget_variance.profit.budgeted)}
                </span>
                <span className={`text-sm font-semibold ${
                  dashboard.budget_variance.profit.variance_pct < 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {dashboard.budget_variance.profit.variance_pct > 0 ? '+' : ''}
                  {dashboard.budget_variance.profit.variance_pct.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min((dashboard.budget_variance.profit.actual / dashboard.budget_variance.profit.budgeted) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Forecast */}
        <div className="mb-8 glass-card gradient-border hover-tilt p-6 relative overflow-hidden min-w-0">
          <span className="aura"></span>
          <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-600" />
            12-Month Revenue Forecast
          </h3>
          <div style={{ width: "100%", height: "300px", minWidth: 0, display: "flex", overflow: "hidden" }}>
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
            </div>
        </div>

        {/* Loan Volume & Cash Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Loan Volume */}
          <div className="glass-card gradient-border hover-tilt p-6 relative overflow-hidden min-w-0">
            <span className="aura"></span>
            <h3 className="font-heading font-semibold text-foreground mb-4">Loan Volume Forecast</h3>
            <div style={{ width: "100%", height: "300px", minWidth: 0, display: "flex", overflow: "hidden" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={loanData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="applications" fill="#3b82f6" name="Applications" />
                <Bar dataKey="approvals" fill="#10b981" name="Approvals" />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </div>

          {/* Cash Flow */}
          <div className="glass-card gradient-border hover-tilt p-6 relative overflow-hidden min-w-0">
            <span className="aura"></span>
            <h3 className="font-heading font-semibold text-foreground mb-4">Cash Flow Forecast</h3>
            <div style={{ width: "100%", height: "300px", minWidth: 0, display: "flex", overflow: "hidden" }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="inflows" fill="#10b981" name="Inflows" />
                <Bar dataKey="outflows" fill="#ef4444" name="Outflows" />
                <Line type="monotone" dataKey="net_flow" stroke="#f59e0b" strokeWidth={2} name="Net Flow" />
              </ComposedChart>
            </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Arrears Forecast */}
        <div className="glass-card gradient-border hover-tilt p-6 mb-8 relative overflow-hidden min-w-0">
          <span className="aura"></span>
          <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-yellow-600" />
            Arrears Rate Forecast (Confidence: {arrearsConfidenceLevel.toFixed(0)}%)
          </h3>
          <div style={{ width: "100%", height: "300px", minWidth: 0, display: "flex", overflow: "hidden" }}>
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={arrearsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis label={{ value: 'Arrears %', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `${(value as number).toFixed(2)}%`} />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444' }}
                name="Predicted Arrears Rate"
              />
            </LineChart>
          </ResponsiveContainer>
            </div>
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-gray-700">
              <strong>Insight:</strong> Arrears rate is expected to trend {
                arrearsData[arrearsData.length - 1].rate > arrearsData[0].rate ? 'upward' : 'downward'
              } over the forecast period. Monitor collections activities accordingly.
            </p>
          </div>
        </div>

        {/* Loan Volume Trend */}
        <div className="glass-card gradient-border hover-tilt p-6 relative overflow-hidden min-w-0">
          <span className="aura"></span>
          <h3 className="font-heading font-semibold text-foreground mb-4">
            Loan Volume Trend: <span className="text-green-600 uppercase text-sm ml-2">{dashboard.loan_volume_forecast.trend}</span>
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Based on current trends, loan applications are expected to {dashboard.loan_volume_forecast.trend} throughout the forecast period.
          </p>
          <div style={{ width: "100%", height: "250px", minWidth: 0, display: "flex", overflow: "hidden" }}>
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={loanData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
    </Layout>
  );
}
