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
import { Clock, AlertCircle, Check, Users, CreditCard, Zap, RefreshCw, Download } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { api } from '@/lib/api';
import KPICard from '@/components/dashboards/KPICard';
import { useRoleRedirect } from '@/hooks/use-role-redirect';
export default function OperationsDashboard() {
    var _this = this;
    useRoleRedirect({
        allowedRoles: ['admin', 'branch_manager', 'loan_officer'],
        fallbackPath: '/dashboard'
    });
    var _a = useState(false), isRefreshing = _a[0], setIsRefreshing = _a[1];
    var _b = useQuery({
        queryKey: ['operationsDashboard'],
        queryFn: function () { return api.getOperationsDashboard(); },
        staleTime: 2 * 60 * 1000,
        refetchInterval: 30 * 1000
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
            ['Operations Dashboard Export'],
            ['Generated:', new Date(dashboard.timestamp).toLocaleString()],
            [''],
            ['Daily Summary'],
            ['Metric', 'Value'],
            ['Applications Today', dashboard.daily_summary.loans_applications_today],
            ['Approved Today', dashboard.daily_summary.loans_approved_today],
            ['Transactions Processed', dashboard.daily_summary.transactions_processed],
            ['Amount Processed', dashboard.daily_summary.amount_processed],
            ['Members Served', dashboard.daily_summary.members_served_today],
            [''],
            ['Member Queue'],
            ['Metric', 'Value'],
            ['Total Pending', dashboard.member_queue.total_pending],
            ['Pending Amount', dashboard.member_queue.pending_amount],
            ['Average Age (days)', dashboard.member_queue.average_age_days],
            [''],
            ['Payment Status'],
            ['Metric', 'Value'],
            ['Pending Payments', dashboard.payment_status.pending_payments],
            ['Failed Payments', dashboard.payment_status.failed_payments],
            ['Completed Today', dashboard.payment_status.completed_today],
            ['Overdue Payments', dashboard.payment_status.overdue_payments],
            ['Success Rate (%)', dashboard.payment_status.success_rate],
        ]
            .map(function (row) { return row.map(function (val) { return "\"".concat(val, "\""); }).join(','); })
            .join('\n');
        var blob = new Blob([csvContent], { type: 'text/csv' });
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = "operations-dashboard-".concat(new Date().toISOString().split('T')[0], ".csv");
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
    if (isError || !dashboard || !dashboard.daily_summary) {
        var errorMsg = (dashboard === null || dashboard === void 0 ? void 0 : dashboard.error) || 'Failed to load dashboard';
        return (<Layout>
        <div className="p-6">
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0"/>
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
    return (<Layout>
      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tight text-gradient">Operations Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Daily operations management and task tracking</p>
            {(dashboard === null || dashboard === void 0 ? void 0 : dashboard.timestamp) && (<p className="text-xs text-muted-foreground mt-2">
                Last updated: {new Date(dashboard.timestamp).toLocaleString()}
              </p>)}
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={handleRefresh} disabled={isRefreshing} className={"flex-1 sm:flex-none btn-neon px-4 py-2 rounded-lg flex items-center justify-center gap-2 ".concat(isRefreshing ? 'opacity-50 cursor-not-allowed' : '')}>
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''}/>
              <span className="text-sm font-medium">
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </span>
            </button>
            <button onClick={handleExport} className="flex-1 sm:flex-none btn-neon px-4 py-2 rounded-lg cursor-pointer flex items-center justify-center gap-2">
              <Download size={18}/>
              <span className="text-sm font-medium">Export</span>
            </button>
          </div>
        </div>

        {/* Daily Summary */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Today's Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <KPICard title="Applications Today" value={dashboard.daily_summary.loans_applications_today} icon={<Clock size={24}/>} className="min-h-[170px] flex flex-col justify-center"/>
            <KPICard title="Approved Today" value={dashboard.daily_summary.loans_approved_today} icon={<Check size={24}/>} status="success" className="min-h-[170px] flex flex-col justify-center"/>
            <KPICard title="Transactions" value={dashboard.daily_summary.transactions_processed} icon={<CreditCard size={24}/>} className="min-h-[170px] flex flex-col justify-center"/>
            <KPICard title="Amount Processed" value={"KES ".concat(dashboard.daily_summary.amount_processed.toLocaleString())} icon={<Zap size={24}/>} className="min-h-[170px] flex flex-col justify-center"/>
            <KPICard title="Members Served" value={dashboard.daily_summary.members_served_today} icon={<Users size={24}/>} className="min-h-[170px] flex flex-col justify-center"/>
          </div>
        </div>

        {/* Pending Member Queue */}
        <div className="mb-8 glass-card gradient-border hover-tilt p-4 md:p-6 relative overflow-hidden">
          <span className="aura"></span>
          <h2 className="text-xl font-heading font-semibold text-foreground mb-4">Member Approval Queue</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <KPICard title="Total Pending" value={dashboard.member_queue.total_pending} status={dashboard.member_queue.total_pending > 10 ? 'warning' : 'normal'} className="min-h-[140px]"/>
            <KPICard title="Pending Amount" value={"KES ".concat(dashboard.member_queue.pending_amount.toLocaleString())} className="min-h-[140px]"/>
            <KPICard title="Avg Age" value={"".concat(dashboard.member_queue.average_age_days)} unit="days" className="min-h-[140px]"/>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-card-foreground">Member</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-card-foreground">Amount</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-card-foreground">Days Pending</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-card-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {dashboard.member_queue.oldest_pending.map(function (loan) { return (<tr key={loan.loan_id} className="hover:bg-accent">
                    <td className="px-4 py-3 text-sm">{loan.member_name}</td>
                    <td className="px-4 py-3 text-sm font-semibold">KES {loan.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={loan.days_pending > 3 ? 'text-destructive font-semibold' : ''}>
                        {loan.days_pending} days
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                        Pending Review
                      </span>
                    </td>
                  </tr>); })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Status */}
        <div className="mb-8 glass-card gradient-border hover-tilt p-6 relative overflow-hidden">
          <span className="aura"></span>
          <h2 className="text-xl font-heading font-semibold text-foreground mb-4">Payment Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <KPICard title="Pending" value={dashboard.payment_status.pending_payments} status="warning" className="min-h-[140px]"/>
            <KPICard title="Failed" value={dashboard.payment_status.failed_payments} status="critical" className="min-h-[140px]"/>
            <KPICard title="Completed Today" value={dashboard.payment_status.completed_today} status="success" className="min-h-[140px]"/>
            <KPICard title="Overdue" value={dashboard.payment_status.overdue_payments} status={dashboard.payment_status.overdue_payments > 0 ? 'warning' : 'normal'} className="min-h-[140px]"/>
            <KPICard title="Success Rate" value={"".concat(dashboard.payment_status.success_rate.toFixed(1), "%")} status="success" className="min-h-[140px]"/>
          </div>
        </div>

        {/* Pending Tasks */}
        {dashboard.pending_tasks.length > 0 && (<div className="mb-8 glass-card gradient-border hover-tilt p-6 relative overflow-hidden">
            <span className="aura"></span>
            <h2 className="text-xl font-heading font-semibold text-foreground mb-4">Pending Tasks</h2>
            <div className="space-y-3">
              {dashboard.pending_tasks.map(function (task) { return (<div key={task.id} className={"p-4 rounded-lg border-l-4 ".concat(task.priority === 'high'
                    ? 'border-l-destructive bg-destructive/10'
                    : 'border-l-accent bg-accent/10')}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-card-foreground">{task.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">Assigned to: {task.assigned_to}</p>
                    </div>
                    <span className={"px-2 py-1 rounded text-xs font-semibold ".concat(task.priority === 'high'
                    ? 'bg-red-200 text-red-800'
                    : 'bg-yellow-200 text-yellow-800')}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                </div>); })}
            </div>
          </div>)}

        {/* Staff Performance */}
        <div className="glass-card gradient-border hover-tilt p-6 relative overflow-hidden">
          <span className="aura"></span>
          <h2 className="text-xl font-heading font-semibold text-foreground mb-4">Staff Performance (Top 5)</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-card-foreground">Staff Member</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-card-foreground">Loans Processed</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-card-foreground">Approval Rate</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-card-foreground">Satisfaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {dashboard.staff_performance.map(function (staff) { return (<tr key={staff.user_id} className="hover:bg-accent">
                    <td className="px-4 py-3 text-sm font-semibold">{staff.name}</td>
                    <td className="px-4 py-3 text-sm">{staff.loans_processed}</td>
                    <td className="px-4 py-3 text-sm">{staff.approval_rate.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="text-yellow-500">★</span> {staff.customer_satisfaction.toFixed(1)}/5.0
                    </td>
                  </tr>); })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </Layout>);
}
