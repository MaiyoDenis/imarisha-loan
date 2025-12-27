import { apiRequest } from "./queryClient.js";

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "https://imarisha-loans.onrender.com/api";

const getUserId = () => {
    if (typeof window === 'undefined') return null;
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.id;
    } catch {
        return null;
    }
};

if (typeof window !== 'undefined') {
    console.log('[API] Configuration:', {
        'API Base': API_BASE,
        'VITE_API_URL': import.meta.env.VITE_API_URL,
        'VITE_BACKEND_URL': import.meta.env.VITE_BACKEND_URL,
        'Mode': import.meta.env.MODE,
        'Dev': import.meta.env.DEV
    });
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Request failed" }));
        throw new Error(error.error || error.message || "Request failed");
    }
    
    return response.json();
}

export const apiCall = fetchAPI;

export const api = {
    // Generic methods
    get: (endpoint: string) => fetchAPI(endpoint),
    post: (endpoint: string, data: any) => fetchAPI(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
    }),
    patch: (endpoint: string, data: any) => fetchAPI(endpoint, {
        method: "PATCH",
        body: JSON.stringify(data),
    }),
    
    // Auth
    login: async (username: string, password: string) => {
        const data = await fetchAPI("/auth/login", {
            method: "POST",
            body: JSON.stringify({ username, password }),
        });
        if (data?.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return data;
    },
    register: (data: any) => fetchAPI("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    logout: () => {
        localStorage.removeItem('user');
        return Promise.resolve({ status: 'success' });
    },
    me: () => fetchAPI("/auth/me"),

    // Dashboard
    getDashboardStats: () => fetchAPI("/dashboard/stats"),
    getDashboardAIInsights: () => fetchAPI("/dashboard/ai-insights"),
    getDashboardActivities: (period: string = "month", limit: number = 10) => {
        return fetchAPI(`/dashboard/activities?period=${period}&limit=${limit}`);
    },
    
    // Advanced Dashboards
    getExecutiveDashboard: (branchId?: number) => {
        const params = branchId ? `?branch_id=${branchId}` : "";
        return fetchAPI(`/dashboards/executive${params}`);
    },
    getOperationsDashboard: (branchId?: number) => {
        const params = branchId ? `?branch_id=${branchId}` : "";
        return fetchAPI(`/dashboards/operations${params}`);
    },
    getRiskDashboard: (branchId?: number) => {
        const params = branchId ? `?branch_id=${branchId}` : "";
        return fetchAPI(`/dashboards/risk${params}`);
    },
    getMemberAnalyticsDashboard: (branchId?: number) => {
        const params = branchId ? `?branch_id=${branchId}` : "";
        return fetchAPI(`/dashboards/member-analytics${params}`);
    },
    getForecastDashboard: (branchId?: number, scenario?: any) => {
        const params = new URLSearchParams();
        if (branchId) params.append("branch_id", branchId.toString());
        if (scenario) {
            if (scenario.revenue_growth) params.append("revenue_growth", scenario.revenue_growth.toString());
            if (scenario.volume_growth) params.append("volume_growth", scenario.volume_growth.toString());
            if (scenario.risk_factor) params.append("risk_factor", scenario.risk_factor.toString());
        }
        return fetchAPI(`/dashboards/forecast?${params.toString()}`);
    },
    getDashboardSummary: (branchId?: number) => {
        const params = branchId ? `?branch_id=${branchId}` : "";
        return fetchAPI(`/dashboards/summary${params}`);
    },
    getAdminDashboard: (branchId?: number) => {
        const params = branchId ? `?branch_id=${branchId}` : "";
        return fetchAPI(`/dashboards/admin${params}`);
    },
    getKPI: (kpiName: string, branchId?: number, period?: string) => {
        const params = new URLSearchParams();
        if (branchId) params.append("branch_id", branchId.toString());
        if (period) params.append("period", period);
        return fetchAPI(`/dashboards/kpi/${kpiName}?${params}`);
    },
    refreshDashboardCache: (dashboardType: string = "all", branchId?: number) => {
        const params = branchId ? `?branch_id=${branchId}` : "";
        return fetchAPI(`/dashboards/refresh${params}`, {
            method: "POST",
            body: JSON.stringify({ dashboard_type: dashboardType }),
        });
    },

    // AI Analytics
    getAIAnalytics: () => fetchAPI("/ai-analytics/summary"),
    getAIInsights: () => fetchAPI("/ai-analytics/insights"),
    getAIForecasts: () => fetchAPI("/ai-analytics/forecasts"),
    getArrearsForcast: (monthsAhead: number = 12, branchId?: number) => {
        const params = new URLSearchParams();
        params.append("months_ahead", monthsAhead.toString());
        if (branchId) params.append("branch_id", branchId.toString());
        return fetchAPI(`/ai-analytics/arrears-forecast?${params}`);
    },
    getMemberBehavior: (branchId?: number) => {
        const params = branchId ? `?branch_id=${branchId}` : "";
        return fetchAPI(`/ai-analytics/member-behavior${params}`);
    },
    getAtRiskMembers: (threshold: number = 0.6, branchId?: number) => {
        const params = new URLSearchParams();
        params.append("threshold", threshold.toString());
        if (branchId) params.append("branch_id", branchId.toString());
        return fetchAPI(`/ai-analytics/at-risk-members?${params}`);
    },
    getCohortAnalysis: (branchId?: number) => {
        const params = branchId ? `?branch_id=${branchId}` : "";
        return fetchAPI(`/ai-analytics/cohort-analysis${params}`);
    },
    getClvPrediction: (memberId: number | string) => fetchAPI(`/ai-analytics/clv-prediction/${memberId}`),
    getSeasonalDemand: (productId?: number | string, monthsAhead: number = 12, branchId?: number) => {
        const params = new URLSearchParams();
        params.append("months_ahead", monthsAhead.toString());
        if (productId) params.append("product_id", productId.toString());
        if (branchId) params.append("branch_id", branchId.toString());
        return fetchAPI(`/ai-analytics/seasonal-demand?${params.toString()}`);
    },

    // Branches
    getBranches: () => fetchAPI("/branches"),
    getBranch: (id: number | string) => fetchAPI(`/branches/${id}`),
    createBranch: (data: any) => fetchAPI("/branches", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    updateBranch: (id: number | string, data: any) => fetchAPI(`/branches/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    }),
    deleteBranch: (id: number | string) => fetchAPI(`/branches/${id}`, { method: "DELETE" }),
    getBranchStaff: (branchId: number | string) => fetchAPI(`/branches/${branchId}/staff`),

    // Groups
    getGroups: () => fetchAPI("/groups"),
    getGroup: (id: number | string) => fetchAPI(`/groups/${id}`),
    createGroup: (data: any) => fetchAPI("/groups", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    updateGroup: (id: number | string, data: any) => fetchAPI(`/groups/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    }),
    deleteGroup: (id: number | string) => fetchAPI(`/groups/${id}`, { method: "DELETE" }),

    // Members
    getMembers: () => fetchAPI("/members"),
    getPendingMembers: () => fetchAPI("/members/pending"),
    approveMember: (id: number | string) => fetchAPI(`/members/${id}/approve`, { method: "POST" }),
    rejectMember: (id: number | string) => fetchAPI(`/members/${id}/reject`, { method: "POST" }),
    bulkApproveMembers: (ids: (number | string)[]) => fetchAPI("/members/bulk-approve", {
        method: "POST",
        body: JSON.stringify({ memberIds: ids }),
    }),
    getMember: (id: number | string) => fetchAPI(`/members/${id}`),
    getSavingsAccounts: () => fetchAPI("/savings"),
    createMember: (data: any) => fetchAPI("/members", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    updateMember: (id: number | string, data: any) => fetchAPI(`/members/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    }),
    deleteMember: (id: number | string) => fetchAPI(`/members/${id}`, { method: "DELETE" }),

    // Loan Products
    getLoanProducts: () => fetchAPI("/loan-products"),
    getLoanProduct: (id: number | string) => fetchAPI(`/loan-products/${id}`),
    getProductCategories: () => fetchAPI("/product-categories"),
    createLoanProduct: (data: any) => fetchAPI("/loan-products", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    updateLoanProduct: (id: number | string, data: any) => fetchAPI(`/loan-products/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    }),
    deleteLoanProduct: (id: number | string) => fetchAPI(`/loan-products/${id}`, { method: "DELETE" }),

    // Loan Types
    getLoanTypes: () => fetchAPI("/loan-types"),
    getLoanType: (id: number | string) => fetchAPI(`/loan-types/${id}`),
    createLoanType: (data: any) => fetchAPI("/loan-types", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    updateLoanType: (id: number | string, data: any) => fetchAPI(`/loan-types/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    }),
    deleteLoanType: (id: number | string) => fetchAPI(`/loan-types/${id}`, { method: "DELETE" }),

    // Loans
    getLoans: (status?: string) => {
        const params = status ? `?status=${status}` : "";
        return fetchAPI(`/loans${params}`);
    },
    getLoan: (id: number | string) => fetchAPI(`/loans/${id}`),
    createLoan: (data: any) => fetchAPI("/loans", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    updateLoan: (id: number | string, data: any) => fetchAPI(`/loans/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    }),
    deleteLoan: (id: number | string) => fetchAPI(`/loans/${id}`, { method: "DELETE" }),
    markLoanUnderReview: (id: number | string) => fetchAPI(`/loans/${id}/under-review`, {
        method: "POST",
    }),
    approveLoan: (id: number | string, data?: any) => fetchAPI(`/loans/${id}/approve`, {
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
    }),
    rejectLoan: (id: number | string, reason: string) => fetchAPI(`/loans/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
    }),
    disburseLoan: (id: number | string, data?: any) => fetchAPI(`/loans/${id}/disburse`, {
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
    }),
    releaseLoan: (id: number | string) => fetchAPI(`/loans/${id}/release`, {
        method: "POST",
    }),

    // Transactions
    getTransactions: (memberId?: number | string, accountType?: string, status?: string) => {
        const params = new URLSearchParams();
        if (memberId) params.append("memberId", memberId.toString());
        if (accountType) params.append("accountType", accountType);
        if (status) params.append("status", status);
        return fetchAPI(`/transactions?${params.toString()}`);
    },
    getTransaction: (id: number | string) => fetchAPI(`/transactions/${id}`),
    createTransaction: (data: any) => fetchAPI("/transactions", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    updateTransaction: (id: number | string, data: any) => fetchAPI(`/transactions/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    }),
    deleteTransaction: (id: number | string) => fetchAPI(`/transactions/${id}`, { method: "DELETE" }),
    approveDeposit: (transactionId: number | string) => fetchAPI(`/transactions/${transactionId}/approve`, {
        method: "POST",
    }),
    rejectDeposit: (transactionId: number | string, reason: string) => fetchAPI(`/transactions/${transactionId}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
    }),
    initiateStkPush: (data: any) => fetchAPI("/transactions/stk-push", {
        method: "POST",
        body: JSON.stringify(data),
    }),

    // Users (Admin Management)
    getUsers: (page?: number, perPage?: number, role?: string, branchId?: number) => {
        const params = new URLSearchParams();
        if (page) params.append("page", page.toString());
        if (perPage) params.append("per_page", perPage.toString());
        if (role) params.append("role", role);
        if (branchId) params.append("branch_id", branchId.toString());
        return fetchAPI(`/users?${params}`);
    },
    getUser: (id: number | string) => fetchAPI(`/users/${id}`),
    createUser: (data: any) => fetchAPI("/users", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    updateUser: (id: number | string, data: any) => fetchAPI(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    }),
    deleteUser: (id: number | string) => fetchAPI(`/users/${id}`, { method: "DELETE" }),
    activateUser: (id: number | string) => fetchAPI(`/users/${id}/activate`, { method: "PUT" }),
    deactivateUser: (id: number | string) => fetchAPI(`/users/${id}/deactivate`, { method: "PUT" }),

    // Suppliers
    getSuppliers: (page?: number, perPage?: number, isActive?: boolean) => {
        const params = new URLSearchParams();
        if (page) params.append("page", page.toString());
        if (perPage) params.append("per_page", perPage.toString());
        if (isActive !== undefined) params.append("is_active", isActive.toString());
        return fetchAPI(`/suppliers?${params}`);
    },
    getSupplier: (id: number | string) => fetchAPI(`/suppliers/${id}`),
    createSupplier: (data: any) => fetchAPI("/suppliers", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    updateSupplier: (id: number | string, data: any) => fetchAPI(`/suppliers/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    }),
    deleteSupplier: (id: number | string) => fetchAPI(`/suppliers/${id}`, { method: "DELETE" }),
    rateSupplier: (id: number | string, rating: number) => fetchAPI(`/suppliers/${id}/rate`, {
        method: "POST",
        body: JSON.stringify({ rating }),
    }),

    // Stock/Inventory
    getStock: (page?: number, perPage?: number) => {
        const params = new URLSearchParams();
        if (page) params.append("page", page.toString());
        if (perPage) params.append("per_page", perPage.toString());
        return fetchAPI(`/stock?${params}`);
    },
    getStockItem: (id: number | string) => fetchAPI(`/stock/${id}`),
    createStockItem: (data: any) => fetchAPI("/stock", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    updateStockItem: (id: number | string, data: any) => fetchAPI(`/stock/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    }),
    deleteStockItem: (id: number | string) => fetchAPI(`/stock/${id}`, { method: "DELETE" }),
    getLowStockProducts: () => fetchAPI("/stock/low-stock"),
    getCriticalStockProducts: () => fetchAPI("/stock/critical-stock"),

    // Reports
    getReports: () => fetchAPI("/reports"),
    getReport: (id: number | string) => fetchAPI(`/reports/${id}`),
    generateReport: (type: string, data: any) => fetchAPI("/reports", {
        method: "POST",
        body: JSON.stringify({ type, ...data }),
    }),

    // Field Officer
    getFieldOfficerGroups: () => fetchAPI("/field-officer/groups"),
    getGroupMembers: (groupId: number | string) => fetchAPI(`/field-officer/groups/${groupId}/members`),
    getGroupStats: (groupId: number | string) => fetchAPI(`/field-officer/groups/${groupId}/stats`),
    getMemberDashboard: (memberId: number | string) => fetchAPI(`/field-officer/members/${memberId}/dashboard`),
    applyLoanForMember: (memberId: number | string, data: any) => fetchAPI(`/field-officer/members/${memberId}/apply-loan`, {
        method: "POST",
        body: JSON.stringify(data),
    }),
    transferFunds: (memberId: number | string, data: any) => fetchAPI(`/field-officer/members/${memberId}/transfer`, {
        method: "POST",
        body: JSON.stringify(data),
    }),
    createFieldOfficerGroup: (data: any) => fetchAPI("/field-officer/groups", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    addMemberToGroup: (data: any) => fetchAPI("/field-officer/members", {
        method: "POST",
        body: JSON.stringify(data),
    }),

    // Field Operations
    getFieldOfficerVisits: (limit: number = 50) => fetchAPI(`/field-operations/visits?limit=${limit}`),
    getFieldOfficerApplications: (limit: number = 50) => fetchAPI(`/field-operations/applications?limit=${limit}`),
    getFieldOfficerPerformance: (period: string = 'month') => fetchAPI(`/field-operations/performance?period=${period}`),
    getSyncStatus: () => fetchAPI("/field-operations/sync/status"),
    getSchedule: () => fetchAPI("/field-operations/visits"),
    createFieldOperation: (data: any) => fetchAPI('/field-operations/visits', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    createAppointment: (data: any) => fetchAPI('/field-operations/visits', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    createGroupVisit: (groupId: number | string, data: any) => fetchAPI(`/field-officer/groups/${groupId}/visits`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    checkMeetingReminders: () => fetchAPI("/field-officer/reminders"),
    
    // Notifications
    getNotifications: (userId: number | string) => fetchAPI(`/notifications/history/${userId}`),
    getUnreadNotificationCount: (userId: number | string) => fetchAPI(`/notifications/unread-count/${userId}`),
    markNotificationRead: (notificationId: string, userId: number | string) => fetchAPI(`/notifications/${notificationId}/mark-read`, {
        method: 'POST',
        body: JSON.stringify({ userId })
    }),

    // Messaging
    getContacts: () => {
        const userId = getUserId();
        const url = userId ? `/messages/contacts?user_id=${userId}` : "/messages/contacts";
        return fetchAPI(url);
    },
    sendMessage: (data: { recipientId: number; content: string }) => {
        const userId = getUserId();
        const url = userId ? `/messages/send?user_id=${userId}` : "/messages/send";
        return fetchAPI(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    getConversation: (contactId: number) => {
        const userId = getUserId();
        const url = userId ? `/messages/conversation/${contactId}?user_id=${userId}` : `/messages/conversation/${contactId}`;
        return fetchAPI(url);
    },
    getUnreadMessageCount: () => {
        const userId = getUserId();
        const url = userId ? `/messages/unread-count?user_id=${userId}` : "/messages/unread-count";
        return fetchAPI(url);
    },

    updateFieldOperationLocation: (id: number | string, location: any) => fetchAPI(`/field-operations/visits/${id}/location`, {
        method: 'PATCH',
        body: JSON.stringify(location)
    }),

    // Gamification
    getGamificationSummary: () => fetchAPI('/gamification/summary'),
    getLeaderboard: (limit: number = 20) => fetchAPI(`/gamification/leaderboard?limit=${limit}`),
    getAchievements: () => fetchAPI('/gamification/achievements'),
    getBadges: () => fetchAPI('/gamification/badges'),
    getPoints: () => fetchAPI('/gamification/points'),
    getRank: () => fetchAPI('/gamification/rank'),
    getChallenges: () => fetchAPI('/gamification/challenges'),
    getMyChallenges: () => fetchAPI('/gamification/my-challenges'),
    getRewards: () => fetchAPI('/gamification/rewards'),
    getMyRewards: () => fetchAPI('/gamification/my-rewards'),
    redeemReward: (rewardId: number | string) => fetchAPI(`/gamification/rewards/${rewardId}/redeem`, { method: 'POST' }),
    joinChallenge: (challengeId: number | string) => fetchAPI(`/gamification/challenges/join/${challengeId}`, { method: 'POST' }),

    // Mobile Features
    syncOfflineData: (data: any) => fetchAPI('/mobile/sync', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
};
