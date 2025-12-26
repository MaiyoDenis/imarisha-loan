import React, { Suspense, lazy, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoadingSpinner } from "@/components/ui/loading";
import { Toaster } from "@/components/ui/toaster";

// Lazy imports
const NotFound = lazy(() => import("@/pages/shared/NotFound"));
const SystemLocked = lazy(() => import("@/pages/shared/SystemLocked"));
const ITSupportDashboard = lazy(() => import("@/pages/it-support/Dashboard"));
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const Dashboard = lazy(() => import("@/pages/customer/Dashboard"));
const LoanProducts = lazy(() => import("@/pages/admin/LoanProducts"));
const Members = lazy(() => import("@/pages/admin/Members"));
const Groups = lazy(() => import("@/pages/admin/Groups"));
const Loans = lazy(() => import("@/pages/admin/Loans"));
const Branches = lazy(() => import("@/pages/admin/Branches"));
const BranchDetail = lazy(() => import("@/pages/admin/BranchDetail"));
const Users = lazy(() => import("@/pages/admin/Users"));
const Savings = lazy(() => import("@/pages/admin/Savings"));
const Reports = lazy(() => import("@/pages/reports/ReportsDashboardFromAdmin"));
const Settings = lazy(() => import("@/pages/shared/Settings"));
const Store = lazy(() => import("@/pages/procurement/Store"));
const ReportsPage = lazy(() => import("@/pages/reports/ReportsPage").then(module => ({ default: module.ReportsPage })));
const ExecutiveDashboard = lazy(() => import("@/pages/executive/Dashboard"));
const OperationsDashboard = lazy(() => import("@/pages/operations/Dashboard"));
const RiskDashboard = lazy(() => import("@/pages/risk/Dashboard"));
const MemberAnalyticsDashboard = lazy(() => import("@/pages/analytics/Members"));
const ForecastDashboard = lazy(() => import("@/pages/analytics/Forecast"));
const AdminDashboard = lazy(() => import("@/pages/admin/DashboardEnhanced"));
const AIAnalyticsDashboard = lazy(() => import("@/pages/analytics/AI").then(module => ({ default: module.AIAnalyticsDashboard })));
const GamificationDashboard = lazy(() => import("@/pages/gamification/GamificationDashboard").then(module => ({ default: module.GamificationDashboard })));
const FieldOperationsPage = lazy(() => import("@/pages/field-operations/Dashboard").then(module => ({ default: module.FieldOperationsPage })));
const MobileFeaturesDashboard = lazy(() => import("@/pages/mobile-features/MobileFeaturesDashboard").then(module => ({ default: module.MobileFeaturesDashboard })));
const FieldOfficerDashboard = lazy(() => import("@/pages/field-officer/Dashboard").then(module => ({ default: module.FieldOfficerDashboard })));
const GroupMembersPage = lazy(() => import("@/pages/field-officer/Groups").then(module => ({ default: module.GroupMembersPage })));
const MemberDashboardPage = lazy(() => import("@/pages/field-officer/Members").then(module => ({ default: module.MemberDashboardPage })));
const SchedulePage = lazy(() => import("@/pages/field-officer/Schedule").then(module => ({ default: module.SchedulePage })));
const LoanProductList = lazy(() => import("@/pages/admin/LoanProductList"));
const PermissionsManager = lazy(() => import("@/pages/admin/Permissions"));
const ProductManagement = lazy(() => import("@/pages/admin/Products"));
const BranchManagerDashboard = lazy(() => import("@/pages/branch-manager/Dashboard"));
const ProcurementOfficerDashboard = lazy(() => import("@/pages/procurement/Dashboard"));
const MemberApprovalPage = lazy(() => import("@/components/field-officer/MemberApprovalPage").then(module => ({ default: module.MemberApprovalPage })));
const MessagesPage = lazy(() => import("@/pages/shared/Messages"));

function Router() {
    const [location, setLocation] = useLocation();
   
    const { data: subscriptionStatus } = useQuery({
        queryKey: ["/api/subscription/status"],
        refetchInterval: 60000,
        retry: false
    });

    useEffect(() => {
        if (subscriptionStatus?.status === 'expired') {
            const userStr = localStorage.getItem('user');
            let isIT = false;
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    const role = user.role.toLowerCase().replace(/[\s-]+/g, '_').trim();
                    if (role === 'it_support') {
                        isIT = true;
                    }
                } catch(e) {}
            }

            if (!isIT && location !== '/system-locked' && location !== '/') {
                setLocation('/system-locked');
            }
        }
    }, [subscriptionStatus, location, setLocation]);

    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Switch>
          <Route path="/" component={Login}/>
          <Route path="/register" component={Register}/>
          <Route path="/system-locked" component={SystemLocked}/>
          <Route path="/dashboards/it-support">
            {(params) => (
              <ProtectedRoute allowedRoles={["it_support"]} fallbackPath="/dashboard">
                <ITSupportDashboard {...params}/>
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/dashboard" component={Dashboard}/>
          {/* <Route path="/admin/users" component={UserList} /> */}
          {/* <Route path="/admin/branches" component={BranchList} /> */}
          <Route path="/admin/products">
            {(params) => (
              <ProtectedRoute allowedRoles={["admin"]} fallbackPath="/dashboard">
                <LoanProductList {...params}/>
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/admin/permissions">
            {(params) => (
              <ProtectedRoute allowedRoles={["admin"]} fallbackPath="/dashboard">
                <PermissionsManager {...params}/>
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/admin/product-management">
            {(params) => (
              <ProtectedRoute allowedRoles={["admin", "branch_manager"]} fallbackPath="/dashboard">
                <ProductManagement {...params}/>
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/dashboards/admin">
            {(params) => (
              <ProtectedRoute allowedRoles={["admin", "branch_manager"]} fallbackPath="/dashboard">
                <AdminDashboard {...params}/>
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/dashboards/branch-manager">
            {(params) => (
              <ProtectedRoute allowedRoles={["admin", "branch_manager"]} fallbackPath="/dashboard">
                <BranchManagerDashboard {...params}/>
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/dashboards/executive">
            {(params) => (
              <ProtectedRoute allowedRoles={["admin", "executive"]} fallbackPath="/dashboard">
                <ExecutiveDashboard {...params}/>
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/dashboards/operations">
            {(params) => (
              <ProtectedRoute allowedRoles={["admin", "operations_manager"]} fallbackPath="/dashboard">
                <OperationsDashboard {...params}/>
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/dashboards/risk">
            {(params) => (
              <ProtectedRoute allowedRoles={["admin", "risk_manager"]} fallbackPath="/dashboard">
                <RiskDashboard {...params}/>
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/dashboards/member-analytics">
            {(params) => (
              <ProtectedRoute allowedRoles={["admin", "executive", "operations_manager"]} fallbackPath="/dashboard">
                <MemberAnalyticsDashboard {...params}/>
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/dashboards/forecast">
            {(params) => (
              <ProtectedRoute allowedRoles={["admin", "executive"]} fallbackPath="/dashboard">
                <ForecastDashboard {...params}/>
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/dashboards/ai-analytics">
            {(params) => (
              <ProtectedRoute allowedRoles={["admin", "executive"]} fallbackPath="/dashboard">
                <AIAnalyticsDashboard {...params}/>
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/gamification">
            {(params) => (
              <ProtectedRoute allowedRoles={["admin", "executive"]} fallbackPath="/dashboard">
                <GamificationDashboard {...params}/>
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/field-operations">
            {(params) => (
              <ProtectedRoute allowedRoles={["admin", "field_officer"]} fallbackPath="/dashboard">
                <FieldOperationsPage {...params}/>
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/mobile-features">
            {(params) => (
              <ProtectedRoute allowedRoles={["admin", "executive", "field_officer"]} fallbackPath="/dashboard">
                <MobileFeaturesDashboard {...params}/>
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/field-officer/schedule">
            {(params) => (
              <ProtectedRoute allowedRoles={["admin", "field_officer"]} fallbackPath="/dashboard">
                <SchedulePage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/field-officer/groups/:groupId">
            {(params) => (
              <ProtectedRoute allowedRoles={["admin", "field_officer"]} fallbackPath="/dashboard">
                <GroupMembersPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/field-officer/members/:memberId">
            {(params) => (
              <ProtectedRoute allowedRoles={["admin", "field_officer"]} fallbackPath="/dashboard">
                <MemberDashboardPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/field-officer">
            {(params) => (
              <ProtectedRoute allowedRoles={["admin", "field_officer"]} fallbackPath="/dashboard">
                <FieldOfficerDashboard {...params}/>
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/procurement">
            {(params) => (
              <ProtectedRoute allowedRoles={["procurement_officer"]} fallbackPath="/dashboard">
                <ProcurementOfficerDashboard {...params}/>
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/member-approval">
            {(params) => (
              <ProtectedRoute allowedRoles={["admin", "branch_manager", "procurement_officer"]} fallbackPath="/dashboard">
                <MemberApprovalPage />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/users">
            {(params) => (
              <ProtectedRoute allowedRoles={["admin"]} fallbackPath="/dashboard">
                <Users {...params}/>
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/branches">
            {(params) => (
              <ProtectedRoute allowedRoles={["admin"]} fallbackPath="/dashboard">
                <Branches {...params}/>
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/branches/:branchId">
            {(params) => (
              <ProtectedRoute allowedRoles={["admin"]} fallbackPath="/dashboard">
                <BranchDetail />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/groups">
            {(params) => (
              <ProtectedRoute allowedRoles={["admin", "executive", "operations_manager", "field_officer"]} fallbackPath="/dashboard">
                <Groups {...params}/>
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/members">
            {(params) => (
              <ProtectedRoute allowedRoles={["admin", "executive", "operations_manager"]} fallbackPath="/dashboard">
                <Members {...params}/>
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/loans">
            {(params) => (
              <ProtectedRoute allowedRoles={["admin", "executive", "operations_manager", "procurement_officer"]} fallbackPath="/dashboard">
                <Loans {...params}/>
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/products">
            {(params) => (
              <ProtectedRoute allowedRoles={["admin"]} fallbackPath="/dashboard">
                <LoanProducts {...params}/>
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/savings">
            {(params) => (
              <ProtectedRoute allowedRoles={["admin", "executive", "operations_manager"]} fallbackPath="/dashboard">
                <Savings {...params}/>
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/store">
            {(params) => (
              <ProtectedRoute allowedRoles={["admin", "procurement_officer"]} fallbackPath="/dashboard">
                <Store {...params}/>
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/reports">
            {(params) => (
              <ProtectedRoute allowedRoles={["admin", "executive", "operations_manager"]} fallbackPath="/dashboard">
                <Reports {...params}/>
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/reports/advanced">
            {(params) => (
              <ProtectedRoute allowedRoles={["admin", "executive", "operations_manager"]} fallbackPath="/dashboard">
                <ReportsPage {...params}/>
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/messages">
            {(params) => (
              <ProtectedRoute fallbackPath="/dashboard">
                <MessagesPage {...params}/>
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/settings" component={Settings}/>
          <Route component={NotFound}/>
        </Switch>
      </Suspense>
    );
}

function App() {
    return (
      <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster />
      </QueryClientProvider>
    );
}

export default App;
