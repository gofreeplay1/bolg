// 使用相对路径，Vite 代理会将 /api 转发到后端
const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('blog_admin_token');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || '请求失败');
  }

  return data;
}

// ---------- Auth API ----------
export async function loginApi(username: string, password: string) {
  const data = await request<{ token: string; user: { id: number; username: string; role: string } }>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }
  );
  localStorage.setItem('blog_admin_token', data.token);
  return data;
}

export async function getCurrentUser() {
  return request<{ user: { id: number; username: string; role: string } }>('/auth/me');
}

// ---------- Posts API (需认证) ----------
export async function fetchAllPosts() {
  return request<{ posts: any[] }>('/posts');
}

export async function fetchPostBySlug(slug: string) {
  return request<{ post: any }>(`/posts/${slug}`);
}

export async function createPost(post: any) {
  return request<{ post: any }>('/posts', {
    method: 'POST',
    body: JSON.stringify(post),
  });
}

export async function updatePostBySlug(slug: string, post: any) {
  return request<{ post: any }>(`/posts/${slug}`, {
    method: 'PUT',
    body: JSON.stringify(post),
  });
}

export async function deletePostBySlug(slug: string) {
  return request<{ message: string }>(`/posts/${slug}`, {
    method: 'DELETE',
  });
}

// ---------- Public API (无需认证) ----------
export async function fetchPublicPosts() {
  return request<{ posts: any[] }>('/public/posts');
}

export async function fetchPublicPostBySlug(slug: string) {
  return request<{ post: any }>(`/public/posts/${slug}`);
}

export async function fetchPublicTags() {
  return request<{ tags: string[] }>('/public/tags');
}

export async function fetchPublicPostsByTag(tag: string) {
  return request<{ posts: any[] }>(`/public/tags/${encodeURIComponent(tag)}`);
}

// ---------- Settings API ----------

// 公开：获取所有设置
export async function fetchSettings() {
  return request<{ settings: Record<string, any> }>('/settings');
}

// 需认证：更新单个设置
export async function updateSetting(key: string, value: any) {
  return request<{ message: string; key: string }>(`/settings/${key}`, {
    method: 'PUT',
    body: JSON.stringify(value),
  });
}

// ---------- Custom Pages API ----------

// 公开：获取所有页面列表
export async function fetchPages() {
  return request<{ pages: any[] }>('/settings/pages');
}

// 公开：获取单个页面
export async function fetchPageBySlug(slug: string) {
  return request<{ page: any }>(`/settings/pages/${encodeURIComponent(slug)}`);
}

// 需认证：创建页面
export async function createPage(page: { slug: string; title: string; content: string; is_published?: number }) {
  return request<{ page: any }>('/settings/pages', {
    method: 'POST',
    body: JSON.stringify(page),
  });
}

// 需认证：更新页面
export async function updatePage(slug: string, page: { title: string; content: string; is_published?: number; newSlug?: string }) {
  return request<{ page: any }>(`/settings/pages/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    body: JSON.stringify(page),
  });
}

// 需认证：删除页面
export async function deletePage(slug: string) {
  return request<{ message: string }>(`/settings/pages/${encodeURIComponent(slug)}`, {
    method: 'DELETE',
  });
}

// ---------- Comments API ----------

// 公开：获取文章已审核评论
export async function fetchComments(postSlug: string) {
  return request<{ comments: any[] }>(`/comments/${postSlug}`);
}

// 公开：提交评论
export async function submitComment(postSlug: string, author: string, content: string) {
  return request<{ comment: any; message: string }>(`/comments/${postSlug}`, {
    method: 'POST',
    body: JSON.stringify({ author, content }),
  });
}

// 需认证：获取所有评论（管理）
export async function fetchAllComments(params?: { status?: string; postSlug?: string }) {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.postSlug) query.set('postSlug', params.postSlug);
  const qs = query.toString();
  return request<{ comments: any[]; stats: any[] }>(`/comments/admin/all${qs ? '?' + qs : ''}`);
}

// 需认证：审核评论
export async function reviewComment(id: number, status: 'approved' | 'rejected') {
  return request<{ comment: any; message: string }>(`/comments/admin/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

// 需认证：删除评论
export async function deleteComment(id: number) {
  return request<{ message: string }>(`/comments/admin/${id}`, {
    method: 'DELETE',
  });
}

// ---------- Friend Links API ----------

// 公开：获取友情链接
export async function fetchFriendLinks() {
  return request<{ links: any[] }>('/friend-links');
}

// 需认证：获取所有友情链接（管理）
export async function fetchAllFriendLinks() {
  return request<{ links: any[] }>('/friend-links/admin/all');
}

// 需认证：创建友情链接
export async function createFriendLink(link: { name: string; url: string; description?: string; sort_order?: number; is_visible?: number }) {
  return request<{ link: any }>('/friend-links', {
    method: 'POST',
    body: JSON.stringify(link),
  });
}

// 需认证：更新友情链接
export async function updateFriendLink(id: number, link: { name: string; url: string; description?: string; sort_order?: number; is_visible?: number }) {
  return request<{ link: any }>(`/friend-links/${id}`, {
    method: 'PUT',
    body: JSON.stringify(link),
  });
}

// 需认证：删除友情链接
export async function deleteFriendLink(id: number) {
  return request<{ message: string }>(`/friend-links/${id}`, {
    method: 'DELETE',
  });
}

// ---------- Tags API ----------

// 公开：获取所有标签
export async function fetchTags() {
  return request<{ tags: any[] }>('/tags');
}

// 公开：获取单个标签
export async function fetchTagBySlug(slug: string) {
  return request<{ tag: any }>(`/tags/${slug}`);
}

// 需认证：创建标签
export async function createTag(tag: { name: string; description?: string; color?: string }) {
  return request<{ tag: any }>('/tags', {
    method: 'POST',
    body: JSON.stringify(tag),
  });
}

// 需认证：更新标签
export async function updateTag(slug: string, tag: { name?: string; description?: string; color?: string }) {
  return request<{ tag: any }>(`/tags/${slug}`, {
    method: 'PUT',
    body: JSON.stringify(tag),
  });
}

// 需认证：删除标签
export async function deleteTag(slug: string) {
  return request<{ message: string }>(`/tags/${slug}`, {
    method: 'DELETE',
  });
}

// 需认证：从文章同步标签
export async function syncTagsFromPosts() {
  return request<{ message: string; created: number; updated: number }>('/tags/sync', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

// ---------- Upload API ----------

// 上传图片（base64）
export async function uploadImage(data: string, filename?: string) {
  return request<{ url: string; filename: string; size: number }>('/upload/image', {
    method: 'POST',
    body: JSON.stringify({ data, filename }),
  });
}

// 上传附件（base64）
export async function uploadFile(data: string, filename?: string) {
  return request<{ url: string; filename: string; originalName: string; size: number }>('/upload/file', {
    method: 'POST',
    body: JSON.stringify({ data, filename }),
  });
}

// 上传网站图片（Logo、背景图）
export async function uploadSiteImage(data: string, filename?: string, category?: string) {
  return request<{ url: string; filename: string; size: number }>('/upload/site-image', {
    method: 'POST',
    body: JSON.stringify({ data, filename, category }),
  });
}

// ---------- Visitor Stats API ----------

// 获取累计访客总数
export async function fetchVisitorTotal() {
  return request<{ total: number }>('/visitor/total');
}

// 记录一次访问
export async function recordVisit() {
  return request<{ total: number; today: number }>('/visitor/record', {
    method: 'POST',
  });
}
