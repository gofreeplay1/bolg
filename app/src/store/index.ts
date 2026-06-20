import { create } from 'zustand';
import type { Post, PostMeta, AllSettings, CustomPage, Comment, FriendLink } from '@/types';
import * as api from '@/api';

// ---------- Auth Store ----------
interface AuthState {
  isAuthenticated: boolean;
  user: { id: number; username: string; role: string } | null;
  loading: boolean;
  initialized: boolean;  // 标识 checkAuth 是否已完成
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  error: string | null;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  loading: false,
  initialized: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const data = await api.loginApi(username, password);
      set({
        isAuthenticated: true,
        user: data.user,
        loading: false,
      });
      return true;
    } catch (err: any) {
      set({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: err.message || '登录失败',
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('blog_admin_token');
    set({ isAuthenticated: false, user: null, error: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('blog_admin_token');
    if (!token) {
      set({ isAuthenticated: false, user: null, initialized: true });
      return;
    }
    try {
      const data = await api.getCurrentUser();
      set({ isAuthenticated: true, user: data.user, initialized: true });
    } catch {
      localStorage.removeItem('blog_admin_token');
      set({ isAuthenticated: false, user: null, initialized: true });
    }
  },
}));

// ---------- Helper: compute derived data from posts ----------
function computeDerived(posts: Post[]) {
  const allPosts: PostMeta[] = posts.map(
    ({ slug, title, description, date, tags, readingTime }) => ({
      slug,
      title,
      description,
      date,
      tags,
      readingTime,
    })
  );

  const tagSet = new Set<string>();
  posts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
  const allTags = Array.from(tagSet).sort();

  return { allPosts, allTags };
}

// ---------- Posts Store ----------
interface PostsState {
  posts: Post[];
  allPosts: PostMeta[];
  allTags: string[];
  loading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  addPost: (post: Post) => Promise<void>;
  updatePost: (slug: string, post: Post) => Promise<void>;
  deletePost: (slug: string) => Promise<void>;
  getPostsByTag: (tag: string) => PostMeta[];
}

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  allPosts: [],
  allTags: [],
  loading: false,
  error: null,

  hydrate: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.fetchPublicPosts();
      const posts = data.posts as Post[];
      const derived = computeDerived(posts);
      set({ posts, ...derived, loading: false });
    } catch (err: any) {
      console.error('Failed to load posts:', err);
      set({ loading: false, error: err.message });
    }
  },

  addPost: async (post) => {
    try {
      await api.createPost({
        slug: post.slug,
        title: post.title,
        description: post.description,
        content: post.content,
        tags: post.tags,
        date: post.date,
        readingTime: post.readingTime,
      });
    } catch (err) {
      // createPost 失败时抛出，让调用方处理
      throw err;
    }
    // 本地乐观更新，避免 hydrate 失败导致报错
    const newPost: Post = {
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      tags: post.tags,
      content: post.content,
      readingTime: post.readingTime,
    };
    set((state) => {
      const filtered = state.posts.filter((p) => p.slug !== newPost.slug);
      return { posts: [...filtered, newPost] };
    });
    // 后台静默刷新（不抛出错误）
    get().hydrate().catch((err) => {
      console.warn('后台刷新文章列表失败（文章已保存）:', err.message);
    });
  },

  updatePost: async (slug, updated) => {
    await api.updatePostBySlug(slug, {
      title: updated.title,
      description: updated.description,
      content: updated.content,
      tags: updated.tags,
      date: updated.date,
      readingTime: updated.readingTime,
      newSlug: updated.slug !== slug ? updated.slug : undefined,
    });
    // 本地乐观更新
    set((state) => ({
      posts: state.posts.map((p) =>
        p.slug === slug
          ? { ...p, ...updated, slug: updated.slug }
          : p
      ),
    }));
    get().hydrate().catch(() => {});
  },

  deletePost: async (slug) => {
    await api.deletePostBySlug(slug);
    set((state) => ({
      posts: state.posts.filter((p) => p.slug !== slug),
    }));
    get().hydrate().catch(() => {});
  },

  getPostsByTag: (tag) => {
    return get().allPosts.filter((p) => p.tags.includes(tag));
  },
}));

// ---------- Default settings fallback ----------
export const DEFAULT_SETTINGS: AllSettings = {
  site: {
    name: 'Blog',
    description: '记录思考，分享知识',
    welcomeTitle: '',
    welcomeSubtitle: '',
    postCopyright: '',
  },
  header: {
    navLinks: [
      { to: '/', label: '首页' },
      { to: '/tags', label: '标签' },
      { to: '/about', label: '关于' },
    ],
  },
  footer: {
    brandName: 'Blog',
    tagline: '记录思考，分享知识',
    socialLinks: [
      { label: 'GitHub', url: 'https://github.com', icon: 'github' },
      { label: 'Twitter', url: 'https://twitter.com', icon: 'twitter' },
    ],
    copyright: '© {year} Blog. Built with React + TypeScript.',
  },
  about: {
    name: '关于我',
    tagline: '全栈开发者，热爱技术与写作',
    bio: '## 👋 你好！\n\n我是一名全栈开发者。',
    socialLinks: [
      { label: 'GitHub', url: 'https://github.com', icon: 'github' },
      { label: 'Twitter', url: 'https://twitter.com', icon: 'twitter' },
    ],
  },
  appearance: {
    siteLogo: '',
    siteBackground: '',
    loginBackground: '',
    donateQrCode: '',
    donateText: '',
    splash: {
      enabled: false,
      title: '',
      subtitle: '',
      background: '',
    },
  },
};

// ---------- Settings Store ----------
interface SettingsState {
  settings: AllSettings;
  loading: boolean;
  hydrate: () => Promise<void>;
  updateSetting: (key: string, value: any) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: { ...DEFAULT_SETTINGS },
  loading: false,

  hydrate: async () => {
    set({ loading: true });
    try {
      const data = await api.fetchSettings();
      const merged = {
        ...DEFAULT_SETTINGS,
        ...data.settings,
      };
      set({ settings: merged as AllSettings, loading: false });
    } catch (err: any) {
      console.error('Failed to load settings:', err);
      set({ loading: false });
    }
  },

  updateSetting: async (key, value) => {
    await api.updateSetting(key, value);
    set((state) => ({
      settings: { ...state.settings, [key]: value },
    }));
  },
}));

// ---------- Pages Store ----------
interface PagesState {
  pages: CustomPage[];
  loading: boolean;
  hydrate: () => Promise<void>;
  createPage: (page: { slug: string; title: string; content: string; is_published?: number }) => Promise<void>;
  updatePage: (slug: string, page: { title: string; content: string; is_published?: number; newSlug?: string }) => Promise<void>;
  deletePage: (slug: string) => Promise<void>;
}

export const usePagesStore = create<PagesState>((set, get) => ({
  pages: [],
  loading: false,

  hydrate: async () => {
    set({ loading: true });
    try {
      const data = await api.fetchPages();
      set({ pages: data.pages as CustomPage[], loading: false });
    } catch (err: any) {
      console.error('Failed to load pages:', err);
      set({ loading: false });
    }
  },

  createPage: async (page) => {
    await api.createPage(page);
    await get().hydrate();
  },

  updatePage: async (slug, page) => {
    await api.updatePage(slug, page);
    await get().hydrate();
  },

  deletePage: async (slug) => {
    await api.deletePage(slug);
    await get().hydrate();
  },
}));

// ---------- Comments Store ----------
interface CommentsState {
  comments: Comment[];
  stats: { status: string; count: number }[];
  loading: boolean;
  hydrate: (params?: { status?: string; postSlug?: string }) => Promise<void>;
  reviewComment: (id: number, status: 'approved' | 'rejected') => Promise<void>;
  deleteComment: (id: number) => Promise<void>;
}

export const useCommentsStore = create<CommentsState>((set, get) => ({
  comments: [],
  stats: [],
  loading: false,

  hydrate: async (params) => {
    set({ loading: true });
    try {
      const data = await api.fetchAllComments(params);
      set({ comments: data.comments as Comment[], stats: data.stats, loading: false });
    } catch (err: any) {
      console.error('Failed to load comments:', err);
      set({ loading: false });
    }
  },

  reviewComment: async (id, status) => {
    await api.reviewComment(id, status);
    // 乐观更新
    set((state) => ({
      comments: state.comments.map((c) =>
        c.id === id ? { ...c, status } : c
      ),
    }));
    get().hydrate().catch(() => {});
  },

  deleteComment: async (id) => {
    await api.deleteComment(id);
    set((state) => ({
      comments: state.comments.filter((c) => c.id !== id),
    }));
    get().hydrate().catch(() => {});
  },
}));

// ---------- Friend Links Store ----------
interface FriendLinksState {
  links: FriendLink[];
  loading: boolean;
  hydrate: () => Promise<void>;
  createLink: (link: { name: string; url: string; description?: string; sort_order?: number; is_visible?: number }) => Promise<void>;
  updateLink: (id: number, link: { name: string; url: string; description?: string; sort_order?: number; is_visible?: number }) => Promise<void>;
  deleteLink: (id: number) => Promise<void>;
}

export const useFriendLinksStore = create<FriendLinksState>((set, get) => ({
  links: [],
  loading: false,

  hydrate: async () => {
    set({ loading: true });
    try {
      const data = await api.fetchAllFriendLinks();
      set({ links: data.links as FriendLink[], loading: false });
    } catch (err: any) {
      console.error('Failed to load friend links:', err);
      set({ loading: false });
    }
  },

  createLink: async (link) => {
    await api.createFriendLink(link);
    await get().hydrate();
  },

  updateLink: async (id, link) => {
    await api.updateFriendLink(id, link);
    await get().hydrate();
  },

  deleteLink: async (id) => {
    await api.deleteFriendLink(id);
    set((state) => ({
      links: state.links.filter((l) => l.id !== id),
    }));
    get().hydrate().catch(() => {});
  },
}));
