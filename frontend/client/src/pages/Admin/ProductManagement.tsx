import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Eye, EyeOff, AlertCircle, RefreshCw } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { api } from '@/lib/api';
import { useRoleRedirect } from '@/hooks/use-role-redirect';

interface LoanProduct {
  id: number;
  name: string;
  categoryId: number;
  buyingPrice: string;
  sellingPrice: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  createdAt: string;
}

export default function ProductManagement() {
  useRoleRedirect({
    allowedRoles: ['admin', 'branch_manager'],
    fallbackPath: '/dashboard'
  });

  const [showHidden, setShowHidden] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '1',
    buyingPrice: '',
    sellingPrice: '',
    stockQuantity: '0',
    lowStockThreshold: '10'
  });

  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ['loan-products'],
    queryFn: api.getLoanProducts,
  });

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/loan-products', {
        name: formData.name,
        categoryId: parseInt(formData.categoryId),
        buyingPrice: parseFloat(formData.buyingPrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        stockQuantity: parseInt(formData.stockQuantity),
        lowStockThreshold: parseInt(formData.lowStockThreshold)
      });
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
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleUpdateProduct = async (id: number, data: any) => {
    try {
      await api.patch(`/loan-products/${id}`, data);
      setEditingId(null);
      refetch();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await api.patch(`/loan-products/${id}`, { isActive: false });
        refetch();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2
    }).format(typeof value === 'string' ? parseFloat(value) : value);
  };

  const calculateMargin = (buying: string, selling: string) => {
    const b = parseFloat(buying);
    const s = parseFloat(selling);
    if (b === 0) return 0;
    return (((s - b) / b) * 100).toFixed(2);
  };

  const visibleProducts = products.filter((p: LoanProduct) => showHidden || p.isActive);

  return (
    <Layout>
      <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">Product Management</h1>
              <p className="text-slate-600 mt-2">Manage loan products with pricing and market values</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
              <button
                onClick={() => setIsAddingNew(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Plus size={18} />
                Add Product
              </button>
            </div>
          </div>

          {/* Toggle Hidden Products */}
          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showHidden}
                onChange={(e) => setShowHidden(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-slate-700 font-medium">Show inactive products</span>
            </label>
          </div>

          {/* Add New Product Form */}
          {isAddingNew && (
            <div className="mb-6 bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Add New Product</h2>
              <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">Energy</option>
                    <option value="2">Electronics</option>
                    <option value="3">Agriculture</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Market Price (Cost)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.buyingPrice}
                    onChange={(e) => setFormData({ ...formData, buyingPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">Only visible to admins</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Selling Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Initial Stock</label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Low Stock Threshold</label>
                  <input
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-3 flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Save Product
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="px-6 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Products Table */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-600 mt-4">Loading products...</p>
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
              <p className="text-slate-600">No products found. Create one to get started.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Product Name</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">Market Price</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">Selling Price</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">Margin %</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">Stock</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">Status</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {visibleProducts.map((product: LoanProduct) => (
                      <tr key={product.id} className={!product.isActive ? 'bg-slate-50 opacity-50' : 'hover:bg-slate-50 transition'}>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{product.name}</td>
                        <td className="px-4 py-3 text-sm text-right text-slate-600">{formatCurrency(product.buyingPrice)}</td>
                        <td className="px-4 py-3 text-sm text-right text-slate-600">{formatCurrency(product.sellingPrice)}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                          {calculateMargin(product.buyingPrice, product.sellingPrice)}%
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-slate-600">
                          <span className={product.stockQuantity <= product.lowStockThreshold ? 'text-red-600 font-semibold' : ''}>
                            {product.stockQuantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            product.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => setEditingId(editingId === product.id ? null : product.id)}
                              className="p-2 hover:bg-blue-100 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit2 size={16} className="text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 hover:bg-red-100 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 size={16} className="text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          {visibleProducts.length > 0 && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <p className="text-sm text-slate-600 font-semibold">Total Products</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{visibleProducts.length}</p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <p className="text-sm text-slate-600 font-semibold">Total Inventory Value</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  {formatCurrency(
                    visibleProducts.reduce((sum: number, p: LoanProduct) => sum + (parseFloat(p.buyingPrice) * p.stockQuantity), 0)
                  )}
                </p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <p className="text-sm text-slate-600 font-semibold">Avg Margin</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {(
                    visibleProducts.reduce((sum: number, p: LoanProduct) => sum + parseFloat(calculateMargin(p.buyingPrice, p.sellingPrice)), 0) / visibleProducts.length
                  ).toFixed(2)}%
                </p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <p className="text-sm text-slate-600 font-semibold">Low Stock Count</p>
                <p className={`text-2xl font-bold mt-2 ${
                  visibleProducts.filter((p: LoanProduct) => p.stockQuantity <= p.lowStockThreshold).length > 0
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}>
                  {visibleProducts.filter((p: LoanProduct) => p.stockQuantity <= p.lowStockThreshold).length}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
