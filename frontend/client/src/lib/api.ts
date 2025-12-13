
const API_BASE = "http://localhost:5000/api";

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    fetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  
  register: (data: any) =>
    fetchAPI("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () => fetchAPI("/auth/logout", { method: "POST" }),
  
  me: () => fetchAPI("/auth/me"),

  // Dashboard
  getDashboardStats: () => fetchAPI("/dashboard/stats"),

  // Branches
  getBranches: () => fetchAPI("/branches"),
  getBranch: (id: number) => fetchAPI(`/branches/${id}`),
  createBranch: (data: any) =>
    fetchAPI("/branches", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Groups
  getGroups: () => fetchAPI("/groups"),
  createGroup: (data: any) =>
    fetchAPI("/groups", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Members
  getMembers: () => fetchAPI("/members"),
  createMember: (data: any) =>
    fetchAPI("/members", {
      method: "POST",
      body: JSON.stringify(data),
    }),

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
  createLoanType: (data: any) =>
    fetchAPI("/loan-types", {
      method: "POST",
      body: JSON.stringify(data),
    }),

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

  // Transactions
  getTransactions: (memberId?: number) => {
    const params = memberId ? `?memberId=${memberId}` : "";
    return fetchAPI(`/transactions${params}`);
  },
  createTransaction: (data: any) =>
    fetchAPI("/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
