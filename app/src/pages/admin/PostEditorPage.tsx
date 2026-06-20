import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePostsStore } from '@/store';
import { fetchPostBySlug, uploadImage, uploadFile } from '@/api';
import MDEditor from '@uiw/react-md-editor';
import { ArrowRightIcon } from '@/components/Icons';
import { CheckIcon, SaveIcon } from '@/components/AdminIcons';
import type { Post } from '@/types';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function PostEditorPage() {
  const { slug: editSlug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const posts = usePostsStore((s) => s.posts);
  const addPost = usePostsStore((s) => s.addPost);
  const updatePost = usePostsStore((s) => s.updatePost);

  const isEditing = !!editSlug;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [slug, setSlug] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [autoSlug, setAutoSlug] = useState(!isEditing);
  const [loadingPost, setLoadingPost] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing post from API for editing
  useEffect(() => {
    if (editSlug) {
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
          console.error('Failed to load post:', err);
          setErrors({ _general: '加载文章失败: ' + err.message });
        })
        .finally(() => setLoadingPost(false));
    }
  }, [editSlug]);

  // Auto-generate slug from title
  useEffect(() => {
    if (autoSlug && title.trim()) {
      setSlug(slugify(title));
    }
  }, [title, autoSlug]);

  const tags = tagsInput
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setUploadMsg('');
    try {
      // 文件大小检查（前端预检）
      if (file.size > 10 * 1024 * 1024) {
        setUploadMsg(`❌ 上传失败: 图片大小不能超过 10MB（当前: ${(file.size / 1024 / 1024).toFixed(2)}MB）`);
        setUploadingImage(false);
        if (imageInputRef.current) imageInputRef.current.value = '';
        return;
      }
      const data = await fileToBase64(file);
      const result = await uploadImage(data, file.name);
      // 插入 Markdown 图片语法到光标位置
      const mdImg = `![${file.name}](${result.url})`;
      setContent((prev) => prev + '\n' + mdImg + '\n');
      setUploadMsg(`✅ 图片已上传并插入文章: ${result.url}`);
    } catch (err: any) {
      setUploadMsg(`❌ 上传失败: ${err.message}`);
    }
    setUploadingImage(false);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    setUploadMsg('');
    try {
      // 文件大小检查（前端预检）
      if (file.size > 50 * 1024 * 1024) {
        setUploadMsg(`❌ 上传失败: 文件大小不能超过 50MB（当前: ${(file.size / 1024 / 1024).toFixed(2)}MB）`);
        setUploadingFile(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      const data = await fileToBase64(file);
      const result = await uploadFile(data, file.name);
      // 插入附件下载链接到光标位置
      const sizeMB = (result.size / 1024 / 1024).toFixed(2);
      const mdLink = `\n📎 [下载附件: ${result.originalName} (${sizeMB} MB)](${result.url})\n`;
      setContent((prev) => prev + mdLink);
      setUploadMsg(`✅ 附件已上传并插入文章: ${result.originalName} (${sizeMB} MB)`);
    } catch (err: any) {
      setUploadMsg(`❌ 上传失败: ${err.message}`);
    }
    setUploadingFile(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      if (isEditing && editSlug) {
        await updatePost(editSlug, post);
      } else {
        await addPost(post);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);

      if (!isEditing) {
        navigate(`/admin/posts/${post.slug}/edit`, { replace: true });
      }
    } catch (err: any) {
      setErrors({ _general: '保存失败: ' + err.message });
    }
  };

  if (loadingPost) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-[#A1A1AA]">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#09090B] dark:text-white">
            {isEditing ? '编辑文章' : '新建文章'}
          </h1>
          <p className="text-sm text-[#71717A] dark:text-[#A1A1AA] mt-1">
            {isEditing ? `正在编辑: ${title || editSlug}` : '撰写一篇新文章'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Upload buttons */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={uploadingImage}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#E4E4E7] dark:border-[#27272A] rounded-lg text-sm text-[#71717A] hover:text-[#09090B] dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] transition-all cursor-pointer disabled:opacity-50"
            title="上传图片"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            {uploadingImage ? '上传中...' : '图片'}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFile}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#E4E4E7] dark:border-[#27272A] rounded-lg text-sm text-[#71717A] hover:text-[#09090B] dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] transition-all cursor-pointer disabled:opacity-50"
            title="上传附件"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
            {uploadingFile ? '上传中...' : '附件'}
          </button>

          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-[#059669]">
              <CheckIcon size={16} />
              已保存
            </span>
          )}
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm cursor-pointer"
          >
            <SaveIcon size={16} />
            {isEditing ? '更新文章' : '发布文章'}
          </button>
        </div>
      </div>

      {(uploadMsg || uploadingImage || uploadingFile) && (
        <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
          uploadMsg.startsWith('✅')
            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            : uploadMsg.startsWith('❌')
            ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
            : 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
        }`}>
          {(uploadingImage || uploadingFile) && (
            <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          <span>{uploadMsg || (uploadingImage ? '正在上传图片...' : '正在上传附件...')}</span>
        </div>
      )}

      {errors._general && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
          {errors._general}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor Area */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
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
                errors.title
                  ? 'border-red-300 dark:border-red-800 focus:border-red-400 focus:ring-red-400'
                  : 'border-[#E4E4E7] dark:border-[#27272A] focus:border-[#2563EB] focus:ring-[#2563EB]'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-[#EF4444] mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
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

          {/* Markdown Editor */}
          <div>
            <label className="block text-sm font-medium text-[#09090B] dark:text-white mb-1.5">
              文章内容 (Markdown) <span className="text-[#EF4444]">*</span>
            </label>
            {errors.content && (
              <p className="text-xs text-[#EF4444] mb-1.5">{errors.content}</p>
            )}
            <div data-color-mode="light" className="border border-[#E4E4E7] dark:border-[#27272A] rounded-lg overflow-hidden">
              <MDEditor
                value={content}
                onChange={(val) => setContent(val || '')}
                height={500}
                preview="live"
                visibleDragbar={false}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Slug */}
          <div className="bg-white dark:bg-[#18181B] rounded-xl border border-[#E4E4E7] dark:border-[#27272A] p-4">
            <label className="block text-sm font-medium text-[#09090B] dark:text-white mb-1.5">
              Slug <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setAutoSlug(false);
              }}
              placeholder="article-slug"
              className={`w-full px-3 py-2 bg-[#FAFAFA] dark:bg-[#09090B] border rounded-lg text-sm text-[#09090B] dark:text-white placeholder-[#A1A1AA] focus:outline-none focus:ring-1 transition-all duration-200 font-mono ${
                errors.slug
                  ? 'border-red-300 dark:border-red-800'
                  : 'border-[#E4E4E7] dark:border-[#27272A] focus:border-[#2563EB] focus:ring-[#2563EB]'
              }`}
            />
            {errors.slug && (
              <p className="text-xs text-[#EF4444] mt-1">{errors.slug}</p>
            )}
            <p className="text-xs text-[#A1A1AA] mt-1.5">
              访问路径: /post/{slug || '...'}
            </p>
          </div>

          {/* Date */}
          <div className="bg-white dark:bg-[#18181B] rounded-xl border border-[#E4E4E7] dark:border-[#27272A] p-4">
            <label className="block text-sm font-medium text-[#09090B] dark:text-white mb-1.5">
              发布日期 <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full px-3 py-2 bg-[#FAFAFA] dark:bg-[#09090B] border rounded-lg text-sm text-[#09090B] dark:text-white focus:outline-none focus:ring-1 transition-all duration-200 ${
                errors.date
                  ? 'border-red-300 dark:border-red-800'
                  : 'border-[#E4E4E7] dark:border-[#27272A] focus:border-[#2563EB] focus:ring-[#2563EB]'
              }`}
            />
            {errors.date && (
              <p className="text-xs text-[#EF4444] mt-1">{errors.date}</p>
            )}
          </div>

          {/* Tags */}
          <div className="bg-white dark:bg-[#18181B] rounded-xl border border-[#E4E4E7] dark:border-[#27272A] p-4">
            <label className="block text-sm font-medium text-[#09090B] dark:text-white mb-1.5">
              标签
            </label>
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
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#3B82F6]/20 dark:text-[#60A5FA]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="bg-white dark:bg-[#18181B] rounded-xl border border-[#E4E4E7] dark:border-[#27272A] p-4">
            <h3 className="text-sm font-medium text-[#09090B] dark:text-white mb-2">文章统计</h3>
            <div className="space-y-1.5 text-xs text-[#71717A] dark:text-[#A1A1AA]">
              <div className="flex justify-between">
                <span>字数</span>
                <span className="font-mono">{content.trim().split(/\s+/).filter(Boolean).length.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>字符数</span>
                <span className="font-mono">{content.length.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>预计阅读</span>
                <span className="font-mono">{estimateReadingTime(content)} 分钟</span>
              </div>
              <div className="flex justify-between">
                <span>标签数</span>
                <span className="font-mono">{tags.length}</span>
              </div>
            </div>
          </div>

          {/* Preview Link */}
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
    </div>
  );
}
