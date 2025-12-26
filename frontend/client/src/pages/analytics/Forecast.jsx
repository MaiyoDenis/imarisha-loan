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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { useRoleRedirect } from '@/hooks/use-role-redirect';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, AlertTriangle, RefreshCw, Download, Sliders } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { api } from '@/lib/api';
export default function ForecastDashboard() {
    var _this = this;
    useRoleRedirect({
        allowedRoles: ['admin', 'branch_manager', 'loan_officer'],
        fallbackPath: '/dashboard'
    });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [scenarioParams, setScenarioParams] = useState({
        revenue_growth: 5.0,
        volume_growth: 8.0,
        risk_factor: 1.0
    });

    const { data: dashboard, isLoading, isError, refetch } = useQuery({
        queryKey: ['forecastDashboard', scenarioParams],
        queryFn: () => api.getForecastDashboard(undefined, scenarioParams),
        staleTime: 5 * 60 * 1000
    });

    const updateParam = (key, value) => {
        setScenarioParams(prev => ({
            ...prev,
            [key]: parseFloat(value)
        }));
    };

    const resetScenario = () => {
        setScenarioParams({
            revenue_growth: 5.0,
            volume_growth: 8.0,
            risk_factor: 1.0
        });
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refetch();
        } finally {
            setIsRefreshing(false);
        }
    };
    var handleExport = function () {
        if (!dashboard)
            return;
        var csvContent = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([
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
            ['Month', 'Forecast', 'Lower CI', 'Upper CI']
        ], dashboard.revenue_forecast.forecast_months.map(function (month, idx) { return [
            month,
            dashboard.revenue_forecast.values[idx],
            dashboard.revenue_forecast.confidence_interval[0],
            dashboard.revenue_forecast.confidence_interval[1]
        ]; }), true), [
            [''],
            ['Loan Volume Forecast (12 Months)'],
            ['Month', 'Applications', 'Approvals']
        ], false), dashboard.loan_volume_forecast.forecast_months.map(function (month, idx) { return [
            month,
            dashboard.loan_volume_forecast.applications[idx],
            dashboard.loan_volume_forecast.approvals[idx]
        ]; }), true), [
            [''],
            ['Cash Flow Forecast (12 Months)'],
            ['Month', 'Inflows', 'Outflows', 'Net Flow']
        ], false), dashboard.cash_flow_forecast.forecast_months.map(function (month, idx) { return [
            month,
            dashboard.cash_flow_forecast.inflows[idx],
            dashboard.cash_flow_forecast.outflows[idx],
            dashboard.cash_flow_forecast.net_flow[idx]
        ]; }), true), [
            [''],
            ['Arrears Forecast (12 Months)'],
            ['Month', 'Predicted Rate (%)']
        ], false), dashboard.arrears_forecast.forecast_months.map(function (month, idx) { return [
            month,
            dashboard.arrears_forecast.predicted_rate[idx]
        ]; }), true), [
            [''],
            ['Loan Volume Trend', dashboard.loan_volume_forecast.trend],
            ['Arrears Confidence Level (%)', (dashboard.arrears_forecast.confidence_level * 100).toFixed(1)],
        ], false).map(function (row) { return row.map(function (val) { return "\"".concat(val, "\""); }).join(','); })
            .join('\n');
        var blob = new Blob([csvContent], { type: 'text/csv' });
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = "forecast-dashboard-".concat(new Date().toISOString().split('T')[0], ".csv");
        a.click();
        window.URL.revokeObjectURL(url);
    };
    if (isLoading) {
        return (<Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>);
    }
    if (!dashboard || !dashboard.revenue_forecast) {
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
    var revenueData = dashboard.revenue_forecast.forecast_months.map(function (month, idx) { return ({
        month: month,
        revenue: dashboard.revenue_forecast.values[idx],
        lower: dashboard.revenue_forecast.confidence_interval[0],
        upper: dashboard.revenue_forecast.confidence_interval[1]
    }); });
    var loanData = dashboard.loan_volume_forecast.forecast_months.map(function (month, idx) { return ({
        month: month,
        applications: dashboard.loan_volume_forecast.applications[idx],
        approvals: dashboard.loan_volume_forecast.approvals[idx]
    }); });
    var mockCashFlowData = Array.from({ length: 12 }, function (_, i) {
        var date = new Date();
        date.setMonth(date.getMonth() + i);
        return {
            month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            inflows: 500000 + Math.random() * 200000,
            outflows: 400000 + Math.random() * 150000,
            net_flow: 100000 + Math.random() * 100000
        };
    });
    var cashFlowData = (dashboard.cash_flow_forecast.forecast_months && dashboard.cash_flow_forecast.forecast_months.length > 0)
        ? dashboard.cash_flow_forecast.forecast_months.map(function (month, idx) { return ({
            month: month,
            inflows: dashboard.cash_flow_forecast.inflows[idx],
            outflows: dashboard.cash_flow_forecast.outflows[idx],
            net_flow: dashboard.cash_flow_forecast.net_flow[idx]
        }); })
        : mockCashFlowData;
    var mockArrearsData = Array.from({ length: 12 }, function (_, i) {
        var date = new Date();
        date.setMonth(date.getMonth() + i);
        return {
            month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            rate: 5.0 + (i * 0.3) + Math.random() * 0.5
        };
    });
    var arrearsData = (dashboard.arrears_forecast.forecast_months && dashboard.arrears_forecast.forecast_months.length > 0)
        ? dashboard.arrears_forecast.forecast_months.map(function (month, idx) { return ({
            month: month,
            rate: dashboard.arrears_forecast.predicted_rate[idx]
        }); })
        : mockArrearsData;
    var arrearsConfidenceLevel = (dashboard.arrears_forecast.forecast_months && dashboard.arrears_forecast.forecast_months.length > 0)
        ? dashboard.arrears_forecast.confidence_level * 100
        : 80;
    var formatCurrency = function (value) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(value);
    };
    return (<Layout>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tight text-gradient">Financial Forecast Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">12-month projections and scenario planning</p>
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

        {/* Scenario Planning Controls */}
        <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
                <Sliders className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Scenario Planning</h2>
            </div>
            
            <div className="glass-card gradient-border p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Revenue Growth Control */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-muted-foreground">Revenue Growth</label>
                            <span className="text-sm font-bold text-primary">{scenarioParams.revenue_growth}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="-20" 
                            max="50" 
                            step="0.5"
                            value={scenarioParams.revenue_growth}
                            onChange={(e) => updateParam('revenue_growth', e.target.value)}
                            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>-20%</span>
                            <span>+50%</span>
                        </div>
                    </div>

                    {/* Loan Volume Growth Control */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-muted-foreground">Volume Growth</label>
                            <span className="text-sm font-bold text-primary">{scenarioParams.volume_growth}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="-10" 
                            max="30" 
                            step="0.5"
                            value={scenarioParams.volume_growth}
                            onChange={(e) => updateParam('volume_growth', e.target.value)}
                            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>-10%</span>
                            <span>+30%</span>
                        </div>
                    </div>

                    {/* Risk Factor Control */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-muted-foreground">Risk Factor</label>
                            <span className={`text-sm font-bold ${scenarioParams.risk_factor > 1 ? 'text-destructive' : 'text-green-500'}`}>
                                {scenarioParams.risk_factor}x
                            </span>
                        </div>
                        <input 
                            type="range" 
                            min="0.5" 
                            max="3.0" 
                            step="0.1"
                            value={scenarioParams.risk_factor}
                            onChange={(e) => updateParam('risk_factor', e.target.value)}
                            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>0.5x (Safe)</span>
                            <span>3.0x (High Risk)</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end mt-6 pt-4 border-t border-border/50">
                    <button 
                        onClick={resetScenario}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                        <RefreshCw size={14} /> Reset to Baseline
                    </button>
                </div>
            </div>
        </div>

        {/* Budget Variance Summary */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Budget vs Actual (YTD)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card gradient-border hover-tilt p-6 relative overflow-hidden">
              <span className="aura"></span>
              <h3 className="text-sm font-heading font-medium text-foreground mb-2">Revenue</h3>
              <p className="text-2xl font-bold text-foreground mb-2">
                {formatCurrency(dashboard.budget_variance.revenue.actual)}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Target: {formatCurrency(dashboard.budget_variance.revenue.budgeted)}
                </span>
                <span className={"text-sm font-semibold ".concat(dashboard.budget_variance.revenue.variance_pct < 0 ? 'text-destructive' : 'text-secondary')}>
                  {dashboard.budget_variance.revenue.variance_pct > 0 ? '+' : ''}
                  {dashboard.budget_variance.revenue.variance_pct.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-3">
                <div className="bg-primary h-2 rounded-full" style={{
            width: "".concat(Math.min((dashboard.budget_variance.revenue.actual / dashboard.budget_variance.revenue.budgeted) * 100, 100), "%")
        }}/>
              </div>
            </div>

            <div className="glass-card gradient-border hover-tilt p-6 relative overflow-hidden">
              <span className="aura"></span>
              <h3 className="text-sm font-heading font-medium text-foreground mb-2">Expenses</h3>
              <p className="text-2xl font-bold text-foreground mb-2">
                {formatCurrency(dashboard.budget_variance.expenses.actual)}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Budget: {formatCurrency(dashboard.budget_variance.expenses.budgeted)}
                </span>
                <span className={"text-sm font-semibold ".concat(dashboard.budget_variance.expenses.variance_pct > 0 ? 'text-destructive' : 'text-secondary')}>
                  {dashboard.budget_variance.expenses.variance_pct > 0 ? '+' : ''}
                  {dashboard.budget_variance.expenses.variance_pct.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-3">
                <div className="bg-destructive h-2 rounded-full" style={{
            width: "".concat(Math.min((dashboard.budget_variance.expenses.actual / dashboard.budget_variance.expenses.budgeted) * 100, 100), "%")
        }}/>
              </div>
            </div>

            <div className="glass-card gradient-border hover-tilt p-6 relative overflow-hidden">
              <span className="aura"></span>
              <h3 className="text-sm font-heading font-medium text-foreground mb-2">Profit</h3>
              <p className="text-2xl font-bold text-foreground mb-2">
                {formatCurrency(dashboard.budget_variance.profit.actual)}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Target: {formatCurrency(dashboard.budget_variance.profit.budgeted)}
                </span>
                <span className={"text-sm font-semibold ".concat(dashboard.budget_variance.profit.variance_pct < 0 ? 'text-destructive' : 'text-secondary')}>
                  {dashboard.budget_variance.profit.variance_pct > 0 ? '+' : ''}
                  {dashboard.budget_variance.profit.variance_pct.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-3">
                <div className="bg-secondary h-2 rounded-full" style={{
            width: "".concat(Math.min((dashboard.budget_variance.profit.actual / dashboard.budget_variance.profit.budgeted) * 100, 100), "%")
        }}/>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Forecast */}
        <div className="mb-8 glass-card gradient-border hover-tilt p-6 relative overflow-hidden min-w-0">
          <span className="aura"></span>
          <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-secondary"/>
            12-Month Revenue Forecast
          </h3>
          <div style={{ width: "100%", height: "300px", minWidth: 0, display: "flex", overflow: "hidden" }}>
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="month"/>
              <YAxis />
              <Tooltip formatter={function (value) { return formatCurrency(value); }}/>
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" fillOpacity={1} fill="url(#colorRevenue)"/>
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
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="month"/>
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="applications" fill="hsl(var(--chart-1))" name="Applications"/>
                <Bar dataKey="approvals" fill="hsl(var(--chart-2))" name="Approvals"/>
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
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="month"/>
                <YAxis />
                <Tooltip formatter={function (value) { return formatCurrency(value); }}/>
                <Legend />
                <Bar dataKey="inflows" fill="hsl(var(--chart-2))" name="Inflows"/>
                <Bar dataKey="outflows" fill="hsl(var(--chart-4))" name="Outflows"/>
                <Line type="monotone" dataKey="net_flow" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Net Flow"/>
              </ComposedChart>
            </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Arrears Forecast */}
        <div className="glass-card gradient-border hover-tilt p-6 mb-8 relative overflow-hidden min-w-0">
          <span className="aura"></span>
          <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-accent"/>
            Arrears Rate Forecast (Confidence: {arrearsConfidenceLevel.toFixed(0)}%)
          </h3>
          <div style={{ width: "100%", height: "300px", minWidth: 0, display: "flex", overflow: "hidden" }}>
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={arrearsData}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="month"/>
              <YAxis label={{ value: 'Arrears %', angle: -90, position: 'insideLeft' }}/>
              <Tooltip formatter={function (value) { return "".concat(value.toFixed(2), "%"); }}/>
              <Line type="monotone" dataKey="rate" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-4))' }} name="Predicted Arrears Rate"/>
            </LineChart>
          </ResponsiveContainer>
            </div>
          <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/30">
            <p className="text-sm text-foreground">
              <strong>Insight:</strong> Arrears rate is expected to trend {arrearsData[arrearsData.length - 1].rate > arrearsData[0].rate ? 'upward' : 'downward'} over the forecast period. Monitor collections activities accordingly.
            </p>
          </div>
        </div>

        {/* Loan Volume Trend */}
        <div className="glass-card gradient-border hover-tilt p-6 relative overflow-hidden min-w-0">
          <span className="aura"></span>
          <h3 className="font-heading font-semibold text-foreground mb-4">
            Loan Volume Trend: <span className="text-secondary uppercase text-sm ml-2">{dashboard.loan_volume_forecast.trend}</span>
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Based on current trends, loan applications are expected to {dashboard.loan_volume_forecast.trend} throughout the forecast period.
          </p>
          <div style={{ width: "100%", height: "250px", minWidth: 0, display: "flex", overflow: "hidden" }}>
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={loanData}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="month"/>
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="applications" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-1))' }}/>
            </LineChart>
          </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
    </Layout>);
}
