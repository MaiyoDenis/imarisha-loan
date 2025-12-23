import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading";
import {
  AlertCircle,
  ChevronLeft,
  DollarSign,
  TrendingUp,
  CreditCard,
  PiggyBank,
  Phone,
  Code,
  Percent,
  Calendar,
} from "lucide-react";
import { ApplyLoanForm } from "@/components/field-officer/ApplyLoanForm";
import { TransferFundsForm } from "@/components/field-officer/TransferFundsForm";
import Layout from "@/components/layout/Layout";
import KPICard from "@/components/dashboards/KPICard";

export function MemberDashboardPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/field-officer/members/:memberId");
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);

  const memberId = params?.memberId ? parseInt(params.memberId) : null;

  const { data: member, isLoading, error, refetch } = useQuery({
    queryKey: ["memberDashboard", memberId],
    queryFn: () => (memberId ? api.getMemberDashboard(memberId) : Promise.reject("No member ID")),
    enabled: !!memberId,
  });

  if (isLoading) return <Layout><LoadingSpinner /></Layout>;

  if (!memberId) {
    return (
      <Layout>
        <div className="text-center">
          <p className="text-destructive">Invalid member ID</p>
        </div>
      </Layout>
    );
  }

  if (!member) {
    return <Layout><LoadingSpinner /></Layout>;
  }

  const m = member;

  return (
    <Layout>
      <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/field-officer")}
            className="hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1 flex-1">
            <h1 className="text-4xl font-bold tracking-tight">
              {m.user.firstName} {m.user.lastName}
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <Code className="h-4 w-4" />
                <span>{m.memberCode}</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <span>{m.user.phone}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowLoanForm(!showLoanForm)}
            className="gap-2 bg-primary hover:bg-primary/80"
            size="lg"
          >
            <CreditCard className="h-5 w-5" />
            {showLoanForm ? "Cancel" : "Apply Loan"}
          </Button>
          <Button
            onClick={() => setShowTransferForm(!showTransferForm)}
            className="gap-2"
            variant="outline"
            size="lg"
          >
            <TrendingUp className="h-5 w-5" />
            {showTransferForm ? "Cancel" : "Transfer"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-4 text-red-800">
          <AlertCircle className="h-5 w-5" />
          <span>{error.message}</span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Max Loan Limit"
          value={new Intl.NumberFormat('en-KE').format(m.maxLoanLimit)}
          unit="KES"
          icon={<CreditCard size={24} />}
          status="normal"
        />

        <KPICard
          title="Available Loan"
          value={new Intl.NumberFormat('en-KE').format(m.availableLoan)}
          unit="KES"
          icon={<DollarSign size={24} />}
          status="success"
        />

        <KPICard
          title="Outstanding Balance"
          value={new Intl.NumberFormat('en-KE').format(m.totalOutstanding)}
          unit="KES"
          icon={<TrendingUp size={24} />}
          status="warning"
        />

        <KPICard
          title="Repayment Rate"
          value={m.repaymentRate}
          unit="%"
          icon={<Percent size={24} />}
          status={parseFloat(m.repaymentRate) >= 90 ? 'success' : parseFloat(m.repaymentRate) >= 70 ? 'warning' : 'critical'}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-secondary" />
                Savings Account
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Current Balance</p>
              <p className="text-3xl font-bold text-secondary">
                KES {new Intl.NumberFormat('en-KE').format(parseFloat(m.savingsBalance))}
              </p>
            </div>
            <Button
              onClick={() => setShowTransferForm(true)}
              variant="outline"
              className="w-full"
            >
              Add to Savings
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Drawdown Account
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-primary/10 p-4 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Current Balance</p>
              <p className="text-3xl font-bold text-primary">
                KES {new Intl.NumberFormat('en-KE').format(parseFloat(m.drawdownBalance))}
              </p>
            </div>
            <Button
              onClick={() => setShowLoanForm(true)}
              className="w-full bg-primary hover:bg-primary/80"
            >
              Withdraw Funds
            </Button>
          </CardContent>
        </Card>
      </div>

      {showLoanForm && (
        <Card className="border-blue-300 bg-primary/10">
          <CardHeader>
            <CardTitle>Apply for New Loan</CardTitle>
          </CardHeader>
          <CardContent>
            <ApplyLoanForm
              memberId={memberId}
              onSuccess={() => {
                setShowLoanForm(false);
                refetch();
              }}
            />
          </CardContent>
        </Card>
      )}

      {showTransferForm && (
        <Card className="border-green-300 bg-green-50">
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

      <Tabs defaultValue="loans" className="w-full">
        <TabsList className="bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="loans" className="data-[state=active]:bg-card">
            Active Loans ({m.activeLoans.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-card">
            Loan History
          </TabsTrigger>
          <TabsTrigger value="transactions" className="data-[state=active]:bg-card">
            Recent Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="loans" className="space-y-4 mt-6">
          {m.activeLoans.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-muted-foreground">No active loans</p>
              </CardContent>
            </Card>
          ) : (
            m.activeLoans.map((loan) => (
              <Card
                key={loan.id}
                className="hover:shadow-md transition-shadow border-2"
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <p className="font-semibold text-lg">{loan.loanNumber}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            loan.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {loan.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 sm:text-right">
                      <div className="bg-primary/10 p-3 rounded-lg sm:bg-transparent sm:p-0">
                        <p className="text-xs text-muted-foreground mb-1">Principal</p>
                        <p className="font-bold text-lg">
                          KES {new Intl.NumberFormat('en-KE').format(parseFloat(loan.principleAmount))}
                        </p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg sm:bg-transparent sm:p-0">
                        <p className="text-xs text-muted-foreground mb-1">Outstanding</p>
                        <p className="font-bold text-lg text-orange-600">
                          KES {new Intl.NumberFormat('en-KE').format(parseFloat(loan.outstandingBalance))}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg sm:bg-transparent sm:p-0">
                        <p className="text-xs text-muted-foreground mb-1">Due In</p>
                        <p className="font-bold text-lg text-purple-600">
                          {loan.daysUntilDue !== undefined
                            ? Math.max(0, loan.daysUntilDue)
                            : "-"}{" "}
                          days
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card className="border-2">
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary/10 p-6 rounded-lg border border-primary/30">
                  <p className="text-xs text-muted-foreground mb-2">Total Borrowed</p>
                  <p className="text-3xl font-bold text-primary">
                    KES {new Intl.NumberFormat('en-KE').format(parseFloat(m.totalBorrowed))}
                  </p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <p className="text-xs text-muted-foreground mb-2">Total Repaid</p>
                  <p className="text-3xl font-bold text-secondary">
                    KES {new Intl.NumberFormat('en-KE').format(parseFloat(m.totalRepaid))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4 mt-6">
          {m.recentTransactions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-muted-foreground">No recent transactions</p>
              </CardContent>
            </Card>
          ) : (
            m.recentTransactions.map((transaction) => (
              <Card
                key={transaction.id}
                className="hover:shadow-md transition-shadow border-2"
              >
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
                          <Calendar className="h-3 w-3" />
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
      </div>
    </Layout>
  );
}
