var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2)
        for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar)
                    ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React from 'react';
import { AlertTriangle, TrendingUp, Phone } from 'lucide-react';
var getRiskColor = function (score) {
    if (score > 0.8)
        return 'text-destructive bg-destructive/10';
    if (score > 0.7)
        return 'text-orange-600 bg-orange-50';
    return 'text-accent bg-accent/10';
};
var getRiskBadgeColor = function (score) {
    if (score > 0.8)
        return 'bg-red-100 text-red-800';
    if (score > 0.7)
        return 'bg-orange-100 text-orange-800';
    return 'bg-yellow-100 text-yellow-800';
};
export var AtRiskMembersTable = function (_a) {
    var members = _a.members, totalScanned = _a.totalScanned, _b = _a.isLoading, isLoading = _b === void 0 ? false : _b;
    if (isLoading) {
        return (<div className="bg-card rounded-xl border border-border/50 shadow-sm p-4 md:p-5">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="space-y-2">
            {__spreadArray([], Array(5), true).map(function (_, i) { return (<div key={i} className="h-12 bg-muted rounded"></div>); })}
          </div>
        </div>
      </div>);
    }
    if (!members) {
        return null;
    }
    var atRiskPercentage = ((members.length / totalScanned) * 100).toFixed(1);
    return (<div className="bg-card rounded-xl border border-border/50 shadow-sm p-4 md:p-5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400"/>
            At-Risk Members
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {members.length} of {totalScanned} members flagged for intervention ({atRiskPercentage}%)
          </p>
        </div>
      </div>

      {members.length === 0 ? (<div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 mb-4">
            <TrendingUp className="w-6 h-6 text-emerald-300"/>
          </div>
          <p className="text-muted-foreground">No at-risk members identified. Portfolio is healthy!</p>
        </div>) : (<div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-4 font-medium text-card-foreground">Member Name</th>
                <th className="text-left py-3 px-4 font-medium text-card-foreground">Risk Score</th>
                <th className="text-left py-3 px-4 font-medium text-card-foreground">Outstanding Balance</th>
                <th className="text-left py-3 px-4 font-medium text-card-foreground">Risk Factors</th>
                <th className="text-left py-3 px-4 font-medium text-card-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {members.map(function (member) {
                return (<tr key={member.member_id} className="border-b border-border/30 hover:bg-accent">
                  <td className="py-4 px-4 text-card-foreground font-medium">
                    <div className="flex flex-col">
                      <span>{member.member_name}</span>
                      <span className="text-xs text-muted-foreground">ID: {member.member_id}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={"px-3 py-1 rounded-full text-sm font-medium ".concat(getRiskBadgeColor(member.risk_score))}>
                      {(member.risk_score * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-card-foreground font-medium">
                    KES {member.outstanding_balance.toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1">
                      {member.risk_factors.slice(0, 2).map(function (factor, idx) {
                        return (<span key={idx} className="text-xs bg-accent text-foreground/90 px-2 py-1 rounded w-fit">
                          {factor}
                        </span>);
                    })}
                      {member.risk_factors.length > 2 && (<span className="text-xs text-muted-foreground">
                          +{member.risk_factors.length - 2} more
                        </span>)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <button className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-primary/10 text-primary rounded hover:bg-primary/20 transition">
                      <Phone className="w-4 h-4"/>
                      <span className="hidden sm:inline">Contact</span>
                    </button>
                  </td>
                </tr>);
            })}
            </tbody>
          </table>
        </div>)}

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-destructive/100/10 border border-red-300/40 rounded-lg p-3">
          <p className="text-sm text-red-300 font-medium">Critical (Score {'>'} 0.8)</p>
          <p className="text-2xl font-bold text-red-300 mt-1">
            {members.filter(function (m) { return m.risk_score > 0.8; }).length}
          </p>
        </div>
        <div className="bg-orange-500/10 border border-orange-300/40 rounded-lg p-3">
          <p className="text-sm text-orange-300 font-medium">High (Score 0.7-0.8)</p>
          <p className="text-2xl font-bold text-orange-300 mt-1">
            {members.filter(function (m) { return m.risk_score > 0.7 && m.risk_score <= 0.8; }).length}
          </p>
        </div>
        <div className="bg-accent/100/10 border border-yellow-300/40 rounded-lg p-3">
          <p className="text-sm text-yellow-300 font-medium">Medium (Score 0.6-0.7)</p>
          <p className="text-2xl font-bold text-yellow-300 mt-1">
            {members.filter(function (m) { return m.risk_score >= 0.6 && m.risk_score <= 0.7; }).length}
          </p>
        </div>
      </div>
    </div>);
};
