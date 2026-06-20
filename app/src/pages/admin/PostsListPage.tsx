import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { usePostsStore } from '@/store';
import { fetchPostBySlug, uploadImage, uploadFile } from '@/api';
import MDEditor from '@uiw/react-md-editor';
import { CalendarIcon, TagIcon, SearchIcon, ArrowRightIcon } from '@/components/Icons';
import { PlusIcon, EditIcon, TrashIcon, EyeIcon, FileTextIcon, SaveIcon, CheckIcon } from '@/components/AdminIcons';
import type { Post } from '@/types';

function slugify(text: string): string {
  // 先处理中文：使用 encodeURIComponent 将中文转为 %XX 格式，然后转为可读的 slug
  // 例如："你好世界" -> "ni-hao-shi-jie" 的方式不可行（没有拼音库）
  // 采用策略：保留中文但转为 URL 编码后再简化
  let slug = text
    .toLowerCase()
    .trim();

  // 将中文等非 ASCII 字符转为 URL 编码形式，再替换 % 为 - 得到可用 slug
  // 但这不够美观，更好的做法是：如果全是中文或特殊字符，生成一个基于时间戳的 slug
  const hasAscii = /[a-z0-9]/i.test(slug);
  if (!hasAscii && slug.length > 0) {
    // 纯中文或特殊字符标题，生成日期+随机后缀的 slug
    const datePart = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomPart = Math.random().toString(36).substring(2, 6);
    return `post-${datePart}-${randomPart}`;
  }

  // 保留中文、字母、数字，将空格和特殊字符转为连字符
  slug = slug
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\u4e00-\u9fff-]/g, '')  // 保留中文、字母、数字、连字符
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);

  // 如果处理后为空，使用默认值
  if (!slug) {
    const datePart = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomPart = Math.random().toString(36).substring(2, 6);
    return `post-${datePart}-${randomPart}`;
  }

  return slug;
}

function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function PostsListPage() {
  const posts = usePostsStore((s) => s.posts);
  const addPost = usePostsStore((s) => s.addPost);
  const updatePost = usePostsStore((s) => s.updatePost);
  const deletePost = usePostsStore((s) => s.deletePost);

  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);

  const isEditing = !!editingSlug;
  const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [posts]
  );

  const filteredPosts = useMemo(() => {
    if (!search.trim()) return sortedPosts;
    return sortedPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    );
  }, [sortedPosts, search]);

  // Auto-slug from title
  useEffect(() => {
    if (autoSlug && title.trim()) {
      setSlug(slugify(title));
    }
  }, [title, autoSlug]);

  const openEditor = useCallback((editSlug?: string) => {
    if (editSlug) {
      setEditingSlug(editSlug);
      setAutoSlug(false);
      setLoadingPost(true);
      fetchPostBySlug(editSlug)
        .then((data) => {
          const post = data.post;
          setTitle(post.title);
          setDescription(post.description);
          setContent(post.content);
          setTagsInput(post.tags.join(', '));
          setDate(post.date);
          setSlug(post.slug);
        })
        .catch((err) => {
          setErrors({ _general: '加载文章失败: ' + err.message });
        })
        .finally(() => setLoadingPost(false));
    } else {
      setEditingSlug(null);
      setTitle('');
      setDescription('');
      setContent('');
      setTagsInput('');
      setDate(new Date().toISOString().split('T')[0]);
      setSlug('');
      setAutoSlug(true);
      setErrors({});
    }
    setSaved(false);
    setShowEditor(true);
  }, []);

  const closeEditor = () => {
    setShowEditor(false);
    setEditingSlug(null);
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = '请输入文章标题';
    if (!content.trim()) newErrors.content = '请输入文章内容';
    if (!slug.trim()) newErrors.slug = '请输入或自动生成 Slug';
    if (!date) newErrors.date = '请选择日期';
    if (!isEditing && posts.some((p) => p.slug === slug)) {
      newErrors.slug = '该 Slug 已存在，请更换';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const post: Post = {
      slug: slug.trim(),
      title: title.trim(),
      description: description.trim() || title.trim(),
      content,
      tags,
      date,
      readingTime: estimateReadingTime(content),
    };

    try {
      if (isEditing && editingSlug) {
        await updatePost(editingSlug, post);
      } else {
        await addPost(post);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);

      if (!isEditing) {
        // After creating, switch to edit mode for the new post
        setEditingSlug(post.slug);
      }
    } catch (err: any) {
      setErrors({ _general: '保存失败: ' + err.message });
    }
  };

  const handleDelete = async (postSlug: string) => {
    try {
      await deletePost(postSlug);
      setDeleteConfirm(null);
    } catch (err: any) {
      alert('删除失败: ' + (err.message || '未知错误'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#09090B] dark:text-white">文章管理</h1>
          <p className="text-sm text-[#71717A] dark:text-[#A1A1AA] mt-1">
            共 {posts.length} 篇文章
          </p>
        </div>
        <button
          onClick={() => openEditor()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm cursor-pointer"
        >
          <PlusIcon size={16} />
          发布文章
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <SearchIcon
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
        />
        <input
          type="text"
          placeholder="搜索文章标题、描述或标签..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-lg text-sm text-[#09090B] dark:text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6] transition-all duration-200"
        />
      </div>

      {/* Posts Table */}
      <div className="bg-white dark:bg-[#18181B] rounded-xl border border-[#E4E4E7] dark:border-[#27272A] overflow-hidden">
        {filteredPosts.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <FileTextIcon size={40} className="mx-auto text-[#D4D4D8] dark:text-[#3F3F46] mb-3" />
            <p className="text-sm text-[#71717A] dark:text-[#A1A1AA]">
              {search.trim() ? '没有找到匹配的文章' : '暂无文章'}
            </p>
            {!search.trim() && (
              <button
                onClick={() => openEditor()}
                className="inline-flex items-center gap-1.5 mt-3 text-sm text-[#2563EB] hover:underline cursor-pointer"
              >
                <PlusIcon size={14} />
                发布第一篇文章
              </button>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E4E4E7] dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#09090B]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider">
                  文章
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider hidden md:table-cell">
                  日期
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider hidden lg:table-cell">
                  标签
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E4E7] dark:divide-[#27272A]">
              {filteredPosts.map((post) => (
                <tr
                  key={post.slug}
                  className="hover:bg-[#FAFAFA] dark:hover:bg-[#09090B] transition-colors duration-150"
                >
                  <td className="px-5 py-3.5">
                    <div className="min-w-0">
                      <button
                        onClick={() => openEditor(post.slug)}
                        className="text-sm font-medium text-[#09090B] dark:text-white hover:text-[#2563EB] dark:hover:text-[#3B82F6] transition-colors block truncate max-w-xs text-left cursor-pointer"
                      >
                        {post.title}
                      </button>
                      <p className="text-xs text-[#A1A1AA] mt-0.5 truncate max-w-xs">
                        {post.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="flex items-center gap-1.5 text-xs text-[#71717A] dark:text-[#A1A1AA]">
                      <CalendarIcon size={12} />
                      {post.date}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[#F4F4F5] dark:bg-[#27272A] text-[#71717A] dark:text-[#A1A1AA]"
                        >
                          <TagIcon size={10} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/post/${post.slug}`}
                        target="_blank"
                        className="p-2 rounded-lg text-[#A1A1AA] hover:text-[#2563EB] hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-200"
                        title="预览"
                      >
                        <EyeIcon size={15} />
                      </Link>
                      <button
                        onClick={() => openEditor(post.slug)}
                        className="p-2 rounded-lg text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] transition-all duration-200 cursor-pointer"
                        title="编辑"
                      >
                        <EditIcon size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(post.slug)}
                        className="p-2 rounded-lg text-[#A1A1AA] hover:text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 cursor-pointer"
                        title="删除"
                      >
                        <TrashIcon size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8">
          <div className="bg-white dark:bg-[#18181B] rounded-xl border border-[#E4E4E7] dark:border-[#27272A] w-full max-w-5xl mx-4 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E4E7] dark:border-[#27272A]">
              <div>
                <h2 className="text-lg font-bold text-[#09090B] dark:text-white">
                  {isEditing ? '编辑文章' : '发布文章'}
                </h2>
                <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
                  {isEditing ? `正在编辑: ${title || editingSlug}` : '撰写一篇新文章'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {saved && (
                  <span className="flex items-center gap-1.5 text-sm text-[#059669]">
                    <CheckIcon size={16} />
                    已保存
                  </span>
                )}
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer"
                >
                  <SaveIcon size={16} />
                  {isEditing ? '更新文章' : '发布文章'}
                </button>
                <button
                  onClick={closeEditor}
                  className="p-2 rounded-lg text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] transition-all duration-200 cursor-pointer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {loadingPost ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-sm text-[#A1A1AA]">加载中...</div>
              </div>
            ) : (
              <>
                {errors._general && (
                  <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                    {errors._general}
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                  {/* Main Editor */}
                  <div className="lg:col-span-2 space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-[#09090B] dark:text-white mb-1.5">
                        文章标题 <span className="text-[#EF4444]">*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="输入文章标题..."
                        className={`w-full px-4 py-2.5 bg-white dark:bg-[#18181B] border rounded-lg text-sm text-[#09090B] dark:text-white placeholder-[#A1A1AA] focus:outline-none focus:ring-1 transition-all duration-200 ${
                          errors.title ? 'border-red-300 dark:border-red-800 focus:border-red-400 focus:ring-red-400' : 'border-[#E4E4E7] dark:border-[#27272A] focus:border-[#2563EB] focus:ring-[#2563EB]'
                        }`}
                      />
                      {errors.title && <p className="text-xs text-[#EF4444] mt-1">{errors.title}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#09090B] dark:text-white mb-1.5">
                        文章摘要
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="简短描述文章内容（留空则使用标题）..."
                        rows={2}
                        className="w-full px-4 py-2.5 bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-lg text-sm text-[#09090B] dark:text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6] focus:ring-1 focus:ring-[#2563EB] transition-all duration-200 resize-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-medium text-[#09090B] dark:text-white">
                          文章内容 (Markdown) <span className="text-[#EF4444]">*</span>
                        </label>
                        <div className="flex items-center gap-1.5">
                          <UploadImageButton
                            onUpload={(url) => setContent((prev) => prev + `\n![图片](${url})\n`)}
                          />
                          <UploadFileButton
                            onUpload={(url, name, size) => {
                              const sizeMB = (size / 1024 / 1024).toFixed(2);
                              setContent((prev) => prev + `\n📎 [下载附件: ${name} (${sizeMB} MB)](${url})\n`);
                            }}
                          />
                        </div>
                      </div>
                      {errors.content && <p className="text-xs text-[#EF4444] mb-1.5">{errors.content}</p>}
                      <div data-color-mode="light" className="border border-[#E4E4E7] dark:border-[#27272A] rounded-lg overflow-hidden">
                        <MDEditor
                          value={content}
                          onChange={(val) => setContent(val || '')}
                          height={450}
                          preview="live"
                          visibleDragbar={false}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-[#18181B] rounded-xl border border-[#E4E4E7] dark:border-[#27272A] p-4">
                      <label className="block text-sm font-medium text-[#09090B] dark:text-white mb-1.5">
                        Slug <span className="text-[#EF4444]">*</span>
                      </label>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => { setSlug(e.target.value); setAutoSlug(false); }}
                        placeholder="article-slug"
                        className={`w-full px-3 py-2 bg-[#FAFAFA] dark:bg-[#09090B] border rounded-lg text-sm text-[#09090B] dark:text-white placeholder-[#A1A1AA] focus:outline-none focus:ring-1 transition-all duration-200 font-mono ${
                          errors.slug ? 'border-red-300 dark:border-red-800' : 'border-[#E4E4E7] dark:border-[#27272A] focus:border-[#2563EB] focus:ring-[#2563EB]'
                        }`}
                      />
                      {errors.slug && <p className="text-xs text-[#EF4444] mt-1">{errors.slug}</p>}
                      <p className="text-xs text-[#A1A1AA] mt-1.5">访问路径: /post/{slug || '...'}</p>
                    </div>

                    <div className="bg-white dark:bg-[#18181B] rounded-xl border border-[#E4E4E7] dark:border-[#27272A] p-4">
                      <label className="block text-sm font-medium text-[#09090B] dark:text-white mb-1.5">
                        发布日期 <span className="text-[#EF4444]">*</span>
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={`w-full px-3 py-2 bg-[#FAFAFA] dark:bg-[#09090B] border rounded-lg text-sm text-[#09090B] dark:text-white focus:outline-none focus:ring-1 transition-all duration-200 ${
                          errors.date ? 'border-red-300 dark:border-red-800' : 'border-[#E4E4E7] dark:border-[#27272A] focus:border-[#2563EB] focus:ring-[#2563EB]'
                        }`}
                      />
                      {errors.date && <p className="text-xs text-[#EF4444] mt-1">{errors.date}</p>}
                    </div>

                    <div className="bg-white dark:bg-[#18181B] rounded-xl border border-[#E4E4E7] dark:border-[#27272A] p-4">
                      <label className="block text-sm font-medium text-[#09090B] dark:text-white mb-1.5">标签</label>
                      <input
                        type="text"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        placeholder="React, TypeScript, 教程"
                        className="w-full px-3 py-2 bg-[#FAFAFA] dark:bg-[#09090B] border border-[#E4E4E7] dark:border-[#27272A] rounded-lg text-sm text-[#09090B] dark:text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6] focus:ring-1 focus:ring-[#2563EB] transition-all duration-200"
                      />
                      <p className="text-xs text-[#A1A1AA] mt-1.5">多个标签用逗号分隔</p>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {tags.map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#3B82F6]/20 dark:text-[#60A5FA]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-white dark:bg-[#18181B] rounded-xl border border-[#E4E4E7] dark:border-[#27272A] p-4">
                      <h3 className="text-sm font-medium text-[#09090B] dark:text-white mb-2">文章统计</h3>
                      <div className="space-y-1.5 text-xs text-[#71717A] dark:text-[#A1A1AA]">
                        <div className="flex justify-between"><span>字数</span><span className="font-mono">{content.trim().split(/\s+/).filter(Boolean).length.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>字符数</span><span className="font-mono">{content.length.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>预计阅读</span><span className="font-mono">{estimateReadingTime(content)} 分钟</span></div>
                        <div className="flex justify-between"><span>标签数</span><span className="font-mono">{tags.length}</span></div>
                      </div>
                    </div>

                    {slug && (
                      <a
                        href={`/post/${slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full px-4 py-3 bg-white dark:bg-[#18181B] rounded-xl border border-[#E4E4E7] dark:border-[#27272A] text-sm text-[#2563EB] hover:border-[#2563EB] transition-all duration-200 group"
                      >
                        <span className="font-medium">预览文章</span>
                        <ArrowRightIcon size={14} className="group-hover:translate-x-1 transition-transform" />
                      </a>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#18181B] rounded-xl shadow-2xl p-6 mx-4 max-w-sm w-full">
            <h3 className="text-lg font-bold text-[#09090B] dark:text-white mb-2">确认删除</h3>
            <p className="text-sm text-[#71717A] mb-6">
              确定要删除文章 <code className="bg-[#F4F4F5] dark:bg-[#27272A] px-1.5 py-0.5 rounded text-[#EF4444]">{deleteConfirm}</code> 吗？此操作不可撤销。
            </p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-[#E4E4E7] dark:border-[#27272A] rounded-lg text-sm text-[#71717A] hover:text-[#09090B] dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] transition-all cursor-pointer">
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-[#EF4444] text-white text-sm font-medium rounded-lg hover:bg-[#DC2626] transition-colors cursor-pointer"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 小型上传按钮组件（用于 PostsListPage 内联编辑器）
function UploadImageButton({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setMsg('❌ 图片不能超过 10MB');
      setTimeout(() => setMsg(''), 3000);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setUploading(true);
    setMsg('');
    try {
      const reader = new FileReader();
      const data = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const result = await uploadImage(data, file.name);
      onUpload(result.url);
      setMsg(`✅ 已插入: ${result.url}`);
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setMsg(`❌ 上传失败: ${err.message}`);
      setTimeout(() => setMsg(''), 4000);
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-[#E4E4E7] dark:border-[#27272A] rounded text-[#71717A] hover:text-[#09090B] dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] transition-all cursor-pointer disabled:opacity-50"
        title="上传图片"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
        {uploading ? '上传中...' : '图片'}
      </button>
      {msg && (
        <span className={`text-xs ml-1 ${msg.startsWith('✅') ? 'text-emerald-600' : 'text-red-500'}`}>
          {msg}
        </span>
      )}
    </>
  );
}

function UploadFileButton({ onUpload }: { onUpload: (url: string, name: string, size: number) => void }) {
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      setMsg('❌ 文件不能超过 50MB');
      setTimeout(() => setMsg(''), 3000);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setUploading(true);
    setMsg('');
    try {
      const reader = new FileReader();
      const data = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const result = await uploadFile(data, file.name);
      onUpload(result.url, result.originalName, result.size);
      const sizeMB = (result.size / 1024 / 1024).toFixed(2);
      setMsg(`✅ 已插入: ${result.originalName} (${sizeMB}MB)`);
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setMsg(`❌ 上传失败: ${err.message}`);
      setTimeout(() => setMsg(''), 4000);
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <>
      <input ref={inputRef} type="file" onChange={handleChange} className="hidden" />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-[#E4E4E7] dark:border-[#27272A] rounded text-[#71717A] hover:text-[#09090B] dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] transition-all cursor-pointer disabled:opacity-50"
        title="上传附件"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
        {uploading ? '上传中...' : '附件'}
      </button>
      {msg && (
        <span className={`text-xs ml-1 ${msg.startsWith('✅') ? 'text-emerald-600' : 'text-red-500'}`}>
          {msg}
        </span>
      )}
    </>
  );
}
