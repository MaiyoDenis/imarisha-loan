import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const repaymentSchema = z.object({
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number",
  }),
  accountType: z.enum(['savings', 'drawdown', 'mpesa']),
  mpesaCode: z.string().optional(),
  reference: z.string().min(3, "Reference is required"),
});

export function RepaymentForm({ memberId, loanId, onSuccess }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(repaymentSchema),
    defaultValues: {
      amount: '',
      accountType: 'savings',
      mpesaCode: '',
      reference: 'Loan Repayment',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/transactions', {
        memberId,
        loanId,
        amount: parseFloat(data.amount),
        accountType: data.accountType === 'mpesa' ? 'loan' : data.accountType,
        transactionType: 'loan_repayment',
        mpesaCode: data.accountType === 'mpesa' ? data.mpesaCode : null,
        reference: data.reference,
      });
      toast({ title: "Success", description: "Repayment recorded successfully" });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.error || "Failed to record repayment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (KES)</FormLabel>
              <FormControl>
                <Input placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accountType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="savings">Savings Account</SelectItem>
                  <SelectItem value="drawdown">Drawdown Account</SelectItem>
                  <SelectItem value="mpesa">M-Pesa Direct</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch('accountType') === 'mpesa' && (
          <FormField
            control={form.control}
            name="mpesaCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>M-Pesa Reference Code</FormLabel>
                <FormControl>
                  <Input placeholder="QCXXXXXXXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference/Notes</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Processing..." : "Submit Repayment"}
        </Button>
      </form>
    </Form>
  );
}
