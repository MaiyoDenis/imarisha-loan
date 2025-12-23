import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
export function VisitScheduleWidget(_a) {
    var _b = _a.groupsCount, groupsCount = _b === void 0 ? 0 : _b;
    var _c = useState(new Date()), currentDate = _c[0], setCurrentDate = _c[1];
    var _d = useState('week'), viewMode = _d[0], setViewMode = _d[1];
    var weekStart = useMemo(function () {
        var d = new Date(currentDate);
        var day = d.getDay();
        var diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    }, [currentDate]);
    var weekDays = useMemo(function () {
        return Array.from({ length: 7 }).map(function (_, i) {
            var date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            return date;
        });
    }, [weekStart]);
    var mockSchedule = useMemo(function () {
        return [
            {
                date: new Date().toISOString().split('T')[0],
                day: 'Today',
                groupName: 'Nairobi West Group',
                location: 'Westlands',
                memberCount: 24,
                time: '10:00 AM',
                status: 'today'
            },
            {
                date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                day: 'Tomorrow',
                groupName: 'South C Savings Group',
                location: 'South C',
                memberCount: 18,
                time: '2:00 PM',
                status: 'pending'
            },
            {
                date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
                day: 'Wed',
                groupName: 'Kilimani Business Group',
                location: 'Kilimani',
                memberCount: 32,
                time: '3:30 PM',
                status: 'pending'
            },
            {
                date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
                day: 'Thu',
                groupName: 'Makadara Women Traders',
                location: 'Makadara',
                memberCount: 15,
                time: '11:00 AM',
                status: 'pending'
            },
            {
                date: new Date(Date.now() + 345600000).toISOString().split('T')[0],
                day: 'Fri',
                groupName: 'CBD Financial Group',
                location: 'Nairobi CBD',
                memberCount: 28,
                time: '4:00 PM',
                status: 'pending'
            },
        ];
    }, []);
    var formatDate = function (date) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    var isToday = function (date) {
        var today = new Date();
        return (date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear());
    };
    return (<Card className="border-2 col-span-full lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5"/>
              Visit Schedule
            </CardTitle>
            <CardDescription>
              Your weekly group visits
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Button variant={viewMode === 'week' ? 'default' : 'outline'} size="sm" onClick={function () { return setViewMode('week'); }}>
              Week
            </Button>
            <Button variant={viewMode === 'month' ? 'default' : 'outline'} size="sm" onClick={function () { return setViewMode('month'); }}>
              Month
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={function () {
            var d = new Date(currentDate);
            d.setDate(d.getDate() - 7);
            setCurrentDate(d);
        }}>
              <ChevronLeft className="h-4 w-4"/>
            </Button>
            <h3 className="font-semibold">
              {currentDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        })}
            </h3>
            <Button variant="ghost" size="sm" onClick={function () {
            var d = new Date(currentDate);
            d.setDate(d.getDate() + 7);
            setCurrentDate(d);
        }}>
              <ChevronRight className="h-4 w-4"/>
            </Button>
          </div>

          {/* Week View Calendar */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(function (date) { return (<div key={date.toISOString()} className={"p-2 rounded-lg text-center text-xs font-medium transition ".concat(isToday(date)
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground')}>
                <div className="font-semibold">
                  {date.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 1)}
                </div>
                <div>{date.getDate()}</div>
              </div>); })}
          </div>

          {/* Schedule List */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Scheduled Visits</h4>
            {mockSchedule.length === 0 ? (<p className="text-sm text-muted-foreground text-center py-4">
                No visits scheduled
              </p>) : (<div className="space-y-2">
                {mockSchedule.map(function (item, idx) { return (<div key={idx} className={"p-3 rounded-lg border-l-4 transition ".concat(item.status === 'today'
                    ? 'border-l-primary bg-primary/5'
                    : item.status === 'completed'
                        ? 'border-l-secondary bg-secondary/5'
                        : 'border-l-accent bg-accent/5')}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm truncate">
                            {item.groupName}
                          </p>
                          {item.status === 'today' && (<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary text-white">
                              Today
                            </span>)}
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {item.time && (<div className="flex items-center gap-1">
                              <Clock className="h-3 w-3"/>
                              {item.time}
                            </div>)}
                          {item.location && (<div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3"/>
                              {item.location}
                            </div>)}
                          {item.memberCount && (<div className="flex items-center gap-1">
                              <Users className="h-3 w-3"/>
                              {item.memberCount} members
                            </div>)}
                        </div>
                      </div>
                    </div>
                  </div>); })}
              </div>)}
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {mockSchedule.filter(function (s) { return s.status === 'pending'; }).length}
              </p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">
                {mockSchedule.filter(function (s) { return s.status === 'completed'; }).length}
              </p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">
                {mockSchedule.length}
              </p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>);
}
