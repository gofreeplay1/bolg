import { useMemo } from 'react';
import { usePostsStore } from '@/store';
import { Link } from 'react-router-dom';
import { TagIcon, CalendarIcon } from '@/components/Icons';
import { PlusIcon, FileTextIcon } from '@/components/AdminIcons';

export function DashboardPage() {
  const posts = usePostsStore((s) => s.posts);
  const allTags = usePostsStore((s) => s.allTags);

  const recentPosts = useMemo(
    () =>
      [...posts]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    [posts]
  );

  const totalWords = useMemo(
    () => posts.reduce((sum, p) => sum + (p.content?.length || 0), 0),
    [posts]
  );
  const totalReadingTime = useMemo(
    () => posts.reduce((sum, p) => sum + (p.readingTime || 0), 0),
    [posts]
  );

  const stats = useMemo(
    () => [
      { label: '文章总数', value: posts.length, color: 'text-[#2563EB]', bg: 'bg-blue-50 dark:bg-blue-950/20' },
      { label: '标签数', value: allTags.length, color: 'text-[#7C3AED]', bg: 'bg-violet-50 dark:bg-violet-950/20' },
      { label: '总字数', value: totalWords.toLocaleString(), color: 'text-[#059669]', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
      { label: '总阅读时间', value: `${totalReadingTime} 分钟`, color: 'text-[#D97706]', bg: 'bg-amber-50 dark:bg-amber-950/20' },
    ],
    [posts.length, allTags.length, totalWords, totalReadingTime]
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#09090B] dark:text-white">仪表盘</h1>
          <p className="text-sm text-[#71717A] dark:text-[#A1A1AA] mt-1">博客数据概览</p>
        </div>
        <Link
          to="/admin/posts/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm"
        >
          <PlusIcon size={16} />
          新建文章
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-[#18181B] rounded-xl border border-[#E4E4E7] dark:border-[#27272A] p-5"
          >
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${stat.bg} mb-3`}>
              <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
            </div>
            <p className="text-sm text-[#71717A] dark:text-[#A1A1AA]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Posts */}
      <div className="bg-white dark:bg-[#18181B] rounded-xl border border-[#E4E4E7] dark:border-[#27272A]">
        <div className="px-5 py-4 border-b border-[#E4E4E7] dark:border-[#27272A]">
          <h2 className="text-sm font-semibold text-[#09090B] dark:text-white">最近文章</h2>
        </div>
        <div className="divide-y divide-[#E4E4E7] dark:divide-[#27272A]">
          {recentPosts.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-[#A1A1AA]">
              暂无文章，点击右上角新建第一篇文章
            </div>
          ) : (
            recentPosts.map((post) => (
              <div
                key={post.slug}
                className="px-5 py-3.5 flex items-center justify-between hover:bg-[#FAFAFA] dark:hover:bg-[#09090B] transition-colors duration-150"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileTextIcon size={16} className="text-[#A1A1AA] shrink-0" />
                  <div className="min-w-0">
                    <Link
                      to={`/admin/posts/${post.slug}/edit`}
                      className="text-sm font-medium text-[#09090B] dark:text-white hover:text-[#2563EB] dark:hover:text-[#3B82F6] truncate block transition-colors"
                    >
                      {post.title}
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-[#A1A1AA] mt-0.5">
                      <span className="flex items-center gap-1">
                        <CalendarIcon size={11} />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <TagIcon size={11} />
                        {post.tags.length} 个标签
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  to={`/admin/posts/${post.slug}/edit`}
                  className="text-xs text-[#2563EB] hover:underline shrink-0 ml-4"
                >
                  编辑
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

      {/* All Tags */}
      {allTags.length > 0 && (
        <div className="bg-white dark:bg-[#18181B] rounded-xl border border-[#E4E4E7] dark:border-[#27272A]">
          <div className="px-5 py-4 border-b border-[#E4E4E7] dark:border-[#27272A]">
            <h2 className="text-sm font-semibold text-[#09090B] dark:text-white">所有标签</h2>
          </div>
          <div className="px-5 py-4 flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#F4F4F5] dark:bg-[#27272A] text-[#71717A] dark:text-[#A1A1AA]"
              >
                <TagIcon size={11} />
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
