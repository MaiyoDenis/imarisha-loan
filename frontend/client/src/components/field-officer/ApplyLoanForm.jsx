import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, CreditCard, TrendingUp, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
export function ApplyLoanForm(_a) {
    var memberId = _a.memberId, onSuccess = _a.onSuccess;
    var _b = useState(""), amount = _b[0], setAmount = _b[1];
    var _c = useState(""), loanTypeId = _c[0], setLoanTypeId = _c[1];
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    var loanTypes = useQuery({
        queryKey: ["loanTypes"],
        queryFn: function () { return api.getLoanTypes(); },
    }).data;
    var memberDashboard = useQuery({
        queryKey: ["memberDashboard", memberId],
        queryFn: function () { return api.getMemberDashboard(memberId); },
        enabled: !!memberId,
    }).data;
    var mutation = useMutation({
        mutationFn: function (data) {
            return api.applyLoanForMember(memberId, {
                amount: parseFloat(data.amount),
                loanTypeId: data.loanTypeId,
            });
        },
        onSuccess: function () {
            toast({
                title: "Success",
                description: "Loan application created successfully",
            });
            setAmount("");
            setLoanTypeId("");
            queryClient.invalidateQueries({ queryKey: ["memberDashboard", memberId] });
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!amount || !loanTypeId) {
            toast({
                title: "Error",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }
        mutation.mutate({
            amount: amount,
            loanTypeId: parseInt(loanTypeId),
        });
    };
    var selectedLoanType = loanTypes === null || loanTypes === void 0 ? void 0 : loanTypes.find(function (lt) { return lt.id === parseInt(loanTypeId); });
    var savingsBalance = (memberDashboard === null || memberDashboard === void 0 ? void 0 : memberDashboard.savingsBalance) ? parseFloat(memberDashboard.savingsBalance) : 0;
    var maxLoanLimit = (memberDashboard === null || memberDashboard === void 0 ? void 0 : memberDashboard.maxLoanLimit) ? parseFloat(memberDashboard.maxLoanLimit) : 0;
    var availableLoan = (memberDashboard === null || memberDashboard === void 0 ? void 0 : memberDashboard.availableLoan) ? parseFloat(memberDashboard.availableLoan) : 0;
    var totalOutstanding = (memberDashboard === null || memberDashboard === void 0 ? void 0 : memberDashboard.totalOutstanding) ? parseFloat(memberDashboard.totalOutstanding) : 0;
    return (<Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5"/>
          Apply Loan on Behalf of Customer
        </CardTitle>
        <CardDescription>Submit a new loan application for this customer</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {memberDashboard && memberDashboard.status !== 'active' && (<div className="p-4 bg-red-50 border border-red-300 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0"/>
            <div>
              <p className="font-semibold text-red-900">Account Not Active</p>
              <p className="text-sm text-red-800 mt-1">
                This member's account is not active. Only active members can apply for loans.
              </p>
            </div>
          </div>)}
        
        {/* Member Financial Summary */}
        {memberDashboard && (<div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5"/>
              Member Financial Summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-blue-700 font-medium">Savings Balance</p>
                <p className="text-lg font-bold text-blue-900">KES {savingsBalance.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-blue-700 font-medium">Max Loan Limit (4× Savings)</p>
                <p className="text-lg font-bold text-blue-900">KES {maxLoanLimit.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-blue-700 font-medium">Outstanding Loans</p>
                <p className="text-lg font-bold text-orange-700">KES {totalOutstanding.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-blue-700 font-medium">Available for Loan</p>
                <p className={"text-lg font-bold ".concat(availableLoan > 0 ? 'text-green-700' : 'text-red-700')}>
                  KES {availableLoan.toLocaleString()}
                </p>
              </div>
            </div>
            {availableLoan <= 0 && (<div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4"/>
                Member has reached their loan limit or has outstanding loans.
              </div>)}
          </div>)}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loanType">Loan Type</Label>
            <select id="loanType" value={loanTypeId} onChange={function (e) { return setLoanTypeId(e.target.value); }} className="w-full px-3 py-2 border border-input rounded-md bg-background">
              <option value="">Select a loan type</option>
              {loanTypes === null || loanTypes === void 0 ? void 0 : loanTypes.map(function (type) { return (<option key={type.id} value={type.id}>
                  {type.name} ({type.interestRate}% interest)
                </option>); })}
            </select>
          </div>

          {selectedLoanType && (<div className="text-sm bg-primary/10 p-3 rounded-md text-blue-900">
              <p>Min: KES {parseFloat(selectedLoanType.minAmount).toLocaleString()}</p>
              <p>Max: KES {parseFloat(selectedLoanType.maxAmount).toLocaleString()}</p>
              <p>Duration: {selectedLoanType.durationMonths} months</p>
            </div>)}

          <div className="space-y-2">
            <Label htmlFor="amount">
              Loan Amount (KES)
              {availableLoan > 0 && (<span className="text-sm text-muted-foreground ml-2">
                  (Max available: KES {availableLoan.toLocaleString()})
                </span>)}
            </Label>
            <Input id="amount" type="number" placeholder="Enter loan amount" value={amount} onChange={function (e) { return setAmount(e.target.value); }} min={selectedLoanType ? Math.max(0, parseFloat(selectedLoanType.minAmount)) : 0} max={Math.min(selectedLoanType ? parseFloat(selectedLoanType.maxAmount) : Infinity, availableLoan > 0 ? availableLoan : Infinity)}/>
            {availableLoan > 0 && amount && parseFloat(amount) > availableLoan && (<p className="text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4"/>
                Amount exceeds available loan limit
              </p>)}
          </div>

          {mutation.isPending && (<div className="flex items-center gap-2 text-primary">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"/>
              <span>Processing...</span>
            </div>)}

          {mutation.isSuccess && (<div className="flex items-center gap-2 text-secondary">
              <CheckCircle className="h-5 w-5"/>
              <span>Loan application created successfully</span>
            </div>)}

          {mutation.isError && (<div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5"/>
              <span>{mutation.error.message}</span>
            </div>)}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={mutation.isPending || (memberDashboard && memberDashboard.status !== 'active')} className="flex-1">
              Apply Loan
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>);
}
