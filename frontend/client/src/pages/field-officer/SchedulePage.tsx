import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar as CalendarIcon, Clock, MapPin, Search, Filter, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth, 
  isToday, 
  addMonths, 
  subMonths, 
  isAfter, 
  startOfToday, 
  addDays, 
  isWithinInterval 
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue, 
} from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { api } from "@/lib/api";
import Layout from "@/components/layout/Layout";
import { AddAppointmentModal } from "@/components/field-officer/AddAppointmentModal";

interface ScheduleItem {
  id: number;
  groupName: string;
  date: string;
  time: string;
  location: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  type: string;
  contactPerson: string;
  phone: string;
}

export function SchedulePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [filter, setFilter] = useState<string>('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('today');

  const { data: schedule = [], isLoading, refetch } = useQuery<ScheduleItem[]>({
    queryKey: ["schedule"],
    queryFn: api.getSchedule,
  });

  const filteredSchedule = schedule.filter((item) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });
    
  const listSchedule = filteredSchedule.filter((item) => {
    const itemDate = new Date(item.date);
    const today = startOfToday();
        
    switch (timeRange) {
      case 'today':
        return isSameDay(itemDate, today);
      case 'upcoming':
        return isAfter(itemDate, today) || isSameDay(itemDate, today);
      case 'next-7-days':
        return isWithinInterval(itemDate, { start: today, end: addDays(today, 7) });
      case 'next-30-days':
        return isWithinInterval(itemDate, { start: today, end: addDays(today, 30) });
      case 'selected-date':
        return date ? isSameDay(itemDate, date) : true;
      case 'all':
      default:
        return true;
    }
  });

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      setTimeRange('selected-date');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Calendar View Logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
            <p className="text-muted-foreground">Manage your field visits and appointments</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={view === 'list' ? 'default' : 'outline'} 
              onClick={() => setView('list')} 
              size="sm"
            >
              List View
            </Button>
            <Button 
              variant={view === 'calendar' ? 'default' : 'outline'} 
              onClick={() => setView('calendar')} 
              size="sm"
            >
              Calendar View
            </Button>
            <Button size="sm" className="gap-2" onClick={() => setIsModalOpen(true)}>
              <CalendarIcon className="h-4 w-4"/>
              New Appointment
            </Button>
          </div>
        </div>

        <AddAppointmentModal 
          open={isModalOpen} 
          onOpenChange={setIsModalOpen} 
          onSuccess={refetch}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar / Calendar Picker */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            <Card>
              <CardContent className="p-4">
                <Calendar 
                  mode="single" 
                  selected={date} 
                  onSelect={handleDateSelect} 
                  className="rounded-md border w-full flex justify-center"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Upcoming Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Today</span>
                  <Badge variant="secondary">
                    {schedule.filter((i) => isSameDay(new Date(i.date), new Date())).length} Visits
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                    {schedule.filter((i) => i.status === 'pending').length} Pending
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                <Input type="search" placeholder="Search groups, locations..." className="pl-8"/>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Clock className="h-4 w-4 text-muted-foreground"/>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Timeframe"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="upcoming">All Upcoming</SelectItem>
                    <SelectItem value="next-7-days">Next 7 Days</SelectItem>
                    <SelectItem value="next-30-days">Next 30 Days</SelectItem>
                    <SelectItem value="selected-date">Selected Date</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>

                <Filter className="h-4 w-4 text-muted-foreground ml-2"/>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">Loading schedule...</div>
            ) : view === 'list' ? (
              <div className="space-y-4">
                {listSchedule.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
                    No appointments found for this period.
                  </div>
                ) : (
                  listSchedule.map((item) => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row">
                        <div className={`w-full md:w-2 ${
                          item.status === 'completed' ? 'bg-green-500' :
                          item.status === 'pending' ? 'bg-blue-500' :
                          item.status === 'in-progress' ? 'bg-amber-500' :
                          'bg-gray-500'
                        }`}/>
                        <div className="flex-1 p-6">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className={getStatusColor(item.status)}>
                                  {item.status.replace('-', ' ').toUpperCase()}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {item.type.toUpperCase()}
                                </Badge>
                              </div>
                              <h3 className="text-lg font-semibold">{item.groupName}</h3>
                              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="h-4 w-4"/>
                                  {format(new Date(item.date), 'EEEE, MMMM do, yyyy')}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4"/>
                                  {item.time}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4"/>
                                  {item.location}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">View Details</Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4"/>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Edit Appointment</DropdownMenuItem>
                                  <DropdownMenuItem>Reschedule</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">Cancel Appointment</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row justify-between gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Contact: </span>
                              <span className="font-medium">{item.contactPerson}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Phone: </span>
                              <span className="font-medium">{item.phone}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            ) : (
              <Card className="overflow-hidden">
                <div className="p-4 flex items-center justify-between border-b">
                  <h2 className="font-semibold text-lg">
                    {format(currentMonth, 'MMMM yyyy')}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prevMonth}>
                      <ChevronLeft className="h-4 w-4"/>
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                      <ChevronRight className="h-4 w-4"/>
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-7 border-b bg-muted/50">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 auto-rows-fr">
                  {calendarDays.map((day) => {
                    const dayEvents = filteredSchedule.filter((item) => 
                      isSameDay(new Date(item.date), day)
                    );
                    return (
                      <div 
                        key={day.toString()} 
                        className={`
                          min-h-[100px] p-2 border-b border-r relative
                          ${!isSameMonth(day, currentMonth) ? 'bg-muted/20 text-muted-foreground' : 'bg-background'}
                          ${isToday(day) ? 'bg-primary/5' : ''}
                        `}
                        onClick={() => setDate(day)}
                      >
                        <div className={`
                          text-sm font-medium mb-1
                          ${isToday(day) ? 'text-primary' : ''}
                        `}>
                          {format(day, 'd')}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.map((event) => (
                            <div 
                              key={event.id} 
                              className={`
                                text-[10px] p-1 rounded truncate cursor-pointer
                                ${event.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  event.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                                  event.status === 'in-progress' ? 'bg-amber-100 text-amber-800' :
                                  'bg-gray-100 text-gray-800'}
                              `}
                              title={`${event.time} - ${event.groupName}`}
                            >
                              {event.time} {event.groupName}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
