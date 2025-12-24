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
import { PieChart, Pie, BarChart, Bar, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, Target, RefreshCw, Download } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { api } from '@/lib/api';
import KPICard from '@/components/dashboards/KPICard';
export default function MemberAnalyticsDashboard() {
    var _this = this;
    useRoleRedirect({
        allowedRoles: ['admin', 'branch_manager', 'loan_officer'],
        fallbackPath: '/dashboard'
    });
    var _a = useState(false), isRefreshing = _a[0], setIsRefreshing = _a[1];
    var _b = useQuery({
        queryKey: ['memberAnalyticsDashboard'],
        queryFn: function () { return api.getMemberAnalyticsDashboard(); },
        staleTime: 5 * 60 * 1000
    }), dashboard = _b.data, isLoading = _b.isLoading, refetch = _b.refetch;
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
        var csvContent = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([
            ['Member Analytics Dashboard Export'],
            ['Generated:', new Date(dashboard.timestamp).toLocaleString()],
            [''],
            ['Retention Trends'],
            ['Metric', 'Value'],
            ['Active Members', dashboard.retention_trends.active_members],
            ['Inactive Members', dashboard.retention_trends.inactive_members],
            ['Retention Rate (%)', dashboard.retention_trends.retention_rate],
            ['Churn Rate (%)', dashboard.retention_trends.churn_rate],
            ['Average Lifespan (months)', dashboard.retention_trends.average_lifespan_months],
            [''],
            ['Lifecycle Stages'],
            ['Stage', 'Count', 'Percentage']
        ], Object.entries(dashboard.lifecycle_stages.stages).map(function (_a) {
            var stage = _a[0], data = _a[1];
            return [
                stage,
                data.count,
                data.percentage
            ];
        }), true), [
            [''],
            ['Member Segmentation'],
            ['Segment', 'Count', 'Percentage']
        ], false), Object.entries(dashboard.segmentation.segments).map(function (_a) {
            var segment = _a[0], data = _a[1];
            return [
                segment,
                data.count,
                data.percentage
            ];
        }), true), [
            [''],
            ['Journey Map'],
            ['Stage', 'Average Duration', 'Key Action']
        ], false), dashboard.journey_map.stages.map(function (stage) { return [
            stage.stage,
            stage.average_duration,
            stage.key_action
        ]; }), true), [
            [''],
            ['Journey Success Rate (%)', dashboard.journey_map.success_rate],
        ], false).map(function (row) { return row.map(function (val) { return "\"".concat(val, "\""); }).join(','); })
            .join('\n');
        var blob = new Blob([csvContent], { type: 'text/csv' });
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = "member-analytics-".concat(new Date().toISOString().split('T')[0], ".csv");
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
    if (!dashboard || !dashboard.lifecycle_stages) {
        var errorMsg = (dashboard === null || dashboard === void 0 ? void 0 : dashboard.error) || 'Failed to load dashboard';
        return (<Layout>
        <div className="p-6">
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0"/>
              <div className="flex-1">
                <h3 className="font-semibold text-destructive">Failed to load dashboard</h3>
                <p className="text-sm text-destructive mt-1">{errorMsg}</p>
                <button onClick={handleRefresh} disabled={isRefreshing} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50">
                  {isRefreshing ? 'Retrying...' : 'Retry'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>);
    }
    var lifecycleData = Object.entries(dashboard.lifecycle_stages.stages).map(function (_a) {
        var key = _a[0], value = _a[1];
        return ({
            name: key.replace(/_/g, ' ').toUpperCase(),
            value: value.count,
            percentage: value.percentage
        });
    });
    var segmentData = Object.entries(dashboard.segmentation.segments).map(function (_a) {
        var key = _a[0], value = _a[1];
        return ({
            name: key.replace(/_/g, ' ').toUpperCase(),
            value: value.count,
            percentage: value.percentage
        });
    });
    var cohortData = Object.entries(dashboard.cohort_analysis.cohorts)
        .slice(-6)
        .map(function (_a) {
        var month = _a[0], data = _a[1];
        return ({
            month: month,
            total: data.count,
            active: data.active
        });
    });
    var colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    return (<Layout>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tight text-gradient">Member Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Understand your member base and growth patterns</p>
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

        {/* Retention Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Retention Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <KPICard title="Active Members" value={dashboard.retention_trends.active_members} icon={<Users size={24}/>} status="success"/>
            <KPICard title="Inactive Members" value={dashboard.retention_trends.inactive_members} status="warning"/>
            <KPICard title="Retention Rate" value={"".concat(dashboard.retention_trends.retention_rate.toFixed(1), "%")} status="success" icon={<TrendingUp size={24}/>}/>
            <KPICard title="Churn Rate" value={"".concat(dashboard.retention_trends.churn_rate.toFixed(1), "%")} status={dashboard.retention_trends.churn_rate > 5 ? 'warning' : 'normal'}/>
            <KPICard title="Avg Lifespan" value={"".concat(dashboard.retention_trends.average_lifespan_months)} unit="months"/>
          </div>
        </div>

        {/* Lifecycle & Segmentation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Lifecycle Stages */}
          <div className="glass-card gradient-border hover-tilt p-6 relative overflow-hidden">
            <span className="aura"></span>
            <h3 className="font-heading font-semibold text-foreground mb-4">Member Lifecycle Stages</h3>
            <div style={{ width: "100%", height: "300px", minWidth: 0, overflow: "hidden" }}>
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              <PieChart>
                <Pie data={lifecycleData} cx="50%" cy="50%" labelLine={false} label={function (entry) { return "".concat(entry.name, ": ").concat(((entry.value / lifecycleData.reduce(function (sum, d) { return sum + d.value; }, 0)) * 100).toFixed(0), "%"); }} outerRadius={80} fill="#8884d8" dataKey="value">
                  {lifecycleData.map(function (entry, index) { return (<Cell key={"cell-".concat(index)} fill={colors[index % colors.length]}/>); })}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            </div>
          </div>

          {/* Member Segments */}
          <div className="glass-card gradient-border hover-tilt p-6 relative overflow-hidden">
            <span className="aura"></span>
            <h3 className="font-heading font-semibold text-foreground mb-4">Member Segmentation</h3>
            <div style={{ width: "100%", height: "300px", minWidth: 0, overflow: "hidden" }}>
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              <BarChart data={segmentData}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100}/>
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6"/>
              </BarChart>
            </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Cohort Analysis */}
        <div className="mb-8 glass-card gradient-border hover-tilt p-6 relative overflow-hidden">
          <span className="aura"></span>
          <h3 className="font-heading font-semibold text-foreground mb-4">Cohort Analysis (Last 6 Months)</h3>
          <div style={{ width: "100%", height: "300px", minWidth: 0, overflow: "hidden" }}>
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
            <LineChart data={cohortData}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="month"/>
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total Members"/>
              <Line type="monotone" dataKey="active" stroke="#10b981" strokeWidth={2} name="Active Members"/>
            </LineChart>
          </ResponsiveContainer>
            </div>
        </div>

        {/* Member Journey Map */}
        <div className="glass-card gradient-border hover-tilt p-6 relative overflow-hidden">
          <span className="aura"></span>
          <h2 className="text-xl font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target size={24}/>
            Member Journey Map
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboard.journey_map.stages.map(function (stageInfo, idx) { return (<div key={idx} className="p-4 rounded-lg glass-card">
                <h4 className="font-bold text-foreground text-lg">{stageInfo.stage}</h4>
                <p className="text-sm text-muted-foreground mt-2">
                  <strong>Duration:</strong> {stageInfo.average_duration}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Key Action:</strong> {stageInfo.key_action}
                </p>
                {idx < dashboard.journey_map.stages.length - 1 && (<div className="text-center mt-3 text-primary text-2xl">→</div>)}
              </div>); })}
          </div>
          <div className="mt-6 p-4 glass-card">
            <p className="text-sm text-foreground">
              <strong>Journey Success Rate:</strong> {dashboard.journey_map.success_rate.toFixed(1)}% of members successfully progress through their lifecycle stages.
            </p>
          </div>
        </div>
      </div>
    </div>
    </Layout>);
}
