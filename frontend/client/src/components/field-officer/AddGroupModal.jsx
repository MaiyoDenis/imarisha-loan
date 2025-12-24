import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
export function AddGroupModal(_a) {
    var open = _a.open, onOpenChange = _a.onOpenChange, onSuccess = _a.onSuccess;
    var _b = useState(""), groupName = _b[0], setGroupName = _b[1];
    var _c = useState(""), location = _c[0], setLocation = _c[1];
    var _d = useState(""), description = _d[0], setDescription = _d[1];
    var toast = useToast().toast;
    var mutation = useMutation({
        mutationFn: function (data) { return api.createFieldOfficerGroup(data); },
        onSuccess: function () {
            toast({
                title: "Success",
                description: "Group created successfully",
            });
            setGroupName("");
            setLocation("");
            setDescription("");
            onOpenChange(false);
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
        },
        onError: function (error) {
            var errorMessage = error.message;
            // Handle duplicate group name error
            if (error.message.includes('Group name already exists')) {
                errorMessage = "A group with this name already exists in your branch. Please choose a different name.";
            }
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        },
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!groupName.trim()) {
            toast({
                title: "Validation Error",
                description: "Please enter a group name",
                variant: "destructive",
            });
            return;
        }
        mutation.mutate({
            name: groupName,
            location: location,
            description: description,
        });
    };
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Group</DialogTitle>
          <DialogDescription>
            Create a new customer group to manage members and their loans.
          </DialogDescription>
        </DialogHeader>

        {mutation.error && (<div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-3 text-red-800">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0"/>
            <span className="text-sm">{mutation.error.message}</span>
          </div>)}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input id="group-name" placeholder="e.g., Nairobi West Group" value={groupName} onChange={function (e) { return setGroupName(e.target.value); }} disabled={mutation.isPending} required/>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="e.g., Westlands, Nairobi" value={location} onChange={function (e) { return setLocation(e.target.value); }} disabled={mutation.isPending}/>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea id="description" placeholder="Brief description of the group..." value={description} onChange={function (e) { return setDescription(e.target.value); }} disabled={mutation.isPending} className="w-full px-3 py-2 border border-input rounded-md text-sm resize-none" rows={3}/>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button type="button" variant="outline" onClick={function () { return onOpenChange(false); }} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="bg-primary hover:bg-primary/80">
              {mutation.isPending ? "Creating..." : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>);
}
