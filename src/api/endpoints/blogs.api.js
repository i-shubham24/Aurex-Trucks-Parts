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
      coverImage: (typeof b.coverImage === 'string' ? b.coverImage : b.coverImage?.url) || b.img || '',
      img: (typeof b.coverImage === 'string' ? b.coverImage : b.coverImage?.url) || b.img || '',
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
      coverImage: (typeof b.coverImage === 'string' ? b.coverImage : b.coverImage?.url) || b.img || '',
      img: (typeof b.coverImage === 'string' ? b.coverImage : b.coverImage?.url) || b.img || '',
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
    coverImage: (typeof b.coverImage === 'string' ? b.coverImage : b.coverImage?.url) || b.img || '',
    img: (typeof b.coverImage === 'string' ? b.coverImage : b.coverImage?.url) || b.img || '',
    date: b.publishedAt ? new Date(b.publishedAt).toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
  }));
}

export async function getAdminBlogsApi() {
  const response = await apiClient.get('/admin/blogs');
  const rawBlogs = response?.data?.blogs || response?.blogs || [];
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
      coverImage: (typeof b.coverImage === 'string' ? b.coverImage : b.coverImage?.url) || b.img || '',
      img: (typeof b.coverImage === 'string' ? b.coverImage : b.coverImage?.url) || b.img || '',
      coverImageObj: b.coverImage,
      tag: Array.isArray(b.tags) && b.tags[0] ? b.tags[0] : (b.tag || b.category || 'Workshop News'),
      tags: b.tags || (b.tag ? [b.tag] : []),
      category: b.category || 'Workshop News',
      type: b.type || 'NEWS',
      author: b.author?.name || b.author || 'Aurex Heavy Duty Tech Team',
      authorObj: b.author,
      isPublished: b.isPublished !== false,
      viewsCount: b.viewsCount || 0,
      readTimeMinutes: b.readTimeMinutes || 4,
      publishedAt: b.publishedAt || b.createdAt || new Date().toISOString(),
      createdAt: b.createdAt || new Date().toISOString(),
      date: b.publishedAt ? new Date(b.publishedAt).toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
    })),
    count: rawBlogs.length,
  };
}

export async function getAdminBlogByIdApi(id) {
  if (!id) throw new Error('Blog ID or slug is required');
  const response = await apiClient.get(`/admin/blogs/${encodeURIComponent(id)}`);
  const b = response?.data?.blog || response?.blog;
  if (!b) return null;
  return {
    id: b._id || b.id || b.slug,
    _id: b._id || b.id || b.slug,
    slug: b.slug,
    title: b.title,
    summary: b.summary || b.excerpt || '',
    excerpt: b.summary || b.excerpt || '',
    content: b.content || '',
    body: b.body || [],
    coverImage: (typeof b.coverImage === 'string' ? b.coverImage : b.coverImage?.url) || b.img || '',
    img: (typeof b.coverImage === 'string' ? b.coverImage : b.coverImage?.url) || b.img || '',
    coverImageObj: b.coverImage,
    tag: Array.isArray(b.tags) && b.tags[0] ? b.tags[0] : (b.tag || b.category || 'Workshop News'),
    tags: b.tags || (b.tag ? [b.tag] : []),
    category: b.category || 'Workshop News',
    type: b.type || 'NEWS',
    author: b.author?.name || b.author || 'Aurex Heavy Duty Tech Team',
    authorObj: b.author,
    isPublished: b.isPublished !== false,
    viewsCount: b.viewsCount || 0,
    readTimeMinutes: b.readTimeMinutes || 4,
    publishedAt: b.publishedAt || b.createdAt || new Date().toISOString(),
    createdAt: b.createdAt || new Date().toISOString(),
    date: b.publishedAt ? new Date(b.publishedAt).toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
  };
}

export async function createAdminBlogApi(payload) {
  const response = await apiClient.post('/admin/blogs', payload);
  return response?.data?.blog || response?.blog || response;
}

export async function updateAdminBlogApi(id, payload) {
  const response = await apiClient.put(`/admin/blogs/${encodeURIComponent(id)}`, payload);
  return response?.data?.blog || response?.blog || response;
}

export async function deleteAdminBlogApi(id) {
  const response = await apiClient.delete(`/admin/blogs/${encodeURIComponent(id)}`);
  return response?.data || response;
}

export default {
  getBlogsApi,
  getBlogBySlugApi,
  getAdminBlogsApi,
  getAdminBlogByIdApi,
  createAdminBlogApi,
  updateAdminBlogApi,
  deleteAdminBlogApi,
};
