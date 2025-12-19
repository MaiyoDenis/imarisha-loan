import React, { useState } from 'react';
import { Brain, RefreshCw, Download, AlertCircle } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { ArrearsForcastChart } from '../../components/ai-analytics/ArrearsForcastChart';
import { MemberSegmentationChart } from '../../components/ai-analytics/MemberSegmentationChart';
import { AtRiskMembersTable } from '../../components/ai-analytics/AtRiskMembersTable';
import { CohortAnalysisChart } from '../../components/ai-analytics/CohortAnalysisChart';
import {
  useArrearsForcast,
  useMemberBehavior,
  useAtRiskMembers,
  useCohortAnalysis,
} from '../../hooks/use-ai-analytics';

interface FilterState {
  branchId?: number;
  timeRange: 'month' | 'quarter' | 'year';
}

export const AIAnalyticsDashboard: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    timeRange: 'month',
  });

  const arrearsForcast = useArrearsForcast(filters.branchId);
  const memberBehavior = useMemberBehavior(filters.branchId);
  const atRiskMembers = useAtRiskMembers(filters.branchId);
  const cohortAnalysis = useCohortAnalysis(filters.branchId);

  const isLoading =
    (arrearsForcast.isLoading && !arrearsForcast.isError) ||
    (memberBehavior.isLoading && !memberBehavior.isError) ||
    (atRiskMembers.isLoading && !atRiskMembers.isError) ||
    (cohortAnalysis.isLoading && !cohortAnalysis.isError);

  const hasErrors =
    arrearsForcast.isError ||
    memberBehavior.isError ||
    atRiskMembers.isError ||
    cohortAnalysis.isError;

  const handleRefresh = () => {
    arrearsForcast.refetch();
    memberBehavior.refetch();
    atRiskMembers.refetch();
    cohortAnalysis.refetch();
  };

  const handleExport = () => {
    const data = {
      timestamp: new Date().toISOString(),
      arrears_forecast: arrearsForcast.data,
      member_behavior: memberBehavior.data,
      at_risk_members: atRiskMembers.data,
      cohort_analysis: cohortAnalysis.data,
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  if (hasErrors && !arrearsForcast.data && !memberBehavior.data && !atRiskMembers.data && !cohortAnalysis.data) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900">Failed to load AI Analytics</h3>
                <p className="text-sm text-red-700 mt-2">
                  There was an error loading the AI analytics data. Please try again.
                </p>
                <button
                  onClick={handleRefresh}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading && !arrearsForcast.data && !memberBehavior.data && !atRiskMembers.data && !cohortAnalysis.data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen">
        <div className="sticky top-0 z-40 glass-card gradient-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tight text-gradient flex items-center gap-3">
                <Brain className="w-8 h-8 text-purple-600" />
                AI Analytics Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                AI-powered insights for predictive analytics and member intelligence
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="btn-neon px-4 py-2 rounded-lg disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="btn-neon px-4 py-2 rounded-lg"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          <div className="flex gap-4 flex-wrap">
            <select
              value={filters.timeRange}
              onChange={(e) => setFilters({ ...filters, timeRange: e.target.value as any })}
              className="neon-input text-sm"
            >
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {hasErrors && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">Some data failed to load</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Some AI analytics sections may not be available. Showing cached data where available.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card gradient-border hover-tilt relative overflow-hidden p-4 md:p-6">
              <span className="aura"></span>
              {arrearsForcast.data && (
                <ArrearsForcastChart
                  data={arrearsForcast.data}
                  isLoading={arrearsForcast.isLoading}
                />
              )}
              {arrearsForcast.isError && !arrearsForcast.data && (
                <div className="h-96 flex items-center justify-center text-gray-500">
                  Failed to load arrears forecast
                </div>
              )}
            </div>

            <div className="glass-card gradient-border hover-tilt relative overflow-hidden p-4 md:p-6">
              <span className="aura"></span>
              <MemberSegmentationChart
                segments={memberBehavior.data?.segments || {}}
                totalMembers={memberBehavior.data?.total_members || 0}
                isLoading={memberBehavior.isLoading}
              />
              {memberBehavior.isError && !memberBehavior.data && (
                <div className="h-96 flex items-center justify-center text-gray-500">
                  Failed to load member behavior analysis
                </div>
              )}
            </div>
          </div>

          {(atRiskMembers.data || !atRiskMembers.isError) && (
            <div className="glass-card gradient-border hover-tilt relative overflow-hidden p-4 md:p-6">
              <span className="aura"></span>
              {atRiskMembers.data ? (
                <AtRiskMembersTable
                  members={atRiskMembers.data.members}
                  totalScanned={atRiskMembers.data.total_members_scanned}
                  isLoading={atRiskMembers.isLoading}
                />
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-500">
                  Failed to load at-risk members
                </div>
              )}
            </div>
          )}

          <div className="glass-card gradient-border hover-tilt relative overflow-hidden p-4 md:p-6">
            <span className="aura"></span>
            <CohortAnalysisChart
              cohorts={cohortAnalysis.data?.cohorts || []}
              insights={cohortAnalysis.data?.insights || { best_performing_cohort: null, average_active_rate: 0, average_default_rate: 0 }}
              isLoading={cohortAnalysis.isLoading}
            />
            {cohortAnalysis.isError && !cohortAnalysis.data && (
              <div className="h-96 flex items-center justify-center text-gray-500">
                Failed to load cohort analysis
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card gradient-border hover-tilt p-6 relative overflow-hidden">
              <span className="aura"></span>
              <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Key Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-gray-600">Portfolio Health Score</span>
                  <span className="text-2xl font-bold text-green-600">78%</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-gray-600">Members at Risk</span>
                  <span className="text-2xl font-bold text-red-600">
                    {atRiskMembers.data?.at_risk_count || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-gray-600">Average Active Rate</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {cohortAnalysis.data?.insights?.average_active_rate?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Forecast Confidence</span>
                  <span className="text-2xl font-bold text-purple-600">95%</span>
                </div>
              </div>
            </div>

            <div className="glass-card gradient-border hover-tilt p-6 relative overflow-hidden">
              <span className="aura"></span>
              <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Recommendations</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5"></div>
                  <p className="text-sm text-gray-700">
                    Immediate follow-up required for {atRiskMembers.data?.members?.filter((m: any) => m.risk_score > 0.8).length || 0} critical risk members
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 mt-1.5"></div>
                  <p className="text-sm text-gray-700">
                    Arrears forecasting shows {arrearsForcast.data?.predictions?.[0]?.trend === 'increasing' ? 'increasing' : 'decreasing'} trend
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"></div>
                  <p className="text-sm text-gray-700">
                    Focus engagement efforts on Growth Potential segment for portfolio expansion
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-1.5"></div>
                  <p className="text-sm text-gray-700">
                    {cohortAnalysis.data?.insights?.best_performing_cohort} shows best retention metrics
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
};
