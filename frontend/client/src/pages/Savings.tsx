
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MoreHorizontal, Download, Wallet, ArrowUpRight, ArrowDownLeft, CreditCard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useState } from "react";

interface SavingsAccount {
  id: number;
  memberId: number;
  accountNumber: string;
  balance: string;
  createdAt: string;
  member?: any;
}

interface Transaction {
  id: number;
  transactionId: string;
  memberId: number;
  accountType: string;
  transactionType: string;
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  reference?: string;
  createdAt: string;
  member?: any;
}

export default function Savings() {
  const { data: savingsAccounts = [], isLoading: savingsLoading } = useQuery({
    queryKey: ["savings-accounts"],
    queryFn: async () => {
      // Simulate savings account data - in real implementation you'd have an endpoint
      return [
        {
          id: 1,
          memberId: 1,
          accountNumber: "SAV-001234",
          balance: "25000.00",
          createdAt: "2024-01-15T10:30:00Z",
          member: { firstName: "John", lastName: "Doe", memberCode: "M001" }
        },
        {
          id: 2,
          memberId: 2,
          accountNumber: "SAV-001235",
          balance: "15000.50",
          createdAt: "2024-01-20T14:15:00Z",
          member: { firstName: "Jane", lastName: "Smith", memberCode: "M002" }
        },
        {
          id: 3,
          memberId: 3,
          accountNumber: "SAV-001236",
          balance: "8750.25",
          createdAt: "2024-02-01T09:45:00Z",
          member: { firstName: "Mike", lastName: "Johnson", memberCode: "M003" }
        }
      ];
    },
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["savings-transactions"],
    queryFn: async () => {
      // Simulate transactions data - in real implementation you'd have an endpoint
      return [
        {
          id: 1,
          transactionId: "TXN-2024-001",
          memberId: 1,
          accountType: "savings",
          transactionType: "deposit",
          amount: "5000.00",
          balanceBefore: "20000.00",
          balanceAfter: "25000.00",
          reference: "M-PESA DEPOSIT",
          createdAt: "2024-03-15T10:30:00Z",
          member: { firstName: "John", lastName: "Doe" }
        },
        {
          id: 2,
          transactionId: "TXN-2024-002",
          memberId: 1,
          accountType: "savings",
          transactionType: "withdrawal",
          amount: "2000.00",
          balanceBefore: "27000.00",
          balanceAfter: "25000.00",
          reference: "ATM WITHDRAWAL",
          createdAt: "2024-03-14T15:45:00Z",
          member: { firstName: "John", lastName: "Doe" }
        },
        {
          id: 3,
          transactionId: "TXN-2024-003",
          memberId: 2,
          accountType: "savings",
          transactionType: "deposit",
          amount: "3000.00",
          balanceBefore: "12000.50",
          balanceAfter: "15000.50",
          reference: "CASH DEPOSIT",
          createdAt: "2024-03-13T11:20:00Z",
          member: { firstName: "Jane", lastName: "Smith" }
        }
      ];
    },
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const { toast } = useToast();

  const [depositForm, setDepositForm] = useState({
    accountNumber: "",
    amount: "",
    reference: "",
  });

  const [withdrawForm, setWithdrawForm] = useState({
    accountNumber: "",
    amount: "",
    reference: "",
  });



  const filteredTransactions = transactions.filter((txn: Transaction) => {
    const matchesSearch = 
      txn.member?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.member?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.reference?.includes(searchTerm);
    
    const matchesType = typeFilter === "all" || !typeFilter || txn.transactionType === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // In real implementation, you'd call api.createTransaction
      toast({
        title: "Success",
        description: `Deposit of KES ${depositForm.amount} processed successfully`,
      });
      
      setIsDepositOpen(false);
      setDepositForm({
        accountNumber: "",
        amount: "",
        reference: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process deposit",
        variant: "destructive",
      });
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // In real implementation, you'd call api.createTransaction
      toast({
        title: "Success",
        description: `Withdrawal of KES ${withdrawForm.amount} processed successfully`,
      });
      
      setIsWithdrawOpen(false);
      setWithdrawForm({
        accountNumber: "",
        amount: "",
        reference: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process withdrawal",
        variant: "destructive",
      });
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'transfer':
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      default:
        return <Wallet className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return "text-green-600";
      case 'withdrawal':
        return "text-red-600";
      case 'transfer':
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const totalSavings = savingsAccounts.reduce((sum: number, account: SavingsAccount) => 
    sum + parseFloat(account.balance), 0);

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">Savings Accounts</h1>
              <p className="text-muted-foreground mt-1">Manage member savings and transactions.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
              <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <ArrowDownLeft className="mr-2 h-4 w-4" /> Deposit
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Make Deposit</DialogTitle>
                    <DialogDescription>
                      Add funds to a member's savings account.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleDeposit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="depositAccount">Account Number</Label>
                      <Select value={depositForm.accountNumber} onValueChange={(value) => setDepositForm({ ...depositForm, accountNumber: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {savingsAccounts.map((account: SavingsAccount) => (
                            <SelectItem key={account.id} value={account.accountNumber}>
                              {account.accountNumber} - {account.member?.firstName} {account.member?.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="depositAmount">Amount (KES)</Label>
                      <Input
                        id="depositAmount"
                        type="number"
                        step="0.01"
                        value={depositForm.amount}
                        onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="depositReference">Reference</Label>
                      <Input
                        id="depositReference"
                        value={depositForm.reference}
                        onChange={(e) => setDepositForm({ ...depositForm, reference: e.target.value })}
                        placeholder="M-PESA, Cash, etc."
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit">Process Deposit</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <ArrowUpRight className="mr-2 h-4 w-4" /> Withdraw
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Process Withdrawal</DialogTitle>
                    <DialogDescription>
                      Withdraw funds from a member's savings account.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleWithdraw} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="withdrawAccount">Account Number</Label>
                      <Select value={withdrawForm.accountNumber} onValueChange={(value) => setWithdrawForm({ ...withdrawForm, accountNumber: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {savingsAccounts.map((account: SavingsAccount) => (
                            <SelectItem key={account.id} value={account.accountNumber}>
                              {account.accountNumber} - {account.member?.firstName} {account.member?.lastName} (KES {parseFloat(account.balance).toLocaleString()})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="withdrawAmount">Amount (KES)</Label>
                      <Input
                        id="withdrawAmount"
                        type="number"
                        step="0.01"
                        value={withdrawForm.amount}
                        onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="withdrawReference">Reference</Label>
                      <Input
                        id="withdrawReference"
                        value={withdrawForm.reference}
                        onChange={(e) => setWithdrawForm({ ...withdrawForm, reference: e.target.value })}
                        placeholder="ATM, Cash, etc."
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit">Process Withdrawal</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border/50 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, account number, or transaction ID..." 
                className="pl-9 bg-background" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
                <SelectItem value="transfer">Transfers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KES {totalSavings.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{savingsAccounts.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Deposits</CardTitle>
                <ArrowDownLeft className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {transactions.filter((t: Transaction) => 
                    t.transactionType === 'deposit' && 
                    new Date(t.createdAt).toDateString() === new Date().toDateString()
                  ).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Withdrawals</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {transactions.filter((t: Transaction) => 
                    t.transactionType === 'withdrawal' && 
                    new Date(t.createdAt).toDateString() === new Date().toDateString()
                  ).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Savings Accounts Table */}
          <div className="rounded-md border border-border bg-card">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Savings Accounts</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Number</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {savingsAccounts.map((account: SavingsAccount) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.accountNumber}</TableCell>
                    <TableCell>
                      {account.member?.firstName} {account.member?.lastName}
                      <div className="text-sm text-muted-foreground">{account.member?.memberCode}</div>
                    </TableCell>
                    <TableCell className="font-mono">KES {parseFloat(account.balance).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="default">Active</Badge>
                    </TableCell>
                    <TableCell>{new Date(account.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View account</DropdownMenuItem>
                          <DropdownMenuItem>View transactions</DropdownMenuItem>
                          <DropdownMenuItem>Transfer funds</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">Freeze account</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Recent Transactions */}
          <div className="rounded-md border border-border bg-card">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Balance After</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.slice(0, 10).map((transaction: Transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-sm">{transaction.transactionId}</TableCell>
                    <TableCell>
                      {transaction.member?.firstName} {transaction.member?.lastName}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(transaction.transactionType)}
                        <span className="capitalize">{transaction.transactionType}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={getTransactionColor(transaction.transactionType)}>
                        {transaction.transactionType === 'deposit' ? '+' : '-'}KES {parseFloat(transaction.amount).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono">KES {parseFloat(transaction.balanceAfter).toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{transaction.reference}</TableCell>
                    <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}
