import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPublicPostBySlug } from '@/api';
import { useSettingsStore } from '@/store';
import type { Post } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { CalendarIcon, TagIcon, ArrowRightIcon } from '@/components/Icons';
import { CommentSection } from '@/components/CommentSection';
import { RelatedPosts } from '@/components/RelatedPosts';
import { DonateFloating } from '@/components/DonateFloating';

// 判断链接是否是下载链接（上传的文件）
function isDownloadLink(url: string): boolean {
  return url.startsWith('/uploads/files/');
}

// 判断链接是否是网盘链接
function isCloudDriveLink(url: string): { isCloudDrive: boolean; service: string } {
  const patterns: { regex: RegExp; service: string }[] = [
    { regex: /pan\.baidu\.com/, service: '百度网盘' },
    { regex: /123pan\.com|123684\.com|123912\.com/, service: '123云盘' },
    { regex: /aliyundrive\.com|alipan\.com/, service: '阿里云盘' },
    { regex: /lanzou[a-z]*\.com|lanzoux\.com|lanzoui\.com/, service: '蓝奏云' },
    { regex: /quark\.cn/, service: '夸克网盘' },
    { regex: /xunlei\.com/, service: '迅雷云盘' },
    { regex: /115\.com/, service: '115网盘' },
    { regex: /weiyun\.com/, service: '微云' },
    { regex: /cloud\.189\.cn/, service: '天翼云盘' },
    { regex: /pan\.xunlei\.com/, service: '迅雷云盘' },
    { regex: /drive\.google\.com/, service: 'Google Drive' },
    { regex: /dropbox\.com/, service: 'Dropbox' },
    { regex: /onedrive\.live\.com|1drv\.ms/, service: 'OneDrive' },
    { regex: /mega\.nz/, service: 'MEGA' },
  ];
  for (const { regex, service } of patterns) {
    if (regex.test(url)) {
      return { isCloudDrive: true, service };
    }
  }
  return { isCloudDrive: false, service: '' };
}

// 判断链接是否是外部链接
function isExternalLink(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

// 从 Markdown 文本中提取下载链接文本
function extractDownloadText(text: string): { name: string; size: string } | null {
  const match = text.match(/下载附件:\s*(.+?)\s*\(([^)]+)\)/);
  if (match) {
    return { name: match[1], size: match[2] };
  }
  return null;
}

export function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { settings, hydrate } = useSettingsStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const hasSiteBackground = !!settings.appearance?.siteBackground;

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    fetchPublicPostBySlug(slug)
      .then((data) => setPost(data.post as Post))
      .catch((err) => setError('文章加载失败: ' + err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-[#A1A1AA] text-sm">加载中...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#09090B] dark:text-white mb-2">文章不存在</h1>
          <p className="text-[#71717A] dark:text-[#A1A1AA] mb-4">{error || '找不到该文章'}</p>
          <Link to="/" className="text-[#2563EB] hover:underline text-sm">返回首页</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <article className="max-w-3xl mx-auto px-6">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#71717A] dark:text-[#A1A1AA] hover:text-[#2563EB] dark:hover:text-[#3B82F6] mb-8 transition-colors group"
        >
          <ArrowRightIcon size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
          返回首页
        </Link>

        {/* Article Card - 有背景图时给文章内容加白色遮罩卡片提升可读性 */}
        <div className={hasSiteBackground ? 'bg-white/90 dark:bg-[#18181B]/90 backdrop-blur-sm rounded-2xl p-6 md:p-10 shadow-lg border border-white/20' : ''}>
          {/* Header */}
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-[#09090B] dark:text-white tracking-tight mb-4">
              {post.title}
            </h1>
            {post.description && post.description !== post.title && (
              <p className="text-lg text-[#71717A] dark:text-[#A1A1AA] mb-6">{post.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#A1A1AA]">
              <span className="flex items-center gap-1.5">
                <CalendarIcon size={14} />
                {post.date}
              </span>
              <span>·</span>
              <span>{post.readingTime} 分钟阅读</span>
            </div>
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/tags?tag=${encodeURIComponent(tag)}`}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#F4F4F5] dark:bg-[#27272A] text-[#71717A] dark:text-[#A1A1AA] hover:bg-[#E4E4E7] dark:hover:bg-[#3F3F46] transition-colors"
                  >
                    <TagIcon size={11} />
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </header>

          {/* Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:leading-relaxed prose-p:text-[#3F3F46] dark:prose-p:text-[#D4D4D8]
            prose-a:text-[#2563EB] dark:prose-a:text-[#3B82F6] prose-a:no-underline hover:prose-a:underline
            prose-code:bg-[#F4F4F5] dark:prose-code:bg-[#27272A] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-[#18181B] dark:prose-pre:bg-[#0A0A0A] prose-pre:border prose-pre:border-[#27272A] prose-pre:rounded-xl
            prose-img:rounded-xl
            prose-blockquote:border-l-[#2563EB] dark:prose-blockquote:border-l-[#3B82F6] prose-blockquote:bg-[#F4F4F5] dark:prose-blockquote:bg-[#18181B] prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
            prose-table:border prose-table:border-[#E4E4E7] dark:prose-table:border-[#27272A] prose-th:bg-[#FAFAFA] dark:prose-th:bg-[#18181B]
            prose-li:text-[#3F3F46] dark:prose-li:text-[#D4D4D8]
            ">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeHighlight]}
              components={{
                a: ({ href, children, node, ...props }) => {
                  const url = href || '';
                  // 安全获取纯文本内容（children 可能是 React 节点数组）
                  const getTextContent = (children: React.ReactNode): string => {
                    if (typeof children === 'string') return children;
                    if (Array.isArray(children)) {
                      return children.map(c => (typeof c === 'string' ? c : '')).join('');
                    }
                    return '';
                  };
                  const text = getTextContent(children);

                  // 下载链接（站内附件）：跳转下载确认页
                  if (isDownloadLink(url)) {
                    const downloadInfo = extractDownloadText(text);
                    const downloadUrl = `/download?url=${encodeURIComponent(url)}&name=${encodeURIComponent(downloadInfo?.name || '')}&size=${encodeURIComponent(downloadInfo?.size || '')}`;
                    return (
                      <a
                        href={downloadUrl}
                        className="!inline-flex !items-center !gap-2 !px-4 !py-2.5 !bg-[#2563EB] hover:!bg-[#1D4ED8] !text-white !text-sm !font-medium !rounded-lg !transition-colors !no-underline hover:!no-underline !cursor-pointer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.625rem 1rem',
                          backgroundColor: '#2563EB',
                          color: 'white',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          borderRadius: '0.5rem',
                          textDecoration: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" x2="12" y1="15" y2="3" />
                        </svg>
                        {downloadInfo ? (
                          <span style={{ display: 'inline' }}>
                            下载附件: {downloadInfo.name} <span style={{ opacity: 0.7 }}>({downloadInfo.size})</span>
                          </span>
                        ) : (
                          <span style={{ display: 'inline' }}>下载附件</span>
                        )}
                      </a>
                    );
                  }

                  // 网盘链接：渲染为下载按钮
                  const cloudDrive = isCloudDriveLink(url);
                  if (cloudDrive.isCloudDrive) {
                    const downloadUrl = `/download?url=${encodeURIComponent(url)}&name=${encodeURIComponent(cloudDrive.service + '下载')}`;
                    return (
                      <a
                        href={downloadUrl}
                        className="!inline-flex !items-center !gap-2 !px-4 !py-2.5 !bg-[#F59E0B] hover:!bg-[#D97706] !text-white !text-sm !font-medium !rounded-lg !transition-colors !no-underline hover:!no-underline !cursor-pointer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.625rem 1rem',
                          backgroundColor: '#F59E0B',
                          color: 'white',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          borderRadius: '0.5rem',
                          textDecoration: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" x2="12" y1="15" y2="3" />
                        </svg>
                        <span style={{ display: 'inline' }}>
                          {cloudDrive.service}下载 {text ? `: ${text}` : ''}
                        </span>
                      </a>
                    );
                  }

                  // 外部链接：跳转风险提示页面
                  if (isExternalLink(url)) {
                    return (
                      <a
                        href={`/redirect?url=${encodeURIComponent(url)}`}
                        className="!text-[#2563EB] dark:!text-[#3B82F6] !no-underline hover:!underline !inline-flex !items-center !gap-1"
                        style={{ color: '#2563EB', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        {children}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', flexShrink: 0 }}>
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" x2="21" y1="14" y2="3" />
                        </svg>
                      </a>
                    );
                  }

                  // 普通内部链接
                  return <a href={url} style={{ color: '#2563EB' }}>{children}</a>;
                },
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Copyright Notice */}
        {settings.site.postCopyright && (
          <div className="mt-8 p-4 bg-[#F4F4F5] dark:bg-[#27272A] rounded-xl border border-[#E4E4E7] dark:border-[#3F3F46]">
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
              {settings.site.postCopyright
                .replace('{title}', post.title)
                .replace('{date}', post.date)
                .replace('{year}', new Date().getFullYear().toString())}
            </p>
          </div>
        )}

        {/* Related Posts */}
        <RelatedPosts currentSlug={post.slug} tags={post.tags} />

        {/* Comments Section */}
        <CommentSection postSlug={post.slug} />
      </article>

      {/* Floating Donate Button */}
      <DonateFloating />
    </div>
  );
}
