import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/loading';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function LoanSchedule({ loanId }) {
  const { data: schedule, isLoading, error } = useQuery({
    queryKey: ['loan-schedule', loanId],
    queryFn: () => api.get(`/loans/${loanId}/schedule`),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-destructive p-4">Failed to load schedule</div>;
  if (!schedule || schedule.length === 0) return <div className="p-4 text-center text-muted-foreground">No schedule available</div>;

  return (
    <div className="rounded-md border border-gray-200/20">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-gray-200/20">
            <TableHead className="w-[80px]">Inst. #</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Amount (KES)</TableHead>
            <TableHead className="text-right">Remaining Balance</TableHead>
            <TableHead className="text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedule.map((item) => (
            <TableRow key={item.installment_number} className="hover:bg-transparent border-gray-200/20">
              <TableCell className="font-medium">{item.installment_number}</TableCell>
              <TableCell>{new Date(item.due_date).toLocaleDateString()}</TableCell>
              <TableCell className="text-right font-semibold">
                {new Intl.NumberFormat('en-KE').format(item.amount)}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {new Intl.NumberFormat('en-KE').format(item.remaining_balance)}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={item.status === 'due' ? 'destructive' : 'outline'} className="text-[10px] uppercase">
                  {item.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
