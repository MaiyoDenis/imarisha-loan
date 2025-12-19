import { useState } from "react";
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
import { AlertCircle, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { downloadCSV, downloadJSON } from "@/lib/exportUtils";

interface ExportDataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups?: any[];
}

export function ExportDataModal({
  open,
  onOpenChange,
  groups = [],
}: ExportDataModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExportCSV = async () => {
    if (groups.length === 0) {
      toast({
        title: "No Data",
        description: "No groups available to export",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const exportData = groups.map((group) => ({
        "Group ID": group.id,
        "Group Name": group.name,
        "Total Members": group.totalMembers,
        "Total Savings": parseFloat(group.totalSavings || "0").toLocaleString(),
        "Outstanding Loans": parseFloat(
          group.totalLoansOutstanding || "0"
        ).toLocaleString(),
        "Repayment Rate": `${group.repaymentRate}%`,
      }));

      downloadCSV(exportData, `groups_report_${new Date().getTime()}`);

      toast({
        title: "Success",
        description: "Groups data exported as CSV",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = async () => {
    if (groups.length === 0) {
      toast({
        title: "No Data",
        description: "No groups available to export",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        totalGroups: groups.length,
        totalMembers: groups.reduce((sum, g) => sum + g.totalMembers, 0),
        groups: groups.map((group) => ({
          id: group.id,
          name: group.name,
          totalMembers: group.totalMembers,
          totalSavings: group.totalSavings,
          totalLoansOutstanding: group.totalLoansOutstanding,
          repaymentRate: group.repaymentRate,
        })),
      };

      downloadJSON(exportData, `groups_report_${new Date().getTime()}`);

      toast({
        title: "Success",
        description: "Groups data exported as JSON",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Groups Data</DialogTitle>
          <DialogDescription>
            Download your groups and members data in your preferred format.
          </DialogDescription>
        </DialogHeader>

        {groups.length === 0 && (
          <div className="flex items-start gap-3 rounded-lg bg-yellow-50 p-3 text-yellow-800">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <span className="text-sm">No groups available to export</span>
          </div>
        )}

        <div className="space-y-4 py-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Export Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-600">Total Groups</p>
                <p className="text-2xl font-bold text-blue-900">
                  {groups.length}
                </p>
              </div>
              <div>
                <p className="text-blue-600">Total Members</p>
                <p className="text-2xl font-bold text-blue-900">
                  {groups.reduce((sum, g) => sum + g.totalMembers, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Select Export Format</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleExportCSV}
                disabled={isExporting || groups.length === 0}
                variant="outline"
                className="flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download CSV
              </Button>
              <Button
                onClick={handleExportJSON}
                disabled={isExporting || groups.length === 0}
                variant="outline"
                className="flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download JSON
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            disabled={isExporting}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
