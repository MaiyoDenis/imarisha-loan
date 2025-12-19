import { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Plus } from "lucide-react";

export function CreateLoanDialog() {
  const [open, setOpen] = useState(false);
  const [memberId, setMemberId] = useState("");
  const [productId, setProductId] = useState("");
  const [amount, setAmount] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: products = [] } = useQuery({
    queryKey: ["loan-products"],
    queryFn: api.getLoanProducts,
  });

  const createLoanMutation = useMutation({
    mutationFn: api.createLoan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      setOpen(false);
      setMemberId("");
      setProductId("");
      setAmount("");
      toast({
        title: "Success",
        description: "Loan application submitted successfully",
      });
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
    createLoanMutation.mutate({
      memberId: parseInt(memberId),
      productId: parseInt(productId),
      amount: parseFloat(amount),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> Apply for Loan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Loan Application</DialogTitle>
          <DialogDescription>
            Submit a new loan application for a member.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="memberId" className="text-right">
                Member ID
              </Label>
              <Input
                id="memberId"
                type="number"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product" className="text-right">
                Loan Product
              </Label>
              <Select onValueChange={setProductId} value={productId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select loan product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product: any) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} - {product.stockQuantity} in stock
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createLoanMutation.isPending}>
              {createLoanMutation.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
