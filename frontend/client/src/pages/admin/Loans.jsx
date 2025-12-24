import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, MoreHorizontal, FileText, CheckCircle, XCircle, Clock, CreditCard } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { CreateLoanDialog } from "@/components/ui/CreateLoanDialog";
export default function Loans() {
    var _a = useQuery({
        queryKey: ["loans"],
        queryFn: function () { return api.getLoans(); },
    }), _b = _a.data, loans = _b === void 0 ? [] : _b, isLoading = _a.isLoading;
    var getStatusIcon = function (status) {
        switch (status) {
            case "active": return <Clock className="mr-1 h-3 w-3"/>;
            case "pending": return <FileText className="mr-1 h-3 w-3"/>;
            case "defaulted": return <XCircle className="mr-1 h-3 w-3"/>;
            case "completed": return <CheckCircle className="mr-1 h-3 w-3"/>;
            default: return null;
        }
    };
    var getStatusStyle = function (status) {
        switch (status) {
            case "active": return "bg-primary/10 text-blue-700 border-primary/30";
            case "pending": return "bg-accent/10 text-yellow-700 border-accent/30";
            case "approved": return "bg-green-50 text-green-700 border-green-200";
            case "disbursed": return "bg-purple-50 text-purple-700 border-purple-200";
            case "completed": return "bg-green-50 text-green-700 border-green-200";
            case "defaulted": return "bg-destructive/10 text-red-700 border-destructive/30";
            default: return "bg-background text-foreground border-border";
        }
    };
    return (<Layout>
        <div className="p-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">Loans</h1>
              <p className="text-muted-foreground mt-1">Manage loan applications and active portfolio.</p>
            </div>
            <CreateLoanDialog />
          </div>

          <div className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border/50 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
              <Input placeholder="Search loans..." className="pl-9 bg-background" data-testid="input-search-loans"/>
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4"/> Filter
            </Button>
          </div>

          {isLoading ? (<div className="text-center py-12">Loading loans...</div>) : loans.length === 0 ? (<Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CreditCard className="h-12 w-12 text-muted-foreground mb-4"/>
                <h3 className="text-lg font-semibold mb-2">No loans yet</h3>
                <p className="text-muted-foreground text-center mb-4">Create a new loan application to get started.</p>
                <CreateLoanDialog />
              </CardContent>
            </Card>) : (<div className="rounded-md border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loan Number</TableHead>
                    <TableHead>Member ID</TableHead>
                    <TableHead className="text-right">Principal</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map(function (loan) { return (<TableRow key={loan.id} data-testid={"row-loan-".concat(loan.id)}>
                      <TableCell className="font-medium">{loan.loanNumber}</TableCell>
                      <TableCell>{loan.memberId}</TableCell>
                      <TableCell className="text-right font-mono">
                        KES {parseFloat(loan.principalAmount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        KES {parseFloat(loan.totalAmount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-primary">
                        KES {parseFloat(loan.outstandingBalance).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusStyle(loan.status)}>
                          {getStatusIcon(loan.status)}
                          {loan.status}
                        </Badge>
                      </TableCell>
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
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Repayment Schedule</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {loan.status === "pending" && (<>
                                <DropdownMenuItem className="text-secondary">Approve Loan</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">Reject Loan</DropdownMenuItem>
                              </>)}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>); })}
                </TableBody>
              </Table>
            </div>)}
        </div>
    </Layout>);
}
