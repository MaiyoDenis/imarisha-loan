



const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

if (typeof window !== 'undefined') {
  console.log('[API] Using API base:', API_BASE);
}

function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      return false;
    }

    const data = await response.json();
    if (data.access_token) {
      setAuthToken(data.access_token);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

async function fetchAPI(endpoint: string, options: any = {}, retryCount: number = 0) {
  const token = getAuthToken();
  const headers: any = {
    "Content-Type": "application/json",
    ...options?.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && retryCount === 0) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(async (newToken) => {
          headers["Authorization"] = `Bearer ${newToken}`;
          const retryResponse = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers,
            credentials: "include",
          });
          if (!retryResponse.ok) {
            reject(new Error("Request failed after token refresh"));
          } else {
            resolve(retryResponse.json());
          }
        });
      });
    }

    isRefreshing = true;
    const refreshed = await refreshAccessToken();
    isRefreshing = false;

    if (refreshed) {
      const newToken = getAuthToken();
      onRefreshed(newToken || '');
      return fetchAPI(endpoint, options, 1);
    } else {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname; if (currentPath !== '/login') { window.location.pathname = '/login'; }
      }
      throw new Error('Authentication required');
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || error.message || "Request failed");
  }

  return response.json();
}

export const api = {
  // Auth
  login: async (username: string, password: string) => {
    const data = await fetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    // Persist tokens and user for subsequent authorized requests
    const access = data?.access_token || data?.tokens?.access_token;
    const refresh = data?.refresh_token || data?.tokens?.refresh_token;
    if (access) setAuthToken(access);
    if (refresh) localStorage.setItem('refresh_token', refresh);
    if (data?.user) localStorage.setItem('user', JSON.stringify(data.user));

    return data;
  },
  
  register: (data: any) =>
    fetchAPI("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  refresh: async () => {
    const data = await fetchAPI("/auth/refresh", { method: "POST" });
    const access = data?.access_token;
    if (access) setAuthToken(access);
    return data;
  },

  logout: () => fetchAPI("/auth/logout", { method: "POST" }),
  
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

  // Generic methods for API calls
  get: (endpoint: string) => fetchAPI(endpoint),
  post: (endpoint: string, data?: any) => 
    fetchAPI(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),
  put: (endpoint: string, data?: any) =>
    fetchAPI(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),
  patch: (endpoint: string, data?: any) =>
    fetchAPI(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: (endpoint: string) =>
    fetchAPI(endpoint, { method: "DELETE" }),
};

// Flexible API call function for complex requests
export const apiCall = async (endpoint: string, options: any = {}) => {
  const {
    method = "GET",
    body,
    headers = {},
    ...otherOptions
  } = options;

  const requestOptions: any = {
    method,
    headers: {
      "Content-Type": body instanceof FormData ? undefined : "application/json",
      ...headers,
    },
    ...otherOptions,
  };

  if (body && !(body instanceof FormData)) {
    requestOptions.body = body;
  } else if (body instanceof FormData) {
    requestOptions.body = body;
  }

  return fetchAPI(endpoint, requestOptions);
};

