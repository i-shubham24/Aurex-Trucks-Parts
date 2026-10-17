import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBlogsApi,
  getBlogBySlugApi,
  getAdminBlogsApi,
  getAdminBlogByIdApi,
  createAdminBlogApi,
  updateAdminBlogApi,
  deleteAdminBlogApi,
} from '../../api/endpoints/blogs.api';

export const BLOG_QUERY_KEYS = {
  all: ['blogs'],
  lists: () => [...BLOG_QUERY_KEYS.all, 'list'],
  list: (params) => [...BLOG_QUERY_KEYS.lists(), params],
  details: () => [...BLOG_QUERY_KEYS.all, 'detail'],
  detail: (slug) => [...BLOG_QUERY_KEYS.details(), slug],
  adminList: () => [...BLOG_QUERY_KEYS.all, 'admin-list'],
  adminDetail: (id) => [...BLOG_QUERY_KEYS.all, 'admin-detail', id],
};

export function useBlogs(params = {}, options = {}) {
  return useQuery({
    queryKey: BLOG_QUERY_KEYS.list(params),
    queryFn: () => getBlogsApi(params),
    staleTime: 1000 * 60 * 10, // 10 mins cache
    ...options,
  });
}

export function useBlog(slug, options = {}) {
  return useQuery({
    queryKey: BLOG_QUERY_KEYS.detail(slug),
    queryFn: () => getBlogBySlugApi(slug),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 10,
    ...options,
  });
}

export function useAdminBlogs(options = {}) {
  return useQuery({
    queryKey: BLOG_QUERY_KEYS.adminList(),
    queryFn: () => getAdminBlogsApi(),
    staleTime: 1000 * 60 * 2, // 2 mins cache
    ...options,
  });
}

export function useAdminBlog(id, options = {}) {
  return useQuery({
    queryKey: BLOG_QUERY_KEYS.adminDetail(id),
    queryFn: () => getAdminBlogByIdApi(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2,
    ...options,
  });
}

export function useCreateBlogMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createAdminBlogApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEYS.all });
    },
  });
}

export function useUpdateBlogMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => updateAdminBlogApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEYS.all });
    },
  });
}

export function useDeleteBlogMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteAdminBlogApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEYS.all });
    },
  });
}

export default useBlogs;
