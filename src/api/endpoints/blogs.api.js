import { apiClient } from '../client';

export async function getBlogsApi(params = {}) {
  const response = await apiClient.get('/blogs', { params });
  const rawBlogs = response?.data?.blogs || response?.blogs || [];
  const pagination = response?.data?.pagination || response?.pagination || {};

  return {
    blogs: rawBlogs.map((b) => ({
      id: b._id || b.id || b.slug,
      _id: b._id || b.id || b.slug,
      slug: b.slug,
      title: b.title,
      summary: b.summary || b.excerpt || '',
      excerpt: b.summary || b.excerpt || '',
      content: b.content || '',
      body: b.body || [],
      coverImage: b.coverImage?.url || b.img || '',
      img: b.coverImage?.url || b.img || '',
      tag: Array.isArray(b.tags) && b.tags[0] ? b.tags[0] : (b.category || 'Workshop News'),
      tags: b.tags || [],
      category: b.category || 'Workshop News',
      publishedAt: b.publishedAt || b.createdAt || new Date().toISOString(),
      date: b.publishedAt ? new Date(b.publishedAt).toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
      readTime: b.readTimeMinutes ? `${b.readTimeMinutes} min read` : '4 min read',
    })),
    pagination,
  };
}

export async function getBlogBySlugApi(slug) {
  if (!slug) throw new Error('Blog slug is required');
  const response = await apiClient.get(`/blogs/${slug}`);
  const b = response?.data?.blog || response?.blog;
  const rawRelated = response?.data?.related || response?.related || [];

  if (!b) return null;

  return {
    blog: {
      id: b._id || b.id || b.slug,
      _id: b._id || b.id || b.slug,
      slug: b.slug,
      title: b.title,
      summary: b.summary || b.excerpt || '',
      excerpt: b.summary || b.excerpt || '',
      content: b.content || '',
      body: b.body || [],
      coverImage: b.coverImage?.url || b.img || '',
      img: b.coverImage?.url || b.img || '',
      tag: Array.isArray(b.tags) && b.tags[0] ? b.tags[0] : (b.category || 'Workshop News'),
      tags: b.tags || [],
      category: b.category || 'Workshop News',
      publishedAt: b.publishedAt || b.createdAt || new Date().toISOString(),
      date: b.publishedAt ? new Date(b.publishedAt).toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
      readTime: b.readTimeMinutes ? `${b.readTimeMinutes} min read` : '4 min read',
    },
    related: rawBlogsMap(rawRelated),
  };
}

function rawBlogsMap(list = []) {
  return list.map((b) => ({
    id: b._id || b.id || b.slug,
    slug: b.slug,
    title: b.title,
    coverImage: b.coverImage?.url || b.img || '',
    img: b.coverImage?.url || b.img || '',
    date: b.publishedAt ? new Date(b.publishedAt).toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
  }));
}

export default {
  getBlogsApi,
  getBlogBySlugApi,
};
