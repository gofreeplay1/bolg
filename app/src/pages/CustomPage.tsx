import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@/components/Icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchPageBySlug } from '@/api';
import type { CustomPage as CustomPageType } from '@/types';

export function CustomPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<CustomPageType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError('');
    fetchPageBySlug(slug)
      .then((data) => {
        setPage(data.page);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || '页面不存在');
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="flex items-center gap-2 text-[#71717A]">
          <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          加载中...
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-3xl font-bold text-[#09090B] dark:text-white mb-4">页面不存在</h1>
          <p className="text-[#71717A] mb-6">{error || '找不到该页面'}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#2563EB] dark:text-[#3B82F6] hover:underline"
          >
            <ArrowLeftIcon size={16} />
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-[#71717A] hover:text-[#09090B] dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeftIcon size={16} />
          返回首页
        </Link>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#09090B] dark:text-white tracking-tight mb-8">
          {page.title}
        </h1>

        {/* Content */}
        <div className="bg-white dark:bg-[#18181B] rounded-xl border border-[#E4E4E7] dark:border-[#27272A] p-8">
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children, ...props }) => {
                  const url = href || '';
                  if (url.startsWith('http://') || url.startsWith('https://')) {
                    return (
                      <a
                        href={`/redirect?url=${encodeURIComponent(url)}`}
                        className="text-[#2563EB] dark:text-[#3B82F6] no-underline hover:underline inline-flex items-center gap-1"
                        {...props}
                      >
                        {children}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" x2="21" y1="14" y2="3" />
                        </svg>
                      </a>
                    );
                  }
                  return <a href={url} {...props}>{children}</a>;
                },
              }}
            >
              {page.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
