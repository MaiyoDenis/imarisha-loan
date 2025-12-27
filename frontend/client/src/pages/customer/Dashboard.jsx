import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import { useRoleRedirect } from "@/hooks/use-role-redirect";
import { LoadingSpinner } from "@/components/ui/loading";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApplyLoanForm } from "@/components/field-officer/ApplyLoanForm";
import KPICard from "@/components/dashboards/KPICard";
import { PiggyBank, DollarSign, Percent, CreditCard, TrendingUp, ShoppingBag, Phone, Code } from "lucide-react";
import { TransferFundsForm } from "@/components/field-officer/TransferFundsForm";
import { DepositForm } from "@/components/field-officer/DepositForm";

export default function Dashboard() {
    var _a = useLocation(), setLocation = _a[1];
    var _meQuery = useQuery({
        queryKey: ["me"],
        queryFn: function () { return api.me(); },
    });
    var me = _meQuery.data;

    useRoleRedirect({
        allowedRoles: ['customer', 'admin'],
        fallbackPath: '/dashboard'
    });

    if (_meQuery.isLoading) return <Layout><LoadingSpinner /></Layout>;

    // Find the member ID for this user
    var memberId = me?.member_profile?.[0]?.id || me?.memberProfile?.[0]?.id;

    if (!memberId) {
        return (
            <Layout>
                <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold">Profile Not Found</h2>
                    <p className="text-muted-foreground">We couldn't find your member profile. Please contact support.</p>
                </div>
            </Layout>
        );
    }

    return <CustomerDashboardView memberId={memberId} />;
}

function CustomerDashboardView({ memberId }) {
    var queryClient = useQueryClient();
    var toast = useToast().toast;
    
    var _g = useQuery({
        queryKey: ["memberDashboard", memberId],
        queryFn: function () { return api.getMemberDashboard(memberId); },
    }), member = _g.data, isLoading = _g.isLoading, error = _g.error, refetch = _g.refetch;

    var _p = useQuery({
        queryKey: ["loan-products"],
        queryFn: function () { return api.getLoanProducts(); },
    }), products = _p.data;

    var [showLoanForm, setShowLoanForm] = useState(false);
    var [showTransferForm, setShowTransferForm] = useState(false);
    var [showDepositForm, setShowDepositForm] = useState(false);
    var [depositAccountType, setDepositAccountType] = useState(null);

    var cancelMutation = useMutation({
        mutationFn: function (id) { return api.post("/loans/".concat(id, "/cancel"), {}); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["memberDashboard", memberId] });
            queryClient.invalidateQueries({ queryKey: ["loan-products"] });
            toast({ title: "Success", description: "Loan application cancelled and stock restored" });
        },
    });

    if (isLoading) return <Layout><LoadingSpinner /></Layout>;
    if (!member) return <Layout><div className="p-8 text-center">Failed to load dashboard</div></Layout>;

    const m = member;

    return (
        <Layout>
            <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                        <h1 className="text-4xl font-bold tracking-tight">
                            Welcome, {m.user.firstName}!
                        </h1>
                        <div className="flex items-center gap-4 text-muted-foreground flex-wrap">
                            <span className={`px-4 py-1 rounded-full text-xs font-bold border shadow-sm ${
                                m.status === 'active' 
                                ? 'bg-[#3E2723] border-[#FFD700] text-white' 
                                : 'bg-gray-100 border-gray-200 text-gray-700'
                            }`}>
                                {m.status.toUpperCase()}
                            </span>
                            <div className="flex items-center gap-1">
                                <Code className="h-4 w-4"/>
                                <span>{m.memberCode}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => setShowLoanForm(!showLoanForm)} className="gap-2 bg-primary hover:bg-primary/80" size="lg">
                            <CreditCard className="h-5 w-5"/>
                            {showLoanForm ? "Cancel" : "Apply for Loan"}
                        </Button>
                        <Button onClick={() => setShowTransferForm(!showTransferForm)} className="gap-2" variant="outline" size="lg">
                            <TrendingUp className="h-5 w-5"/>
                            {showTransferForm ? "Cancel" : "Transfer"}
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <KPICard className="!bg-transparent" title="Max Loan Limit" value={new Intl.NumberFormat('en-KE').format(m.maxLoanLimit)} unit="KES" icon={<CreditCard size={24}/>} status="normal"/>
                    <KPICard className="!bg-transparent" title="Available Loan" value={new Intl.NumberFormat('en-KE').format(m.availableLoan)} unit="KES" icon={<DollarSign size={24}/>} status="success"/>
                    <KPICard className="!bg-transparent" title="Outstanding Balance" value={new Intl.NumberFormat('en-KE').format(m.totalOutstanding)} unit="KES" icon={<TrendingUp size={24}/>} status="warning"/>
                    <KPICard className="!bg-transparent" title="Repayment Rate" value={m.repaymentRate} unit="%" icon={<Percent size={24}/>} status={parseFloat(m.repaymentRate) >= 90 ? 'success' : 'warning'}/>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-2 !bg-transparent">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PiggyBank className="h-5 w-5 text-secondary"/>
                                Savings Account
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="bg-transparent p-4 rounded-lg border border-gray-200/20">
                                <p className="text-xs text-muted-foreground mb-1">Current Balance</p>
                                <p className="text-3xl font-bold text-secondary">
                                    KES {new Intl.NumberFormat('en-KE').format(parseFloat(m.savingsBalance))}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => { setDepositAccountType("savings"); setShowDepositForm(true); }} className="flex-1">
                                    <DollarSign className="h-4 w-4 mr-2"/>
                                    Deposit
                                </Button>
                                <Button onClick={() => setShowTransferForm(true)} variant="outline" className="flex-1">
                                    Transfer
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 !bg-transparent">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-primary"/>
                                Drawdown Account
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="bg-transparent p-4 rounded-lg border border-gray-200/20">
                                <p className="text-xs text-muted-foreground mb-1">Current Balance</p>
                                <p className="text-3xl font-bold text-primary">
                                    KES {new Intl.NumberFormat('en-KE').format(parseFloat(m.drawdownBalance))}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => { setDepositAccountType("drawdown"); setShowDepositForm(true); }} className="flex-1 bg-primary hover:bg-primary/80">
                                    <DollarSign className="h-4 w-4 mr-2"/>
                                    Deposit
                                </Button>
                                <Button onClick={() => setShowLoanForm(true)} variant="outline" className="flex-1">
                                    Withdraw
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {showLoanForm && (
                    <Card className="border-primary/30 !bg-transparent">
                        <CardHeader>
                            <CardTitle>New Product Loan Application</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ApplyLoanForm 
                                memberId={memberId} 
                                title="Apply for a Product Loan"
                                onSuccess={() => {
                                    setShowLoanForm(false);
                                    refetch();
                                }}
                            />
                        </CardContent>
                    </Card>
                )}

                {showTransferForm && (
                    <Card className="border-green-300 !bg-transparent">
                        <CardHeader>
                            <CardTitle>Transfer Funds Between Accounts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TransferFundsForm 
                                memberId={memberId} 
                                onSuccess={() => {
                                    setShowTransferForm(false);
                                    refetch();
                                }}
                            />
                        </CardContent>
                    </Card>
                )}

                {showDepositForm && (
                    <Card className="border-secondary/50 !bg-transparent">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <div>
                                <CardTitle>Record Deposit</CardTitle>
                                <CardDescription>
                                    Deposit to {depositAccountType === "savings" ? "Savings" : "Drawdown"} Account
                                </CardDescription>
                            </div>
                            <Button variant="ghost" onClick={() => setShowDepositForm(false)}>✕</Button>
                        </CardHeader>
                        <CardContent>
                            <DepositForm 
                                memberId={memberId} 
                                defaultAccountType={depositAccountType || "savings"} 
                                onSuccess={() => {
                                    setShowDepositForm(false);
                                    refetch();
                                }}
                            />
                        </CardContent>
                    </Card>
                )}

                <Tabs defaultValue="loans" className="w-full">
                    <TabsList className="bg-transparent p-1 rounded-lg border border-border">
                        <TabsTrigger value="loans">Active Loans ({m.activeLoans.length})</TabsTrigger>
                        <TabsTrigger value="products">Product Catalog</TabsTrigger>
                        <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
                    </TabsList>
                    <TabsContent value="loans" className="mt-6">
                        {m.activeLoans.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed rounded-xl">
                                <CreditCard className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                                <h3 className="text-lg font-medium">No active loans</h3>
                                <p className="text-muted-foreground">When you have active loans, they will appear here.</p>
                            </div>
                        ) : (
                            m.activeLoans.map(loan => (
                                <Card key={loan.id} className="mb-4 !bg-transparent border-2">
                                    <CardContent className="pt-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div className="space-y-1 flex-1">
                                                <p className="font-bold text-lg">{loan.loanNumber}</p>
                                                <p className="text-sm text-muted-foreground">Due: {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : 'N/A'}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                        loan.status === "active" || loan.status === "disbursed"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                    }`}>
                                                        {loan.status.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-2">
                                                <p className="text-xl font-bold text-primary">KES {parseFloat(loan.outstandingBalance).toLocaleString()}</p>
                                                {loan.status === 'pending' && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={(e) => { e.stopPropagation(); cancelMutation.mutate(loan.id); }}
                                                        disabled={cancelMutation.isPending}
                                                    >
                                                        {cancelMutation.isPending ? "Cancelling..." : "Cancel Application"}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>
                    <TabsContent value="products" className="mt-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {products?.map(product => (
                                <Card key={product.id} className="!bg-transparent border-primary/20">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-lg">{product.name}</CardTitle>
                                            <ShoppingBag className="h-5 w-5 text-primary opacity-50" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-2xl font-bold text-primary">
                                                    KES {parseFloat(product.sellingPrice).toLocaleString()}
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    product.stockQuantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {product.stockQuantity} in stock
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Available for credit purchase. Apply for a loan to get this item.
                                            </p>
                                            <Button 
                                                variant="outline" 
                                                className="w-full mt-2"
                                                onClick={() => setShowLoanForm(true)}
                                                disabled={product.stockQuantity <= 0}
                                            >
                                                {product.stockQuantity > 0 ? "Apply for this Item" : "Out of Stock"}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="transactions" className="mt-6">
                        {m.recentTransactions.map(t => (
                            <div key={t.id} className="flex justify-between items-center p-4 border-b border-border">
                                <div>
                                    <p className="font-medium capitalize">{t.transactionType.replace(/_/g, ' ')}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.amount > 0 ? '+' : ''}KES {parseFloat(t.amount).toLocaleString()}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground uppercase">{t.status}</p>
                                </div>
                            </div>
                        ))}
                    </TabsContent>
                </Tabs>
            </div>
        </Layout>
    );
}
