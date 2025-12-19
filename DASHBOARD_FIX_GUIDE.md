# Dashboard Issues - Complete Fix Guide

## Problem Summary
Dashboards on Vercel deployment are experiencing:
1. 404 errors when clicking dashboards
2. Infinite redirects to login page
3. Page refresh/reload on dashboard navigation
4. Different dashboards have varying behavior

**Root Cause:** API authentication and retry logic issues with Render backend

---

## Fix 1: Configure Vercel Environment Variables

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com and log in
2. Select your **imarisha-loans** project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add These Environment Variables
```
VITE_API_URL = https://imarisha-loans.onrender.com/api
VITE_BACKEND_URL = https://imarisha-loans.onrender.com/api
VITE_ENV = production
```

### Step 3: Redeploy
```bash
# In Vercel dashboard, click "Redeploy" or push to main branch
```

---

## Fix 2: Update Frontend API Configuration

### File: `frontend/client/src/lib/api.ts`

**Replace line 5:**
```typescript
// OLD:
const API_BASE = import.meta.env.VITE_API_URL || "https://imarisha-loans.onrender.com/api";

// NEW:
const API_BASE = import.meta.env.VITE_API_URL || 
                import.meta.env.VITE_BACKEND_URL || 
                "https://imarisha-loans.onrender.com/api";

if (typeof window !== 'undefined') {
  console.log('[API] Using API base:', API_BASE);
  console.log('[API] Environment Config:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV
  });
}
```

---

## Fix 3: Fix Auth Redirect Loop (Lines 112-124)

**Current problematic code:**
```typescript
} else {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname; 
    if (currentPath !== '/') { 
      window.location.pathname = '/';  // ❌ HARD REDIRECT - CAUSES ISSUE
    }
  }
  throw new Error('Authentication required');
}
```

**Replace with:**
```typescript
} else {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    // Avoid redirect loop - only redirect from non-auth pages
    if (currentPath !== '/' && currentPath !== '/register' && currentPath !== '/login') {
      // Use soft redirect instead of hard pathname change
      window.location.href = '/?redirect=' + encodeURIComponent(currentPath);
    }
  }
  throw new Error('Authentication required');
}
```

---

## Fix 4: Add Retry Configuration to All Hooks

### File: `frontend/client/src/hooks/use-ai-analytics.ts`

**Add to EVERY useQuery hook:**

```typescript
export const useArrearsForcast = (branchId?: number, monthsAhead = 12) => {
  return useQuery<ArrearsForcast>({
    queryKey: ['arrears-forecast', branchId, monthsAhead],
    queryFn: async () => {
      const params = new URLSearchParams({
        months_ahead: monthsAhead.toString(),
        ...(branchId && { branch_id: branchId.toString() }),
      });
      return api.get(`/ai-analytics/arrears-forecast?${params}`);
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,  // ✅ ADD THIS - only retry once instead of 3 times
    gcTime: 10 * 60 * 1000,  // ✅ ADD THIS - keep cache for 10 min
  });
};
```

Do this for ALL hooks:
- `useArrearsForcast`
- `useMemberBehavior`
- `useClvPrediction`
- `useSeasonalDemand`
- `useAtRiskMembers`
- `useCohortAnalysis`
- `useAISummary`

---

## Fix 5: Update React Query Configuration

### File: `frontend/client/src/lib/queryClient.ts`

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 401/404/403 auth errors
        if (error?.status === 401 || error?.status === 403 || error?.status === 404) {
          return false;
        }
        // Retry up to 1 time for other errors
        return failureCount < 1;
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,  // ✅ Prevent aggressive refetch when tab regains focus
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

---

## Fix 6: Verify Backend Health

### Check if Render backend is running:

```bash
# Test health endpoint
curl https://imarisha-loans.onrender.com/health

# Expected response (200 OK):
# {
#   "status": "healthy",
#   "database": "connected",
#   "cache": "connected"
# }
```

### If backend is down:
1. Go to Render.com dashboard
2. Check **imarisha-loans** service
3. If it shows "Suspended" - restart it
4. Wait 2-3 minutes for it to wake up

---

## Fix 7: Add Error Handling to Executive Dashboard

### File: `frontend/client/src/pages/dashboards/ExecutiveDashboard.tsx`

**Update the useQuery (line 126):**

```typescript
const { data: dashboard, isLoading, isError, error, refetch } = useQuery<DashboardData>({
  queryKey: ['executiveDashboard', branchId, dateRange],
  queryFn: async () => {
    return api.getExecutiveDashboard(branchId || undefined);
  },
  staleTime: 5 * 60 * 1000,
  retry: 1,  // ✅ ADD THIS
  gcTime: 10 * 60 * 1000,  // ✅ ADD THIS
});
```

**Add error boundary (after loading check, line 197):**

```typescript
if (isError) {
  return (
    <Layout>
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Failed to load dashboard</h3>
              <p className="text-sm text-red-700 mt-1">
                {(error as any)?.message || 'Unable to load executive dashboard'}
              </p>
              <button
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
```

---

## Implementation Order

1. **First:** Set Vercel environment variables (Fix 1)
2. **Then:** Update `api.ts` configuration (Fix 2)
3. **Then:** Fix auth redirect (Fix 3)
4. **Then:** Update queryClient defaults (Fix 5)
5. **Then:** Add retry config to all hooks (Fix 4)
6. **Then:** Add error handling to dashboards (Fix 7)
7. **Finally:** Test & verify backend is running (Fix 6)

---

## Testing After Fixes

```bash
# 1. Local development
cd frontend
npm run dev

# Test each dashboard:
# - http://localhost:5173/dashboards/executive
# - http://localhost:5173/dashboards/operations
# - http://localhost:5173/dashboards/risk
# - http://localhost:5173/dashboards/member-analytics
# - http://localhost:5173/dashboards/forecast
# - http://localhost:5173/dashboards/ai-analytics

# 2. Check browser console for API debug logs

# 3. Check network tab for 401/404 errors

# 4. Redeploy to Vercel
git add .
git commit -m "Fix dashboard authentication and retry logic"
git push origin main
```

---

## Debugging

If issues persist:

1. **Check console logs:**
   - Browser DevTools → Console
   - Look for `[API] Using API base:` message
   - Check all error messages

2. **Check Network tab:**
   - Look for failed requests
   - Check response status (401, 404, 500)
   - Verify correct API URL is being called

3. **Check Backend:**
   - Test: `curl https://imarisha-loans.onrender.com/api/health`
   - If failing, restart Render service

4. **Check Vercel logs:**
   - Vercel dashboard → Deployments → View logs
   - Look for environment variable errors

---

## Summary of Changes

| Component | Change | Reason |
|-----------|--------|--------|
| `api.ts` | Add fallback env vars + logging | Debug API URL issues |
| `api.ts` | Fix auth redirect logic | Prevent redirect loops |
| `queryClient.ts` | Add retry rules for 401/404 | Prevent infinite retries |
| `use-ai-analytics.ts` | Add `retry: 1` to all hooks | Prevent aggressive retries |
| Dashboard files | Add `isError` boundary | Show errors instead of reloading |
| Vercel | Set VITE_API_URL env var | Ensure correct API URL in production |

