import { apiClient } from '../client';

/**
 * Fetch pending reviews for products from delivered orders for the current user.
 */
export async function getPendingReviewsApi() {
  const response = await apiClient.get('/reviews/pending');
  const items = response?.data?.pendingReviews || response?.pendingReviews || [];
  return items;
}

/**
 * Fetch all reviews written by the currently logged-in user.
 */
export async function getMyReviewsApi() {
  const response = await apiClient.get('/reviews/mine');
  const reviews = response?.data?.reviews || response?.reviews || [];
  return { reviews, count: reviews.length };
}

/**
 * Submit a product rating and review.
 * @param {Object} payload - { productId, orderId, rating, comment, title, truckModelReviewed }
 */
export async function submitReviewApi(payload) {
  const response = await apiClient.post('/reviews', payload);
  return response?.data || response;
}

/**
 * Fetch reviews for a specific product by SKU or ObjectId.
 * @param {string} productIdOrSku
 */
export async function getProductReviewsApi(productIdOrSku) {
  if (!productIdOrSku) return { reviews: [] };
  const response = await apiClient.get(`/products/${productIdOrSku}/reviews`);
  const reviews = response?.data?.reviews || response?.reviews || [];
  return { reviews };
}

/**
 * Fetch testimonials for homepage reviews carousel.
 */
export async function getTestimonialsApi() {
  const response = await apiClient.get('/reviews/testimonials');
  const testimonials = response?.data?.testimonials || response?.testimonials || [];
  return testimonials;
}

/**
 * Fetch all reviews for admin management.
 */
export async function getAdminReviewsApi() {
  const response = await apiClient.get('/admin/reviews');
  const reviews = response?.data?.reviews || response?.reviews || [];
  return { reviews, count: reviews.length };
}

/**
 * Toggle approval / visibility of a review.
 */
export async function toggleReviewApprovalApi(id) {
  const response = await apiClient.patch(`/admin/reviews/${id}/toggle-approval`);
  return response?.data || response;
}

/**
 * Toggle featured on homepage carousel.
 */
export async function toggleReviewFeaturedApi(id) {
  const response = await apiClient.patch(`/admin/reviews/${id}/toggle-featured`);
  return response?.data || response;
}

/**
 * Delete a review completely.
 */
export async function deleteReviewApi(id) {
  const response = await apiClient.delete(`/admin/reviews/${id}`);
  return response?.data || response;
}

export default {
  getPendingReviewsApi,
  getMyReviewsApi,
  submitReviewApi,
  getProductReviewsApi,
  getTestimonialsApi,
  getAdminReviewsApi,
  toggleReviewApprovalApi,
  toggleReviewFeaturedApi,
  deleteReviewApi,
};
