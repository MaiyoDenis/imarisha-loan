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
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Layout from '@/components/layout/Layout';
import { AlertCircle, Download, RefreshCw, Users, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { api } from '@/lib/api';
import KPICard from '@/components/dashboards/KPICard';
import { useRoleRedirect } from '@/hooks/use-role-redirect';
function generateRevenueData(revenue) {
    if (!revenue) {
        return [];
    }
    var total = (revenue.mtd_interest_income || 0) + (revenue.total_processing_fees || 0);
    var interestPercent = total > 0 ? ((revenue.mtd_interest_income || 0) / total * 100) : 0;
    var feesPercent = total > 0 ? ((revenue.total_processing_fees || 0) / total * 100) : 0;
    var otherPercent = 100 - interestPercent - feesPercent;
    var data = [];
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
export default function ExecutiveDashboard() {
    var _this = this;
    var _a;
    useRoleRedirect({
        allowedRoles: ['admin', 'branch_manager'],
        fallbackPath: '/dashboard'
    });
    var _b = useState(null), branchId = _b[0], setBranchId = _b[1];
    var _c = useState('mtd'), dateRange = _c[0], setDateRange = _c[1];
    var _d = useState(false), isRefreshing = _d[0], setIsRefreshing = _d[1];
    var _e = useQuery({
        queryKey: ['executiveDashboard', branchId, dateRange],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, api.getExecutiveDashboard(branchId || undefined)];
            });
        }); },
        staleTime: 5 * 60 * 1000,
        refetchInterval: 30 * 1000
    }), dashboard = _e.data, isLoading = _e.isLoading, isError = _e.isError, refetch = _e.refetch;
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
    var handleExport = function () {
        if (!dashboard)
            return;
        var csvContent = [
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
            .map(function (row) { return row.map(function (val) { return "\"".concat(val, "\""); }).join(','); })
            .join('\n');
        var blob = new Blob([csvContent], { type: 'text/csv' });
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = "executive-dashboard-".concat(new Date().toISOString().split('T')[0], ".csv");
        a.click();
        window.URL.revokeObjectURL(url);
    };
    if (isLoading) {
        return (<Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading executive dashboard...</p>
          </div>
        </div>
      </Layout>);
    }
    if (isError || !dashboard || !dashboard.portfolio_health) {
        var errorMsg = (dashboard === null || dashboard === void 0 ? void 0 : dashboard.error) || 'Unknown error occurred';
        return (<Layout>
        <div className="p-6">
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0"/>
              <div className="flex-1">
                <h3 className="font-semibold text-destructive">Failed to load dashboard</h3>
                <p className="text-sm text-destructive mt-1">There was an error loading your dashboard data.</p>
                {(dashboard === null || dashboard === void 0 ? void 0 : dashboard.error) && (<p className="text-xs text-destructive mt-2">Details: {errorMsg}</p>)}
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
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0
        }).format(value);
    };
    var formatNumber = function (value) {
        return new Intl.NumberFormat('en-US').format(value);
    };
    return (<Layout>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tight text-gradient">Executive Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Real-time overview of key metrics and performance indicators</p>
            {(dashboard === null || dashboard === void 0 ? void 0 : dashboard.timestamp) && (<p className="text-xs text-muted-foreground mt-2">
                Last updated: {new Date(dashboard.timestamp).toLocaleString()}
              </p>)}
          </div>
          <div className="flex gap-3">
            <button onClick={handleRefresh} disabled={isRefreshing} className={"btn-neon px-4 py-2 rounded-lg ".concat(isRefreshing ? 'opacity-50 cursor-not-allowed' : '')}>
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''}/>
              <span className="text-sm font-medium">
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </span>
            </button>
            <button onClick={handleExport} className="btn-neon px-4 py-2 rounded-lg cursor-pointer">
              <Download size={18}/>
              <span className="text-sm font-medium">Export</span>
            </button>
          </div>
        </div>

        {/* Alerts */}
        {dashboard.key_alerts && dashboard.key_alerts.length > 0 && (<div className="mb-6 space-y-3">
            {dashboard.key_alerts.map(function (alert, idx) { return (<div key={idx} className={"p-4 rounded-lg border flex items-start gap-3 cursor-pointer transition glass-card gradient-border hover-tilt"}>
                <span className="aura"></span>
                <AlertCircle size={20} className={alert.severity === 'high' ? 'text-red-500' : 'text-yellow-500'}/>
                <div className="flex-1">
                  <h3 className={"font-semibold ".concat(alert.severity === 'high' ? 'text-destructive' : 'text-accent')}>
                    {alert.title}
                  </h3>
                  <p className={"text-sm mt-1 ".concat(alert.severity === 'high' ? 'text-destructive/80' : 'text-accent/90')}>
                    {alert.message}
                  </p>
                </div>
              </div>); })}
          </div>)}

        {/* Portfolio Health KPIs */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Portfolio Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Total AUM" value={formatCurrency(dashboard.portfolio_health.total_aum)} icon={<DollarSign size={24}/>} status="success"/>
            <KPICard title="Active Members" value={formatNumber(dashboard.portfolio_health.active_members)} icon={<Users size={24}/>} status="success"/>
            <KPICard title="Active Loans" value={formatNumber(dashboard.portfolio_health.active_loans)} icon={<Activity size={24}/>}/>
            <KPICard title="Portfolio at Risk" value={"".concat(dashboard.portfolio_health.par_ratio.toFixed(2), "%")} status={dashboard.portfolio_health.par_ratio > 10 ? 'warning' : 'normal'} icon={<TrendingUp size={24}/>}/>
          </div>
        </div>

        {/* Revenue Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Revenue Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="MTD Interest Income" value={formatCurrency(dashboard.revenue_metrics.mtd_interest_income)} change={{ value: 5.2, isPositive: true }}/>
            <KPICard title="YTD Interest Income" value={formatCurrency(dashboard.revenue_metrics.ytd_interest_income)}/>
            <KPICard title="Processing Fees" value={formatCurrency(dashboard.revenue_metrics.total_processing_fees)}/>
            <KPICard title="Profit Margin" value={"".concat(dashboard.revenue_metrics.profit_margin.toFixed(1), "%")} status="success"/>
          </div>
        </div>

        {/* Growth Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Growth Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="New Members (MTD)" value={formatNumber(dashboard.growth_metrics.new_members_mtd)} change={{ value: 12.5, isPositive: true }}/>
            <KPICard title="Member Growth Rate" value={"".concat(dashboard.growth_metrics.member_growth_rate.toFixed(2), "%")}/>
            <KPICard title="New Loans (MTD)" value={formatNumber(dashboard.growth_metrics.new_loans_mtd)}/>
            <KPICard title="Repeat Loan Rate" value={"".concat(dashboard.growth_metrics.repeat_loan_rate.toFixed(1), "%")} status="success"/>
          </div>
        </div>

        {/* Risk Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Risk Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="PAR Ratio" value={"".concat(dashboard.risk_metrics.par_ratio.toFixed(2), "%")} status={dashboard.risk_metrics.par_ratio > 10 ? 'critical' : 'warning'}/>
            <KPICard title="NPL Ratio" value={"".concat(dashboard.risk_metrics.npl_ratio.toFixed(2), "%")} status={dashboard.risk_metrics.npl_ratio > 5 ? 'warning' : 'normal'}/>
            <KPICard title="Default Rate" value={"".concat(dashboard.risk_metrics.default_rate.toFixed(2), "%")}/>
            <KPICard title="Early Warnings" value={formatNumber(dashboard.risk_metrics.early_warning_count)} status={dashboard.risk_metrics.early_warning_count > 5 ? 'warning' : 'normal'}/>
          </div>
        </div>

        {/* Operational Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Operational Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Avg Processing Time" value={"".concat(dashboard.operational_metrics.avg_processing_time_days.toFixed(1))} unit="days"/>
            <KPICard title="Approval Rate" value={"".concat(dashboard.operational_metrics.approval_rate.toFixed(1), "%")} status="success"/>
            <KPICard title="Repayment Rate" value={"".concat(dashboard.operational_metrics.repayment_rate.toFixed(1), "%")} status="success"/>
            <KPICard title="NPS Score" value={"".concat(dashboard.operational_metrics.nps_score.toFixed(0))} unit="/100" status="success"/>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mb-8">
          {/* Revenue by Source */}
          <div className="glass-card gradient-border hover-tilt p-6 relative overflow-hidden">
            <span className="aura"></span>
            <h3 className="font-heading font-semibold text-foreground mb-4">Revenue by Source</h3>
            <div style={{ width: "100%", height: "300px", minWidth: 0, overflow: "hidden" }}>
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              <PieChart>
                <Pie data={generateRevenueData(dashboard === null || dashboard === void 0 ? void 0 : dashboard.revenue_metrics)} cx="50%" cy="50%" labelLine={false} label={function (_a) {
        var name = _a.name, percent = _a.percent;
        return "".concat(name, ": ").concat(((percent || 0) * 100).toFixed(0), "%");
    }} outerRadius={80} fill="#8884d8" dataKey="value">
                  <Cell fill="#3b82f6"/>
                  <Cell fill="#10b981"/>
                  <Cell fill="#f59e0b"/>
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center text-sm text-gray-500">
          Last updated: {new Date(dashboard.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
    </Layout>);
}
