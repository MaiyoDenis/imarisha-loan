# Frontend Schedule & Groups Navigation Plan

## Objective
Add Schedule and Groups functionality to the field officer sidebar navigation

## Tasks Completed
- ✅ Analyzed existing frontend structure
- ✅ Identified VisitScheduleWidget component
- ✅ Reviewed field officer dashboard integration
- ✅ Updated plan to include Groups navigation

## Implementation Plan

### 1. Create Schedule Page Component
- [ ] Create `/frontend/client/src/pages/field-officer/SchedulePage.tsx`
- [ ] Integrate VisitScheduleWidget with enhanced features
- [ ] Add schedule management capabilities

### 2. Create Groups Page Component
- [ ] Create `/frontend/client/src/pages/field-officer/GroupsPage.tsx`
- [ ] Move groups functionality from dashboard to dedicated page
- [ ] Include group management and viewing capabilities

### 3. Update Sidebar Navigation
- [ ] Add Schedule menu item to AppSidebar.tsx with Calendar icon
- [ ] Add Groups menu item to AppSidebar.tsx with Users icon
- [ ] Include proper icon and role-based access for field_officer role
- [ ] Position items appropriately in the navigation

### 4. Update Routing
- [ ] Add route in App.tsx for /field-officer/schedule
- [ ] Add route in App.tsx for /field-officer/groups
- [ ] Implement protected routes with field_officer role
- [ ] Ensure proper navigation flow

### 5. Update Field Officer Dashboard
- [ ] Remove Groups section from main dashboard
- [ ] Streamline dashboard to focus on key metrics only
- [ ] Keep only essential KPIs and quick actions

### 6. Test Integration
- [ ] Verify sidebar navigation works
- [ ] Test route accessibility
- [ ] Ensure proper role-based access
- [ ] Verify Groups functionality still works

## Files to Modify
- `frontend/client/src/pages/field-officer/SchedulePage.tsx` (new)
- `frontend/client/src/pages/field-officer/GroupsPage.tsx` (new)
- `frontend/client/src/components/layout/AppSidebar.tsx` (update)
- `frontend/client/src/App.tsx` (update routes)
- `frontend/client/src/pages/field-officer/FieldOfficerDashboard.tsx` (remove groups section)
