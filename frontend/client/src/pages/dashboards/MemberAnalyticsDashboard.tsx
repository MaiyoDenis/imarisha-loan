import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PieChart, Pie, BarChart, Bar, LineChart, Line,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Users, TrendingUp, Target, RefreshCw, Download } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { api } from '@/lib/api';
import KPICard from '@/components/dashboards/KPICard';

interface MemberData {
  timestamp: string;
  cohort_analysis: {
    cohorts: Record<string, { count: number; active: number }>;
    total_cohorts: number;
  };
  lifecycle_stages: {
    stages: Record<string, { count: number; percentage: number }>;
  };
  segmentation: {
    segments: Record<string, { count: number; percentage: number }>;
  };
  retention_trends: {
    active_members: number;
    inactive_members: number;
    retention_rate: number;
    churn_rate: number;
    average_lifespan_months: number;
  };
  journey_map: {
    stages: Array<{
      stage: string;
      average_duration: string;
      key_action: string;
    }>;
    success_rate: number;
  };
}

export default function MemberAnalyticsDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: dashboard, isLoading, refetch } = useQuery<MemberData>({
    queryKey: ['memberAnalyticsDashboard'],
    queryFn: () => api.getMemberAnalyticsDashboard(),
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
      ['Stage', 'Count', 'Percentage'],
      ...Object.entries(dashboard.lifecycle_stages.stages).map(([stage, data]) => [
        stage,
        data.count,
        data.percentage
      ]),
      [''],
      ['Member Segmentation'],
      ['Segment', 'Count', 'Percentage'],
      ...Object.entries(dashboard.segmentation.segments).map(([segment, data]) => [
        segment,
        data.count,
        data.percentage
      ]),
      [''],
      ['Journey Map'],
      ['Stage', 'Average Duration', 'Key Action'],
      ...dashboard.journey_map.stages.map(stage => [
        stage.stage,
        stage.average_duration,
        stage.key_action
      ]),
      [''],
      ['Journey Success Rate (%)', dashboard.journey_map.success_rate],
    ]
      .map(row => row.map(val => `"${val}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `member-analytics-${new Date().toISOString().split('T')[0]}.csv`;
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
  if (!dashboard || !dashboard.lifecycle_stages) {
    const errorMsg = (dashboard as any)?.error || 'Failed to load dashboard';
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">Failed to load dashboard</h3>
                <p className="text-sm text-red-700 mt-1">{errorMsg}</p>
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

  const lifecycleData = Object.entries(dashboard.lifecycle_stages.stages).map(([key, value]) => ({
    name: key.replace(/_/g, ' ').toUpperCase(),
    value: value.count,
    percentage: value.percentage
  }));

  const segmentData = Object.entries(dashboard.segmentation.segments).map(([key, value]) => ({
    name: key.replace(/_/g, ' ').toUpperCase(),
    value: value.count,
    percentage: value.percentage
  }));

  const cohortData = Object.entries(dashboard.cohort_analysis.cohorts)
    .slice(-6)
    .map(([month, data]) => ({
      month,
      total: data.count,
      active: data.active
    }));

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <Layout>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tight text-gradient">Member Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Understand your member base and growth patterns</p>
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

        {/* Retention Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Retention Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <KPICard
              title="Active Members"
              value={dashboard.retention_trends.active_members}
              icon={<Users size={24} />}
              status="success"
            />
            <KPICard
              title="Inactive Members"
              value={dashboard.retention_trends.inactive_members}
              status="warning"
            />
            <KPICard
              title="Retention Rate"
              value={`${dashboard.retention_trends.retention_rate.toFixed(1)}%`}
              status="success"
              icon={<TrendingUp size={24} />}
            />
            <KPICard
              title="Churn Rate"
              value={`${dashboard.retention_trends.churn_rate.toFixed(1)}%`}
              status={dashboard.retention_trends.churn_rate > 5 ? 'warning' : 'normal'}
            />
            <KPICard
              title="Avg Lifespan"
              value={`${dashboard.retention_trends.average_lifespan_months}`}
              unit="months"
            />
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
                <Pie
                  data={lifecycleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${((entry.value / lifecycleData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {lifecycleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
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
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total Members" />
              <Line type="monotone" dataKey="active" stroke="#10b981" strokeWidth={2} name="Active Members" />
            </LineChart>
          </ResponsiveContainer>
            </div>
        </div>

        {/* Member Journey Map */}
        <div className="glass-card gradient-border hover-tilt p-6 relative overflow-hidden">
          <span className="aura"></span>
          <h2 className="text-xl font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target size={24} />
            Member Journey Map
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboard.journey_map.stages.map((stageInfo, idx) => (
              <div key={idx} className="p-4 rounded-lg glass-card">
                <h4 className="font-bold text-gray-900 text-lg">{stageInfo.stage}</h4>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Duration:</strong> {stageInfo.average_duration}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Key Action:</strong> {stageInfo.key_action}
                </p>
                {idx < dashboard.journey_map.stages.length - 1 && (
                  <div className="text-center mt-3 text-blue-500 text-2xl">→</div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 glass-card">
            <p className="text-sm text-foreground">
              <strong>Journey Success Rate:</strong> {dashboard.journey_map.success_rate.toFixed(1)}% of members successfully progress through their lifecycle stages.
            </p>
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
}
