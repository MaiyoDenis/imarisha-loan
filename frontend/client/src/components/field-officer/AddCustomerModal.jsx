var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
export function AddCustomerModal(_a) {
    var open = _a.open, onOpenChange = _a.onOpenChange, groupId = _a.groupId, onSuccess = _a.onSuccess;
    var _b = useState({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        idNumber: "",
    }), formData = _b[0], setFormData = _b[1];
    var toast = useToast().toast;
    var mutation = useMutation({
        mutationFn: function (data) { return api.addMemberToGroup(data); },
        onSuccess: function (data) {
            toast({
                title: "Success",
                description: "Customer added successfully. Member Code: ".concat(data.memberCode),
            });
            setFormData({
                firstName: "",
                lastName: "",
                phone: "",
                email: "",
                idNumber: "",
            });
            onOpenChange(false);
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
        if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.phone.trim()) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields (First Name, Last Name, Phone)",
                variant: "destructive",
            });
            return;
        }
        mutation.mutate(__assign(__assign({}, formData), { groupId: groupId }));
    };
    var handleChange = function (e) {
        var _a = e.target, name = _a.name, value = _a.value;
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = value, _a)));
        });
    };
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Add a new customer to this group. A unique member code will be generated automatically. 
            The customer will start with "pending" status and needs approval before becoming active.
          </DialogDescription>
        </DialogHeader>

        {mutation.error && (<div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-3 text-red-800">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0"/>
            <span className="text-sm">{mutation.error.message}</span>
          </div>)}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" name="firstName" placeholder="John" value={formData.firstName} onChange={handleChange} disabled={mutation.isPending} required/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input id="lastName" name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} disabled={mutation.isPending} required/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input id="phone" name="phone" placeholder="0712345678" value={formData.phone} onChange={handleChange} disabled={mutation.isPending} required/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} disabled={mutation.isPending}/>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idNumber">ID Number</Label>
            <Input id="idNumber" name="idNumber" placeholder="12345678" value={formData.idNumber} onChange={handleChange} disabled={mutation.isPending}/>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button type="button" variant="outline" onClick={function () { return onOpenChange(false); }} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="bg-primary hover:bg-primary/80">
              {mutation.isPending ? "Adding..." : "Add Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>);
}
