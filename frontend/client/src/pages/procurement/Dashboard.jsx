import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Package, CheckCircle, XCircle, Clock, Eye, Edit, MoreHorizontal, DollarSign, Zap } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useRoleRedirect } from "@/hooks/use-role-redirect";
import { useCurrentUser } from "@/hooks/use-current-user";
var statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    under_review: "bg-blue-100 text-blue-800",
    approved: "bg-green-100 text-green-800",
    disbursed: "bg-purple-100 text-purple-800",
    released: "bg-indigo-100 text-indigo-800",
    rejected: "bg-red-100 text-red-800",
    completed: "bg-green-100 text-green-800",
};
export default function ProcurementOfficerDashboard() {
    useRoleRedirect({
        allowedRoles: ['procurement_officer'],
        fallbackPath: '/dashboard'
    });
    var user = useCurrentUser().user;
    var queryClient = useQueryClient();
    var toast = useToast().toast;
    var _a = useState("pending-loans"), activeTab = _a[0], setActiveTab = _a[1];
    var _b = useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = useState(null), selectedLoan = _c[0], setSelectedLoan = _c[1];
    var _d = useState(false), isActionDialogOpen = _d[0], setIsActionDialogOpen = _d[1];
    var _e = useState('under_review'), actionType = _e[0], setActionType = _e[1];
    var _f = useState(""), rejectionReason = _f[0], setRejectionReason = _f[1];
    var _g = useQuery({
        queryKey: ["loans"],
        queryFn: function () { return api.getLoans(); },
        refetchInterval: 10000,
    }), _h = _g.data, loansData = _h === void 0 ? [] : _h, loansLoading = _g.isLoading;
    var _j = useQuery({
        queryKey: ["low-stock-products"],
        queryFn: function () { return api.getLowStockProducts(); },
        staleTime: 5 * 60 * 1000,
    }).data, lowStockProducts = _j === void 0 ? [] : _j;
    var suppliersData = useQuery({
        queryKey: ["suppliers"],
        queryFn: function () { return api.getSuppliers(); },
    }).data;
    var suppliers = (suppliersData === null || suppliersData === void 0 ? void 0 : suppliersData.suppliers) || [];
    var markUnderReviewMutation = useMutation({
        mutationFn: function (id) { return api.markLoanUnderReview(id); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["loans"] });
            setIsActionDialogOpen(false);
            toast({ title: "Success", description: "Loan marked as under review" });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to update loan",
                variant: "destructive"
            });
        },
    });
    var approveLoanMutation = useMutation({
        mutationFn: function (id) { return api.approveLoan(id); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["loans"] });
            setIsActionDialogOpen(false);
            toast({ title: "Success", description: "Loan approved successfully" });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to approve loan",
                variant: "destructive"
            });
        },
    });
    var disburseLoanMutation = useMutation({
        mutationFn: function (id) { return api.disburseLoan(id); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["loans"] });
            setIsActionDialogOpen(false);
            toast({ title: "Success", description: "Loan disbursed successfully" });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to disburse loan",
                variant: "destructive"
            });
        },
    });
    var releaseLoanMutation = useMutation({
        mutationFn: function (id) { return api.releaseLoan(id); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["loans"] });
            setIsActionDialogOpen(false);
            toast({ title: "Success", description: "Loan released successfully" });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to release loan",
                variant: "destructive"
            });
        },
    });
    var rejectLoanMutation = useMutation({
        mutationFn: function (id) { return api.rejectLoan(id, rejectionReason); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["loans"] });
            setIsActionDialogOpen(false);
            setRejectionReason("");
            toast({ title: "Success", description: "Loan rejected successfully" });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to reject loan",
                variant: "destructive"
            });
        },
    });
    var handleLoanAction = function () {
        if (!selectedLoan)
            return;
        switch (actionType) {
            case 'under_review':
                markUnderReviewMutation.mutate(selectedLoan.id);
                break;
            case 'approve':
                approveLoanMutation.mutate(selectedLoan.id);
                break;
            case 'disburse':
                disburseLoanMutation.mutate(selectedLoan.id);
                break;
            case 'release':
                releaseLoanMutation.mutate(selectedLoan.id);
                break;
            case 'reject':
                if (!rejectionReason.trim()) {
                    toast({
                        title: "Error",
                        description: "Please provide a rejection reason",
                        variant: "destructive"
                    });
                    return;
                }
                rejectLoanMutation.mutate(selectedLoan.id);
                break;
        }
    };
    var pendingLoans = loansData.filter(function (l) { return l.status === 'pending'; });
    var underReviewLoans = loansData.filter(function (l) { return l.status === 'under_review'; });
    var approvedLoans = loansData.filter(function (l) { return l.status === 'approved'; });
    var disbursedLoans = loansData.filter(function (l) { return l.status === 'disbursed'; });
    var filteredLoans = loansData.filter(function (loan) {
        return loan.loanNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            loan.memberId.toString().includes(searchQuery);
    });
    var getStatusIcon = function (status) {
        switch (status) {
            case "pending": return <Clock className="h-4 w-4"/>;
            case "under_review": return <Eye className="h-4 w-4"/>;
            case "approved": return <CheckCircle className="h-4 w-4"/>;
            case "disbursed": return <DollarSign className="h-4 w-4"/>;
            case "released": return <Zap className="h-4 w-4"/>;
            case "rejected": return <XCircle className="h-4 w-4"/>;
            default: return null;
        }
    };
    var getNextActions = function (status) {
        switch (status) {
            case "pending":
                return [
                    { action: 'under_review', label: 'Mark Under Review', color: 'text-primary' },
                    { action: 'reject', label: 'Reject', color: 'text-destructive' }
                ];
            case "under_review":
                return [
                    { action: 'approve', label: 'Approve', color: 'text-secondary' },
                    { action: 'reject', label: 'Reject', color: 'text-destructive' }
                ];
            case "approved":
                return [
                    { action: 'disburse', label: 'Disburse', color: 'text-purple-600' }
                ];
            case "disbursed":
                return [
                    { action: 'release', label: 'Release', color: 'text-indigo-600' }
                ];
            default:
                return [];
        }
    };
    return (<Layout>
      <div className="p-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-heading font-extrabold tracking-tight text-gradient">Procurement Officer</h1>
            <p className="text-muted-foreground mt-1">Manage loan approvals, store inventory, and suppliers for your branch.</p>
            {(user === null || user === void 0 ? void 0 : user.branch_id) && (<p className="text-sm text-primary mt-2 font-medium">
                Branch ID: {user.branch_id}
              </p>)}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card gradient-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{pendingLoans.length}</p>
              <p className="text-xs text-secondary mt-1">Awaiting review</p>
            </CardContent>
          </Card>

          <Card className="glass-card gradient-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Under Review</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{underReviewLoans.length}</p>
              <p className="text-xs text-primary mt-1">In processing</p>
            </CardContent>
          </Card>

          <Card className="glass-card gradient-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{approvedLoans.length}</p>
              <p className="text-xs text-secondary mt-1">Ready to disburse</p>
            </CardContent>
          </Card>

          <Card className="glass-card gradient-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Critical Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{lowStockProducts.filter(function (p) { return p.status === 'critical'; }).length}</p>
              <p className="text-xs text-destructive mt-1">Restock needed</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pending-loans">Pending ({pendingLoans.length})</TabsTrigger>
            <TabsTrigger value="under-review">Under Review ({underReviewLoans.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedLoans.length})</TabsTrigger>
            <TabsTrigger value="stock-alerts">Stock Alerts ({lowStockProducts.length})</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          </TabsList>

          {/* Pending Loans */}
          <TabsContent value="pending-loans" className="space-y-4 mt-6">
            <div className="flex items-center gap-4 glass-card gradient-border p-4 rounded-lg">
              <Search className="h-4 w-4 text-muted-foreground"/>
              <Input placeholder="Search by loan number or member ID..." className="flex-1 bg-background neon-input" value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }}/>
            </div>

            {loansLoading ? (<div className="text-center py-12">Loading loans...</div>) : pendingLoans.length === 0 ? (<Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4"/>
                  <p className="text-muted-foreground">No pending loans</p>
                </CardContent>
              </Card>) : (<div className="rounded-md border border-border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loan #</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingLoans.map(function (loan) { return (<TableRow key={loan.id}>
                        <TableCell className="font-semibold">{loan.loanNumber}</TableCell>
                        <TableCell>Member {loan.memberId}</TableCell>
                        <TableCell className="text-right font-mono">KES {parseFloat(loan.totalAmount).toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(loan.applicationDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[loan.status]}>
                            {getStatusIcon(loan.status)}
                            <span className="ml-1">{loan.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4"/>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={function () { setSelectedLoan(loan); setActionType('under_review'); setIsActionDialogOpen(true); }}>
                                Mark Under Review
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={function () { setSelectedLoan(loan); setActionType('reject'); setIsActionDialogOpen(true); }}>
                                Reject
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>); })}
                  </TableBody>
                </Table>
              </div>)}
          </TabsContent>

          {/* Under Review */}
          <TabsContent value="under-review" className="space-y-4 mt-6">
            {underReviewLoans.length === 0 ? (<Card>
                <CardContent className="py-12 text-center">
                  <Eye className="h-12 w-12 text-primary mx-auto mb-4"/>
                  <p className="text-muted-foreground">No loans under review</p>
                </CardContent>
              </Card>) : (<div className="rounded-md border border-border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loan #</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {underReviewLoans.map(function (loan) { return (<TableRow key={loan.id}>
                        <TableCell className="font-semibold">{loan.loanNumber}</TableCell>
                        <TableCell>Member {loan.memberId}</TableCell>
                        <TableCell className="text-right font-mono">KES {parseFloat(loan.totalAmount).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[loan.status]}>
                            {getStatusIcon(loan.status)}
                            <span className="ml-1">{loan.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4"/>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem className="text-secondary" onClick={function () { setSelectedLoan(loan); setActionType('approve'); setIsActionDialogOpen(true); }}>
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={function () { setSelectedLoan(loan); setActionType('reject'); setIsActionDialogOpen(true); }}>
                                Reject
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>); })}
                  </TableBody>
                </Table>
              </div>)}
          </TabsContent>

          {/* Approved */}
          <TabsContent value="approved" className="space-y-4 mt-6">
            {approvedLoans.length === 0 ? (<Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4"/>
                  <p className="text-muted-foreground">No approved loans</p>
                </CardContent>
              </Card>) : (<div className="rounded-md border border-border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loan #</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Approved</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedLoans.map(function (loan) { return (<TableRow key={loan.id}>
                        <TableCell className="font-semibold">{loan.loanNumber}</TableCell>
                        <TableCell>Member {loan.memberId}</TableCell>
                        <TableCell className="text-right font-mono">KES {parseFloat(loan.totalAmount).toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {loan.approvalDate ? new Date(loan.approvalDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[loan.status]}>
                            {getStatusIcon(loan.status)}
                            <span className="ml-1">{loan.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4"/>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem className="text-purple-600" onClick={function () { setSelectedLoan(loan); setActionType('disburse'); setIsActionDialogOpen(true); }}>
                                Disburse
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>); })}
                  </TableBody>
                </Table>
              </div>)}
          </TabsContent>

          {/* Stock Alerts */}
          <TabsContent value="stock-alerts" className="space-y-4 mt-6">
            {lowStockProducts.length === 0 ? (<Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4"/>
                  <p className="text-muted-foreground">All products have adequate stock</p>
                </CardContent>
              </Card>) : (<div className="space-y-4">
                {lowStockProducts.map(function (item) { return (<Card key={item.product.id} className={"border-l-4 ".concat(item.status === 'critical' ? 'border-l-red-500' : 'border-l-yellow-500')}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{item.product.name}</h3>
                          <div className="grid grid-cols-3 gap-4 mt-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Current Stock</p>
                              <p className="text-2xl font-bold">{item.product.stockQuantity}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Threshold</p>
                              <p className="text-2xl font-bold">{item.product.lowStockThreshold}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Status</p>
                              <Badge className={item.status === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                                {item.status.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-1"/> Restock
                        </Button>
                      </div>
                    </CardContent>
                  </Card>); })}
              </div>)}
          </TabsContent>

          {/* Suppliers */}
          <TabsContent value="suppliers" className="space-y-4 mt-6">
            <div className="flex items-center gap-4 glass-card gradient-border p-4 rounded-lg">
              <Search className="h-4 w-4 text-muted-foreground"/>
              <Input placeholder="Search suppliers..." className="flex-1 bg-background neon-input"/>
            </div>

            {suppliers.length === 0 ? (<Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                  <p className="text-muted-foreground">No suppliers found</p>
                </CardContent>
              </Card>) : (<div className="grid gap-6 md:grid-cols-2">
                {suppliers.map(function (supplier) { return (<Card key={supplier.id} className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{supplier.name}</CardTitle>
                          <CardDescription>{supplier.phone}</CardDescription>
                        </div>
                        <Badge variant={supplier.isActive ? "default" : "outline"}>
                          {supplier.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {supplier.email && <p className="text-sm text-muted-foreground mb-2">{supplier.email}</p>}
                      {supplier.location && <p className="text-sm text-muted-foreground mb-4">{supplier.location}</p>}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4"/>
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>); })}
              </div>)}
          </TabsContent>
        </Tabs>
      </div>

      {/* Loan Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'reject' ? 'Reject Loan' : "".concat(actionType.replace('_', ' ').toUpperCase(), " - ").concat(selectedLoan === null || selectedLoan === void 0 ? void 0 : selectedLoan.loanNumber)}
            </DialogTitle>
            <DialogDescription>
              {selectedLoan && (<div className="mt-2 space-y-1 text-sm">
                  <p>Member: {selectedLoan.memberId}</p>
                  <p>Amount: KES {parseFloat(selectedLoan.totalAmount).toLocaleString()}</p>
                </div>)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {actionType === 'reject' && (<div>
                <label className="text-sm font-medium">Reason for Rejection</label>
                <textarea className="w-full mt-2 p-2 border border-input rounded-md text-sm" placeholder="Enter reason..." rows={4} value={rejectionReason} onChange={function (e) { return setRejectionReason(e.target.value); }}/>
              </div>)}
            
            {actionType === 'disburse' && (<div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Disbursing this loan will deduct stock items and set the due date based on the loan term.
                </p>
              </div>)}

            {actionType === 'under_review' && (<div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Mark this loan as under review for internal processing.
                </p>
              </div>)}
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button variant="outline" onClick={function () { return setIsActionDialogOpen(false); }}>
              Cancel
            </Button>
            <Button onClick={handleLoanAction} disabled={markUnderReviewMutation.isPending ||
            approveLoanMutation.isPending ||
            disburseLoanMutation.isPending ||
            releaseLoanMutation.isPending ||
            rejectLoanMutation.isPending} className={actionType === 'reject'
            ? 'bg-red-600 hover:bg-red-700'
            : actionType === 'approve'
                ? 'bg-secondary hover:bg-secondary/80'
                : 'bg-primary hover:bg-primary/80'}>
              {actionType === 'reject' ? 'Reject Loan' : "".concat(actionType.replace('_', ' '), " Loan")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>);
}
