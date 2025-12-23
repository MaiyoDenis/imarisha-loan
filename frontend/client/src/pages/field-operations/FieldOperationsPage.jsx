import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { MapPin, AlertCircle, Download, RefreshCw, TrendingUp, CheckCircle2, Clock, FileText, Plus } from 'lucide-react';
import { AddGroupModal } from '@/components/field-officer/AddGroupModal';
export var FieldOperationsPage = function () {
    var _a = useState('overview'), activeTab = _a[0], setActiveTab = _a[1];
    var _b = useState(false), showAddGroup = _b[0], setShowAddGroup = _b[1];
    var refetch = useQuery({
        queryKey: ["fieldOfficerGroups"],
        queryFn: function () { return api.getFieldOfficerGroups(); },
    }).refetch;
    var stats = {
        totalVisits: 45,
        activeVisits: 8,
        completedVisits: 37,
        totalApplications: 52,
        draftApplications: 5,
        submittedApplications: 47,
        visitsCompleted: 37,
        applicationsSubmitted: 47,
        approvalRate: 92,
        pendingSyncItems: 3
    };
    var recentVisits = [
        { id: 1, member: 'Jane Mwangi', location: 'Nairobi CBD', status: 'completed', date: '2024-12-20', duration: '45 mins' },
        { id: 2, member: 'John Kipchoge', location: 'Westlands', status: 'completed', date: '2024-12-20', duration: '35 mins' },
        { id: 3, member: 'Sarah Kariuki', location: 'South C', status: 'in-progress', date: '2024-12-21', duration: '22 mins' },
        { id: 4, member: 'David Omondi', location: 'Kilimani', status: 'scheduled', date: '2024-12-21', duration: 'N/A' },
        { id: 5, member: 'Emily Kipketer', location: 'Makadara', status: 'completed', date: '2024-12-20', duration: '52 mins' }
    ];
    var applications = [
        { id: 1, member: 'Jane Mwangi', amount: 'KES 50,000', status: 'submitted', date: '2024-12-20' },
        { id: 2, member: 'John Kipchoge', amount: 'KES 75,000', status: 'submitted', date: '2024-12-20' },
        { id: 3, member: 'Sarah Kariuki', amount: 'KES 40,000', status: 'draft', date: '2024-12-21' },
        { id: 4, member: 'David Omondi', amount: 'KES 60,000', status: 'submitted', date: '2024-12-20' },
        { id: 5, member: 'Emily Kipketer', amount: 'KES 55,000', status: 'submitted', date: '2024-12-20' }
    ];
    var getStatusColor = function (status) {
        var colors = {
            'completed': 'bg-secondary/10 border-secondary/30 text-secondary',
            'submitted': 'bg-primary/10 border-primary/30 text-primary',
            'in-progress': 'bg-accent/10 border-accent/30 text-accent',
            'scheduled': 'bg-muted text-muted-foreground',
            'draft': 'bg-muted text-muted-foreground'
        };
        return colors[status] || colors.scheduled;
    };
    var getStatusIcon = function (status) {
        switch (status) {
            case 'completed':
                return <CheckCircle2 size={16}/>;
            case 'submitted':
                return <FileText size={16}/>;
            case 'in-progress':
                return <Clock size={16}/>;
            case 'draft':
            case 'scheduled':
            default:
                return <AlertCircle size={16}/>;
        }
    };
    return (<Layout>
      <div className="min-h-screen p-6 bg-background">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">Field Operations</h1>
              <p className="text-muted-foreground mt-2">Manage your visits, applications, and field work efficiently</p>
            </div>
            <div className="flex gap-3">
              <button onClick={function () { return setShowAddGroup(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition">
                <Plus size={18}/>
                Add Group
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition">
                <RefreshCw size={18}/>
                Sync
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/80 transition">
                <Download size={18}/>
                Export
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-4 md:p-6 rounded-xl bg-card border border-border shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Total Visits</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">{stats.totalVisits}</h3>
                  <p className="text-xs text-secondary mt-2 font-medium">{stats.activeVisits} active</p>
                </div>
                <div className="p-2 md:p-3 rounded-lg flex-shrink-0">
                  <MapPin className="w-6 h-6 md:w-8 md:h-8 text-primary"/>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 rounded-xl bg-card border border-border shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Total Applications</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">{stats.totalApplications}</h3>
                  <p className="text-xs text-secondary mt-2 font-medium">{stats.draftApplications} drafts</p>
                </div>
                <div className="p-2 md:p-3 rounded-lg flex-shrink-0">
                  <FileText className="w-6 h-6 md:w-8 md:h-8 text-secondary"/>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 rounded-xl bg-card border border-border shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Completion Rate</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">{stats.visitsCompleted}</h3>
                  <p className="text-xs text-muted-foreground mt-2">visits completed</p>
                </div>
                <div className="p-2 md:p-3 rounded-lg flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-secondary"/>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 rounded-xl bg-card border border-border shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Approval Rate</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">{stats.approvalRate}%</h3>
                  <p className="text-xs text-muted-foreground mt-2">applications approved</p>
                </div>
                <div className="p-2 md:p-3 rounded-lg flex-shrink-0">
                  <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-primary"/>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {stats.pendingSyncItems > 0 && (<div className="mb-6 p-4 rounded-lg bg-accent/10 border border-accent/30 flex items-start gap-3">
              <AlertCircle size={20} className="text-accent mt-0.5 flex-shrink-0"/>
              <div className="flex-1">
                <h3 className="font-semibold text-accent">Pending Synchronization</h3>
                <p className="text-sm text-accent mt-1">{stats.pendingSyncItems} items waiting to sync. Make sure you have an internet connection.</p>
              </div>
              <button className="px-3 py-1.5 text-sm font-medium bg-accent/20 hover:bg-accent/30 text-accent rounded transition">
                Sync Now
              </button>
            </div>)}

          {/* Tabs */}
          <div className="mb-6 border-b border-border">
            <div className="flex gap-8">
              {['overview', 'visits', 'applications', 'settings'].map(function (tab) { return (<button key={tab} onClick={function () { return setActiveTab(tab); }} className={"px-4 py-3 font-medium capitalize border-b-2 transition ".concat(activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground')}>
                  {tab}
                </button>); })}
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4">Performance Summary</h3>
                <div className="space-y-4 p-6 rounded-xl bg-card border border-border">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Visits Completed</span>
                      <span className="text-sm font-bold text-foreground">{stats.visitsCompleted}/{stats.totalVisits}</span>
                    </div>
                    <div className="w-full bg-background rounded-lg h-2.5">
                      <div className="bg-primary h-2.5 rounded-lg" style={{ width: "".concat((stats.visitsCompleted / stats.totalVisits) * 100, "%") }}/>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Applications Submitted</span>
                      <span className="text-sm font-bold text-foreground">{stats.applicationsSubmitted}/{stats.totalApplications}</span>
                    </div>
                    <div className="w-full bg-background rounded-lg h-2.5">
                      <div className="bg-secondary h-2.5 rounded-lg" style={{ width: "".concat((stats.applicationsSubmitted / stats.totalApplications) * 100, "%") }}/>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Approval Rate</span>
                      <span className="text-sm font-bold text-foreground">{stats.approvalRate}%</span>
                    </div>
                    <div className="w-full bg-background rounded-lg h-2.5">
                      <div className="bg-secondary h-2.5 rounded-lg" style={{ width: "".concat(stats.approvalRate, "%") }}/>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-foreground mb-4">Synchronization Status</h3>
                <div className="p-6 rounded-xl bg-card border border-border">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/10">
                      <span className="text-sm font-medium text-foreground">Last Sync</span>
                      <span className="text-sm text-muted-foreground">Today at 2:45 PM</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
                      <span className="text-sm font-medium text-foreground">Data Synced</span>
                      <span className="text-sm text-primary font-bold">{stats.totalVisits + stats.totalApplications} items</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10">
                      <span className="text-sm font-medium text-foreground">Pending</span>
                      <span className="text-sm text-accent font-bold">{stats.pendingSyncItems} items</span>
                    </div>
                    <button className="w-full mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition font-medium">
                      Manual Sync
                    </button>
                  </div>
                </div>
              </div>
            </div>)}

          {/* Visits Tab */}
          {activeTab === 'visits' && (<div>
              <h3 className="text-lg font-bold text-foreground mb-4">Recent Visits</h3>
              <div className="space-y-2">
                {recentVisits.map(function (visit) { return (<div key={visit.id} className="p-4 rounded-xl bg-card border-l-4 border-l-primary hover:shadow-md transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{visit.member}</h4>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin size={14}/> {visit.location}
                          </span>
                          <span className="text-sm text-muted-foreground">{visit.date}</span>
                          <span className="text-sm text-muted-foreground">{visit.duration}</span>
                        </div>
                      </div>
                      <div className={"px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 border ".concat(getStatusColor(visit.status))}>
                        {getStatusIcon(visit.status)}
                        {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
                      </div>
                    </div>
                  </div>); })}
              </div>
            </div>)}

          {/* Applications Tab */}
          {activeTab === 'applications' && (<div>
              <h3 className="text-lg font-bold text-foreground mb-4">Loan Applications</h3>
              <div className="space-y-2">
                {applications.map(function (app) { return (<div key={app.id} className="p-4 rounded-xl bg-card border border-border hover:shadow-md transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{app.member}</h4>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-lg font-bold text-primary">{app.amount}</span>
                          <span className="text-sm text-muted-foreground">{app.date}</span>
                        </div>
                      </div>
                      <div className={"px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 border ".concat(getStatusColor(app.status))}>
                        {getStatusIcon(app.status)}
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </div>
                    </div>
                  </div>); })}
              </div>
            </div>)}

          {/* Settings Tab */}
          {activeTab === 'settings' && (<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-card border border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">Synchronization Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Sync Frequency</label>
                    <select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground hover:border-primary/40 transition focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>Every 15 minutes</option>
                      <option>Every 30 minutes</option>
                      <option>Every hour</option>
                      <option>Manual only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Wi-Fi Only</label>
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded cursor-pointer"/>
                    <p className="text-xs text-muted-foreground mt-1">Only sync when connected to Wi-Fi</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-card border border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">Storage & Cache</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Local Data</span>
                      <span className="text-sm font-bold text-primary">2.4 MB</span>
                    </div>
                    <div className="w-full bg-background rounded-lg h-2.5">
                      <div className="bg-primary h-2.5 rounded-lg" style={{ width: '40%' }}/>
                    </div>
                  </div>
                  <button className="w-full px-4 py-2 border border-border rounded-lg hover:bg-background transition font-medium text-foreground">
                    Clear Cache
                  </button>
                </div>
              </div>
            </div>)}
        </div>
      </div>

      <AddGroupModal open={showAddGroup} onOpenChange={setShowAddGroup} onSuccess={function () {
            refetch();
            setShowAddGroup(false);
        }}/>
    </Layout>);
};
export default FieldOperationsPage;
