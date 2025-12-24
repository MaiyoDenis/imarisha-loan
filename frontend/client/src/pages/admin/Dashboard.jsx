var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { AlertCircle, Download, RefreshCw, TrendingUp, Package, DollarSign, Activity, Zap, Target, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import KPICard from '@/components/dashboards/KPICard';
import { useRoleRedirect } from '@/hooks/use-role-redirect';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
export default function AdminDashboard() {
    var _this = this;
    var _a, _b;
    var _c = useLocation(), setLocation = _c[1];
    var toast = useToast().toast;
    useRoleRedirect({
        allowedRoles: ['admin', 'branch_manager'],
        fallbackPath: '/dashboard'
    });
    var _d = useState(null), branchId = _d[0], setBranchId = _d[1];
    var _e = useState(false), isRefreshing = _e[0], setIsRefreshing = _e[1];
    var _f = useState('all'), sectionFilter = _f[0], setSectionFilter = _f[1];
    var _g = useState('all'), lendingAnalyticsFilter = _g[0], setLendingAnalyticsFilter = _g[1];
    var _h = useState(false), showProfileMenu = _h[0], setShowProfileMenu = _h[1];
    var notifications = useState([
        { id: 1, message: 'Low stock alert: Product X', time: '5 min ago', read: false },
        { id: 2, message: 'Loan repayment due', time: '1 hour ago', read: false },
        { id: 3, message: 'System maintenance scheduled', time: '2 hours ago', read: true }
    ])[0];
    var messages = useState([
        { id: 1, sender: 'John Doe', message: 'Can you review the report?', time: '10 min ago', unread: true },
        { id: 2, sender: 'Jane Smith', message: 'Meeting at 3 PM', time: '30 min ago', unread: false }
    ])[0];
    var userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    var user = userStr ? JSON.parse(userStr) : null;
    var userInitials = user ? "".concat(((_a = user.firstName) === null || _a === void 0 ? void 0 : _a[0]) || '').concat(((_b = user.lastName) === null || _b === void 0 ? void 0 : _b[0]) || '').toUpperCase() : 'A';
    var userName = user ? "".concat(user.firstName, " ").concat(user.lastName) : 'Admin';
    var unreadNotifications = notifications.filter(function (n) { return !n.read; }).length;
    var unreadMessages = messages.filter(function (m) { return m.unread; }).length;
    var _j = useQuery({
        queryKey: ['adminDashboard', branchId],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, api.getAdminDashboard(branchId || undefined)];
            });
        }); },
        staleTime: 5 * 60 * 1000,
        refetchInterval: 30 * 1000
    }), dashboard = _j.data, isLoading = _j.isLoading, isError = _j.isError, refetch = _j.refetch;
    var handleRefresh = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsRefreshing(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, refetch()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setIsRefreshing(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleLogout = function () { return __awaiter(_this, void 0, void 0, function () {
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
    }); };
    var handleExport = function () {
        if (!dashboard)
            return;
        var csvContent = [
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
            .map(function (row) { return row.map(function (val) { return "\"".concat(val, "\""); }).join(','); })
            .join('\n');
        var blob = new Blob([csvContent], { type: 'text/csv' });
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = "admin-dashboard-".concat(new Date().toISOString().split('T')[0], ".csv");
        a.click();
        window.URL.revokeObjectURL(url);
    };
    if (isLoading) {
        return (<Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </div>
      </Layout>);
    }
    if (isError || !dashboard) {
        return (<Layout>
        <div className="p-6">
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0"/>
              <div className="flex-1">
                <h3 className="font-semibold text-destructive">Failed to load dashboard</h3>
                <p className="text-sm text-destructive mt-1">There was an error loading your dashboard data.</p>
                <button onClick={handleRefresh} disabled={isRefreshing} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50">
                  {isRefreshing ? 'Retrying...' : 'Retry'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>);
    }
    var formatCurrency = function (value) {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0
        }).format(value);
    };
    var formatNumber = function (value) {
        return new Intl.NumberFormat('en-KE').format(value);
    };

    var prepareGrowthData = function(metrics) {
        if (!metrics) return [];
        return [
            {
                name: 'Month to Date',
                loans: Number(metrics.mtd_new_loans) || 0,
                amount: Number(metrics.mtd_amount) || 0
            },
            {
                name: 'Quarter to Date',
                loans: Number(metrics.qtd_new_loans) || 0,
                amount: Number(metrics.qtd_amount) || 0
            },
            {
                name: 'Year to Date',
                loans: Number(metrics.ytd_new_loans) || 0,
                amount: Number(metrics.ytd_amount) || 0
            }
        ];
    };

    return (<Layout>
      <div className="min-h-screen p-6 bg-background">
        <div className="max-w-7xl mx-auto">
          {/* Main Dashboard Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">Reports & Analytics</h1>
              <p className="text-muted-foreground mt-2">Generate insights and monitor performance across your organization.</p>
              {(dashboard === null || dashboard === void 0 ? void 0 : dashboard.timestamp) && (<p className="text-xs text-muted-foreground mt-2">
                  Last updated: {new Date(dashboard.timestamp).toLocaleString()}
                </p>)}
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <button onClick={handleRefresh} disabled={isRefreshing} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition disabled:opacity-50">
                  <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''}/>
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </button>
                <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/80 transition">
                  <Download size={18}/>
                  Export
                </button>
              </div>
              <select value={sectionFilter} onChange={function (e) { return setSectionFilter(e.target.value); }} className="px-4 py-2 border border-border rounded-lg bg-card text-foreground font-medium hover:border-primary/40 transition focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="all">All Sections</option>
                <option value="product">Product Inventory Overview</option>
                <option value="lending">Lending Analytics</option>
                <option value="topproducts">Top Performing Products</option>
                <option value="branch">Branch Comparison</option>
              </select>
            </div>
          </div>

          {/* Alerts */}
          {dashboard.alerts && dashboard.alerts.length > 0 && (<div className="mb-6 space-y-3">
              {dashboard.alerts.map(function (alert, idx) { return (<div key={idx} className={"p-4 rounded-lg border flex items-start gap-3 ".concat(alert.severity === 'high'
                    ? 'bg-destructive/10 border-destructive/30'
                    : 'bg-accent/10 border-accent/30')}>
                  <AlertCircle size={20} className={alert.severity === 'high' ? 'text-destructive' : 'text-accent'}/>
                  <div className="flex-1">
                    <h3 className={"font-semibold ".concat(alert.severity === 'high' ? 'text-destructive' : 'text-accent')}>
                      {alert.title}
                    </h3>
                    <p className={"text-sm mt-1 ".concat(alert.severity === 'high'
                    ? 'text-destructive'
                    : 'text-accent')}>
                      {alert.message}
                    </p>
                  </div>
                </div>); })}
            </div>)}

          {/* Product Overview */}
          {(sectionFilter === 'all' || sectionFilter === 'product') && (<div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Package className="text-primary" size={28}/>
                Product Inventory Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <KPICard title="Total Products" value={formatNumber(dashboard.product_overview.total_products)} icon={<Package size={24}/>} status="success"/>
                <KPICard title="Inventory Value" value={formatCurrency(dashboard.product_overview.total_inventory_value)} icon={<DollarSign size={24}/>}/>
                <KPICard title="Active Products" value={formatNumber(dashboard.product_overview.active_products)} status="success"/>
                <KPICard title="Low Stock Alerts" value={formatNumber(dashboard.product_overview.low_stock_alerts)} status={dashboard.product_overview.low_stock_alerts > 0 ? 'warning' : 'success'}/>
                <KPICard title="Market Value" value={formatCurrency(dashboard.product_overview.total_market_value)}/>
              </div>
            </div>)}

          {/* Lending Analytics */}
          {(sectionFilter === 'all' || sectionFilter === 'lending') && (<div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Activity className="text-primary" size={28}/>
                  Lending Analytics
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <KPICard title="Active Loans" value={formatNumber(dashboard.lending_analytics.total_loans_active)} icon={<Activity size={24}/>} status="success"/>
                <KPICard title="Completed Loans" value={formatNumber(dashboard.lending_analytics.total_loans_completed)} icon={<CheckCircle2 size={24}/>} status="success"/>
                <KPICard title="Pending Loans" value={formatNumber(dashboard.lending_analytics.total_loans_pending)} icon={<AlertCircle size={24}/>} status="warning"/>
                <KPICard title="Total Borrowed" value={formatCurrency(dashboard.lending_analytics.total_borrowed_amount)} icon={<TrendingUp size={24}/>}/>
                <KPICard title="Total Paid" value={formatCurrency(dashboard.lending_analytics.total_paid_amount)}/>
                <KPICard title="Outstanding" value={formatCurrency(dashboard.lending_analytics.total_outstanding)} status={dashboard.lending_analytics.total_outstanding > 0 ? 'warning' : 'normal'}/>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <KPICard title="Expected Total Income" value={formatCurrency(dashboard.lending_analytics.expected_total_income)}/>
                <KPICard title="Borrowed vs Paid Ratio" value={"".concat(dashboard.lending_analytics.borrowed_to_paid_ratio.toFixed(1), "%")}/>
              </div>
            </div>)}

          {/* Profit Analysis */}
          {(sectionFilter === 'all' || sectionFilter === 'lending') && (<div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="text-secondary" size={28}/>
                Profit Analysis & Financial Performance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Cost of Goods Sold" value={formatCurrency(dashboard.profit_analysis.cost_of_goods_sold)} status="normal"/>
                <KPICard title="Revenue (Selling Price)" value={formatCurrency(dashboard.profit_analysis.revenue_selling_price)} status="success"/>
                <KPICard title="Gross Profit" value={formatCurrency(dashboard.profit_analysis.gross_profit)} icon={<Zap size={24}/>} status={dashboard.profit_analysis.gross_profit > 0 ? 'success' : 'warning'}/>
                <KPICard title="Profit Margin" value={"".concat(dashboard.profit_analysis.profit_margin_percentage.toFixed(2), "%")} status={dashboard.profit_analysis.profit_margin_percentage > 0 ? 'success' : 'warning'}/>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <KPICard title="Interest Income (Realized)" value={formatCurrency(dashboard.profit_analysis.total_interest_income)}/>
                <KPICard title="Processing Fees" value={formatCurrency(dashboard.profit_analysis.total_processing_fees)}/>
                <KPICard title="Expected Income (Pending)" value={formatCurrency(dashboard.profit_analysis.expected_income_pending)}/>
              </div>
            </div>)}

          {/* Repayment Tracking */}
          {(sectionFilter === 'all' || sectionFilter === 'lending') && (<div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-emerald-600" size={28}/>
                Repayment Performance Tracking
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Total Disbursed" value={formatNumber(dashboard.repayment_tracking.total_disbursed)}/>
                <KPICard title="Total Completed" value={formatNumber(dashboard.repayment_tracking.total_completed)} status="success"/>
                <KPICard title="Repayment Rate" value={"".concat(dashboard.repayment_tracking.repayment_rate.toFixed(1), "%")} status={dashboard.repayment_tracking.repayment_rate > 80 ? 'success' : 'warning'}/>
                <KPICard title="Default Rate" value={"".concat(dashboard.repayment_tracking.default_rate.toFixed(1), "%")} status={dashboard.repayment_tracking.default_rate < 5 ? 'success' : 'warning'}/>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <KPICard title="Overdue Loans" value={formatNumber(dashboard.repayment_tracking.overdue_loans)} status={dashboard.repayment_tracking.overdue_loans > 0 ? 'warning' : 'success'}/>
                <KPICard title="Outstanding Balance" value={formatCurrency(dashboard.repayment_tracking.outstanding_balance)}/>
              </div>
            </div>)}

          {/* Growth Metrics */}
          {(sectionFilter === 'all' || sectionFilter === 'lending') && (<div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="text-primary" size={28}/>
                Growth Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card rounded-lg p-4 border border-border">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase">Month to Date</h3>
                  <p className="text-2xl font-bold text-foreground mt-2">{formatNumber(dashboard.growth_metrics.mtd_new_loans)}</p>
                  <p className="text-xs text-muted-foreground mt-1">New Loans</p>
                  <p className="text-xl font-semibold text-foreground mt-3">{formatCurrency(dashboard.growth_metrics.mtd_amount)}</p>
                  <p className="text-xs text-muted-foreground">Amount</p>
                </div>
                <div className="bg-card rounded-lg p-4 border border-border">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase">Quarter to Date</h3>
                  <p className="text-2xl font-bold text-foreground mt-2">{formatNumber(dashboard.growth_metrics.qtd_new_loans)}</p>
                  <p className="text-xs text-muted-foreground mt-1">New Loans</p>
                  <p className="text-xl font-semibold text-foreground mt-3">{formatCurrency(dashboard.growth_metrics.qtd_amount)}</p>
                  <p className="text-xs text-muted-foreground">Amount</p>
                </div>
                <div className="bg-card rounded-lg p-4 border border-border">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase">Year to Date</h3>
                  <p className="text-2xl font-bold text-foreground mt-2">{formatNumber(dashboard.growth_metrics.ytd_new_loans)}</p>
                  <p className="text-xs text-muted-foreground mt-1">New Loans</p>
                  <p className="text-xl font-semibold text-foreground mt-3">{formatCurrency(dashboard.growth_metrics.ytd_amount)}</p>
                  <p className="text-xs text-muted-foreground">Amount</p>
                </div>
              </div>

              {/* Growth Metrics Chart */}
              <div className="mt-6 bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Growth Comparison</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareGrowthData(dashboard.growth_metrics)}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" tick={{fill: 'currentColor'}} />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" className="text-xs" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" className="text-xs" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                        itemStyle={{ color: 'var(--foreground)' }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="loans" name="New Loans" fill="#8884d8" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="amount" name="Total Amount (KES)" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>)}

          {/* Top Products */}
          {(sectionFilter === 'all' || sectionFilter === 'topproducts') && dashboard.top_products && dashboard.top_products.length > 0 && (<div className="mb-8 bg-card rounded-lg border border-border p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <ShoppingCart className="text-destructive" size={28}/>
                Top Performing Products
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-background border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Product</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">Market Price</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">Selling Price</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">Loans</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">Units Sold</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">Revenue</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">Profit</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {dashboard.top_products.map(function (product) { return (<tr key={product.product_id} className="hover:bg-background transition">
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{product.product_name}</td>
                        <td className="px-4 py-3 text-sm text-right text-muted-foreground">{formatCurrency(product.buying_price)}</td>
                        <td className="px-4 py-3 text-sm text-right text-muted-foreground">{formatCurrency(product.selling_price)}</td>
                        <td className="px-4 py-3 text-sm text-right text-muted-foreground">{formatNumber(product.loans_count)}</td>
                        <td className="px-4 py-3 text-sm text-right text-muted-foreground">{formatNumber(product.units_sold)}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-foreground">{formatCurrency(product.total_revenue)}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-secondary">{formatCurrency(product.profit)}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-secondary">{product.margin.toFixed(1)}%</td>
                      </tr>); })}
                  </tbody>
                </table>
              </div>
            </div>)}

          {/* Branch Comparison */}
          {(sectionFilter === 'all' || sectionFilter === 'branch') && dashboard.branch_comparison && dashboard.branch_comparison.length > 0 && (<div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Target className="text-primary" size={28}/>
                Branch Comparison
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-background border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Branch</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Location</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">Loans</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">Total Amount</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">Completed</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {dashboard.branch_comparison.map(function (branch) { return (<tr key={branch.branch_id} className="hover:bg-background transition">
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{branch.branch_name}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{branch.location}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-foreground">{formatNumber(branch.loans_count)}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-foreground">{formatCurrency(branch.total_amount)}</td>
                        <td className="px-4 py-3 text-sm text-right text-secondary">{formatNumber(branch.completed_loans)}</td>
                        <td className="px-4 py-3 text-sm text-right text-primary">{formatNumber(branch.active_loans)}</td>
                      </tr>); })}
                  </tbody>
                </table>
              </div>
            </div>)}
        </div>
      </div>
    </Layout>);
}
