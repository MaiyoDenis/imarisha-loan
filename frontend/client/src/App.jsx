import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import LoanProducts from "@/pages/LoanProducts";
import Members from "@/pages/Members";
import Groups from "@/pages/Groups";
import Loans from "@/pages/Loans";
import Branches from "@/pages/Branches";
import BranchDetail from "@/pages/BranchDetail";
import Users from "@/pages/Users";
import Savings from "@/pages/Savings";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Store from "@/pages/Store";
import { ReportsPage } from "@/pages/reports/ReportsPage";
import ExecutiveDashboard from "@/pages/dashboards/ExecutiveDashboard";
import OperationsDashboard from "@/pages/dashboards/OperationsDashboard";
import RiskDashboard from "@/pages/dashboards/RiskDashboard";
import MemberAnalyticsDashboard from "@/pages/dashboards/MemberAnalyticsDashboard";
import ForecastDashboard from "@/pages/dashboards/ForecastDashboard";
import AdminDashboard from "@/pages/dashboards/AdminDashboard";
import { AIAnalyticsDashboard } from "@/pages/dashboards/AIAnalyticsDashboard";
import { GamificationDashboard } from "@/pages/gamification/GamificationDashboard";
import { FieldOperationsPage } from "@/pages/field-operations/FieldOperationsPage";
import { MobileFeaturesDashboard } from "@/pages/mobile-features/MobileFeaturesDashboard";
import { FieldOfficerDashboard } from "@/pages/field-officer/FieldOfficerDashboard";
import { GroupMembersPage } from "@/pages/field-officer/GroupMembersPage";
import { MemberDashboardPage } from "@/pages/field-officer/MemberDashboardPage";
import { SchedulePage } from "@/pages/field-officer/SchedulePage";
// import UserList from "@/pages/Admin/Users/UserList";
// import BranchList from "@/pages/Admin/Branches/BranchList";
import LoanProductList from "@/pages/Admin/LoanProductList";
import PermissionsManager from "@/pages/Admin/PermissionsManager";
import ProductManagement from "@/pages/Admin/ProductManagement";
import BranchManagerDashboard from "@/pages/Dashboards/BranchManagerDashboard";
import ProcurementOfficerDashboard from "@/pages/ProcurementOfficerDashboard";
function Router() {
    return (<Switch>
      <Route path="/" component={Login}/>
      <Route path="/register" component={Register}/>
      <Route path="/dashboard" component={Dashboard}/>
      {/* <Route path="/admin/users" component={UserList} /> */}
      {/* <Route path="/admin/branches" component={BranchList} /> */}
      <Route path="/admin/products">
        {function (params) { return (<ProtectedRoute allowedRoles={["admin"]} fallbackPath="/dashboard">
            <LoanProductList {...params}/>
          </ProtectedRoute>); }}
      </Route>
      <Route path="/admin/permissions">
        {function (params) { return (<ProtectedRoute allowedRoles={["admin"]} fallbackPath="/dashboard">
            <PermissionsManager {...params}/>
          </ProtectedRoute>); }}
      </Route>
      <Route path="/admin/product-management">
        {function (params) { return (<ProtectedRoute allowedRoles={["admin", "branch_manager"]} fallbackPath="/dashboard">
            <ProductManagement {...params}/>
          </ProtectedRoute>); }}
      </Route>
      <Route path="/dashboards/admin">
        {function (params) { return (<ProtectedRoute allowedRoles={["admin", "branch_manager"]} fallbackPath="/dashboard">
            <AdminDashboard {...params}/>
          </ProtectedRoute>); }}
      </Route>
      <Route path="/dashboards/branch-manager">
        {function (params) { return (<ProtectedRoute allowedRoles={["admin", "branch_manager"]} fallbackPath="/dashboard">
            <BranchManagerDashboard {...params}/>
          </ProtectedRoute>); }}
      </Route>
      <Route path="/dashboards/executive">
        {function (params) { return (<ProtectedRoute allowedRoles={["admin", "executive"]} fallbackPath="/dashboard">
            <ExecutiveDashboard {...params}/>
          </ProtectedRoute>); }}
      </Route>
      <Route path="/dashboards/operations">
        {function (params) { return (<ProtectedRoute allowedRoles={["admin", "operations_manager"]} fallbackPath="/dashboard">
            <OperationsDashboard {...params}/>
          </ProtectedRoute>); }}
      </Route>
      <Route path="/dashboards/risk">
        {function (params) { return (<ProtectedRoute allowedRoles={["admin", "risk_manager"]} fallbackPath="/dashboard">
            <RiskDashboard {...params}/>
          </ProtectedRoute>); }}
      </Route>
      <Route path="/dashboards/member-analytics">
        {function (params) { return (<ProtectedRoute allowedRoles={["admin", "executive", "operations_manager"]} fallbackPath="/dashboard">
            <MemberAnalyticsDashboard {...params}/>
          </ProtectedRoute>); }}
      </Route>
      <Route path="/dashboards/forecast">
        {function (params) { return (<ProtectedRoute allowedRoles={["admin", "executive"]} fallbackPath="/dashboard">
            <ForecastDashboard {...params}/>
          </ProtectedRoute>); }}
      </Route>
      <Route path="/dashboards/ai-analytics">
        {function (params) { return (<ProtectedRoute allowedRoles={["admin", "executive"]} fallbackPath="/dashboard">
            <AIAnalyticsDashboard {...params}/>
          </ProtectedRoute>); }}
      </Route>
      <Route path="/gamification">
        {function (params) { return (<ProtectedRoute allowedRoles={["admin", "executive"]} fallbackPath="/dashboard">
            <GamificationDashboard {...params}/>
          </ProtectedRoute>); }}
      </Route>
      <Route path="/field-operations">
        {function (params) { return (<ProtectedRoute allowedRoles={["admin", "field_officer"]} fallbackPath="/dashboard">
            <FieldOperationsPage {...params}/>
          </ProtectedRoute>); }}
      </Route>
      <Route path="/mobile-features">
        {function (params) { return (<ProtectedRoute allowedRoles={["admin", "executive"]} fallbackPath="/dashboard">
            <MobileFeaturesDashboard {...params}/>
          </ProtectedRoute>); }}
      </Route>
      <Route path="/field-officer/schedule">
        {function (params) { return (<ProtectedRoute allowedRoles={["admin", "field_officer"]} fallbackPath="/dashboard">
            <SchedulePage />
          </ProtectedRoute>); }}
      </Route>
      <Route path="/field-officer/groups/:groupId">
        {function (params) { return (<ProtectedRoute allowedRoles={["admin", "field_officer"]} fallbackPath="/dashboard">
            <GroupMembersPage />
          </ProtectedRoute>); }}
      </Route>
      <Route path="/field-officer/members/:memberId">
        {function (params) { return (<ProtectedRoute allowedRoles={["admin", "field_officer"]} fallbackPath="/dashboard">
            <MemberDashboardPage />
          </ProtectedRoute>); }}
      </Route>
      <Route path="/field-officer">
        {function (params) { return (<ProtectedRoute allowedRoles={["admin", "field_officer"]} fallbackPath="/dashboard">
            <FieldOfficerDashboard {...params}/>
          </ProtectedRoute>); }}
      </Route>
      <Route path="/procurement">
        {function (params) { return (<ProtectedRoute allowedRoles={["procurement_officer"]} fallbackPath="/dashboard">
            <ProcurementOfficerDashboard {...params}/>
          </ProtectedRoute>); }}
      </Route>
      <Route path="/users">
        {function (params) { return (<ProtectedRoute allowedRoles={["admin"]} fallbackPath="/dashboard">
            <Users {...params}/>
          </ProtectedRoute>); }}
      </Route>
      <Route path="/branches">
        {function (params) { return (<ProtectedRoute allowedRoles={["admin"]} fallbackPath="/dashboard">
            <Branches {...params}/>
          </ProtectedRoute>); }}
      </Route>
      <Route path="/branches/:branchId">
        {function (params) { return (<ProtectedRoute allowedRoles={["admin"]} fallbackPath="/dashboard">
            <BranchDetail />
          </ProtectedRoute>); }}
      </Route>
      <Route path="/groups">
        {function (params) { return (<ProtectedRoute allowedRoles={["admin", "executive", "operations_manager", "field_officer"]} fallbackPath="/dashboard">
            <Groups {...params}/>
          </ProtectedRoute>); }}
      </Route>
      <Route path="/members">
        {function (params) { return (<ProtectedRoute allowedRoles={["admin", "executive", "operations_manager"]} fallbackPath="/dashboard">
            <Members {...params}/>
          </ProtectedRoute>); }}
      </Route>
      <Route path="/loans">
        {function (params) { return (<ProtectedRoute allowedRoles={["admin", "executive", "operations_manager", "procurement_officer"]} fallbackPath="/dashboard">
            <Loans {...params}/>
          </ProtectedRoute>); }}
      </Route>
      <Route path="/products">
        {function (params) { return (<ProtectedRoute allowedRoles={["admin"]} fallbackPath="/dashboard">
            <LoanProducts {...params}/>
          </ProtectedRoute>); }}
      </Route>
      <Route path="/savings">
        {function (params) { return (<ProtectedRoute allowedRoles={["admin", "executive", "operations_manager"]} fallbackPath="/dashboard">
            <Savings {...params}/>
          </ProtectedRoute>); }}
      </Route>
      <Route path="/store">
        {function (params) { return (<ProtectedRoute allowedRoles={["admin", "procurement_officer"]} fallbackPath="/dashboard">
            <Store {...params}/>
          </ProtectedRoute>); }}
      </Route>
      <Route path="/reports">
        {function (params) { return (<ProtectedRoute allowedRoles={["admin", "executive", "operations_manager"]} fallbackPath="/dashboard">
            <Reports {...params}/>
          </ProtectedRoute>); }}
      </Route>
      <Route path="/reports/advanced">
        {function (params) { return (<ProtectedRoute allowedRoles={["admin", "executive", "operations_manager"]} fallbackPath="/dashboard">
            <ReportsPage {...params}/>
          </ProtectedRoute>); }}
      </Route>
      <Route path="/settings" component={Settings}/>
      <Route component={NotFound}/>
    </Switch>);
}
function App() {
    return (<QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>);
}
export default App;
