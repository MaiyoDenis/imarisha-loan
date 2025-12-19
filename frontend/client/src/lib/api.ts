



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
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        console.warn('[API] Auth failed - clearing tokens. Current path:', currentPath);
        // Avoid redirect loop - only redirect from non-auth pages
        if (currentPath !== '/' && !currentPath.includes('login') && !currentPath.includes('register')) {
          console.log('[API] Redirecting to login with return URL:', currentPath);
          window.location.href = '/?return=' + encodeURIComponent(currentPath);
        } else if (currentPath !== '/') {
          // If already on login/register, just redirect home
          window.location.href = '/';
        }
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
  getSupplierProducts: (supplierId: number) =>
    fetchAPI(`/suppliers/${supplierId}/products`),
  addSupplierProduct: (supplierId: number, data: any) =>
    fetchAPI(`/suppliers/${supplierId}/products`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  removeSupplierProduct: (productId: number) =>
    fetchAPI(`/suppliers/products/${productId}`, { method: "DELETE" }),
  rateSupplier: (supplierId: number, rating: number) =>
    fetchAPI(`/suppliers/${supplierId}/rating`, {
      method: "PUT",
      body: JSON.stringify({ rating }),
    }),

  // Stock Management
  getStockMovements: (page?: number, perPage?: number, productId?: number, branchId?: number, movementType?: string) => {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (perPage) params.append("per_page", perPage.toString());
    if (productId) params.append("product_id", productId.toString());
    if (branchId) params.append("branch_id", branchId.toString());
    if (movementType) params.append("movement_type", movementType);
    return fetchAPI(`/stock/movements?${params}`);
  },
  getStockMovement: (id: number) => fetchAPI(`/stock/movements/${id}`),
  createStockMovement: (data: any) =>
    fetchAPI("/stock/movements", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  createRestockRequest: (data: any) =>
    fetchAPI("/stock/restock", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getLowStockProducts: (branchId?: number) => {
    const params = branchId ? `?branch_id=${branchId}` : "";
    return fetchAPI(`/stock/low-stock${params}`);
  },
  getCriticalStockProducts: () =>
    fetchAPI("/stock/critical-stock"),
  getBranchInventory: (branchId: number) =>
    fetchAPI(`/stock/branch/${branchId}/inventory`),
  updateBranchInventory: (branchId: number, data: any) =>
    fetchAPI(`/stock/branch/${branchId}/inventory`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

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

