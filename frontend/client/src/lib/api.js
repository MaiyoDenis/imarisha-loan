var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "https://imarisha-loans.onrender.com/api";
if (typeof window !== 'undefined') {
    console.log('[API] Configuration:', {
        'API Base': API_BASE,
        'VITE_API_URL': import.meta.env.VITE_API_URL,
        'VITE_BACKEND_URL': import.meta.env.VITE_BACKEND_URL,
        'Mode': import.meta.env.MODE,
        'Dev': import.meta.env.DEV
    });
}
function fetchAPI(endpoint_1) {
    return __awaiter(this, arguments, void 0, function (endpoint, options) {
        var headers, response, error;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    headers = __assign({ "Content-Type": "application/json" }, options === null || options === void 0 ? void 0 : options.headers);
                    return [4 /*yield*/, fetch("".concat(API_BASE).concat(endpoint), __assign(__assign({}, options), { headers: headers, credentials: "include" }))];
                case 1:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json().catch(function () { return ({ error: "Request failed" }); })];
                case 2:
                    error = _a.sent();
                    throw new Error(error.error || error.message || "Request failed");
                case 3: return [2 /*return*/, response.json()];
            }
        });
    });
}
export var apiCall = fetchAPI;
export var api = {
    // Generic methods
    get: function (endpoint) { return fetchAPI(endpoint); },
    post: function (endpoint, data) { return fetchAPI(endpoint, {
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
    }); },
    patch: function (endpoint, data) { return fetchAPI(endpoint, {
        method: "PATCH",
        body: data ? JSON.stringify(data) : undefined,
    }); },
    // Auth
    login: function (username, password) { return __awaiter(void 0, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetchAPI("/auth/login", {
                        method: "POST",
                        body: JSON.stringify({ username: username, password: password }),
                    })];
                case 1:
                    data = _a.sent();
                    if (data === null || data === void 0 ? void 0 : data.user)
                        localStorage.setItem('user', JSON.stringify(data.user));
                    return [2 /*return*/, data];
            }
        });
    }); },
    register: function (data) {
        return fetchAPI("/auth/register", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
    logout: function () {
        localStorage.removeItem('user');
        return Promise.resolve({ status: 'success' });
    },
    me: function () { return fetchAPI("/auth/me"); },
    // Dashboard
    getDashboardStats: function () { return fetchAPI("/dashboard/stats"); },
    // Advanced Dashboards
    getExecutiveDashboard: function (branchId) {
        var params = branchId ? "?branch_id=".concat(branchId) : "";
        return fetchAPI("/dashboards/executive".concat(params));
    },
    getOperationsDashboard: function (branchId) {
        var params = branchId ? "?branch_id=".concat(branchId) : "";
        return fetchAPI("/dashboards/operations".concat(params));
    },
    getRiskDashboard: function (branchId) {
        var params = branchId ? "?branch_id=".concat(branchId) : "";
        return fetchAPI("/dashboards/risk".concat(params));
    },
    getMemberAnalyticsDashboard: function (branchId) {
        var params = branchId ? "?branch_id=".concat(branchId) : "";
        return fetchAPI("/dashboards/member-analytics".concat(params));
    },
    getForecastDashboard: function (branchId) {
        var params = branchId ? "?branch_id=".concat(branchId) : "";
        return fetchAPI("/dashboards/forecast".concat(params));
    },
    getDashboardSummary: function (branchId) {
        var params = branchId ? "?branch_id=".concat(branchId) : "";
        return fetchAPI("/dashboards/summary".concat(params));
    },
    getAdminDashboard: function (branchId) {
        var params = branchId ? "?branch_id=".concat(branchId) : "";
        return fetchAPI("/dashboards/admin".concat(params));
    },
    getKPI: function (kpiName, branchId, period) {
        var params = new URLSearchParams();
        if (branchId)
            params.append("branch_id", branchId.toString());
        if (period)
            params.append("period", period);
        return fetchAPI("/dashboards/kpi/".concat(kpiName, "?").concat(params));
    },
    refreshDashboardCache: function (dashboardType, branchId) {
        if (dashboardType === void 0) { dashboardType = "all"; }
        var params = branchId ? "?branch_id=".concat(branchId) : "";
        return fetchAPI("/dashboards/refresh".concat(params), {
            method: "POST",
            body: JSON.stringify({ dashboard_type: dashboardType }),
        });
    },
    // AI Analytics
    getAIAnalytics: function () { return fetchAPI("/ai-analytics/summary"); },
    getAIInsights: function () { return fetchAPI("/ai-analytics/insights"); },
    getAIForecasts: function () { return fetchAPI("/ai-analytics/forecasts"); },
    getArrearsForcast: function (monthsAhead, branchId) {
        if (monthsAhead === void 0) { monthsAhead = 12; }
        var params = new URLSearchParams();
        params.append("months_ahead", monthsAhead.toString());
        if (branchId)
            params.append("branch_id", branchId.toString());
        return fetchAPI("/ai-analytics/arrears-forecast?".concat(params));
    },
    getMemberBehavior: function (branchId) {
        var params = branchId ? "?branch_id=".concat(branchId) : "";
        return fetchAPI("/ai-analytics/member-behavior".concat(params));
    },
    getAtRiskMembers: function (threshold, branchId) {
        if (threshold === void 0) { threshold = 0.6; }
        var params = new URLSearchParams();
        params.append("threshold", threshold.toString());
        if (branchId)
            params.append("branch_id", branchId.toString());
        return fetchAPI("/ai-analytics/at-risk-members?".concat(params));
    },
    getCohortAnalysis: function (branchId) {
        var params = branchId ? "?branch_id=".concat(branchId) : "";
        return fetchAPI("/ai-analytics/cohort-analysis".concat(params));
    },
    // Branches
    getBranches: function () { return fetchAPI("/branches"); },
    getBranch: function (id) { return fetchAPI("/branches/".concat(id)); },
    createBranch: function (data) {
        return fetchAPI("/branches", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
    updateBranch: function (id, data) {
        return fetchAPI("/branches/".concat(id), {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },
    deleteBranch: function (id) {
        return fetchAPI("/branches/".concat(id), { method: "DELETE" });
    },
    getBranchStaff: function (branchId) {
        return fetchAPI("/branches/".concat(branchId, "/staff"));
    },
    // Groups
    getGroups: function () { return fetchAPI("/groups"); },
    getGroup: function (id) { return fetchAPI("/groups/".concat(id)); },
    createGroup: function (data) {
        return fetchAPI("/groups", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
    updateGroup: function (id, data) {
        return fetchAPI("/groups/".concat(id), {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },
    deleteGroup: function (id) {
        return fetchAPI("/groups/".concat(id), { method: "DELETE" });
    },
    // Members
    getMembers: function () { return fetchAPI("/members"); },
    getMember: function (id) { return fetchAPI("/members/".concat(id)); },
    createMember: function (data) {
        return fetchAPI("/members", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
    updateMember: function (id, data) {
        return fetchAPI("/members/".concat(id), {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },
    deleteMember: function (id) {
        return fetchAPI("/members/".concat(id), { method: "DELETE" });
    },
    // Loan Products
    getLoanProducts: function () { return fetchAPI("/loan-products"); },
    getLoanProduct: function (id) { return fetchAPI("/loan-products/".concat(id)); },
    createLoanProduct: function (data) {
        return fetchAPI("/loan-products", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
    updateLoanProduct: function (id, data) {
        return fetchAPI("/loan-products/".concat(id), {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },
    // Loan Types
    getLoanTypes: function () { return fetchAPI("/loan-types"); },
    getLoanType: function (id) { return fetchAPI("/loan-types/".concat(id)); },
    createLoanType: function (data) {
        return fetchAPI("/loan-types", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
    updateLoanType: function (id, data) {
        return fetchAPI("/loan-types/".concat(id), {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },
    deleteLoanType: function (id) {
        return fetchAPI("/loan-types/".concat(id), { method: "DELETE" });
    },
    // Loans
    getLoans: function (status) {
        var params = status ? "?status=".concat(status) : "";
        return fetchAPI("/loans".concat(params));
    },
    getLoan: function (id) { return fetchAPI("/loans/".concat(id)); },
    createLoan: function (data) {
        return fetchAPI("/loans", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
    updateLoan: function (id, data) {
        return fetchAPI("/loans/".concat(id), {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },
    deleteLoan: function (id) {
        return fetchAPI("/loans/".concat(id), { method: "DELETE" });
    },
    markLoanUnderReview: function (id) {
        return fetchAPI("/loans/".concat(id, "/under-review"), {
            method: "POST",
        });
    },
    approveLoan: function (id, data) {
        return fetchAPI("/loans/".concat(id, "/approve"), {
            method: "POST",
            body: data ? JSON.stringify(data) : undefined,
        });
    },
    rejectLoan: function (id, reason) {
        return fetchAPI("/loans/".concat(id, "/reject"), {
            method: "POST",
            body: JSON.stringify({ reason: reason }),
        });
    },
    disburseLoan: function (id, data) {
        return fetchAPI("/loans/".concat(id, "/disburse"), {
            method: "POST",
            body: data ? JSON.stringify(data) : undefined,
        });
    },
    releaseLoan: function (id) {
        return fetchAPI("/loans/".concat(id, "/release"), {
            method: "POST",
        });
    },
    // Transactions
    getTransactions: function (memberId) {
        var params = memberId ? "?memberId=".concat(memberId) : "";
        return fetchAPI("/transactions".concat(params));
    },
    getTransaction: function (id) { return fetchAPI("/transactions/".concat(id)); },
    createTransaction: function (data) {
        return fetchAPI("/transactions", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
    updateTransaction: function (id, data) {
        return fetchAPI("/transactions/".concat(id), {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },
    deleteTransaction: function (id) {
        return fetchAPI("/transactions/".concat(id), { method: "DELETE" });
    },
    // Users (Admin Management)
    getUsers: function (page, perPage, role, branchId) {
        var params = new URLSearchParams();
        if (page)
            params.append("page", page.toString());
        if (perPage)
            params.append("per_page", perPage.toString());
        if (role)
            params.append("role", role);
        if (branchId)
            params.append("branch_id", branchId.toString());
        return fetchAPI("/users?".concat(params));
    },
    getUser: function (id) { return fetchAPI("/users/".concat(id)); },
    createUser: function (data) {
        return fetchAPI("/users", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
    updateUser: function (id, data) {
        return fetchAPI("/users/".concat(id), {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },
    deleteUser: function (id) {
        return fetchAPI("/users/".concat(id), { method: "DELETE" });
    },
    activateUser: function (id) {
        return fetchAPI("/users/".concat(id, "/activate"), { method: "PUT" });
    },
    deactivateUser: function (id) {
        return fetchAPI("/users/".concat(id, "/deactivate"), { method: "PUT" });
    },
    // Suppliers
    getSuppliers: function (page, perPage, isActive) {
        var params = new URLSearchParams();
        if (page)
            params.append("page", page.toString());
        if (perPage)
            params.append("per_page", perPage.toString());
        if (isActive !== undefined)
            params.append("is_active", isActive.toString());
        return fetchAPI("/suppliers?".concat(params));
    },
    getSupplier: function (id) { return fetchAPI("/suppliers/".concat(id)); },
    createSupplier: function (data) {
        return fetchAPI("/suppliers", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
    updateSupplier: function (id, data) {
        return fetchAPI("/suppliers/".concat(id), {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },
    deleteSupplier: function (id) {
        return fetchAPI("/suppliers/".concat(id), { method: "DELETE" });
    },
    rateSupplier: function (id, rating) {
        return fetchAPI("/suppliers/".concat(id, "/rate"), {
            method: "POST",
            body: JSON.stringify({ rating: rating }),
        });
    },
    // Stock/Inventory
    getStock: function (page, perPage) {
        var params = new URLSearchParams();
        if (page)
            params.append("page", page.toString());
        if (perPage)
            params.append("per_page", perPage.toString());
        return fetchAPI("/stock?".concat(params));
    },
    getStockItem: function (id) { return fetchAPI("/stock/".concat(id)); },
    createStockItem: function (data) {
        return fetchAPI("/stock", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
    updateStockItem: function (id, data) {
        return fetchAPI("/stock/".concat(id), {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },
    deleteStockItem: function (id) {
        return fetchAPI("/stock/".concat(id), { method: "DELETE" });
    },
    getLowStockProducts: function () { return fetchAPI("/stock/low-stock"); },
    getCriticalStockProducts: function () { return fetchAPI("/stock/critical-stock"); },
    // Reports
    getReports: function () { return fetchAPI("/reports"); },
    getReport: function (id) { return fetchAPI("/reports/".concat(id)); },
    generateReport: function (type, data) {
        return fetchAPI("/reports", {
            method: "POST",
            body: JSON.stringify(__assign({ type: type }, data)),
        });
    },
    // Field Officer
    getFieldOfficerGroups: function () { return fetchAPI("/field-officer/groups"); },
    getGroupMembers: function (groupId) { return fetchAPI("/field-officer/groups/".concat(groupId, "/members")); },
    getGroupStats: function (groupId) { return fetchAPI("/field-officer/groups/".concat(groupId, "/stats")); },
    getMemberDashboard: function (memberId) { return fetchAPI("/field-officer/members/".concat(memberId, "/dashboard")); },
    applyLoanForMember: function (memberId, data) {
        return fetchAPI("/field-officer/members/".concat(memberId, "/apply-loan"), {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
    transferFunds: function (memberId, data) {
        return fetchAPI("/field-officer/members/".concat(memberId, "/transfer"), {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
    createFieldOfficerGroup: function (data) {
        return fetchAPI("/field-officer/groups", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
    addMemberToGroup: function (data) { return fetchAPI("/field-officer/groups/members", {
        method: "POST",
        body: JSON.stringify(data),
    }); },
    getSchedule: function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Mock data for now, simulating API call
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                case 1:
                    // Mock data for now, simulating API call
                    _a.sent();
                    return [2 /*return*/, [
                            {
                                id: '1',
                                date: new Date().toISOString(),
                                groupName: 'Nairobi West Group',
                                location: 'Westlands Community Hall',
                                time: '10:00 AM',
                                status: 'in-progress',
                                type: 'meeting',
                                contactPerson: 'John Doe',
                                phone: '+254 712 345 678'
                            },
                            {
                                id: '2',
                                date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                                groupName: 'South C Savings Group',
                                location: 'South C Market',
                                time: '2:00 PM',
                                status: 'pending',
                                type: 'collection',
                                contactPerson: 'Jane Smith',
                                phone: '+254 722 123 456'
                            },
                            {
                                id: '3',
                                date: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
                                groupName: 'Kilimani Business Group',
                                location: 'Kilimani Plaza',
                                time: '3:30 PM',
                                status: 'pending',
                                type: 'disbursement',
                                contactPerson: 'Michael Johnson',
                                phone: '+254 733 987 654'
                            },
                            {
                                id: '4',
                                date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                                groupName: 'Langata Women Group',
                                location: 'Langata Primary School',
                                time: '11:00 AM',
                                status: 'completed',
                                type: 'visit',
                                contactPerson: 'Sarah Williams',
                                phone: '+254 711 222 333'
                            }
                        ]];
            }
        });
    }); },
};
