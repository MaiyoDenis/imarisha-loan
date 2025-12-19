import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TransferFundsFormProps {
  memberId: number;
  onSuccess?: () => void;
}

export function TransferFundsForm({ memberId, onSuccess }: TransferFundsFormProps) {
  const [fromAccount, setFromAccount] = useState("savings");
  const [toAccount, setToAccount] = useState("drawdown");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: {
      fromAccountType: string;
      toAccountType: string;
      amount: string;
      reference: string;
    }) =>
      api.transferFunds(memberId, {
        fromAccountType: data.fromAccountType,
        toAccountType: data.toAccountType,
        amount: parseFloat(data.amount),
        reference: data.reference,
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Funds transferred successfully",
      });
      setAmount("");
      setReference("");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
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
      amount,
      reference,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer Funds</CardTitle>
        <CardDescription>Transfer funds between member accounts</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromAccount">From Account</Label>
              <select
                id="fromAccount"
                value={fromAccount}
                onChange={(e) => setFromAccount(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="savings">Savings</option>
                <option value="drawdown">Drawdown</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="toAccount">To Account</Label>
              <select
                id="toAccount"
                value={toAccount}
                onChange={(e) => setToAccount(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="savings">Savings</option>
                <option value="drawdown">Drawdown</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (KES)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount to transfer"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Reference (Optional)</Label>
            <Input
              id="reference"
              type="text"
              placeholder="Enter reference or notes"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          {mutation.isPending && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <span>Processing transfer...</span>
            </div>
          )}

          {mutation.isSuccess && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>Funds transferred successfully</span>
            </div>
          )}

          {mutation.isError && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{(mutation.error as Error).message}</span>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={mutation.isPending} className="flex-1">
              Transfer Funds
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
