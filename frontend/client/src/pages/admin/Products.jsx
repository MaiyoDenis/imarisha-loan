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
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { api } from '@/lib/api';
import { useRoleRedirect } from '@/hooks/use-role-redirect';
export default function ProductManagement() {
    var _this = this;
    useRoleRedirect({
        allowedRoles: ['admin', 'branch_manager'],
        fallbackPath: '/dashboard'
    });
    var _a = useState(false), showHidden = _a[0], setShowHidden = _a[1];
    var _b = useState(null), editingId = _b[0], setEditingId = _b[1];
    var _c = useState(false), isAddingNew = _c[0], setIsAddingNew = _c[1];
    var _d = useState({
        name: '',
        categoryId: '1',
        buyingPrice: '',
        sellingPrice: '',
        stockQuantity: '0',
        lowStockThreshold: '10'
    }), formData = _d[0], setFormData = _d[1];
    var _e = useQuery({
        queryKey: ['loan-products'],
        queryFn: api.getLoanProducts,
    }), _f = _e.data, products = _f === void 0 ? [] : _f, isLoading = _e.isLoading, refetch = _e.refetch;
    var handleAddProduct = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, api.post('/loan-products', {
                            name: formData.name,
                            categoryId: parseInt(formData.categoryId),
                            buyingPrice: parseFloat(formData.buyingPrice),
                            sellingPrice: parseFloat(formData.sellingPrice),
                            stockQuantity: parseInt(formData.stockQuantity),
                            lowStockThreshold: parseInt(formData.lowStockThreshold)
                        })];
                case 2:
                    _a.sent();
                    setFormData({
                        name: '',
                        categoryId: '1',
                        buyingPrice: '',
                        sellingPrice: '',
                        stockQuantity: '0',
                        lowStockThreshold: '10'
                    });
                    setIsAddingNew(false);
                    refetch();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error adding product:', error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleUpdateProduct = function (id, data) { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, api.patch("/loan-products/".concat(id), data)];
                case 1:
                    _a.sent();
                    setEditingId(null);
                    refetch();
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error updating product:', error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteProduct = function (id) { return __awaiter(_this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm('Are you sure you want to delete this product?')) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, api.patch("/loan-products/".concat(id), { isActive: false })];
                case 2:
                    _a.sent();
                    refetch();
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error('Error deleting product:', error_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var formatCurrency = function (value) {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 2
        }).format(typeof value === 'string' ? parseFloat(value) : value);
    };
    var calculateMargin = function (buying, selling) {
        var b = parseFloat(buying);
        var s = parseFloat(selling);
        if (b === 0)
            return 0;
        return ((s - b) / b) * 100;
    };
    var visibleProducts = products.filter(function (p) { return showHidden || p.isActive; });
    return (<Layout>
      <div className="min-h-screen p-6 bg-background">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">Product Management</h1>
              <p className="text-muted-foreground mt-2">Manage loan products with pricing and market values</p>
            </div>
            <div className="flex gap-3">
              <button onClick={function () { return refetch(); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition">
                <RefreshCw size={18}/>
                Refresh
              </button>
              <button onClick={function () { return setIsAddingNew(true); }} className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/80 transition">
                <Plus size={18}/>
                Add Product
              </button>
            </div>
          </div>

          {/* Toggle Hidden Products */}
          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showHidden} onChange={function (e) { return setShowHidden(e.target.checked); }} className="w-4 h-4"/>
              <span className="text-foreground font-medium">Show inactive products</span>
            </label>
          </div>

          {/* Add New Product Form */}
          {isAddingNew && (<div className="mb-6 bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Add New Product</h2>
              <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Product Name</label>
                  <input type="text" value={formData.name} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { name: e.target.value })); }} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Category</label>
                  <select value={formData.categoryId} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { categoryId: e.target.value })); }} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="1">Energy</option>
                    <option value="2">Electronics</option>
                    <option value="3">Agriculture</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Market Price (Cost)</label>
                  <input type="number" step="0.01" value={formData.buyingPrice} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { buyingPrice: e.target.value })); }} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required/>
                  <p className="text-xs text-muted-foreground mt-1">Only visible to admins</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Selling Price</label>
                  <input type="number" step="0.01" value={formData.sellingPrice} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { sellingPrice: e.target.value })); }} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Initial Stock</label>
                  <input type="number" value={formData.stockQuantity} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { stockQuantity: e.target.value })); }} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Low Stock Threshold</label>
                  <input type="number" value={formData.lowStockThreshold} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { lowStockThreshold: e.target.value })); }} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
                </div>
                <div className="md:col-span-3 flex gap-3">
                  <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition font-medium">
                    Save Product
                  </button>
                  <button type="button" onClick={function () { return setIsAddingNew(false); }} className="px-6 py-2 bg-slate-300 text-foreground rounded-lg hover:bg-slate-400 transition font-medium">
                    Cancel
                  </button>
                </div>
              </form>
            </div>)}

          {/* Products Table */}
          {isLoading ? (<div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading products...</p>
            </div>) : visibleProducts.length === 0 ? (<div className="bg-card rounded-lg border border-border p-12 text-center">
              <p className="text-muted-foreground">No products found. Create one to get started.</p>
            </div>) : (<div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-background border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Product Name</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">Market Price</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">Selling Price</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">Margin %</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">Stock</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {visibleProducts.map(function (product) { return (<tr key={product.id} className={!product.isActive ? 'bg-background opacity-50' : 'hover:bg-background transition'}>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{product.name}</td>
                        <td className="px-4 py-3 text-sm text-right text-muted-foreground">{formatCurrency(product.buyingPrice)}</td>
                        <td className="px-4 py-3 text-sm text-right text-muted-foreground">{formatCurrency(product.sellingPrice)}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-secondary">
                          {calculateMargin(product.buyingPrice, product.sellingPrice)}%
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-muted-foreground">
                          <span className={product.stockQuantity <= product.lowStockThreshold ? 'text-destructive font-semibold' : ''}>
                            {product.stockQuantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={"px-2 py-1 rounded text-xs font-semibold ".concat(product.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-background text-slate-800')}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={function () { return setEditingId(editingId === product.id ? null : product.id); }} className="p-2 hover:bg-blue-100 rounded-lg transition" title="Edit">
                              <Edit2 size={16} className="text-primary"/>
                            </button>
                            <button onClick={function () { return handleDeleteProduct(product.id); }} className="p-2 hover:bg-red-100 rounded-lg transition" title="Delete">
                              <Trash2 size={16} className="text-destructive"/>
                            </button>
                          </div>
                        </td>
                      </tr>); })}
                  </tbody>
                </table>
              </div>
            </div>)}

          {/* Summary Stats */}
          {visibleProducts.length > 0 && (<div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground font-semibold">Total Products</p>
                <p className="text-2xl font-bold text-foreground mt-2">{visibleProducts.length}</p>
              </div>
              <div className="bg-card rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground font-semibold">Total Inventory Value</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {formatCurrency(visibleProducts.reduce(function (sum, p) { return sum + (parseFloat(p.buyingPrice) * p.stockQuantity); }, 0))}
                </p>
              </div>
              <div className="bg-card rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground font-semibold">Avg Margin</p>
                <p className="text-2xl font-bold text-secondary mt-2">
                  {(visibleProducts.reduce(function (sum, p) { return sum + calculateMargin(p.buyingPrice, p.sellingPrice); }, 0) / visibleProducts.length).toFixed(2)}%
                </p>
              </div>
              <div className="bg-card rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground font-semibold">Low Stock Count</p>
                <p className={"text-2xl font-bold mt-2 ".concat(visibleProducts.filter(function (p) { return p.stockQuantity <= p.lowStockThreshold; }).length > 0
                ? 'text-destructive'
                : 'text-secondary')}>
                  {visibleProducts.filter(function (p) { return p.stockQuantity <= p.lowStockThreshold; }).length}
                </p>
              </div>
            </div>)}
        </div>
      </div>
    </Layout>);
}
