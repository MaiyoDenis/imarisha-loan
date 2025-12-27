import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading";
import { AlertCircle, ChevronLeft, DollarSign, TrendingUp, CreditCard, PiggyBank, Phone, Code, Percent, Calendar, } from "lucide-react";
import { ApplyLoanForm } from "@/components/field-officer/ApplyLoanForm";
import { TransferFundsForm } from "@/components/field-officer/TransferFundsForm";
import { DepositForm } from "@/components/field-officer/DepositForm";
import { RepaymentForm } from "@/components/field-officer/RepaymentForm";
import { LoanSchedule } from "@/components/field-officer/LoanSchedule";
import Layout from "@/components/layout/Layout";
import KPICard from "@/components/dashboards/KPICard";
export function MemberDashboardPage() {
    var _a = useLocation(), setLocation = _a[1];
    var _b = useRoute("/field-officer/members/:memberId"), params = _b[1];
    var _c = useState(false), showLoanForm = _c[0], setShowLoanForm = _c[1];
    var _d = useState(false), showTransferForm = _d[0], setShowTransferForm = _d[1];
    var _e = useState(false), showDepositForm = _e[0], setShowDepositForm = _e[1];
    var _f = useState(null), depositAccountType = _f[0], setDepositAccountType = _f[1];
    var [showRepaymentForm, setShowRepaymentForm] = useState(false);
    var [showSchedule, setShowSchedule] = useState(false);
    var [selectedLoanId, setSelectedLoanId] = useState(null);
    var memberId = (params === null || params === void 0 ? void 0 : params.memberId) ? parseInt(params.memberId) : null;
    var _g = useQuery({
        queryKey: ["memberDashboard", memberId],
        queryFn: function () { return (memberId ? api.getMemberDashboard(memberId) : Promise.reject("No member ID")); },
        enabled: !!memberId,
    }), member = _g.data, isLoading = _g.isLoading, error = _g.error, refetch = _g.refetch;
    if (isLoading)
        return <Layout><LoadingSpinner /></Layout>;
    if (!memberId) {
        return (<Layout>
        <div className="text-center">
          <p className="text-destructive">Invalid member ID</p>
        </div>
      </Layout>);
    }
    if (!member) {
        return <Layout><LoadingSpinner /></Layout>;
    }
    var m = member;
    return (<Layout>
      <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Button variant="ghost" size="icon" onClick={function () { return setLocation("/field-officer"); }} className="hover:bg-gray-100">
            <ChevronLeft className="h-5 w-5"/>
          </Button>
          <div className="space-y-1 flex-1">
            <h1 className="text-4xl font-bold tracking-tight">
              {m.user.firstName} {m.user.lastName}
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
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4"/>
                <span>{m.user.phone}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={function () { return setShowLoanForm(!showLoanForm); }} className="gap-2 bg-primary hover:bg-primary/80" size="lg">
            <CreditCard className="h-5 w-5"/>
            {showLoanForm ? "Cancel" : "Apply Loan"}
          </Button>
          <Button onClick={function () { return setShowTransferForm(!showTransferForm); }} className="gap-2" variant="outline" size="lg">
            <TrendingUp className="h-5 w-5"/>
            {showTransferForm ? "Cancel" : "Transfer"}
          </Button>
        </div>
      </div>

      {error && (<div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-4 text-red-800">
          <AlertCircle className="h-5 w-5"/>
          <span>{error.message}</span>
        </div>)}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard className="!bg-transparent" title="Max Loan Limit" value={new Intl.NumberFormat('en-KE').format(m.maxLoanLimit)} unit="KES" icon={<CreditCard size={24}/>} status="normal"/>

        <KPICard className="!bg-transparent" title="Available Loan" value={new Intl.NumberFormat('en-KE').format(m.availableLoan)} unit="KES" icon={<DollarSign size={24}/>} status="success"/>

        <KPICard className="!bg-transparent" title="Outstanding Balance" value={new Intl.NumberFormat('en-KE').format(m.totalOutstanding)} unit="KES" icon={<TrendingUp size={24}/>} status="warning"/>

        <KPICard className="!bg-transparent" title="Repayment Rate" value={m.repaymentRate} unit="%" icon={<Percent size={24}/>} status={parseFloat(m.repaymentRate) >= 90 ? 'success' : parseFloat(m.repaymentRate) >= 70 ? 'warning' : 'critical'}/>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2 !bg-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-secondary"/>
                Savings Account
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-transparent p-4 rounded-lg border border-gray-200/20">
              <p className="text-xs text-muted-foreground mb-1">Current Balance</p>
              <p className="text-3xl font-bold text-secondary">
                KES {new Intl.NumberFormat('en-KE').format(parseFloat(m.savingsBalance))}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={function () {
            setDepositAccountType("savings");
            setShowDepositForm(true);
        }} className="flex-1">
                <DollarSign className="h-4 w-4 mr-2"/>
                Deposit
              </Button>
              <Button onClick={function () { return setShowTransferForm(true); }} variant="outline" className="flex-1">
                Transfer
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 !bg-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary"/>
                Drawdown Account
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-transparent p-4 rounded-lg border border-gray-200/20">
              <p className="text-xs text-muted-foreground mb-1">Current Balance</p>
              <p className="text-3xl font-bold text-primary">
                KES {new Intl.NumberFormat('en-KE').format(parseFloat(m.drawdownBalance))}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={function () {
            setDepositAccountType("drawdown");
            setShowDepositForm(true);
        }} className="flex-1 bg-primary hover:bg-primary/80">
                <DollarSign className="h-4 w-4 mr-2"/>
                Deposit
              </Button>
              <Button onClick={function () { return setShowLoanForm(true); }} variant="outline" className="flex-1">
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {showLoanForm && (<Card className="border-blue-300 !bg-transparent">
          <CardHeader>
            <CardTitle>Apply for New Loan</CardTitle>
          </CardHeader>
          <CardContent>
            <ApplyLoanForm memberId={memberId} onSuccess={function () {
                setShowLoanForm(false);
                refetch();
            }}/>
          </CardContent>
        </Card>)}

      {showTransferForm && (<Card className="border-green-300 !bg-transparent">
          <CardHeader>
            <CardTitle>Transfer Funds Between Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <TransferFundsForm memberId={memberId} onSuccess={function () {
                setShowTransferForm(false);
                refetch();
            }}/>
          </CardContent>
        </Card>)}

      {showDepositForm && (<Card className="border-secondary/50 !bg-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Record Deposit</CardTitle>
              <CardDescription>
                Deposit to {depositAccountType === "savings" ? "Savings" : "Drawdown"} Account
              </CardDescription>
            </div>
            <Button variant="ghost" onClick={function () { return setShowDepositForm(false); }} className="text-muted-foreground hover:text-foreground">
              ✕
            </Button>
          </CardHeader>
          <CardContent>
            <DepositForm memberId={memberId} defaultAccountType={depositAccountType || "savings"} onSuccess={function () {
                setShowDepositForm(false);
                refetch();
            }}/>
          </CardContent>
        </Card>)}

      {showRepaymentForm && (
          <Card className="border-secondary/50 !bg-transparent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                      <CardTitle>Loan Repayment</CardTitle>
                      <CardDescription>
                          Make a payment towards this loan
                      </CardDescription>
                  </div>
                  <Button variant="ghost" onClick={() => setShowRepaymentForm(false)}>✕</Button>
              </CardHeader>
              <CardContent>
                  <RepaymentForm 
                      memberId={memberId} 
                      loanId={selectedLoanId}
                      onSuccess={() => {
                          setShowRepaymentForm(false);
                          refetch();
                      }}
                  />
              </CardContent>
          </Card>
      )}

      {showSchedule && (
          <Card className="border-primary/50 !bg-transparent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                      <CardTitle>Repayment Schedule</CardTitle>
                      <CardDescription>
                          Monthly installment plan
                      </CardDescription>
                  </div>
                  <Button variant="ghost" onClick={() => setShowSchedule(false)}>✕</Button>
              </CardHeader>
              <CardContent>
                  <LoanSchedule loanId={selectedLoanId} />
              </CardContent>
          </Card>
      )}

      <Tabs defaultValue="loans" className="w-full">
        <TabsList className="bg-transparent p-1 rounded-lg border border-gray-200/20">
          <TabsTrigger value="loans" className="data-[state=active]:bg-[#3E2723] data-[state=active]:text-white data-[state=active]:border-[#FFD700] data-[state=active]:border">
            Active Loans ({m.activeLoans.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-[#3E2723] data-[state=active]:text-white data-[state=active]:border-[#FFD700] data-[state=active]:border">
            Loan History
          </TabsTrigger>
          <TabsTrigger value="transactions" className="data-[state=active]:bg-[#3E2723] data-[state=active]:text-white data-[state=active]:border-[#FFD700] data-[state=active]:border">
            Recent Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="loans" className="space-y-4 mt-6">
          {m.activeLoans.length === 0 ? (<Card className="border-dashed !bg-transparent">
              <CardContent className="pt-6 text-center">
                <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-2"/>
                <p className="text-muted-foreground">No active loans</p>
              </CardContent>
            </Card>) : (m.activeLoans.map(function (loan) { return (<Card key={loan.id} className="hover:shadow-md transition-shadow border-2 !bg-transparent">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <p className="font-semibold text-lg">{loan.loanNumber}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className={"px-2 py-1 rounded-full text-xs font-semibold ".concat(loan.status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700")}>
                          {loan.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 sm:text-right">
                      <div className="bg-transparent p-3 rounded-lg border border-gray-200/20 sm:p-0 sm:border-0">
                        <p className="text-xs text-muted-foreground mb-1">Principal</p>
                        <p className="font-bold text-lg">
                          KES {new Intl.NumberFormat('en-KE').format(parseFloat(loan.principleAmount))}
                        </p>
                      </div>
                      <div className="bg-transparent p-3 rounded-lg border border-gray-200/20 sm:p-0 sm:border-0">
                        <p className="text-xs text-muted-foreground mb-1">Outstanding</p>
                        <p className="font-bold text-lg text-orange-600">
                          KES {new Intl.NumberFormat('en-KE').format(parseFloat(loan.outstandingBalance))}
                        </p>
                      </div>
                      <div className="bg-transparent p-3 rounded-lg border border-gray-200/20 sm:p-0 sm:border-0">
                        <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                        <p className="font-bold text-lg text-purple-600">
                          {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t flex justify-end gap-2">
                      {(loan.status === "active" || loan.status === "disbursed" || loan.status === "approved") && (
                          <>
                              <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 text-xs border-primary/30 hover:bg-primary/5"
                                  onClick={() => {
                                      setSelectedLoanId(loan.id);
                                      setShowSchedule(true);
                                  }}
                              >
                                  Schedule
                              </Button>
                              <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  className="h-8 text-xs font-bold"
                                  onClick={() => {
                                      setSelectedLoanId(loan.id);
                                      setShowRepaymentForm(true);
                                  }}
                              >
                                  Pay Loan
                              </Button>
                          </>
                      )}
                  </div>
                </CardContent>
              </Card>); }))}
        </TabsContent>

        <TabsContent value="history" className="mt-6 space-y-4">
          <Card className="border-2 !bg-transparent">
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-transparent p-6 rounded-lg border border-primary/30">
                  <p className="text-xs text-muted-foreground mb-2">Total Borrowed</p>
                  <p className="text-3xl font-bold text-primary">
                    KES {new Intl.NumberFormat('en-KE').format(parseFloat(m.totalBorrowed))}
                  </p>
                </div>
                <div className="bg-transparent p-6 rounded-lg border border-green-200">
                  <p className="text-xs text-muted-foreground mb-2">Total Repaid</p>
                  <p className="text-3xl font-bold text-secondary">
                    KES {new Intl.NumberFormat('en-KE').format(parseFloat(m.totalRepaid))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {m.loanHistory && m.loanHistory.length > 0 ? (
            m.loanHistory.map(function (loan) {
              return (
                <Card key={loan.id} className="hover:shadow-md transition-shadow border-2 !bg-transparent">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <p className="font-semibold text-lg">{loan.loanNumber}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className={"px-2 py-1 rounded-full text-xs font-semibold ".concat(
                            loan.status === "active" || loan.status === "disbursed"
                              ? "bg-green-100 text-green-700"
                              : loan.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                          )}>
                            {loan.status.toUpperCase()}
                          </span>
                          <span>Applied: {new Date(loan.applicationDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          KES {new Intl.NumberFormat('en-KE').format(parseFloat(loan.principleAmount))}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="border-dashed !bg-transparent">
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">No loan history available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4 mt-6">
          {m.recentTransactions.length === 0 ? (<Card className="border-dashed !bg-transparent">
              <CardContent className="pt-6 text-center">
                <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-2"/>
                <p className="text-muted-foreground">No recent transactions</p>
              </CardContent>
            </Card>) : (m.recentTransactions.map(function (transaction) { return (<Card key={transaction.id} className="hover:shadow-md transition-shadow border-2 !bg-transparent">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <p className="font-semibold">{transaction.transactionId}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {transaction.transactionType.replace(/_/g, " ")}
                      </p>
                    </div>

                    <div className="flex items-start justify-between sm:justify-end gap-6">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-secondary">
                          +KES {new Intl.NumberFormat('en-KE').format(parseFloat(transaction.amount))}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center justify-end gap-1">
                          <Calendar className="h-3 w-3"/>
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>); }))}
        </TabsContent>
      </Tabs>
      </div>
    </Layout>);
}
