import React, { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Plus } from "lucide-react";
export function CreateMemberDialog() {
    var _a = useState(false), open = _a[0], setOpen = _a[1];
    var _b = useState(""), userId = _b[0], setUserId = _b[1];
    var _c = useState("800"), registrationFee = _c[0], setRegistrationFee = _c[1];
    var queryClient = useQueryClient();
    var toast = useToast().toast;
    var createMemberMutation = useMutation({
        mutationFn: api.createMember,
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["members"] });
            setOpen(false);
            setUserId("");
            setRegistrationFee("800");
            toast({
                title: "Success",
                description: "Member registered successfully",
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
    var handleSubmit = function (e) {
        e.preventDefault();
        createMemberMutation.mutate({
            userId: parseInt(userId),
            registrationFee: parseFloat(registrationFee),
        });
    };
    return (<Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-lg shadow-primary/20" data-testid="button-register-member">
          <Plus className="mr-2 h-4 w-4"/> Register Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Register New Member</DialogTitle>
          <DialogDescription>
            Link an existing user to a member profile.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="userId" className="text-right">
                User ID
              </Label>
              <Input id="userId" type="number" value={userId} onChange={function (e) { return setUserId(e.target.value); }} className="col-span-3" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fee" className="text-right">
                Reg. Fee
              </Label>
              <Input id="fee" type="number" value={registrationFee} onChange={function (e) { return setRegistrationFee(e.target.value); }} className="col-span-3" required/>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createMemberMutation.isPending}>
              {createMemberMutation.isPending ? "Registering..." : "Register Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>);
}
