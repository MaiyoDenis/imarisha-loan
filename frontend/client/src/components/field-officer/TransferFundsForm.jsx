import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
export function TransferFundsForm(_a) {
    var memberId = _a.memberId, onSuccess = _a.onSuccess;
    var _b = useState("savings"), fromAccount = _b[0], setFromAccount = _b[1];
    var _c = useState("drawdown"), toAccount = _c[0], setToAccount = _c[1];
    var _d = useState(""), amount = _d[0], setAmount = _d[1];
    var _e = useState(""), reference = _e[0], setReference = _e[1];
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    var mutation = useMutation({
        mutationFn: function (data) {
            return api.transferFunds(memberId, {
                fromAccountType: data.fromAccountType,
                toAccountType: data.toAccountType,
                amount: parseFloat(data.amount),
                reference: data.reference,
            });
        },
        onSuccess: function () {
            toast({
                title: "Success",
                description: "Funds transferred successfully",
            });
            setAmount("");
            setReference("");
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
        if (!amount) {
            toast({
                title: "Error",
                description: "Please enter an amount",
                variant: "destructive",
            });
            return;
        }
        if (fromAccount === toAccount) {
            toast({
                title: "Error",
                description: "From and To accounts must be different",
                variant: "destructive",
            });
            return;
        }
        mutation.mutate({
            fromAccountType: fromAccount,
            toAccountType: toAccount,
            amount: amount,
            reference: reference,
        });
    };
    return (<Card>
      <CardHeader>
        <CardTitle>Transfer Funds</CardTitle>
        <CardDescription>Transfer funds between member accounts</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromAccount">From Account</Label>
              <select id="fromAccount" value={fromAccount} onChange={function (e) { return setFromAccount(e.target.value); }} className="w-full px-3 py-2 border border-input rounded-md bg-background">
                <option value="savings">Savings</option>
                <option value="drawdown">Drawdown</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="toAccount">To Account</Label>
              <select id="toAccount" value={toAccount} onChange={function (e) { return setToAccount(e.target.value); }} className="w-full px-3 py-2 border border-input rounded-md bg-background">
                <option value="savings">Savings</option>
                <option value="drawdown">Drawdown</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (KES)</Label>
            <Input id="amount" type="number" placeholder="Enter amount to transfer" value={amount} onChange={function (e) { return setAmount(e.target.value); }} min="0" step="100"/>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Reference (Optional)</Label>
            <Input id="reference" type="text" placeholder="Enter reference or notes" value={reference} onChange={function (e) { return setReference(e.target.value); }}/>
          </div>

          {mutation.isPending && (<div className="flex items-center gap-2 text-primary">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"/>
              <span>Processing transfer...</span>
            </div>)}

          {mutation.isSuccess && (<div className="flex items-center gap-2 text-secondary">
              <CheckCircle className="h-5 w-5"/>
              <span>Funds transferred successfully</span>
            </div>)}

          {mutation.isError && (<div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5"/>
              <span>{mutation.error.message}</span>
            </div>)}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={mutation.isPending} className="flex-1">
              Transfer Funds
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>);
}
