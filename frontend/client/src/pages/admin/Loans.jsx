import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, MoreHorizontal, FileText, CheckCircle, XCircle, Clock, CreditCard, Calendar, User, Info } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { CreateLoanDialog } from "@/components/ui/CreateLoanDialog";
import { format } from "date-fns";
export default function Loans() {
    var [selectedLoan, setSelectedLoan] = useState(null);
    var [isDetailsOpen, setIsDetailsOpen] = useState(false);
    var [isScheduleOpen, setIsScheduleOpen] = useState(false);
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
                        KES {parseFloat(loan.principleAmount).toLocaleString()}
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
                            <DropdownMenuItem onClick={function () {
                                setSelectedLoan(loan);
                                setIsDetailsOpen(true);
                            }}>
                              <Info className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={function () {
                                setSelectedLoan(loan);
                                setIsScheduleOpen(true);
                            }}>
                              <Calendar className="mr-2 h-4 w-4" /> Repayment Schedule
                            </DropdownMenuItem>
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

          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Loan Details - {selectedLoan?.loanNumber}</DialogTitle>
                <DialogDescription>
                  Detailed information about the loan application and status.
                </DialogDescription>
              </DialogHeader>
              {selectedLoan && (
                <div className="grid grid-cols-2 gap-6 py-4">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Member Information</p>
                      <div className="mt-1 flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <p className="font-semibold">{selectedLoan.member?.name || 'N/A'}</p>
                      </div>
                      <p className="text-xs text-muted-foreground ml-6">Code: {selectedLoan.member?.memberCode || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Loan Type</p>
                      <p className="font-semibold">{selectedLoan.loanType?.name || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">{selectedLoan.loanType?.interestRate}% {selectedLoan.loanType?.interestType} interest</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge variant="outline" className={getStatusStyle(selectedLoan.status) + " mt-1"}>
                        {selectedLoan.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
                      <p className="text-sm font-medium text-muted-foreground">Financial Summary</p>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Principal:</span>
                          <span className="font-mono">KES {parseFloat(selectedLoan.principleAmount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Interest:</span>
                          <span className="font-mono text-muted-foreground">KES {parseFloat(selectedLoan.interestAmount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t border-border pt-1 font-bold">
                          <span>Total:</span>
                          <span className="font-mono">KES {parseFloat(selectedLoan.totalAmount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-primary font-bold">
                          <span>Outstanding:</span>
                          <span className="font-mono">KES {parseFloat(selectedLoan.outstandingBalance).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs space-y-1">
                      <p><span className="text-muted-foreground">Applied:</span> {format(new Date(selectedLoan.applicationDate), 'PPP')}</p>
                      {selectedLoan.approvalDate && <p><span className="text-muted-foreground">Approved:</span> {format(new Date(selectedLoan.approvalDate), 'PPP')}</p>}
                      {selectedLoan.dueDate && <p><span className="text-muted-foreground">Due Date:</span> {format(new Date(selectedLoan.dueDate), 'PPP')}</p>}
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Repayment Schedule - {selectedLoan?.loanNumber}</DialogTitle>
                <DialogDescription>
                  Estimated monthly repayment breakdown.
                </DialogDescription>
              </DialogHeader>
              {selectedLoan && (
                <div className="py-4">
                  <div className="mb-6 grid grid-cols-3 gap-4">
                    <div className="p-3 bg-muted/30 rounded border border-border/50">
                      <p className="text-xs text-muted-foreground">Total Amount</p>
                      <p className="font-bold">KES {parseFloat(selectedLoan.totalAmount).toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded border border-border/50">
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-bold">{selectedLoan.loanType?.durationMonths || 0} Months</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded border border-border/50">
                      <p className="text-xs text-muted-foreground">Monthly Payment</p>
                      <p className="font-bold text-primary">
                        KES {(parseFloat(selectedLoan.totalAmount) / (selectedLoan.loanType?.durationMonths || 1)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">No.</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Remaining Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(function() {
                        if (!selectedLoan.loanType) return null;
                        const total = parseFloat(selectedLoan.totalAmount);
                        const months = selectedLoan.loanType.durationMonths || 1;
                        const monthly = total / months;
                        const startDate = new Date(selectedLoan.disbursementDate || selectedLoan.applicationDate);
                        const rows = [];
                        
                        for (let i = 1; i <= months; i++) {
                          const dueDate = new Date(startDate);
                          dueDate.setMonth(startDate.getMonth() + i);
                          const remaining = total - (monthly * i);
                          rows.push(
                            <TableRow key={i}>
                              <TableCell>{i}</TableCell>
                              <TableCell>{format(dueDate, 'PP')}</TableCell>
                              <TableCell className="text-right font-mono">KES {monthly.toLocaleString()}</TableCell>
                              <TableCell className="text-right font-mono text-muted-foreground">
                                KES {Math.max(0, remaining).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          );
                        }
                        return rows;
                      })()}
                    </TableBody>
                  </Table>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
    </Layout>);
}
