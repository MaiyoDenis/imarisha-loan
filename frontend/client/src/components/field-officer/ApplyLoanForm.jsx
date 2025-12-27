import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, CreditCard, TrendingUp, AlertTriangle, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
export function ApplyLoanForm(_a) {
    var memberId = _a.memberId, onSuccess = _a.onSuccess, _title = _a.title;
    var title = _title || "Apply Product Loan";
    var _c = useState(""), loanTypeId = _c[0], setLoanTypeId = _c[1];
    var _items = useState([]), selectedItems = _items[0], setSelectedItems = _items[1];
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    var loanTypes = useQuery({
        queryKey: ["loan-types"],
        queryFn: function () { return api.getLoanTypes(); },
    }).data;
    var products = useQuery({
        queryKey: ["loan-products"],
        queryFn: function () { return api.getLoanProducts(); },
    }).data;
    var memberDashboard = useQuery({
        queryKey: ["memberDashboard", memberId],
        queryFn: function () { return api.getMemberDashboard(memberId); },
        enabled: !!memberId,
    }).data;
    var mutation = useMutation({
        mutationFn: function (data) {
            return api.post('/loans', {
                memberId: memberId,
                loanTypeId: data.loanTypeId,
                items: data.items
            });
        },
        onSuccess: function () {
            toast({
                title: "Success",
                description: "Loan application created successfully",
            });
            setSelectedItems([]);
            setLoanTypeId("");
            queryClient.invalidateQueries({ queryKey: ["memberDashboard", memberId] });
            queryClient.invalidateQueries({ queryKey: ["loan-products"] });
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
        var principle = calculateTotalPrinciple();
        if (selectedItems.length === 0 || !loanTypeId) {
            toast({
                title: "Error",
                description: "Please select a loan type and at least one product",
                variant: "destructive",
            });
            return;
        }
        
        var invalidItems = selectedItems.filter(item => !item.productId || parseInt(item.quantity) <= 0);
        if (invalidItems.length > 0) {
            toast({
                title: "Error",
                description: "Please ensure all items have a selected product and valid quantity",
                variant: "destructive",
            });
            return;
        }

        mutation.mutate({
            loanTypeId: parseInt(loanTypeId),
            items: selectedItems.map(item => ({
                productId: parseInt(item.productId),
                quantity: parseInt(item.quantity)
            }))
        });
    };
    var selectedLoanType = loanTypes === null || loanTypes === void 0 ? void 0 : loanTypes.find(function (lt) { return lt.id === parseInt(loanTypeId); });
    var savingsBalance = (memberDashboard === null || memberDashboard === void 0 ? void 0 : memberDashboard.savingsBalance) ? parseFloat(memberDashboard.savingsBalance) : 0;
    var maxLoanLimit = (memberDashboard === null || memberDashboard === void 0 ? void 0 : memberDashboard.maxLoanLimit) ? parseFloat(memberDashboard.maxLoanLimit) : 0;
    var availableLoan = (memberDashboard === null || memberDashboard === void 0 ? void 0 : memberDashboard.availableLoan) ? parseFloat(memberDashboard.availableLoan) : 0;
    var totalOutstanding = (memberDashboard === null || memberDashboard === void 0 ? void 0 : memberDashboard.totalOutstanding) ? parseFloat(memberDashboard.totalOutstanding) : 0;
    var currentPrinciple = calculateTotalPrinciple();

    return (<Card className="!bg-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <CreditCard className="h-5 w-5"/>
          {title}
        </CardTitle>
        <CardDescription className="text-muted-foreground">Select products to calculate loan principle automatically</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {memberDashboard && memberDashboard.status !== 'active' && (<div className="p-4 bg-red-50/50 border border-red-300 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0"/>
            <div>
              <p className="font-semibold text-red-900">Account Not Active</p>
              <p className="text-sm text-red-800 mt-1">
                This member's account is not active. Only active members can apply for loans.
              </p>
            </div>
          </div>)}
        
        {memberDashboard && (<div className="bg-transparent p-4 rounded-lg border border-blue-200">
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
          </div>)}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="loanType" className="text-foreground">Loan Type</Label>
            <select id="loanType" value={loanTypeId} onChange={function (e) { return setLoanTypeId(e.target.value); }} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground">
              <option value="">Select a loan type</option>
              {loanTypes === null || loanTypes === void 0 ? void 0 : loanTypes.map(function (type) { return (<option key={type.id} value={type.id}>
                  {type.name} ({type.interestRate}% interest)
                </option>); })}
            </select>
            {selectedLoanType && (<div className="text-xs text-muted-foreground mt-1 flex gap-4">
                <span>Min: KES {parseFloat(selectedLoanType.minAmount).toLocaleString()}</span>
                <span>Max: KES {parseFloat(selectedLoanType.maxAmount).toLocaleString()}</span>
                <span>Duration: {selectedLoanType.durationMonths} months</span>
              </div>)}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
                <ShoppingCart className="h-5 w-5"/>
                Selected Products
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="flex items-center gap-1 border-primary text-primary hover:bg-primary/10">
                <Plus className="h-4 w-4"/>
                Add Product
              </Button>
            </div>

            <div className="space-y-3">
              {selectedItems.map(function (item, index) { 
                var selectedProduct = products?.find(p => p.id === parseInt(item.productId));
                return (
                <div key={index} className="flex gap-3 items-end p-3 bg-muted/30 rounded-lg border border-border">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-muted-foreground">Product</Label>
                    <select value={item.productId} onChange={function (e) { return updateItem(index, "productId", e.target.value); }} className="w-full px-2 py-1.5 border border-input rounded-md bg-background text-sm text-foreground">
                      <option value="">Select Product</option>
                      {products === null || products === void 0 ? void 0 : products.map(function (p) { return (<option key={p.id} value={p.id} disabled={p.stockQuantity <= 0}>
                          {p.name} - KES {parseFloat(p.sellingPrice).toLocaleString()} ({p.stockQuantity} in stock)
                        </option>); })}
                    </select>
                  </div>
                  <div className="w-24 space-y-1">
                    <Label className="text-xs text-muted-foreground">Quantity</Label>
                    <Input type="number" value={item.quantity} onChange={function (e) { return updateItem(index, "quantity", e.target.value); }} min="1" max={selectedProduct ? selectedProduct.stockQuantity : undefined} className="h-9"/>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={function () { return removeItem(index); }} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4"/>
                  </Button>
                </div>
              ); })}
              
              {selectedItems.length === 0 && (
                <div className="text-center py-6 border border-dashed border-border rounded-lg text-muted-foreground">
                  No products selected. Click "Add Product" to start.
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Principle Amount:</span>
              <span className="font-bold text-foreground text-lg">KES {currentPrinciple.toLocaleString()}</span>
            </div>
            {selectedLoanType && (
              <div className="flex justify-between items-center text-xs text-muted-foreground italic border-t border-primary/10 pt-2">
                <span>Calculated based on {selectedItems.length} item(s)</span>
                {currentPrinciple > 0 && currentPrinciple < parseFloat(selectedLoanType.minAmount) && (
                  <span className="text-destructive font-medium">Below minimum loan amount</span>
                )}
                {currentPrinciple > parseFloat(selectedLoanType.maxAmount) && (
                  <span className="text-destructive font-medium">Above maximum loan amount</span>
                )}
                {availableLoan > 0 && currentPrinciple > availableLoan && (
                  <span className="text-destructive font-medium">Exceeds available limit</span>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={mutation.isPending || (memberDashboard && memberDashboard.status !== 'active') || currentPrinciple <= 0} className="w-full h-11 text-lg">
              {mutation.isPending ? "Processing..." : "Submit Loan Application"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>);
}
