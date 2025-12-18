import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, AlertCircle, Check, Users, CreditCard, Zap, RefreshCw, Download } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { api } from '@/lib/api';
import KPICard from '@/components/dashboards/KPICard';

interface DailyTask {
  id: string;
  title: string;
  priority: string;
  due_today: boolean;
  assigned_to: string;
}

interface PendingLoan {
  loan_id: number;
  member_name: string;
  amount: number;
  days_pending: number;
}

interface StaffMember {
  user_id: number;
  name: string;
  loans_processed: number;
  approval_rate: number;
  customer_satisfaction: number;
}

interface OpsData {
  timestamp: string;
  daily_summary: {
    loans_applications_today: number;
    loans_approved_today: number;
    transactions_processed: number;
    amount_processed: number;
    members_served_today: number;
  };
  member_queue: {
    total_pending: number;
    pending_amount: number;
    average_age_days: number;
    oldest_pending: PendingLoan[];
  };
  payment_status: {
    pending_payments: number;
    failed_payments: number;
    completed_today: number;
    overdue_payments: number;
    success_rate: number;
  };
  pending_tasks: DailyTask[];
  incidents: any[];
  staff_performance: StaffMember[];
}

export default function OperationsDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: dashboard, isLoading, refetch } = useQuery<OpsData>({
    queryKey: ['operationsDashboard'],
    queryFn: () => api.getOperationsDashboard(),
    staleTime: 2 * 60 * 1000,
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
      .map(row => row.map(val => `"${val}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `operations-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (!dashboard || !dashboard.daily_summary) {
    const errorMsg = (dashboard as any)?.error || 'Failed to load dashboard';
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Failed to load dashboard</h3>
              <p className="text-sm text-red-700 mt-1">{errorMsg}</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tight text-gradient">Operations Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Daily operations management and task tracking</p>
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

        {/* Daily Summary */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <KPICard
              title="Applications Today"
              value={dashboard.daily_summary.loans_applications_today}
              icon={<Clock size={24} />}
            />
            <KPICard
              title="Approved Today"
              value={dashboard.daily_summary.loans_approved_today}
              icon={<Check size={24} />}
              status="success"
            />
            <KPICard
              title="Transactions"
              value={dashboard.daily_summary.transactions_processed}
              icon={<CreditCard size={24} />}
            />
            <KPICard
              title="Amount Processed"
              value={`KES ${(dashboard.daily_summary.amount_processed / 1000).toFixed(0)}K`}
              icon={<Zap size={24} />}
            />
            <KPICard
              title="Members Served"
              value={dashboard.daily_summary.members_served_today}
              icon={<Users size={24} />}
            />
          </div>
        </div>

        {/* Pending Member Queue */}
        <div className="mb-8 glass-card gradient-border hover-tilt p-6 relative overflow-hidden">
          <span className="aura"></span>
          <h2 className="text-xl font-heading font-semibold text-foreground mb-4">Member Approval Queue</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <KPICard
              title="Total Pending"
              value={dashboard.member_queue.total_pending}
              status={dashboard.member_queue.total_pending > 10 ? 'warning' : 'normal'}
            />
            <KPICard
              title="Pending Amount"
              value={`KES ${(dashboard.member_queue.pending_amount / 1000000).toFixed(1)}M`}
            />
            <KPICard
              title="Avg Age"
              value={`${dashboard.member_queue.average_age_days}`}
              unit="days"
            />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Member</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Amount</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Days Pending</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dashboard.member_queue.oldest_pending.map((loan) => (
                  <tr key={loan.loan_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{loan.member_name}</td>
                    <td className="px-4 py-3 text-sm font-semibold">KES {loan.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={loan.days_pending > 3 ? 'text-red-600 font-semibold' : ''}>
                        {loan.days_pending} days
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                        Pending Review
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Status */}
        <div className="mb-8 glass-card gradient-border hover-tilt p-6 relative overflow-hidden">
          <span className="aura"></span>
          <h2 className="text-xl font-heading font-semibold text-foreground mb-4">Payment Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <KPICard
              title="Pending"
              value={dashboard.payment_status.pending_payments}
              status="warning"
            />
            <KPICard
              title="Failed"
              value={dashboard.payment_status.failed_payments}
              status="critical"
            />
            <KPICard
              title="Completed Today"
              value={dashboard.payment_status.completed_today}
              status="success"
            />
            <KPICard
              title="Overdue"
              value={dashboard.payment_status.overdue_payments}
              status={dashboard.payment_status.overdue_payments > 0 ? 'warning' : 'normal'}
            />
            <KPICard
              title="Success Rate"
              value={`${dashboard.payment_status.success_rate.toFixed(1)}%`}
              status="success"
            />
          </div>
        </div>

        {/* Pending Tasks */}
        {dashboard.pending_tasks.length > 0 && (
          <div className="mb-8 glass-card gradient-border hover-tilt p-6 relative overflow-hidden">
            <span className="aura"></span>
            <h2 className="text-xl font-heading font-semibold text-foreground mb-4">Pending Tasks</h2>
            <div className="space-y-3">
              {dashboard.pending_tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    task.priority === 'high'
                      ? 'border-l-red-500 bg-red-50'
                      : 'border-l-yellow-500 bg-yellow-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{task.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">Assigned to: {task.assigned_to}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      task.priority === 'high'
                        ? 'bg-red-200 text-red-800'
                        : 'bg-yellow-200 text-yellow-800'
                    }`}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Staff Performance */}
        <div className="glass-card gradient-border hover-tilt p-6 relative overflow-hidden">
          <span className="aura"></span>
          <h2 className="text-xl font-heading font-semibold text-foreground mb-4">Staff Performance (Top 5)</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Staff Member</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Loans Processed</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Approval Rate</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Satisfaction</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dashboard.staff_performance.map((staff) => (
                  <tr key={staff.user_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-semibold">{staff.name}</td>
                    <td className="px-4 py-3 text-sm">{staff.loans_processed}</td>
                    <td className="px-4 py-3 text-sm">{staff.approval_rate.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="text-yellow-500">★</span> {staff.customer_satisfaction.toFixed(1)}/5.0
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
}
