import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import Layout from '@/components/layout/Layout';
import {
  AlertCircle, Download, RefreshCw, TrendingUp, Package,
  DollarSign, Users, Activity, Zap, PieChart as PieIcon,
  Target, ShoppingCart, CheckCircle2, Bell, MessageSquare, User, LogOut, ChevronDown
} from 'lucide-react';
import { api } from '@/lib/api';
import KPICard from '@/components/dashboards/KPICard';
import { useRoleRedirect } from '@/hooks/use-role-redirect';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

interface AdminDashboardData {
  timestamp: string;
  product_overview: {
    total_products: number;
    total_inventory_value: number;
    total_market_value: number;
    active_products: number;
    low_stock_alerts: number;
    low_stock_products: Array<{ id: number; name: string; stock: number; threshold: number }>;
  };
  lending_analytics: {
    total_loans_active: number;
    total_loans_completed: number;
    total_loans_pending: number;
    total_loans_count: number;
    total_borrowed_amount: number;
    total_paid_amount: number;
    total_outstanding: number;
    total_interest_income: number;
    total_processing_fees: number;
    expected_total_income: number;
    borrowed_to_paid_ratio: number;
  };
  profit_analysis: {
    cost_of_goods_sold: number;
    revenue_selling_price: number;
    gross_profit: number;
    profit_margin_percentage: number;
    total_interest_income: number;
    total_processing_fees: number;
    total_income_realized: number;
    expected_income_pending: number;
    cost_benefit_ratio: number;
  };
  repayment_tracking: {
    total_disbursed: number;
    total_completed: number;
    total_defaulted: number;
    overdue_loans: number;
    repayment_rate: number;
    default_rate: number;
    outstanding_balance: number;
  };
  growth_metrics: {
    mtd_new_loans: number;
    mtd_amount: number;
    qtd_new_loans: number;
    qtd_amount: number;
    ytd_new_loans: number;
    ytd_amount: number;
  };
  branch_comparison: Array<{
    branch_id: number;
    branch_name: string;
    location: string;
    loans_count: number;
    total_amount: number;
    completed_loans: number;
    active_loans: number;
  }>;
  top_products: Array<{
    product_id: number;
    product_name: string;
    buying_price: number;
    selling_price: number;
    loans_count: number;
    units_sold: number;
    total_revenue: number;
    total_cost: number;
    profit: number;
    margin: number;
  }>;
  alerts: Array<{
    severity: string;
    title: string;
    message: string;
    action: string;
  }>;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  useRoleRedirect({
    allowedRoles: ['admin', 'branch_manager'],
    fallbackPath: '/dashboard'
  });

  const [branchId, setBranchId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sectionFilter, setSectionFilter] = useState<'all' | 'product' | 'lending' | 'topproducts' | 'branch'>('all');
  const [lendingAnalyticsFilter, setLendingAnalyticsFilter] = useState<'all' | 'active' | 'completed' | 'pending'>('all');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications] = useState([
    { id: 1, message: 'Low stock alert: Product X', time: '5 min ago', read: false },
    { id: 2, message: 'Loan repayment due', time: '1 hour ago', read: false },
    { id: 3, message: 'System maintenance scheduled', time: '2 hours ago', read: true }
  ]);
  const [messages] = useState([
    { id: 1, sender: 'John Doe', message: 'Can you review the report?', time: '10 min ago', unread: true },
    { id: 2, sender: 'Jane Smith', message: 'Meeting at 3 PM', time: '30 min ago', unread: false }
  ]);

  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const user = userStr ? JSON.parse(userStr) : null;
  const userInitials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'A';
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Admin';

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const unreadMessages = messages.filter(m => m.unread).length;

  const { data: dashboard, isLoading, isError, refetch } = useQuery<AdminDashboardData>({
    queryKey: ['adminDashboard', branchId],
    queryFn: async () => {
      return api.getAdminDashboard(branchId || undefined);
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

  const handleExport = () => {
    if (!dashboard) return;
    
    const csvContent = [
      ['Admin Dashboard Export'],
      ['Generated:', new Date(dashboard.timestamp).toLocaleString()],
      [''],
      ['PRODUCT OVERVIEW'],
      ['Metric', 'Value'],
      ['Total Products', dashboard.product_overview.total_products],
      ['Total Inventory Value (KES)', dashboard.product_overview.total_inventory_value],
      ['Active Products', dashboard.product_overview.active_products],
      ['Low Stock Alerts', dashboard.product_overview.low_stock_alerts],
      [''],
      ['LENDING ANALYTICS'],
      ['Metric', 'Value'],
      ['Total Active Loans', dashboard.lending_analytics.total_loans_active],
      ['Total Completed Loans', dashboard.lending_analytics.total_loans_completed],
      ['Total Borrowed Amount (KES)', dashboard.lending_analytics.total_borrowed_amount],
      ['Total Paid Amount (KES)', dashboard.lending_analytics.total_paid_amount],
      ['Total Outstanding (KES)', dashboard.lending_analytics.total_outstanding],
      ['Borrowed to Paid Ratio (%)', dashboard.lending_analytics.borrowed_to_paid_ratio],
      [''],
      ['PROFIT ANALYSIS'],
      ['Metric', 'Value'],
      ['Cost of Goods Sold (KES)', dashboard.profit_analysis.cost_of_goods_sold],
      ['Revenue from Selling Price (KES)', dashboard.profit_analysis.revenue_selling_price],
      ['Gross Profit (KES)', dashboard.profit_analysis.gross_profit],
      ['Profit Margin (%)', dashboard.profit_analysis.profit_margin_percentage],
      ['Total Interest Income (KES)', dashboard.profit_analysis.total_interest_income],
      ['Total Processing Fees (KES)', dashboard.profit_analysis.total_processing_fees],
      [''],
      ['REPAYMENT TRACKING'],
      ['Metric', 'Value'],
      ['Total Disbursed', dashboard.repayment_tracking.total_disbursed],
      ['Total Completed', dashboard.repayment_tracking.total_completed],
      ['Repayment Rate (%)', dashboard.repayment_tracking.repayment_rate],
      ['Default Rate (%)', dashboard.repayment_tracking.default_rate],
      ['Overdue Loans', dashboard.repayment_tracking.overdue_loans],
      ['Outstanding Balance (KES)', dashboard.repayment_tracking.outstanding_balance]
    ]
      .map(row => row.map(val => `"${val}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (isError || !dashboard) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">Failed to load dashboard</h3>
                <p className="text-sm text-red-700 mt-1">There was an error loading your dashboard data.</p>
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
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-KE').format(value);
  };

  return (
    <Layout>
      <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto">
          {/* Main Dashboard Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">Reports & Analytics</h1>
              <p className="text-slate-600 mt-2">Generate insights and monitor performance across your organization.</p>
              {dashboard?.timestamp && (
                <p className="text-xs text-slate-500 mt-2">
                  Last updated: {new Date(dashboard.timestamp).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Download size={18} />
                  Export
                </button>
              </div>
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value as 'all' | 'product' | 'lending' | 'topproducts' | 'branch')}
                className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 font-medium hover:border-slate-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Sections</option>
                <option value="product">Product Inventory Overview</option>
                <option value="lending">Lending Analytics</option>
                <option value="topproducts">Top Performing Products</option>
                <option value="branch">Branch Comparison</option>
              </select>
            </div>
          </div>

          {/* Alerts */}
          {dashboard.alerts && dashboard.alerts.length > 0 && (
            <div className="mb-6 space-y-3">
              {dashboard.alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border flex items-start gap-3 ${
                    alert.severity === 'high'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <AlertCircle
                    size={20}
                    className={alert.severity === 'high' ? 'text-red-600' : 'text-yellow-600'}
                  />
                  <div className="flex-1">
                    <h3
                      className={`font-semibold ${
                        alert.severity === 'high' ? 'text-red-900' : 'text-yellow-900'
                      }`}
                    >
                      {alert.title}
                    </h3>
                    <p
                      className={`text-sm mt-1 ${
                        alert.severity === 'high'
                          ? 'text-red-700'
                          : 'text-yellow-700'
                      }`}
                    >
                      {alert.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Product Overview */}
          {(sectionFilter === 'all' || sectionFilter === 'product') && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Package className="text-blue-600" size={28} />
                Product Inventory Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <KPICard
                  title="Total Products"
                  value={formatNumber(dashboard.product_overview.total_products)}
                  icon={<Package size={24} />}
                  status="success"
                />
                <KPICard
                  title="Inventory Value"
                  value={formatCurrency(dashboard.product_overview.total_inventory_value)}
                  icon={<DollarSign size={24} />}
                />
                <KPICard
                  title="Active Products"
                  value={formatNumber(dashboard.product_overview.active_products)}
                  status="success"
                />
                <KPICard
                  title="Low Stock Alerts"
                  value={formatNumber(dashboard.product_overview.low_stock_alerts)}
                  status={dashboard.product_overview.low_stock_alerts > 0 ? 'warning' : 'success'}
                />
                <KPICard
                  title="Market Value"
                  value={formatCurrency(dashboard.product_overview.total_market_value)}
                />
              </div>
            </div>
          )}

          {/* Lending Analytics */}
          {(sectionFilter === 'all' || sectionFilter === 'lending') && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="text-purple-600" size={28} />
                  Lending Analytics
                </h2>
                <select
                  value={lendingAnalyticsFilter}
                  onChange={(e) => setLendingAnalyticsFilter(e.target.value as 'all' | 'active' | 'completed' | 'pending')}
                  className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 font-medium hover:border-slate-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">View All</option>
                  <option value="active">Active Loans</option>
                  <option value="completed">Completed Loans</option>
                  <option value="pending">Pending Loans</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {(lendingAnalyticsFilter === 'all' || lendingAnalyticsFilter === 'active') && (
                  <KPICard
                    title="Active Loans"
                    value={formatNumber(dashboard.lending_analytics.total_loans_active)}
                    icon={<Activity size={24} />}
                    status="success"
                  />
                )}
                {(lendingAnalyticsFilter === 'all' || lendingAnalyticsFilter === 'completed') && (
                  <KPICard
                    title="Completed Loans"
                    value={formatNumber(dashboard.lending_analytics.total_loans_completed)}
                    icon={<CheckCircle2 size={24} />}
                    status="success"
                  />
                )}
                {(lendingAnalyticsFilter === 'all') && (
                  <>
                    <KPICard
                      title="Total Borrowed"
                      value={formatCurrency(dashboard.lending_analytics.total_borrowed_amount)}
                      icon={<TrendingUp size={24} />}
                    />
                    <KPICard
                      title="Total Paid"
                      value={formatCurrency(dashboard.lending_analytics.total_paid_amount)}
                    />
                    <KPICard
                      title="Outstanding"
                      value={formatCurrency(dashboard.lending_analytics.total_outstanding)}
                      status={dashboard.lending_analytics.total_outstanding > 0 ? 'warning' : 'normal'}
                    />
                  </>
                )}
                {(lendingAnalyticsFilter === 'pending') && (
                  <KPICard
                    title="Pending Loans"
                    value={formatNumber(dashboard.lending_analytics.total_loans_pending)}
                    icon={<AlertCircle size={24} />}
                    status="warning"
                  />
                )}
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {(lendingAnalyticsFilter === 'all') && (
                  <>
                    <KPICard
                      title="Expected Total Income"
                      value={formatCurrency(dashboard.lending_analytics.expected_total_income)}
                    />
                    <KPICard
                      title="Borrowed vs Paid Ratio"
                      value={`${dashboard.lending_analytics.borrowed_to_paid_ratio.toFixed(1)}%`}
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {/* Profit Analysis */}
          {(sectionFilter === 'all' || sectionFilter === 'lending') && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="text-green-600" size={28} />
                Profit Analysis & Financial Performance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                  title="Cost of Goods Sold"
                  value={formatCurrency(dashboard.profit_analysis.cost_of_goods_sold)}
                  status="normal"
                />
                <KPICard
                  title="Revenue (Selling Price)"
                  value={formatCurrency(dashboard.profit_analysis.revenue_selling_price)}
                  status="success"
                />
                <KPICard
                  title="Gross Profit"
                  value={formatCurrency(dashboard.profit_analysis.gross_profit)}
                  icon={<Zap size={24} />}
                  status={dashboard.profit_analysis.gross_profit > 0 ? 'success' : 'warning'}
                />
                <KPICard
                  title="Profit Margin"
                  value={`${dashboard.profit_analysis.profit_margin_percentage.toFixed(2)}%`}
                  status={dashboard.profit_analysis.profit_margin_percentage > 0 ? 'success' : 'warning'}
                />
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <KPICard
                  title="Interest Income (Realized)"
                  value={formatCurrency(dashboard.profit_analysis.total_interest_income)}
                />
                <KPICard
                  title="Processing Fees"
                  value={formatCurrency(dashboard.profit_analysis.total_processing_fees)}
                />
                <KPICard
                  title="Expected Income (Pending)"
                  value={formatCurrency(dashboard.profit_analysis.expected_income_pending)}
                />
              </div>
            </div>
          )}

          {/* Repayment Tracking */}
          {(sectionFilter === 'all' || sectionFilter === 'lending') && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-emerald-600" size={28} />
                Repayment Performance Tracking
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                  title="Total Disbursed"
                  value={formatNumber(dashboard.repayment_tracking.total_disbursed)}
                />
                <KPICard
                  title="Total Completed"
                  value={formatNumber(dashboard.repayment_tracking.total_completed)}
                  status="success"
                />
                <KPICard
                  title="Repayment Rate"
                  value={`${dashboard.repayment_tracking.repayment_rate.toFixed(1)}%`}
                  status={dashboard.repayment_tracking.repayment_rate > 80 ? 'success' : 'warning'}
                />
                <KPICard
                  title="Default Rate"
                  value={`${dashboard.repayment_tracking.default_rate.toFixed(1)}%`}
                  status={dashboard.repayment_tracking.default_rate < 5 ? 'success' : 'warning'}
                />
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <KPICard
                  title="Overdue Loans"
                  value={formatNumber(dashboard.repayment_tracking.overdue_loans)}
                  status={dashboard.repayment_tracking.overdue_loans > 0 ? 'warning' : 'success'}
                />
                <KPICard
                  title="Outstanding Balance"
                  value={formatCurrency(dashboard.repayment_tracking.outstanding_balance)}
                />
              </div>
            </div>
          )}

          {/* Growth Metrics */}
          {(sectionFilter === 'all' || sectionFilter === 'lending') && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="text-indigo-600" size={28} />
                Growth Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-600 uppercase">Month to Date</h3>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{formatNumber(dashboard.growth_metrics.mtd_new_loans)}</p>
                  <p className="text-xs text-slate-500 mt-1">New Loans</p>
                  <p className="text-xl font-semibold text-slate-900 mt-3">{formatCurrency(dashboard.growth_metrics.mtd_amount)}</p>
                  <p className="text-xs text-slate-500">Amount</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-600 uppercase">Quarter to Date</h3>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{formatNumber(dashboard.growth_metrics.qtd_new_loans)}</p>
                  <p className="text-xs text-slate-500 mt-1">New Loans</p>
                  <p className="text-xl font-semibold text-slate-900 mt-3">{formatCurrency(dashboard.growth_metrics.qtd_amount)}</p>
                  <p className="text-xs text-slate-500">Amount</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-600 uppercase">Year to Date</h3>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{formatNumber(dashboard.growth_metrics.ytd_new_loans)}</p>
                  <p className="text-xs text-slate-500 mt-1">New Loans</p>
                  <p className="text-xl font-semibold text-slate-900 mt-3">{formatCurrency(dashboard.growth_metrics.ytd_amount)}</p>
                  <p className="text-xs text-slate-500">Amount</p>
                </div>
              </div>
            </div>
          )}

          {/* Top Products */}
          {(sectionFilter === 'all' || sectionFilter === 'topproducts') && dashboard.top_products && dashboard.top_products.length > 0 && (
            <div className="mb-8 bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ShoppingCart className="text-rose-600" size={28} />
                Top Performing Products
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Product</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">Market Price</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">Selling Price</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">Loans</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">Units Sold</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">Revenue</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">Profit</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {dashboard.top_products.map((product) => (
                      <tr key={product.product_id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{product.product_name}</td>
                        <td className="px-4 py-3 text-sm text-right text-slate-600">{formatCurrency(product.buying_price)}</td>
                        <td className="px-4 py-3 text-sm text-right text-slate-600">{formatCurrency(product.selling_price)}</td>
                        <td className="px-4 py-3 text-sm text-right text-slate-600">{formatNumber(product.loans_count)}</td>
                        <td className="px-4 py-3 text-sm text-right text-slate-600">{formatNumber(product.units_sold)}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-slate-900">{formatCurrency(product.total_revenue)}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">{formatCurrency(product.profit)}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">{product.margin.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Branch Comparison */}
          {(sectionFilter === 'all' || sectionFilter === 'branch') && dashboard.branch_comparison && dashboard.branch_comparison.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Target className="text-cyan-600" size={28} />
                Branch Comparison
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Branch</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Location</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">Loans</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">Total Amount</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">Completed</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {dashboard.branch_comparison.map((branch) => (
                      <tr key={branch.branch_id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{branch.branch_name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{branch.location}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-slate-900">{formatNumber(branch.loans_count)}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-slate-900">{formatCurrency(branch.total_amount)}</td>
                        <td className="px-4 py-3 text-sm text-right text-green-600">{formatNumber(branch.completed_loans)}</td>
                        <td className="px-4 py-3 text-sm text-right text-blue-600">{formatNumber(branch.active_loans)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
