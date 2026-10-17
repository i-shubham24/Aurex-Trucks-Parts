import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPendingReviewsApi,
  getMyReviewsApi,
  submitReviewApi,
  getProductReviewsApi,
  getTestimonialsApi,
  getAdminReviewsApi,
  toggleReviewApprovalApi,
  toggleReviewFeaturedApi,
  deleteReviewApi,
} from '../../api/endpoints/reviews.api';
import { PRODUCT_QUERY_KEYS } from './useProducts';

export const REVIEW_QUERY_KEYS = {
  all: ['reviews'],
  pending: () => [...REVIEW_QUERY_KEYS.all, 'pending'],
  myReviews: () => [...REVIEW_QUERY_KEYS.all, 'mine'],
  product: (productIdOrSku) => [...REVIEW_QUERY_KEYS.all, 'product', productIdOrSku],
  testimonials: () => [...REVIEW_QUERY_KEYS.all, 'testimonials'],
  adminList: () => [...REVIEW_QUERY_KEYS.all, 'admin-list'],
};

/**
 * Hook to fetch all reviews submitted by the currently logged-in user.
 */
export function useMyReviews(isLoggedIn = false, options = {}) {
  return useQuery({
    queryKey: REVIEW_QUERY_KEYS.myReviews(),
    queryFn: () => getMyReviewsApi(),
    enabled: Boolean(isLoggedIn),
    staleTime: 1000 * 60 * 3, // 3 mins cache
    refetchOnWindowFocus: true,
    ...options,
  });
}

/**
 * Hook to fetch pending reviews for products from delivered orders.
 * Only enabled when user is logged in.
 */
export function usePendingReviews(isLoggedIn = false, options = {}) {
  return useQuery({
    queryKey: REVIEW_QUERY_KEYS.pending(),
    queryFn: () => getPendingReviewsApi(),
    enabled: Boolean(isLoggedIn),
    staleTime: 1000 * 60 * 3, // 3 mins cache
    refetchOnWindowFocus: true,
    ...options,
  });
}

/**
 * Hook to fetch customer reviews for a given product by SKU or ID.
 */
export function useProductReviews(productIdOrSku, options = {}) {
  return useQuery({
    queryKey: REVIEW_QUERY_KEYS.product(productIdOrSku),
    queryFn: () => getProductReviewsApi(productIdOrSku),
    enabled: Boolean(productIdOrSku),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

/**
 * Hook to fetch testimonials for the home page carousel.
 */
export function useTestimonials(options = {}) {
  return useQuery({
    queryKey: REVIEW_QUERY_KEYS.testimonials(),
    queryFn: () => getTestimonialsApi(),
    staleTime: 1000 * 60 * 15,
    ...options,
  });
}

/**
 * Hook to fetch all reviews for admin moderation.
 */
export function useAdminReviews(options = {}) {
  return useQuery({
    queryKey: REVIEW_QUERY_KEYS.adminList(),
    queryFn: () => getAdminReviewsApi(),
    staleTime: 1000 * 60 * 2, // 2 mins cache
    ...options,
  });
}

/**
 * Mutation hook to submit a review and invalidate pending reviews and product queries.
 */
export function useSubmitReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => submitReviewApi(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: REVIEW_QUERY_KEYS.pending() });
      queryClient.invalidateQueries({ queryKey: REVIEW_QUERY_KEYS.myReviews() });
      if (variables?.productId) {
        queryClient.invalidateQueries({ queryKey: REVIEW_QUERY_KEYS.product(variables.productId) });
      }
      if (variables?.sku) {
        queryClient.invalidateQueries({ queryKey: REVIEW_QUERY_KEYS.product(variables.sku) });
      }
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: REVIEW_QUERY_KEYS.adminList() });
    },
  });
}

/**
 * Admin: Toggle review approval / visibility
 */
export function useToggleApprovalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => toggleReviewApprovalApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEW_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.all });
    },
  });
}

/**
 * Admin: Toggle review featured on home page carousel
 */
export function useToggleFeaturedMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => toggleReviewFeaturedApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEW_QUERY_KEYS.all });
    },
  });
}

/**
 * Admin: Delete a review
 */
export function useDeleteReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteReviewApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEW_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.all });
    },
  });
}

export default {
  usePendingReviews,
  useMyReviews,
  useProductReviews,
  useTestimonials,
  useAdminReviews,
  useSubmitReviewMutation,
  useToggleApprovalMutation,
  useToggleFeaturedMutation,
  useDeleteReviewMutation,
};

