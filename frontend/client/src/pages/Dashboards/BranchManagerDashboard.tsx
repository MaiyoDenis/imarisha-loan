import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/ui/loading';
import {
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Users2,
  CreditCard,
  Percent,
  Search,
  Filter,
  Download,
  Package,
  Truck,
} from 'lucide-react';
import { api } from '@/lib/api';
import {
  exportToCSV,
  generateBranchReport,
  downloadReport,
  flattenGroupData,
  flattenStaffData,
  flattenProductData,
  flattenSupplierData,
  flattenLoanData,
} from '@/lib/export-utils';

interface BranchStats {
  totalLoans: number;
  activeLoans: number;
  pendingLoans: number;
  totalDisbursted: number;
  loans?: any[];
}

export default function BranchManagerDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Get current user's branch
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const branchId = user?.branch_id;

  // Fetch branch data
  const { data: branchStats, isLoading: statsLoading } = useQuery<BranchStats>({
    queryKey: ['branch-stats', branchId],
    queryFn: () =>
      branchId ? api.getLoans().then((loans) => ({
        totalLoans: loans.length,
        activeLoans: loans.filter((l: any) => l.status === 'active').length,
        pendingLoans: loans.filter((l: any) => l.status === 'pending').length,
        totalDisbursted: loans.reduce((sum: number, l: any) => sum + parseFloat(l.totalAmount || 0), 0),
        loans: loans,
      })) : Promise.resolve({
        totalLoans: 0,
        activeLoans: 0,
        pendingLoans: 0,
        totalDisbursted: 0,
        loans: [],
      }),
    enabled: !!branchId,
  });

  const { data: branchUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['branch-users', branchId],
    queryFn: () =>
      branchId
        ? api.getUsers()
        : Promise.resolve([]),
    enabled: !!branchId,
  });

  const { data: branchGroups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ['branch-groups', branchId],
    queryFn: () =>
      branchId ? api.getFieldOfficerGroups() : Promise.resolve([]),
    enabled: !!branchId,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['branch-products', branchId],
    queryFn: () =>
      branchId ? api.getLoanProducts() : Promise.resolve([]),
    enabled: !!branchId,
  });

  const { data: suppliersData, isLoading: suppliersLoading } = useQuery({
    queryKey: ['branch-suppliers', branchId],
    queryFn: () =>
      branchId ? api.getSuppliers() : Promise.resolve({ suppliers: [] }),
    enabled: !!branchId,
  });

  const suppliers = suppliersData?.suppliers || [];

  // Filter users for search
  const filteredUsers = branchUsers.filter((u: any) =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate metrics
  const totalUsers = branchUsers.length;
  const staffByRole = branchUsers.reduce((acc: any, u: any) => {
    const role = u.role || 'unknown';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  const totalGroupMembers = branchGroups.reduce(
    (sum: number, g: any) => sum + (g.totalMembers || 0),
    0
  );

  const totalSavings = branchGroups.reduce(
    (sum: number, g: any) => sum + parseFloat(g.totalSavings || 0),
    0
  );

  const totalOutstandingLoans = branchGroups.reduce(
    (sum: number, g: any) => sum + parseFloat(g.totalLoansOutstanding || 0),
    0
  );

  const avgRepaymentRate = branchGroups.length > 0
    ? branchGroups.reduce((sum: number, g: any) => sum + (g.repaymentRate || 0), 0) /
      branchGroups.length
    : 0;

  const isLoading = statsLoading || usersLoading || groupsLoading || productsLoading || suppliersLoading;

  const handleExportReport = () => {
    const reportData = {
      totalLoans: branchStats?.totalLoans || 0,
      activeLoans: branchStats?.activeLoans || 0,
      pendingLoans: branchStats?.pendingLoans || 0,
      totalMembers: branchGroups.reduce((sum: number, g: any) => sum + (g.totalMembers || 0), 0),
      totalSavings: branchGroups.reduce((sum: number, g: any) => sum + parseFloat(g.totalSavings || 0), 0),
      collectionRate: avgRepaymentRate,
      staffCount: branchUsers.length,
      staffByRole,
      groupCount: branchGroups.length,
      groups: branchGroups,
      products: products,
      suppliers: suppliers,
    };
    const report = generateBranchReport(reportData, user?.branch_name || 'Branch');
    downloadReport(report, `branch-report-${user?.branch_name?.replace(/\s+/g, '-')}`);
  };

  const handleExportGroups = () => {
    const flatData = flattenGroupData(branchGroups);
    exportToCSV(flatData, `branch-groups-${user?.branch_name?.replace(/\s+/g, '-')}`);
  };

  const handleExportStaff = () => {
    const flatData = flattenStaffData(branchUsers);
    exportToCSV(flatData, `branch-staff-${user?.branch_name?.replace(/\s+/g, '-')}`);
  };

  const handleExportProducts = () => {
    const flatData = flattenProductData(products);
    exportToCSV(flatData, `branch-products-${user?.branch_name?.replace(/\s+/g, '-')}`);
  };

  const handleExportSuppliers = () => {
    const flatData = flattenSupplierData(suppliers);
    exportToCSV(flatData, `branch-suppliers-${user?.branch_name?.replace(/\s+/g, '-')}`);
  };

  const handleExportLoans = () => {
    const loansData = (branchStats as BranchStats | undefined)?.loans || [];
    const flatData = flattenLoanData(loansData);
    exportToCSV(flatData, `branch-loans-${user?.branch_name?.replace(/\s+/g, '-')}`);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Layout>
      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Branch Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              {user?.branch_name || 'Branch'} Management & Analytics
            </p>
          </div>
          <Button className="gap-2" onClick={handleExportReport}>
            <Download className="h-4 w-4" />
            Export Full Report
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Loans */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-900">Total Loans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-bold text-blue-900">{branchStats?.totalLoans || 0}</p>
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-xs text-blue-700 mt-2">
                {branchStats?.activeLoans || 0} active
              </p>
            </CardContent>
          </Card>

          {/* Total Members */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-900">Total Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-bold text-green-900">{totalGroupMembers}</p>
                <Users2 className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-xs text-green-700 mt-2">
                {branchGroups.length} groups
              </p>
            </CardContent>
          </Card>

          {/* Total Savings */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-900">Total Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-bold text-purple-900">
                  KES {(totalSavings / 1000000).toFixed(1)}M
                </p>
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          {/* Collection Rate */}
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-amber-900">Collection Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-bold text-amber-900">{avgRepaymentRate.toFixed(1)}%</p>
                <Percent className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-xs text-amber-700 mt-2">Average repayment</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Staff ({totalUsers})</TabsTrigger>
            <TabsTrigger value="groups">Groups ({branchGroups.length})</TabsTrigger>
            <TabsTrigger value="loans">Loans ({branchStats?.totalLoans || 0})</TabsTrigger>
            <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
            <TabsTrigger value="store">Store ({suppliers.length})</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Branch Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Branch Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <span className="text-sm font-medium">Outstanding Loans</span>
                    <span className="font-bold">
                      KES {(totalOutstandingLoans / 1000000).toFixed(2)}M
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b">
                    <span className="text-sm font-medium">Disbursed Amount</span>
                    <span className="font-bold">
                      KES {((branchStats?.totalDisbursted || 0) / 1000000).toFixed(2)}M
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Repayment Rate</span>
                    <Badge variant="default">{avgRepaymentRate.toFixed(1)}%</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Staff Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Staff Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(staffByRole).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between pb-2 border-b last:border-0">
                      <span className="text-sm capitalize font-medium">
                        {role.replace(/_/g, ' ')}
                      </span>
                      <Badge variant="outline">{count as number}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4 mt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff by name or username..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleExportStaff}>
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>

            {filteredUsers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No staff found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role?.replace(/_/g, ' ')}</Badge>
                        </TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? 'default' : 'destructive'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="space-y-4 mt-6">
            <div className="flex justify-end">
              <Button variant="outline" className="gap-2" onClick={handleExportGroups}>
                <Download className="h-4 w-4" />
                Export Groups
              </Button>
            </div>
            {branchGroups.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No groups in this branch</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {branchGroups.map((group: any) => (
                  <Card key={group.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <CardDescription>
                        {group.totalMembers} members
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Savings</p>
                          <p className="font-bold">
                            KES {parseFloat(group.totalSavings || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Outstanding</p>
                          <p className="font-bold">
                            KES {parseFloat(group.totalLoansOutstanding || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Repayment Rate</span>
                          <Badge
                            variant={
                              group.repaymentRate >= 80
                                ? 'default'
                                : group.repaymentRate >= 50
                                ? 'outline'
                                : 'destructive'
                            }
                          >
                            {group.repaymentRate.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Loans Tab */}
          <TabsContent value="loans" className="space-y-4 mt-6">
            <div className="flex justify-end">
              <Button variant="outline" className="gap-2" onClick={handleExportLoans}>
                <Download className="h-4 w-4" />
                Export Loans
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Loan Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Loans</p>
                    <p className="text-2xl font-bold text-blue-900">{branchStats?.totalLoans || 0}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold text-green-900">{branchStats?.activeLoans || 0}</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-yellow-900">{branchStats?.pendingLoans || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4 mt-6">
            <div className="flex justify-end">
              <Button variant="outline" className="gap-2" onClick={handleExportProducts}>
                <Download className="h-4 w-4" />
                Export Products
              </Button>
            </div>
            {products.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No loan products available</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product: any) => {
                  const isLowStock = product.stockQuantity <= product.lowStockThreshold;
                  return (
                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="h-32 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center relative">
                        <Package className="h-12 w-12 text-blue-600" />
                        {isLowStock && (
                          <Badge variant="destructive" className="absolute top-2 right-2 animate-pulse">
                            Low Stock
                          </Badge>
                        )}
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{product.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Price</p>
                            <p className="font-bold text-lg">
                              KES {parseFloat(product.sellingPrice || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-muted-foreground">Stock</p>
                            <p className={`font-bold text-lg ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                              {product.stockQuantity}
                            </p>
                          </div>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Cost: KES {parseFloat(product.buyingPrice || 0).toLocaleString()}</span>
                            <span>Margin: {((parseFloat(product.sellingPrice || 0) - parseFloat(product.buyingPrice || 0)) / parseFloat(product.buyingPrice || 1) * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Store & Inventory Tab */}
          <TabsContent value="store" className="space-y-4 mt-6">
            <div className="flex justify-end">
              <Button variant="outline" className="gap-2" onClick={handleExportSuppliers}>
                <Download className="h-4 w-4" />
                Export Suppliers
              </Button>
            </div>
            {suppliers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No suppliers available</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {suppliers.map((supplier: any) => (
                  <Card key={supplier.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 border-b">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{supplier.name}</h3>
                          {supplier.companyName && (
                            <p className="text-xs text-muted-foreground">{supplier.companyName}</p>
                          )}
                        </div>
                        <Badge variant={supplier.isActive ? 'default' : 'outline'}>
                          {supplier.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="pt-4 space-y-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p className="font-medium">{supplier.phone}</p>
                      </div>
                      {supplier.email && (
                        <div>
                          <p className="text-muted-foreground">Email</p>
                          <p className="font-medium break-all">{supplier.email}</p>
                        </div>
                      )}
                      {supplier.location && (
                        <div>
                          <p className="text-muted-foreground">Location</p>
                          <p className="font-medium">{supplier.location}</p>
                        </div>
                      )}
                      <div className="pt-2 border-t mt-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rating</span>
                          <Badge variant="outline">{supplier.rating || 'N/A'}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
