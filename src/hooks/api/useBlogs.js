import { useQuery } from '@tanstack/react-query';
import { getBlogsApi, getBlogBySlugApi } from '../../api/endpoints/blogs.api';

export const BLOG_QUERY_KEYS = {
  all: ['blogs'],
  lists: () => [...BLOG_QUERY_KEYS.all, 'list'],
  list: (params) => [...BLOG_QUERY_KEYS.lists(), params],
  details: () => [...BLOG_QUERY_KEYS.all, 'detail'],
  detail: (slug) => [...BLOG_QUERY_KEYS.details(), slug],
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

export default useBlogs;
