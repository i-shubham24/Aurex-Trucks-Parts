import { apiClient } from '../client';
import { normalizeProducts, normalizeProduct } from '../normalizers/product.normalizer';
import { normaliseOrder } from '../../lib/api';

/**
 * Fetch executive dashboard statistics from the backend
 */
export async function getAdminDashboardStatsApi() {
  const response = await apiClient.get('/admin/dashboard');
  const payload = response?.data || response || {};
  const data = payload?.stats || payload || {};
  const recentOrders = payload.recentOrders || data.recentOrders || [];
  const recentQuotes = payload.recentQuotes || data.recentQuotes || [];
  return {
    revenue: data.revenue ?? data.totalRevenue ?? 0,
    orders: data.orders ?? data.totalOrders ?? 0,
    products: data.products ?? data.totalProducts ?? 0,
    customers: data.customers ?? data.totalCustomers ?? 0,
    tradeCustomers: data.tradeCustomers ?? 0,
    openQuotes: data.openQuotes ?? 0,
    lowStockProducts: data.lowStockProducts ?? 0,
    recentOrders: recentOrders.map(normaliseOrder),
    recentQuotes,
  };
}

/**
 * Fetch all products for admin management
 */
export async function getAdminProductsApi(params = {}) {
  const response = await apiClient.get('/admin/products', {
    params: {
      limit: 1000,
      ...params,
    },
  });

  const raw = response?.data?.products || response?.products || response?.items || [];
  const normalized = normalizeProducts(raw);

  return {
    products: normalized,
    total: response?.data?.pagination?.total || normalized.length,
    pagination: response?.data?.pagination || {},
  };
}

/**
 * Create a new product in the catalog
 */
export async function createAdminProductApi(productPayload) {
  const response = await apiClient.post('/admin/products', productPayload);
  const raw = response?.data?.product || response?.product;
  return normalizeProduct(raw);
}

/**
 * Update an existing product
 */
export async function updateAdminProductApi(identifier, productPayload) {
  const response = await apiClient.put(`/admin/products/${encodeURIComponent(identifier)}`, productPayload);
  const raw = response?.data?.product || response?.product;
  return normalizeProduct(raw);
}

/**
 * Upload a product image to the server/CDN
 */
export async function uploadAdminImageApi(file) {
  const formData = new FormData();
  formData.append('image', file);
  try {
    const response = await apiClient.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const url = response?.url || response?.data?.url || response?.path;
    if (url) return url;
    throw new Error('No URL returned from upload');
  } catch (err) {
    console.warn('[uploadAdminImageApi] Backend upload failed, reading as base64 data URL:', err);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Delete a product from the catalog
 */
export async function deleteAdminProductApi(identifier) {
  const response = await apiClient.delete(`/admin/products/${encodeURIComponent(identifier)}`);
  return response?.data || response;
}

/**
 * Fetch all orders for admin management
 */
export async function getAdminOrdersApi(params = {}) {
  const response = await apiClient.get('/admin/orders', {
    params: {
      limit: 500,
      ...params,
    },
  });

  const raw = response?.data?.orders || response?.data?.items || response?.items || response?.orders || [];
  const normalized = (Array.isArray(raw) ? raw : []).map(normaliseOrder);

  return {
    orders: normalized,
    total: response?.data?.pagination?.total || normalized.length,
    pagination: response?.data?.pagination || {},
  };
}

/**
 * Fetch single order detail
 */
export async function getAdminOrderDetailApi(id) {
  const response = await apiClient.get(`/admin/orders/${encodeURIComponent(id)}`);
  const raw = response?.data?.order || response?.order;
  return normaliseOrder(raw);
}

/**
 * Update an order's fulfilment status
 */
export async function updateAdminOrderStatusApi(orderRef, { status, note, carrier, trackingNumber }) {
  const response = await apiClient.patch(`/admin/orders/${encodeURIComponent(orderRef)}/status`, {
    status,
    note,
    carrier,
    trackingNumber,
  });

  const raw = response?.data?.order || response?.order;
  return normaliseOrder(raw);
}

export default {
  getAdminDashboardStatsApi,
  getAdminProductsApi,
  createAdminProductApi,
  updateAdminProductApi,
  uploadAdminImageApi,
  deleteAdminProductApi,
  getAdminOrdersApi,
  getAdminOrderDetailApi,
  updateAdminOrderStatusApi,
};
