var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import React, { useState } from 'react';
import { Brain, RefreshCw, Download, AlertCircle } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { ArrearsForcastChart } from '../../components/ai-analytics/ArrearsForcastChart';
import { MemberSegmentationChart } from '../../components/ai-analytics/MemberSegmentationChart';
import { AtRiskMembersTable } from '../../components/ai-analytics/AtRiskMembersTable';
import { CohortAnalysisChart } from '../../components/ai-analytics/CohortAnalysisChart';
import { useArrearsForcast, useMemberBehavior, useAtRiskMembers, useCohortAnalysis, } from '../../hooks/use-ai-analytics';
export var AIAnalyticsDashboard = function () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    var _r = useState({
        timeRange: 'month',
    }), filters = _r[0], setFilters = _r[1];
    var arrearsForcast = useArrearsForcast(filters.branchId);
    var memberBehavior = useMemberBehavior(filters.branchId);
    var atRiskMembers = useAtRiskMembers(filters.branchId);
    var cohortAnalysis = useCohortAnalysis(filters.branchId);
    var isLoading = arrearsForcast.isLoading || memberBehavior.isLoading || atRiskMembers.isLoading || cohortAnalysis.isLoading;
    var hasErrors = arrearsForcast.isError || memberBehavior.isError || atRiskMembers.isError || cohortAnalysis.isError;
    var handleRefresh = function () {
        arrearsForcast.refetch();
        memberBehavior.refetch();
        atRiskMembers.refetch();
        cohortAnalysis.refetch();
    };
    var handleExport = function () {
        var data = {
            timestamp: new Date().toISOString(),
            arrears_forecast: arrearsForcast.data,
            member_behavior: memberBehavior.data,
            at_risk_members: atRiskMembers.data,
            cohort_analysis: cohortAnalysis.data,
        };
        var dataStr = JSON.stringify(data, null, 2);
        var dataBlob = new Blob([dataStr], { type: 'application/json' });
        var url = URL.createObjectURL(dataBlob);
        var link = document.createElement('a');
        link.href = url;
        link.download = "ai-analytics-".concat(new Date().toISOString().split('T')[0], ".json");
        link.click();
    };
    if (hasErrors && !arrearsForcast.data && !memberBehavior.data && !atRiskMembers.data && !cohortAnalysis.data) {
        return (<Layout>
        <div className="p-6">
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-destructive mt-0.5 flex-shrink-0"/>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-destructive">Failed to load AI Analytics</h3>
                <p className="text-sm text-destructive mt-2">
                  There was an error loading the AI analytics data. Please try again.
                </p>
                <button onClick={handleRefresh} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>);
    }
    if (isLoading && !arrearsForcast.data && !memberBehavior.data && !atRiskMembers.data && !cohortAnalysis.data) {
        return (<Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading AI analytics...</p>
          </div>
        </div>
      </Layout>);
    }
    return (<Layout>
      <div className="min-h-screen">
        <div className="sticky top-0 z-40 glass-card gradient-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-heading font-extrabold tracking-tight text-gradient flex items-center gap-3">
                  <Brain className="w-8 h-8 text-primary"/>
                  AI Analytics Dashboard
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  AI-powered insights for predictive analytics and member intelligence
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleRefresh} disabled={isLoading} className="btn-neon px-4 py-2 rounded-lg disabled:opacity-50">
                  <RefreshCw className={"w-4 h-4 ".concat(isLoading ? 'animate-spin' : '')}/>
                  Refresh
                </button>
                <button onClick={handleExport} className="btn-neon px-4 py-2 rounded-lg">
                  <Download className="w-4 h-4"/>
                  Export
                </button>
              </div>
            </div>

            <div className="flex gap-4 flex-wrap">
              <select value={filters.timeRange} onChange={function (e) { return setFilters(__assign(__assign({}, filters), { timeRange: e.target.value })); }} className="neon-input text-sm">
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>
        </div>

        {hasErrors && (<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0"/>
              <div className="flex-1">
                <h3 className="font-semibold text-accent">Some data failed to load</h3>
                <p className="text-sm text-accent mt-1">
                  Some AI analytics sections may not be available. Showing cached data where available.
                </p>
              </div>
            </div>
          </div>)}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass-card gradient-border hover-tilt relative overflow-hidden p-4 md:p-6">
                <span className="aura"></span>
                {arrearsForcast.data && (<ArrearsForcastChart data={arrearsForcast.data} isLoading={arrearsForcast.isLoading}/>)}
                {arrearsForcast.isError && !arrearsForcast.data && (<div className="h-96 flex items-center justify-center text-muted-foreground">
                    Failed to load arrears forecast
                  </div>)}
              </div>

              <div className="glass-card gradient-border hover-tilt relative overflow-hidden p-4 md:p-6">
                <span className="aura"></span>
                <MemberSegmentationChart segments={((_a = memberBehavior.data) === null || _a === void 0 ? void 0 : _a.segments) || {}} totalMembers={((_b = memberBehavior.data) === null || _b === void 0 ? void 0 : _b.total_members) || 0} isLoading={memberBehavior.isLoading}/>
                {memberBehavior.isError && !memberBehavior.data && (<div className="h-96 flex items-center justify-center text-muted-foreground">
                    Failed to load member behavior analysis
                  </div>)}
              </div>
            </div>

            {(atRiskMembers.data || !atRiskMembers.isError) && (<div className="glass-card gradient-border hover-tilt relative overflow-hidden p-4 md:p-6">
                <span className="aura"></span>
                {atRiskMembers.data ? (<AtRiskMembersTable members={atRiskMembers.data.members} totalScanned={atRiskMembers.data.total_members_scanned} isLoading={atRiskMembers.isLoading}/>) : (<div className="h-96 flex items-center justify-center text-muted-foreground">
                    Failed to load at-risk members
                  </div>)}
              </div>)}

            <div className="glass-card gradient-border hover-tilt relative overflow-hidden p-4 md:p-6">
              <span className="aura"></span>
              <CohortAnalysisChart cohorts={((_c = cohortAnalysis.data) === null || _c === void 0 ? void 0 : _c.cohorts) || []} insights={((_d = cohortAnalysis.data) === null || _d === void 0 ? void 0 : _d.insights) || { best_performing_cohort: null, average_active_rate: 0, average_default_rate: 0 }} isLoading={cohortAnalysis.isLoading}/>
              {cohortAnalysis.isError && !cohortAnalysis.data && (<div className="h-96 flex items-center justify-center text-muted-foreground">
                  Failed to load cohort analysis
                </div>)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card gradient-border hover-tilt p-6 relative overflow-hidden">
                <span className="aura"></span>
                <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Key Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-border/50">
                    <span className="text-muted-foreground">Portfolio Health Score</span>
                    <span className="text-2xl font-bold text-secondary">78%</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-border/50">
                    <span className="text-muted-foreground">Members at Risk</span>
                    <span className="text-2xl font-bold text-destructive">
                      {((_e = atRiskMembers.data) === null || _e === void 0 ? void 0 : _e.at_risk_count) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-border/50">
                    <span className="text-muted-foreground">Average Active Rate</span>
                    <span className="text-2xl font-bold text-primary">
                      {((_h = (_g = (_f = cohortAnalysis.data) === null || _f === void 0 ? void 0 : _f.insights) === null || _g === void 0 ? void 0 : _g.average_active_rate) === null || _h === void 0 ? void 0 : _h.toFixed(1)) || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Forecast Confidence</span>
                    <span className="text-2xl font-bold text-primary">95%</span>
                  </div>
                </div>
              </div>

              <div className="glass-card gradient-border hover-tilt p-6 relative overflow-hidden">
                <span className="aura"></span>
                <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Recommendations</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-destructive/100 flex-shrink-0 mt-1.5"></div>
                    <p className="text-sm text-muted-foreground">
                      Immediate follow-up required for {((_k = (_j = atRiskMembers.data) === null || _j === void 0 ? void 0 : _j.members) === null || _k === void 0 ? void 0 : _k.filter(function (m) { return m.risk_score > 0.8; }).length) || 0} critical risk members
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 mt-1.5"></div>
                    <p className="text-sm text-muted-foreground">
                      Arrears forecasting shows {((_o = (_m = (_l = arrearsForcast.data) === null || _l === void 0 ? void 0 : _l.predictions) === null || _m === void 0 ? void 0 : _m[0]) === null || _o === void 0 ? void 0 : _o.trend) === 'increasing' ? 'increasing' : 'decreasing'} trend
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5"></div>
                    <p className="text-sm text-muted-foreground">
                      Focus engagement efforts on Growth Potential segment for portfolio expansion
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-1.5"></div>
                    <p className="text-sm text-muted-foreground">
                      {(_q = (_p = cohortAnalysis.data) === null || _p === void 0 ? void 0 : _p.insights) === null || _q === void 0 ? void 0 : _q.best_performing_cohort} shows best retention metrics
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>);
};
