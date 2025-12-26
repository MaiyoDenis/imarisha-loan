import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MoreHorizontal, Download, Wallet, ArrowUpRight, ArrowDownLeft, CreditCard, PlusCircle, MinusCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import KPICard from "@/components/dashboards/KPICard";

export default function Savings() {
    const queryClient = useQueryClient();
    const { data: savingsAccounts = [], isLoading: savingsLoading } = useQuery({
        queryKey: ["savings-accounts"],
        queryFn: async () => {
            const data = await api.getSavingsAccounts();
            return data;
        },
    });

    const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
        queryKey: ["savings-transactions"],
        queryFn: async () => {
            const data = await api.getTransactions(undefined, 'savings');
            return data;
        },
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
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

    const filteredTransactions = transactions.filter((txn) => {
        const matchesSearch =
            txn.member?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            txn.member?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            txn.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            txn.reference?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = typeFilter === "all" || !typeFilter || txn.transactionType === typeFilter;
        return matchesSearch && matchesType;
    });

    const filteredAccounts = savingsAccounts.filter((acc) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            acc.accountNumber?.toLowerCase().includes(searchLower) ||
            acc.member?.firstName?.toLowerCase().includes(searchLower) ||
            acc.member?.lastName?.toLowerCase().includes(searchLower) ||
            acc.member?.memberCode?.toLowerCase().includes(searchLower)
        );
    });

    const handleDeposit = async (e) => {
        e.preventDefault();
        try {
            const selectedAccount = savingsAccounts.find((acc) => acc.accountNumber === depositForm.accountNumber);
            if (!selectedAccount) {
                throw new Error("Please select an account");
            }

            await api.createTransaction({
                memberId: selectedAccount.memberId,
                accountType: 'savings',
                transactionType: 'deposit',
                amount: depositForm.amount,
                reference: depositForm.reference || 'Manual Deposit',
                mpesaCode: depositForm.reference // Using reference as mpesa code for manual entry
            });

            queryClient.invalidateQueries({ queryKey: ["savings-accounts"] });
            queryClient.invalidateQueries({ queryKey: ["savings-transactions"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });

            toast({
                title: "Success",
                description: `Deposit of KES ${depositForm.amount} processed successfully`,
            });
            setIsDepositOpen(false);
            setDepositForm({ accountNumber: "", amount: "", reference: "" });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to process deposit",
                variant: "destructive",
            });
        }
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();
        try {
            const selectedAccount = savingsAccounts.find((acc) => acc.accountNumber === withdrawForm.accountNumber);
            if (!selectedAccount) {
                throw new Error("Please select an account");
            }

            await api.createTransaction({
                memberId: selectedAccount.memberId,
                accountType: 'savings',
                transactionType: 'withdrawal',
                amount: withdrawForm.amount,
                reference: withdrawForm.reference || 'Manual Withdrawal',
            });

            queryClient.invalidateQueries({ queryKey: ["savings-accounts"] });
            queryClient.invalidateQueries({ queryKey: ["savings-transactions"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });

            toast({
                title: "Success",
                description: `Withdrawal of KES ${withdrawForm.amount} processed successfully`,
            });
            setIsWithdrawOpen(false);
            setWithdrawForm({ accountNumber: "", amount: "", reference: "" });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to process withdrawal",
                variant: "destructive",
            });
        }
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'deposit':
                return <PlusCircle className="h-4 w-4 text-emerald-500"/>;
            case 'withdrawal':
                return <MinusCircle className="h-4 w-4 text-rose-500"/>;
            case 'transfer':
                return <CreditCard className="h-4 w-4 text-primary"/>;
            default:
                return <Wallet className="h-4 w-4 text-muted-foreground"/>;
        }
    };

    const getTransactionColor = (type) => {
        switch (type) {
            case 'deposit':
                return "text-emerald-600 font-semibold";
            case 'withdrawal':
                return "text-rose-600 font-semibold";
            case 'transfer':
                return "text-primary font-semibold";
            default:
                return "text-muted-foreground";
        }
    };

    const totalSavings = savingsAccounts.reduce((sum, account) => {
        return sum + parseFloat(account.balance);
    }, 0);

    const activeAccounts = savingsAccounts.length;
    
    const todayDeposits = transactions.filter(t => 
        t.transactionType === 'deposit' && 
        new Date(t.createdAt).toDateString() === new Date().toDateString()
    ).length;
    
    const todayWithdrawals = transactions.filter(t => 
        t.transactionType === 'withdrawal' && 
        new Date(t.createdAt).toDateString() === new Date().toDateString()
    ).length;

    return (
        <Layout>
            <div className="p-8 space-y-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">Savings Accounts</h1>
                        <p className="text-muted-foreground mt-1">Manage member savings and transactions.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4"/> Export
                        </Button>
                        <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-emerald-600 hover:bg-emerald-700">
                                    <PlusCircle className="mr-2 h-4 w-4"/> Deposit
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
                                                <SelectValue placeholder="Select account"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {savingsAccounts.map((account) => (
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
                                <Button variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800">
                                    <MinusCircle className="mr-2 h-4 w-4"/> Withdraw
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
                                                <SelectValue placeholder="Select account"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {savingsAccounts.map((account) => (
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
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                        <Input 
                            placeholder="Search by name, account number, or transaction ID..." 
                            className="pl-9 bg-background" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-48">
                            <Filter className="h-4 w-4 mr-2"/>
                            <SelectValue placeholder="Filter by type"/>
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
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    <KPICard 
                        title="Total Savings" 
                        value={totalSavings} 
                        unit="KES"
                        icon={<Wallet className="h-4 w-4" />} 
                    />
                    <KPICard 
                        title="Active Accounts" 
                        value={activeAccounts} 
                        icon={<CreditCard className="h-4 w-4" />} 
                    />
                    <KPICard 
                        title="Today's Deposits" 
                        value={todayDeposits} 
                        icon={<ArrowDownLeft className="h-4 w-4" />} 
                        status="success"
                    />
                    <KPICard 
                        title="Today's Withdrawals" 
                        value={todayWithdrawals} 
                        icon={<ArrowUpRight className="h-4 w-4" />} 
                        status="critical"
                    />
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
                            {filteredAccounts.map((account) => (
                                <TableRow key={account.id}>
                                    <TableCell className="font-medium">{account.accountNumber}</TableCell>
                                    <TableCell>
                                        {account.member?.firstName} {account.member?.lastName}
                                        <div className="text-sm text-muted-foreground">{account.member?.memberCode}</div>
                                    </TableCell>
                                    <TableCell className="font-mono">KES {parseFloat(account.balance).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={account.member?.status === 'active' ? 'default' : account.member?.status === 'blocked' ? 'destructive' : 'outline'}>
                                            {account.member?.status || 'Active'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(account.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4"/>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => {
                                                    setDepositForm({ ...depositForm, accountNumber: account.accountNumber });
                                                    setIsDepositOpen(true);
                                                }}>
                                                    <PlusCircle className="mr-2 h-4 w-4 text-emerald-600"/> Deposit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => {
                                                    setWithdrawForm({ ...withdrawForm, accountNumber: account.accountNumber });
                                                    setIsWithdrawOpen(true);
                                                }}>
                                                    <MinusCircle className="mr-2 h-4 w-4 text-rose-600"/> Withdraw
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>View account</DropdownMenuItem>
                                                <DropdownMenuItem>View transactions</DropdownMenuItem>
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
                            {filteredTransactions.slice(0, 10).map((transaction) => (
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
        </Layout>
    );
}
