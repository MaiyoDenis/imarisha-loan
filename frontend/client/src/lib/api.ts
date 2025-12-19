const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "https://imarisha-loans.onrender.com/api";

if (typeof window !== 'undefined') {
  console.log('[API] Configuration:', {
    'API Base': API_BASE,
    'VITE_API_URL': import.meta.env.VITE_API_URL,
    'VITE_BACKEND_URL': import.meta.env.VITE_BACKEND_URL,
    'Mode': import.meta.env.MODE,
    'Dev': import.meta.env.DEV
  });
}

async function fetchAPI(endpoint: string, options: any = {}) {
  const headers: any = {
    "Content-Type": "application/json",
    ...options?.headers,
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
  post: (endpoint: string, data?: any) => fetchAPI(endpoint, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  }),

  // Auth
  login: async (username: string, password: string) => {
    const data = await fetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    if (data?.user) localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },
  
  register: (data: any) =>
    fetchAPI("/auth/register", {
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
  getForecastDashboard: (branchId?: number) => {
    const params = branchId ? `?branch_id=${branchId}` : "";
    return fetchAPI(`/dashboards/forecast${params}`);
  },
  getDashboardSummary: (branchId?: number) => {
    const params = branchId ? `?branch_id=${branchId}` : "";
    return fetchAPI(`/dashboards/summary${params}`);
  },
  getKPI: (kpiName: string, branchId?: number, period?: string) => {
    const params = new URLSearchParams();
    if (branchId) params.append("branch_id", branchId.toString());
    if (period) params.append("period", period);
    return fetchAPI(`/dashboards/kpi/${kpiName}?${params}`);
  },
  refreshDashboardCache: (dashboardType = "all", branchId?: number) => {
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
  getArrearsForcast: (monthsAhead = 12, branchId?: number) => {
    const params = new URLSearchParams();
    params.append("months_ahead", monthsAhead.toString());
    if (branchId) params.append("branch_id", branchId.toString());
    return fetchAPI(`/ai-analytics/arrears-forecast?${params}`);
  },
  getMemberBehavior: (branchId?: number) => {
    const params = branchId ? `?branch_id=${branchId}` : "";
    return fetchAPI(`/ai-analytics/member-behavior${params}`);
  },
  getAtRiskMembers: (threshold = 0.6, branchId?: number) => {
    const params = new URLSearchParams();
    params.append("threshold", threshold.toString());
    if (branchId) params.append("branch_id", branchId.toString());
    return fetchAPI(`/ai-analytics/at-risk-members?${params}`);
  },
  getCohortAnalysis: (branchId?: number) => {
    const params = branchId ? `?branch_id=${branchId}` : "";
    return fetchAPI(`/ai-analytics/cohort-analysis${params}`);
  },

  // Branches
  getBranches: () => fetchAPI("/branches"),
  getBranch: (id: number) => fetchAPI(`/branches/${id}`),
  createBranch: (data: any) =>
    fetchAPI("/branches", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateBranch: (id: number, data: any) =>
    fetchAPI(`/branches/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteBranch: (id: number) =>
    fetchAPI(`/branches/${id}`, { method: "DELETE" }),
  getBranchStaff: (branchId: number) =>
    fetchAPI(`/branches/${branchId}/staff`),

  // Groups
  getGroups: () => fetchAPI("/groups"),
  getGroup: (id: number) => fetchAPI(`/groups/${id}`),
  createGroup: (data: any) =>
    fetchAPI("/groups", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateGroup: (id: number, data: any) =>
    fetchAPI(`/groups/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteGroup: (id: number) =>
    fetchAPI(`/groups/${id}`, { method: "DELETE" }),

  // Members
  getMembers: () => fetchAPI("/members"),
  getMember: (id: number) => fetchAPI(`/members/${id}`),
  createMember: (data: any) =>
    fetchAPI("/members", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateMember: (id: number, data: any) =>
    fetchAPI(`/members/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteMember: (id: number) =>
    fetchAPI(`/members/${id}`, { method: "DELETE" }),

  // Loan Products
  getLoanProducts: () => fetchAPI("/loan-products"),
  getLoanProduct: (id: number) => fetchAPI(`/loan-products/${id}`),
  createLoanProduct: (data: any) =>
    fetchAPI("/loan-products", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateLoanProduct: (id: number, data: any) =>
    fetchAPI(`/loan-products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Loan Types
  getLoanTypes: () => fetchAPI("/loan-types"),
  getLoanType: (id: number) => fetchAPI(`/loan-types/${id}`),
  createLoanType: (data: any) =>
    fetchAPI("/loan-types", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateLoanType: (id: number, data: any) =>
    fetchAPI(`/loan-types/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteLoanType: (id: number) =>
    fetchAPI(`/loan-types/${id}`, { method: "DELETE" }),

  // Loans
  getLoans: (status?: string) => {
    const params = status ? `?status=${status}` : "";
    return fetchAPI(`/loans${params}`);
  },
  getLoan: (id: number) => fetchAPI(`/loans/${id}`),
  createLoan: (data: any) =>
    fetchAPI("/loans", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateLoan: (id: number, data: any) =>
    fetchAPI(`/loans/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteLoan: (id: number) =>
    fetchAPI(`/loans/${id}`, { method: "DELETE" }),
  markLoanUnderReview: (id: number) =>
    fetchAPI(`/loans/${id}/under-review`, {
      method: "POST",
    }),
  approveLoan: (id: number, data?: any) =>
    fetchAPI(`/loans/${id}/approve`, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),
  rejectLoan: (id: number, reason?: string) =>
    fetchAPI(`/loans/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
  disburseLoan: (id: number, data?: any) =>
    fetchAPI(`/loans/${id}/disburse`, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),
  releaseLoan: (id: number) =>
    fetchAPI(`/loans/${id}/release`, {
      method: "POST",
    }),

  // Transactions
  getTransactions: (memberId?: number) => {
    const params = memberId ? `?memberId=${memberId}` : "";
    return fetchAPI(`/transactions${params}`);
  },
  getTransaction: (id: number) => fetchAPI(`/transactions/${id}`),
  createTransaction: (data: any) =>
    fetchAPI("/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateTransaction: (id: number, data: any) =>
    fetchAPI(`/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteTransaction: (id: number) =>
    fetchAPI(`/transactions/${id}`, { method: "DELETE" }),

  // Users (Admin Management)
  getUsers: (page?: number, perPage?: number, role?: string, branchId?: number) => {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (perPage) params.append("per_page", perPage.toString());
    if (role) params.append("role", role);
    if (branchId) params.append("branch_id", branchId.toString());
    return fetchAPI(`/users?${params}`);
  },
  getUser: (id: number) => fetchAPI(`/users/${id}`),
  createUser: (data: any) =>
    fetchAPI("/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateUser: (id: number, data: any) =>
    fetchAPI(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteUser: (id: number) =>
    fetchAPI(`/users/${id}`, { method: "DELETE" }),
  activateUser: (id: number) =>
    fetchAPI(`/users/${id}/activate`, { method: "PUT" }),
  deactivateUser: (id: number) =>
    fetchAPI(`/users/${id}/deactivate`, { method: "PUT" }),

  // Suppliers
  getSuppliers: (page?: number, perPage?: number, isActive?: boolean) => {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (perPage) params.append("per_page", perPage.toString());
    if (isActive !== undefined) params.append("is_active", isActive.toString());
    return fetchAPI(`/suppliers?${params}`);
  },
  getSupplier: (id: number) => fetchAPI(`/suppliers/${id}`),
  createSupplier: (data: any) =>
    fetchAPI("/suppliers", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateSupplier: (id: number, data: any) =>
    fetchAPI(`/suppliers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteSupplier: (id: number) =>
    fetchAPI(`/suppliers/${id}`, { method: "DELETE" }),
  rateSupplier: (id: number, rating: number) =>
    fetchAPI(`/suppliers/${id}/rate`, {
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
  getStockItem: (id: number) => fetchAPI(`/stock/${id}`),
  createStockItem: (data: any) =>
    fetchAPI("/stock", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateStockItem: (id: number, data: any) =>
    fetchAPI(`/stock/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteStockItem: (id: number) =>
    fetchAPI(`/stock/${id}`, { method: "DELETE" }),
  getLowStockProducts: () => fetchAPI("/stock/low-stock"),
  getCriticalStockProducts: () => fetchAPI("/stock/critical-stock"),

  // Reports
  getReports: () => fetchAPI("/reports"),
  getReport: (id: number) => fetchAPI(`/reports/${id}`),
  generateReport: (type: string, data: any) =>
    fetchAPI("/reports", {
      method: "POST",
      body: JSON.stringify({ type, ...data }),
    }),

  // Field Officer
  getFieldOfficerGroups: () => fetchAPI("/field-officer/groups"),
  getGroupMembers: (groupId: number) => fetchAPI(`/field-officer/groups/${groupId}/members`),
  getGroupStats: (groupId: number) => fetchAPI(`/field-officer/groups/${groupId}/stats`),
  getMemberDashboard: (memberId: number) => fetchAPI(`/field-officer/members/${memberId}/dashboard`),
  applyLoanForMember: (memberId: number, data: any) =>
    fetchAPI(`/field-officer/members/${memberId}/apply-loan`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  transferFunds: (memberId: number, data: any) =>
    fetchAPI(`/field-officer/members/${memberId}/transfer`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  createFieldOfficerGroup: (data: {
    name: string;
    location?: string;
    description?: string;
  }) =>
    fetchAPI("/field-officer/groups", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  addMemberToGroup: (data: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    idNumber?: string;
    memberCode?: string;
    groupId: number;
  }) =>
    fetchAPI("/field-officer/members", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
