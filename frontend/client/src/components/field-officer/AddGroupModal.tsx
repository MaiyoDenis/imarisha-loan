import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddGroupModal({
  open,
  onOpenChange,
  onSuccess,
}: AddGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: {
      name: string;
      location: string;
      description: string;
    }) => api.createFieldOfficerGroup(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Group created successfully",
      });
      setGroupName("");
      setLocation("");
      setDescription("");
      onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Group</DialogTitle>
          <DialogDescription>
            Create a new customer group to manage members and their loans.
          </DialogDescription>
        </DialogHeader>

        {mutation.error && (
          <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3 text-red-800">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{mutation.error.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              placeholder="e.g., Nairobi West Group"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              disabled={mutation.isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Westlands, Nairobi"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={mutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              placeholder="Brief description of the group..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={mutation.isPending}
              className="w-full px-3 py-2 border border-input rounded-md text-sm resize-none"
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {mutation.isPending ? "Creating..." : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
