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
import { useRoleRedirect } from '@/hooks/use-role-redirect';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Shield, RefreshCw, Download } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { api } from '@/lib/api';
import KPICard from '@/components/dashboards/KPICard';
export default function RiskDashboard() {
    var _this = this;
    useRoleRedirect({
        allowedRoles: ['admin', 'branch_manager', 'loan_officer'],
        fallbackPath: '/dashboard'
    });
    var _a = useState(false), isRefreshing = _a[0], setIsRefreshing = _a[1];
    var _b = useQuery({
        queryKey: ['riskDashboard'],
        queryFn: function () { return api.getRiskDashboard(); },
        staleTime: 5 * 60 * 1000
    }), dashboard = _b.data, isLoading = _b.isLoading, isError = _b.isError, refetch = _b.refetch;
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
            ['Risk Dashboard Export'],
            ['Generated:', new Date(dashboard.timestamp).toLocaleString()],
            [''],
            ['Risk Distribution'],
            ['Risk Level', 'Count', 'Percentage'],
            ['Low Risk', dashboard.risk_distribution.low_risk.count, dashboard.risk_distribution.low_risk.percentage],
            ['Medium Risk', dashboard.risk_distribution.medium_risk.count, dashboard.risk_distribution.medium_risk.percentage],
            ['High Risk', dashboard.risk_distribution.high_risk.count, dashboard.risk_distribution.high_risk.percentage],
            ['Critical Risk', dashboard.risk_distribution.critical_risk.count, dashboard.risk_distribution.critical_risk.percentage],
            [''],
            ['Fraud Detection'],
            ['Metric', 'Value'],
            ['Active Investigations', dashboard.fraud_detection.active_investigations],
            ['Suspicious Transactions', dashboard.fraud_detection.suspicious_transactions],
            ['Flagged Members', dashboard.fraud_detection.flagged_members],
            [''],
            ['Portfolio Concentration'],
            ['Concentration Ratio', dashboard.portfolio_concentration.concentration_ratio],
            [''],
            ['Stress Testing Scenarios'],
            ['Scenario', 'NPL Rate'],
            ['Baseline', dashboard.scenario_analysis.baseline.npl_rate],
            ['Stress 5%', dashboard.scenario_analysis.stress_5pct.npl_rate],
            ['Stress 10%', dashboard.scenario_analysis.stress_10pct.npl_rate],
            ['Stress 20%', dashboard.scenario_analysis.stress_20pct.npl_rate],
        ]
            .map(function (row) { return row.map(function (val) { return "\"".concat(val, "\""); }).join(','); })
            .join('\n');
        var blob = new Blob([csvContent], { type: 'text/csv' });
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = "risk-dashboard-".concat(new Date().toISOString().split('T')[0], ".csv");
        a.click();
        window.URL.revokeObjectURL(url);
    };
    if (isLoading) {
        return (<Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>);
    }
    if (isError || !dashboard || !dashboard.risk_distribution) {
        var errorMsg = (dashboard === null || dashboard === void 0 ? void 0 : dashboard.error) || 'Failed to load dashboard';
        return (<Layout>
        <div className="p-6">
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive mt-0.5"/>
            <div>
              <h3 className="font-semibold text-destructive">Failed to load dashboard</h3>
              <p className="text-sm text-destructive mt-1">{errorMsg}</p>
            </div>
          </div>
        </div>
      </Layout>);
    }
    var riskData = [
        { name: 'Low Risk', value: dashboard.risk_distribution.low_risk.count, color: '#10b981' },
        { name: 'Medium Risk', value: dashboard.risk_distribution.medium_risk.count, color: '#f59e0b' },
        { name: 'High Risk', value: dashboard.risk_distribution.high_risk.count, color: '#ef5350' },
        { name: 'Critical', value: dashboard.risk_distribution.critical_risk.count, color: '#c62828' }
    ];
    return (<Layout>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tight text-gradient">Risk Management Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Monitor portfolio risk and early warning indicators</p>
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

        {/* Risk Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Risk Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KPICard title="Low Risk" value={dashboard.risk_distribution.low_risk.count} unit={"".concat(dashboard.risk_distribution.low_risk.percentage.toFixed(1), "%")} status="success" icon={<Shield size={24}/>}/>
            <KPICard title="Medium Risk" value={dashboard.risk_distribution.medium_risk.count} unit={"".concat(dashboard.risk_distribution.medium_risk.percentage.toFixed(1), "%")} status="normal"/>
            <KPICard title="High Risk" value={dashboard.risk_distribution.high_risk.count} unit={"".concat(dashboard.risk_distribution.high_risk.percentage.toFixed(1), "%")} status="warning"/>
            <KPICard title="Critical Risk" value={dashboard.risk_distribution.critical_risk.count} unit={"".concat(dashboard.risk_distribution.critical_risk.percentage.toFixed(1), "%")} status="critical" icon={<AlertTriangle size={24}/>}/>
          </div>
        </div>

        {/* Fraud Detection */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Fraud Detection</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KPICard title="Active Investigations" value={dashboard.fraud_detection.active_investigations} status={dashboard.fraud_detection.active_investigations > 0 ? 'warning' : 'normal'}/>
            <KPICard title="Suspicious Transactions" value={dashboard.fraud_detection.suspicious_transactions} status={dashboard.fraud_detection.suspicious_transactions > 5 ? 'warning' : 'normal'}/>
            <KPICard title="Flagged Members" value={dashboard.fraud_detection.flagged_members} status={dashboard.fraud_detection.flagged_members > 0 ? 'warning' : 'success'}/>
          </div>
        </div>

        {/* Risk Distribution Chart */}
        <div className="mb-8 glass-card gradient-border hover-tilt p-6 relative overflow-hidden">
          <span className="aura"></span>
          <h3 className="font-heading font-semibold text-foreground mb-4">Member Risk Distribution</h3>
          <div style={{ width: "100%", height: "300px", minWidth: 0, overflow: "hidden" }}>
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
            <PieChart>
              <Pie data={riskData} cx="50%" cy="50%" labelLine={false} label={function (entry) {
            var percent = entry.percent || 0;
            return "".concat(entry.name, ": ").concat(entry.value, " (").concat((percent * 100).toFixed(0), "%)");
        }} outerRadius={80} fill="#8884d8" dataKey="value">
                {riskData.map(function (entry, index) { return (<Cell key={"cell-".concat(index)} fill={entry.color}/>); })}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
            </div>
        </div>

        {/* Portfolio Concentration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* By Product */}
          <div className="glass-card gradient-border hover-tilt p-6 relative overflow-hidden">
            <span className="aura"></span>
            <h3 className="font-heading font-semibold text-foreground mb-4">Concentration by Product</h3>
            <div style={{ width: "100%", height: "300px", minWidth: 0, overflow: "hidden" }}>
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              <BarChart data={dashboard.portfolio_concentration.by_product && dashboard.portfolio_concentration.by_product.length > 0 ? dashboard.portfolio_concentration.by_product : [
            { product: 'Product A', amount: 50000, percentage: 35 },
            { product: 'Product B', amount: 45000, percentage: 30 },
            { product: 'Product C', amount: 35000, percentage: 25 },
            { product: 'Product D', amount: 20000, percentage: 10 }
        ]}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="product"/>
                <YAxis yAxisId="left"/>
                <YAxis yAxisId="right" orientation="right"/>
                <Tooltip />
                <Bar yAxisId="left" dataKey="amount" fill="#3b82f6"/>
                <Bar yAxisId="right" dataKey="percentage" fill="#10b981"/>
              </BarChart>
            </ResponsiveContainer>
            </div>
          </div>

          {/* By Location */}
          <div className="glass-card gradient-border hover-tilt p-6 relative overflow-hidden">
            <span className="aura"></span>
            <h3 className="font-heading font-semibold text-foreground mb-4">Concentration by Location</h3>
            <div style={{ width: "100%", height: "300px", minWidth: 0, overflow: "hidden" }}>
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              <BarChart data={dashboard.portfolio_concentration.by_location && dashboard.portfolio_concentration.by_location.length > 0 ? dashboard.portfolio_concentration.by_location : [
            { location: 'Nairobi', amount: 60000, percentage: 40 },
            { location: 'Mombasa', amount: 45000, percentage: 30 },
            { location: 'Kisumu', amount: 30000, percentage: 20 },
            { location: 'Other', amount: 15000, percentage: 10 }
        ]}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="location"/>
                <YAxis yAxisId="left"/>
                <YAxis yAxisId="right" orientation="right"/>
                <Tooltip />
                <Bar yAxisId="left" dataKey="amount" fill="#8b5cf6"/>
                <Bar yAxisId="right" dataKey="percentage" fill="#ec4899"/>
              </BarChart>
            </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Scenario Analysis */}
        <div className="mb-8 glass-card gradient-border hover-tilt p-6 relative overflow-hidden">
          <span className="aura"></span>
          <h3 className="font-heading font-semibold text-foreground mb-4">Stress Testing Scenarios</h3>
          <div style={{ width: "100%", height: "300px", minWidth: 0, overflow: "hidden" }}>
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
            <BarChart data={[
            { scenario: 'Baseline', npl: dashboard.scenario_analysis.baseline.npl_rate },
            { scenario: 'Stress 5%', npl: dashboard.scenario_analysis.stress_5pct.npl_rate },
            { scenario: 'Stress 10%', npl: dashboard.scenario_analysis.stress_10pct.npl_rate },
            { scenario: 'Stress 20%', npl: dashboard.scenario_analysis.stress_20pct.npl_rate }
        ]}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="scenario"/>
              <YAxis />
              <Tooltip />
              <Bar dataKey="npl" fill="#ef4444"/>
            </BarChart>
          </ResponsiveContainer>
            </div>
        </div>

        {/* Early Warnings */}
        {dashboard.early_warnings.length > 0 && (<div className="glass-card gradient-border hover-tilt p-6">
            <h2 className="text-xl font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle size={24} className="text-accent"/>
              Early Warning Indicators
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {dashboard.early_warnings.slice(0, 10).map(function (warning) { return (<div key={warning.member_id} className="p-4 border-l-4 border-l-accent bg-accent/10 rounded">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{warning.member_name}</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {warning.risk_flags.map(function (flag) { return (<span key={flag} className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs">
                            {flag.replace(/_/g, ' ')}
                          </span>); })}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        <strong>Action:</strong> {warning.recommended_action}
                      </p>
                    </div>
                  </div>
                </div>); })}
            </div>
          </div>)}
      </div>
    </div>
    </Layout>);
}
