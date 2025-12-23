import React, { useState } from 'react';
import { FileText, Download, Mail, RefreshCw } from 'lucide-react';
import { useReportTemplates, useComplianceReport, useOperationsReport, useFinancialReport, useMemberReport, useRiskReport, useExportReportPDF, useExportReportExcel, useSendReportEmail, } from '../../hooks/use-reporting';
export var ReportsPage = function () {
    var _a, _b, _c;
    var _d = useState('compliance'), selectedReport = _d[0], setSelectedReport = _d[1];
    var _e = useState(), branchId = _e[0], setBranchId = _e[1];
    var _f = useState(1), daysBack = _f[0], setDaysBack = _f[1];
    var _g = useState(''), recipients = _g[0], setRecipients = _g[1];
    var _h = useState('Report Generated'), subject = _h[0], setSubject = _h[1];
    var templatesQuery = useReportTemplates();
    var complianceQuery = useComplianceReport(branchId);
    var operationsQuery = useOperationsReport(daysBack, branchId);
    var financialQuery = useFinancialReport(undefined, branchId);
    var memberQuery = useMemberReport(branchId);
    var riskQuery = useRiskReport(branchId);
    var exportPDFMutation = useExportReportPDF();
    var exportExcelMutation = useExportReportExcel();
    var emailMutation = useSendReportEmail();
    var queryMap = {
        compliance: complianceQuery,
        operations: operationsQuery,
        financial: financialQuery,
        member: memberQuery,
        risk: riskQuery,
    };
    var currentQuery = queryMap[selectedReport];
    var reportData = currentQuery.data;
    var handleGenerateReport = function () {
        currentQuery.refetch();
    };
    var handleExportPDF = function () {
        if (reportData) {
            exportPDFMutation.mutate({
                reportType: selectedReport,
                reportData: reportData,
            });
        }
    };
    var handleExportExcel = function () {
        if (reportData) {
            exportExcelMutation.mutate({
                reportType: selectedReport,
                reportData: reportData,
            });
        }
    };
    var handleSendEmail = function () {
        if (reportData && recipients) {
            emailMutation.mutate({
                recipients: recipients.split(',').map(function (r) { return r.trim(); }),
                subject: subject,
                reportData: reportData,
            });
        }
    };
    return (<div className="min-h-screen bg-background">
      <div className="sticky top-0 bg-card border border-border/50 shadow-sm z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary"/>
            Reports
          </h1>
          <p className="text-muted-foreground mt-1">Generate, export, and distribute reports</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Report Types</h2>
            <div className="space-y-2">
              {[
            { id: 'compliance', label: 'Compliance Report' },
            { id: 'operations', label: 'Operations Report' },
            { id: 'financial', label: 'Financial Report' },
            { id: 'member', label: 'Member Report' },
            { id: 'risk', label: 'Risk Report' },
        ].map(function (report) { return (<button key={report.id} onClick={function () { return setSelectedReport(report.id); }} className={"w-full text-left px-4 py-2 rounded-lg transition ".concat(selectedReport === report.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-foreground/90 hover:bg-accent border border-border/50')}>
                  {report.label}
                </button>); })}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-card rounded-xl border border-border/50 shadow-sm p-4 md:p-5">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                {((_c = (_b = (_a = templatesQuery.data) === null || _a === void 0 ? void 0 : _a.templates) === null || _b === void 0 ? void 0 : _b[selectedReport]) === null || _c === void 0 ? void 0 : _c.name) || 'Report'}
              </h2>

              <div className="space-y-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Branch (Optional)
                  </label>
                  <input type="number" value={branchId || ''} onChange={function (e) { return setBranchId(e.target.value ? parseInt(e.target.value) : undefined); }} className="neon-input w-full" placeholder="Select branch"/>
                </div>

                {selectedReport === 'operations' && (<div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Days Back
                    </label>
                    <input type="number" value={daysBack} onChange={function (e) { return setDaysBack(parseInt(e.target.value) || 1); }} className="neon-input w-full" min="1" max="365"/>
                  </div>)}

                <button onClick={handleGenerateReport} disabled={currentQuery.isLoading} className="button-primary w-full disabled:opacity-50 flex items-center justify-center gap-2">
                  <RefreshCw className={"w-4 h-4 ".concat(currentQuery.isLoading ? 'animate-spin' : '')}/>
                  Generate Report
                </button>
              </div>

              {reportData && (<>
                  <div className="bg-accent rounded-xl p-4 md:p-5 mb-6 border border-border/50">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(reportData.summary || {}).map(function (_a) {
                var key = _a[0], value = _a[1];
                return (<div key={key} className="bg-card rounded-xl p-3 border border-border/50">
                          <p className="text-sm text-muted-foreground mb-1">
                            {key.replace(/_/g, ' ').toUpperCase()}
                          </p>
                          <p className="text-2xl font-bold text-card-foreground">
                            {typeof value === 'number' ? value.toLocaleString() : String(value)}
                          </p>
                        </div>);
            })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Export & Share</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button onClick={handleExportPDF} disabled={exportPDFMutation.isPending} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
                        <Download className="w-4 h-4"/>
                        Export PDF
                      </button>

                      <button onClick={handleExportExcel} disabled={exportExcelMutation.isPending} className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/80 disabled:opacity-50 flex items-center justify-center gap-2">
                        <Download className="w-4 h-4"/>
                        Export Excel
                      </button>
                    </div>

                    <div className="border-t border-border pt-4">
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Email Recipients (comma-separated)
                      </label>
                      <input type="text" value={recipients} onChange={function (e) { return setRecipients(e.target.value); }} placeholder="email1@example.com, email2@example.com" className="neon-input w-full mb-2"/>

                      <input type="text" value={subject} onChange={function (e) { return setSubject(e.target.value); }} placeholder="Email subject" className="neon-input w-full mb-4"/>

                      <button onClick={handleSendEmail} disabled={emailMutation.isPending || !recipients} className="button-primary w-full disabled:opacity-50 flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4"/>
                        Send Email
                      </button>
                    </div>
                  </div>
                </>)}
            </div>
          </div>
        </div>
      </div>
    </div>);
};
