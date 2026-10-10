import { apiClient, setCartSessionId } from '../client';
import { normalizeCart } from '../normalizers/cart.normalizer';

/**
 * Fetch current user or session cart from backend
 */
export async function getCartApi() {
  const response = await apiClient.get('/cart');
  if (response?.data?.sessionId) {
    setCartSessionId(response.data.sessionId);
  }
  return normalizeCart(response);
}

/**
 * Add product item to cart
 */
export async function addToCartApi({ productId, sku, quantity = 1, selectedFitment }) {
  const idOrSku = productId || sku;
  const response = await apiClient.post('/cart/items', {
    productId: idOrSku,
    sku,
    quantity,
    selectedFitment,
  });

  if (response?.data?.sessionId) {
    setCartSessionId(response.data.sessionId);
  }

  return normalizeCart(response);
}

/**
 * Update quantity of a line item in cart
 */
export async function updateCartItemApi(itemIdOrSku, quantity) {
  const response = await apiClient.put(`/cart/items/${itemIdOrSku}`, {
    quantity,
  });

  return normalizeCart(response);
}

/**
 * Remove an item from cart
 */
export async function removeFromCartApi(itemIdOrSku) {
  const response = await apiClient.delete(`/cart/items/${itemIdOrSku}`);
  return normalizeCart(response);
}

/**
 * Clear all items in current cart
 */
export async function clearCartApi() {
  const response = await apiClient.delete('/cart/clear');
  return normalizeCart(response);
}

export default {
  getCartApi,
  addToCartApi,
  updateCartItemApi,
  removeFromCartApi,
  clearCartApi,
};
