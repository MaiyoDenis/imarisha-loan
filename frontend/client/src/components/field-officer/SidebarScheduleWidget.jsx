import { useMemo } from "react";
import { Calendar, Clock, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
export function SidebarScheduleWidget() {
    var _a = useLocation(), navigate = _a[1];
    var mockSchedule = useMemo(function () {
        return [
            {
                date: new Date().toISOString().split('T')[0],
                day: 'Today',
                groupName: 'Nairobi West Group',
                location: 'Westlands',
                time: '10:00 AM',
                status: 'today'
            },
            {
                date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                day: 'Tomorrow',
                groupName: 'South C Savings Group',
                location: 'South C',
                time: '2:00 PM',
                status: 'pending'
            },
            {
                date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
                day: 'Wed',
                groupName: 'Kilimani Business Group',
                location: 'Kilimani',
                time: '3:30 PM',
                status: 'pending'
            }
        ];
    }, []);
    return (<div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-semibold text-sidebar-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4"/>
          Schedule
        </h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={function () { return navigate('/field-officer/schedule'); }}>
          <ChevronRight className="h-4 w-4"/>
        </Button>
      </div>

      <div className="space-y-2 px-2">
        {mockSchedule.map(function (item, idx) { return (<div key={idx} className={"p-2 rounded-md border text-xs transition-colors ".concat(item.status === 'today'
                ? 'bg-primary/10 border-primary/20'
                : 'bg-sidebar-accent/50 border-sidebar-border')}>
            <div className="flex justify-between items-start mb-1">
              <span className={"font-semibold ".concat(item.status === 'today' ? 'text-primary' : 'text-sidebar-foreground')}>
                {item.day}
              </span>
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3"/>
                {item.time}
              </span>
            </div>
            
            <p className="font-medium truncate mb-1" title={item.groupName}>
              {item.groupName}
            </p>
            
            {item.location && (<div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3 w-3"/>
                <span className="truncate">{item.location}</span>
              </div>)}
          </div>); })}
      </div>
      
      <div className="px-2">
        <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={function () { return navigate('/field-officer/schedule'); }}>
          View Full Schedule
        </Button>
      </div>
    </div>);
}
