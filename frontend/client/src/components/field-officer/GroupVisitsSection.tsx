import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Plus, Calendar, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Visit {
  id: number;
  visitDate: string;
  notes: string;
  createdAt: string;
  fieldOfficerName?: string;
}

interface GroupVisitsSectionProps {
  groupId: number;
}

export function GroupVisitsSection({ groupId }: GroupVisitsSectionProps) {
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [visitDate, setVisitDate] = useState("");
  const [visitNotes, setVisitNotes] = useState("");
  const { toast } = useToast();

  const { data: visits, isLoading, refetch } = useQuery({
    queryKey: ["groupVisits", groupId],
    queryFn: () => api.get(`/field-officer/groups/${groupId}/visits`),
    enabled: !!groupId,
  });

  const mutation = useMutation({
    mutationFn: (data: { visitDate: string; notes: string }) =>
      api.post(`/field-officer/groups/${groupId}/visits`, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Visit recorded successfully",
      });
      setVisitDate("");
      setVisitNotes("");
      setShowAddVisit(false);
      refetch();
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

    if (!visitDate.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select a visit date",
        variant: "destructive",
      });
      return;
    }

    if (!visitNotes.trim()) {
      toast({
        title: "Validation Error",
        description: "Please add visit notes",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate({
      visitDate,
      notes: visitNotes,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const sortedVisits = visits ? [...visits].sort((a: Visit, b: Visit) => 
    new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
  ) : [];

  return (
    <>
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Visit History</CardTitle>
              <CardDescription>
                Record and view group visits
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowAddVisit(true)}
              className="gap-2"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Log Visit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading visits...</p>
          ) : sortedVisits.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No visits recorded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedVisits.map((visit: Visit) => (
                <div
                  key={visit.id}
                  className="p-4 border rounded-lg bg-card hover:bg-accent/5 transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">
                          {formatDate(visit.visitDate)}
                        </p>
                        {visit.fieldOfficerName && (
                          <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                            {visit.fieldOfficerName}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {visit.notes}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddVisit} onOpenChange={setShowAddVisit}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Log Group Visit</DialogTitle>
            <DialogDescription>
              Record your observations and notes about the group visit.
            </DialogDescription>
          </DialogHeader>

          {mutation.error && (
            <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-3 text-red-800">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{mutation.error.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="visit-date">Visit Date</Label>
              <Input
                id="visit-date"
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                disabled={mutation.isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visit-notes">Visit Notes</Label>
              <textarea
                id="visit-notes"
                placeholder="Write about your observations, group progress, issues discussed, members present, etc."
                value={visitNotes}
                onChange={(e) => setVisitNotes(e.target.value)}
                disabled={mutation.isPending}
                className="w-full px-3 py-2 border border-input rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                rows={5}
              />
            </div>

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddVisit(false)}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="bg-primary hover:bg-primary/80"
              >
                {mutation.isPending ? "Recording..." : "Record Visit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
