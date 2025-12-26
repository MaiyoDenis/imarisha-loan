import React, { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Download,
  RefreshCw,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  FileText,
  Calendar,
  Filter,
  Loader,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const generateReportData = (type, days) => {
  const now = new Date();
  const allReports = [
    { id: 1, name: 'Loan Portfolio Report', type: 'loans', file: 'loan_portfolio.csv', size: '2847 KB', description: 'Complete loan portfolio with principal, interest, outstanding balance' },
    { id: 2, name: 'Transaction History Report', type: 'transactions', file: 'transactions.csv', size: '3256 KB', description: 'All transactions with amounts, balances, references' },
    { id: 3, name: 'Collections & Arrears Report', type: 'collections', file: 'arrears.csv', size: '1942 KB', description: 'Overdue loans with days overdue and member contact' },
    { id: 4, name: 'Compliance Report', type: 'compliance', file: 'compliance.csv', size: '1265 KB', description: 'CBK & SASRA regulatory compliance metrics' },
    { id: 5, name: 'Daily Operations Summary', type: 'operations', file: 'operations.csv', size: '856 KB', description: 'Daily activity: approvals, disbursements, repayments' },
    { id: 6, name: 'Financial Statement', type: 'financial', file: 'financial.csv', size: '2134 KB', description: 'Income statement and balance sheet' },
    { id: 7, name: 'Member Analytics Report', type: 'members', file: 'members.csv', size: '4521 KB', description: 'Member cohort analysis with lifecycle stages' },
    { id: 8, name: 'Risk Management Report', type: 'risk', file: 'risk.csv', size: '2876 KB', description: 'Portfolio risk distribution and warnings' },
    { id: 9, name: 'Branch Performance Scorecard', type: 'performance', file: 'branch_performance.csv', size: '1645 KB', description: 'Branch-level KPI analysis' },
    { id: 10, name: 'Member Savings Summary', type: 'savings', file: 'member_savings.csv', size: '2156 KB', description: 'Member savings accounts and deposits' },
  ];

  return allReports.map((report, idx) => ({
    ...report,
    date: new Date(now.getTime() - (idx * 86400000)),
    status: 'Generated'
  }));
};

export default function ReportsDashboard(props) {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: dashboardData = {}, isLoading: dashboardLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.getDashboardStats(),
  });

  const allReports = useMemo(() => generateReportData(reportType, parseInt(dateRange)), [reportType, dateRange]);

  const filteredReports = useMemo(() => {
    let filtered = allReports;

    if (reportType !== 'overview') {
      filtered = filtered.filter(report => 
        report.type === reportType
      );
    }

    const daysNum = parseInt(dateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysNum);

    filtered = filtered.filter(report => new Date(report.date) >= cutoffDate);

    return filtered;
  }, [allReports, reportType, dateRange]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: 'Success',
        description: 'Reports refreshed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh reports',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast]);

  const handleGenerateReport = useCallback(async () => {
    setIsGenerating(true);
    try {
      const reportName = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${new Date().toLocaleDateString()}`;
      
      toast({
        title: 'Report Generated',
        description: `New ${reportType} report has been generated: ${reportName}`,
      });

      await new Promise(resolve => setTimeout(resolve, 1500));
      await refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [reportType, refetch, toast]);

  const handleExportByType = useCallback(async () => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'https://imarisha-loans.onrender.com/api';
      const token = localStorage.getItem('auth_token');
      
      let endpoint = '/reports/portfolio/export';

      if (reportType === 'savings' || reportType === 'overview') {
        endpoint = '/reports/portfolio/export';
      } else if (reportType === 'collections') {
        endpoint = '/reports/arrears/export';
      } else if (reportType === 'transactions') {
        endpoint = '/reports/transactions/export';
      }

      const response = await fetch(`${apiBase}${endpoint}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token || ''}`,
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - Please login again');
        }
        throw new Error(`Export failed: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `${reportType}_report_${dateStr}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Success',
        description: `${reportType} report exported successfully`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to export report',
        variant: 'destructive',
      });
    }
  }, [reportType, toast]);

  const handleDownloadReport = useCallback(async (report) => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'https://imarisha-loans.onrender.com/api';
      const token = localStorage.getItem('auth_token');
      
      toast({
        title: 'Downloading',
        description: `Downloading ${report.name}...`,
      });

      const endpoint = `/reports/${report.type}/download`;
      
      const response = await fetch(`${apiBase}${endpoint}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token || ''}`,
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - Please login again');
        }
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = report.file || `${report.type}_report.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: `${report.name} downloaded successfully`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to download report',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleDownloadAllReports = useCallback(async () => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'https://imarisha-loans.onrender.com/api';
      const token = localStorage.getItem('auth_token');
      
      toast({
        title: 'Downloading',
        description: 'Preparing all reports...',
      });

      const response = await fetch(`${apiBase}/reports/all/download`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token || ''}`,
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - Please login again');
        }
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `all_reports_${dateStr}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: 'All reports downloaded successfully',
      });
    } catch (error) {
      console.error('Download all error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to download all reports',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const summaryData = {
    totalLoans: dashboardData.total_loans || 0,
    totalSavings: dashboardData.total_savings || 0,
    activeMembers: dashboardData.active_members || 0,
    overdueLoans: dashboardData.overdue_loans || 0,
    collectionRate: dashboardData.collection_rate || 0,
    monthlyGrowth: dashboardData.monthly_growth || 0,
    pendingApprovals: dashboardData.pending_approvals || 0,
    averageLoanAmount: dashboardData.average_loan_amount || 0,
  };

  if (dashboardLoading) {
    return (
      <Layout>
        <div className="p-8 flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading reports...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div className="p-8 flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h2 className="text-2xl font-bold">Failed to load data</h2>
            <p className="text-muted-foreground">{error?.message || "An unexpected error occurred while fetching dashboard statistics."}</p>
            <Button onClick={() => refetch()} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-heading font-extrabold tracking-tight text-gradient">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">Comprehensive reporting system - all system reports in one place.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              className="btn-neon" 
              onClick={handleDownloadAllReports}
              disabled={isGenerating || isRefreshing}
              title="Download all reports in one document"
            >
              <Download className="mr-2 h-4 w-4" /> Download All
            </Button>
            <Button 
              variant="outline" 
              className="btn-neon" 
              onClick={handleExportByType}
              disabled={isGenerating || isRefreshing}
            >
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button 
              className="btn-neon" 
              onClick={handleGenerateReport}
              disabled={isGenerating || isRefreshing}
            >
              {isGenerating ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" /> Generate Report
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 glass-card gradient-border p-4 rounded-lg flex-wrap">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-56 neon-input">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">All Reports (Overview)</SelectItem>
              <SelectItem value="compliance">Compliance Report</SelectItem>
              <SelectItem value="operations">Operations Summary</SelectItem>
              <SelectItem value="financial">Financial Statement</SelectItem>
              <SelectItem value="loans">Loan Portfolio</SelectItem>
              <SelectItem value="transactions">Transactions</SelectItem>
              <SelectItem value="collections">Collections & Arrears</SelectItem>
              <SelectItem value="members">Member Analytics</SelectItem>
              <SelectItem value="risk">Risk Management</SelectItem>
              <SelectItem value="performance">Branch Performance</SelectItem>
              <SelectItem value="savings">Member Savings</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48 neon-input">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isGenerating}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-200">Active Filters</h3>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Showing <strong>{filteredReports.length}</strong> reports of type <strong>{reportType === 'overview' ? 'All' : reportType}</strong> from the <strong>last {dateRange} days</strong>
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryData.totalLoans.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                +{summaryData.monthlyGrowth.toFixed(2)}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES {summaryData.totalSavings.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                Full amount
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryData.activeMembers.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                Active
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryData.collectionRate.toFixed(2)}%</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                Current rate
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <FileText className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{summaryData.pendingApprovals.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Loans</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{summaryData.overdueLoans.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Loan Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES {summaryData.averageLoanAmount.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">+{summaryData.monthlyGrowth.toFixed(2)}%</div>
            </CardContent>
          </Card>
        </div>

        <div className="glass-card gradient-border hover-tilt relative overflow-hidden">
          <span className="aura"></span>
          <div className="p-6 border-b flex items-center justify-between">
            <h3 className="text-lg font-heading font-semibold">System Reports ({filteredReports.length})</h3>
            {filteredReports.length === 0 && (
              <Badge variant="secondary">No reports match filters</Badge>
            )}
          </div>
          {filteredReports.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-40">Report Name</TableHead>
                    <TableHead className="w-32">Type</TableHead>
                    <TableHead className="w-32">Generated</TableHead>
                    <TableHead className="w-24">Size</TableHead>
                    <TableHead className="w-32">Status</TableHead>
                    <TableHead className="w-64">Description</TableHead>
                    <TableHead className="text-right w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map(report => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium text-sm">{report.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">{report.type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{report.date.toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{report.size}</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{report.description}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDownloadReport(report)}
                          className="h-8"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground font-medium">No reports found</p>
              <p className="text-sm text-muted-foreground mt-2">Adjust your filters to see more reports</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
