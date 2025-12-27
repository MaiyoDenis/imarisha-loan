import React, { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Plus, Trash2, ShoppingCart } from "lucide-react";

export function CreateLoanDialog() {
    var _a = useState(false), open = _a[0], setOpen = _a[1];
    var _b = useState(""), memberId = _b[0], setMemberId = _b[1];
    var _d = useState(""), loanTypeId = _d[0], setLoanTypeId = _d[1];
    var _items = useState([]), selectedItems = _items[0], setSelectedItems = _items[1];
    var queryClient = useQueryClient();
    var toast = useToast().toast;
    var _f = useQuery({
        queryKey: ["loan-products"],
        queryFn: api.getLoanProducts,
    }).data, products = _f === void 0 ? [] : _f;
    var _g = useQuery({
        queryKey: ["loan-types"],
        queryFn: api.getLoanTypes,
    }).data, loanTypes = _g === void 0 ? [] : _g;

    var createLoanMutation = useMutation({
        mutationFn: api.createLoan,
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["loans"] });
            queryClient.invalidateQueries({ queryKey: ["loan-products"] });
            setOpen(false);
            setMemberId("");
            setSelectedItems([]);
            setLoanTypeId("");
            toast({
                title: "Success",
                description: "Product loan application submitted successfully",
            });
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    var addItem = function () {
        setSelectedItems([...selectedItems, { productId: "", quantity: 1 }]);
    };

    var removeItem = function (index) {
        var newItems = [...selectedItems];
        newItems.splice(index, 1);
        setSelectedItems(newItems);
    };

    var updateItem = function (index, field, value) {
        var newItems = [...selectedItems];
        newItems[index][field] = value;
        setSelectedItems(newItems);
    };

    var calculateTotalPrinciple = function () {
        return selectedItems.reduce(function (total, item) {
            var product = products === null || products === void 0 ? void 0 : products.find(function (p) { return p.id === parseInt(item.productId); });
            if (product) {
                return total + (parseFloat(product.sellingPrice) * parseInt(item.quantity));
            }
            return total;
        }, 0);
    };

    var handleSubmit = function (e) {
        e.preventDefault();
        if (selectedItems.length === 0) {
            toast({ title: "Error", description: "Select at least one product", variant: "destructive" });
            return;
        }
        createLoanMutation.mutate({
            memberId: parseInt(memberId),
            loanTypeId: parseInt(loanTypeId),
            items: selectedItems.map(item => ({
                productId: parseInt(item.productId),
                quantity: parseInt(item.quantity)
            }))
        });
    };

    var currentPrinciple = calculateTotalPrinciple();

    return (<Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4"/> Apply for Product Loan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Product Loan Application</DialogTitle>
          <DialogDescription>
            Select products and quantities. Total principle is calculated automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="memberId">Member ID</Label>
              <Input id="memberId" type="number" value={memberId} onChange={function (e) { return setMemberId(e.target.value); }} required/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="loanType">Loan Type</Label>
              <Select onValueChange={setLoanTypeId} value={loanTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select loan type"/>
                </SelectTrigger>
                <SelectContent>
                  {loanTypes.map(function (type) {
            return (<SelectItem key={type.id} value={type.id.toString()}>
                      {type.name} ({type.interestRate}%)
                    </SelectItem>);
        })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 font-semibold">
                  <ShoppingCart className="h-4 w-4"/>
                  Selected Products
                </Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1"/> Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {selectedItems.map(function (item, index) { return (<div key={index} className="flex gap-2 items-end p-2 border rounded-md">
                    <div className="flex-1">
                      <Select value={item.productId} onValueChange={function (val) { return updateItem(index, "productId", val); }}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Product"/>
                        </SelectTrigger>
                        <SelectContent>
                          {products.map(function (p) { return (<SelectItem key={p.id} value={p.id.toString()} disabled={p.stockQuantity <= 0}>
                              {p.name} (KES {parseFloat(p.sellingPrice).toLocaleString()})
                            </SelectItem>); })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-20">
                      <Input type="number" value={item.quantity} onChange={function (e) { return updateItem(index, "quantity", e.target.value); }} min="1" className="h-9"/>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={function () { return removeItem(index); }} className="h-9 w-9 text-destructive">
                      <Trash2 className="h-4 w-4"/>
                    </Button>
                  </div>); })}
              </div>
            </div>

            <div className="p-3 bg-muted rounded-md flex justify-between items-center">
              <span className="text-sm font-medium">Total Principle:</span>
              <span className="text-lg font-bold">KES {currentPrinciple.toLocaleString()}</span>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createLoanMutation.isPending || currentPrinciple <= 0} className="w-full">
              {createLoanMutation.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>);
}
