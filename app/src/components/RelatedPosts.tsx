import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePostsStore } from '@/store';
import type { PostMeta } from '@/types';
import { CalendarIcon, ClockIcon, ArrowRightIcon } from '@/components/Icons';

interface RelatedPostsProps {
  currentSlug: string;
  tags: string[];
}

export function RelatedPosts({ currentSlug, tags }: RelatedPostsProps) {
  const allPosts = usePostsStore((s) => s.allPosts);

  const related = useMemo(() => {
    if (allPosts.length === 0) return [];

    // 排除当前文章
    const others = allPosts.filter((p) => p.slug !== currentSlug);
    if (others.length === 0) return [];

    // 按标签匹配度排序：共同标签越多越靠前
    const scored = others.map((post) => {
      const commonTags = post.tags.filter((t) => tags.includes(t));
      return { post, score: commonTags.length };
    });

    // 先按标签匹配度排序，再按日期排序
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.post.date.localeCompare(a.post.date);
    });

    return scored.slice(0, 3).map((s) => s.post);
  }, [allPosts, currentSlug, tags]);

  if (related.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-[#E4E4E7] dark:border-[#27272A]">
      <h3 className="text-lg font-bold text-[#09090B] dark:text-white mb-6">推荐阅读</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((post) => (
          <Link
            key={post.slug}
            to={`/post/${post.slug}`}
            className="group block p-4 bg-white dark:bg-[#18181B] rounded-xl border border-[#E4E4E7] dark:border-[#27272A] hover:border-[#2563EB] dark:hover:border-[#3B82F6] hover:shadow-md transition-all duration-300"
          >
            <h4 className="text-sm font-semibold text-[#09090B] dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-[#3B82F6] transition-colors line-clamp-2 mb-2">
              {post.title}
            </h4>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] line-clamp-2 mb-3">
              {post.description}
            </p>
            <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
              <span className="flex items-center gap-1">
                <CalendarIcon size={12} />
                {post.date}
              </span>
              <span className="flex items-center gap-1 text-[#2563EB] dark:text-[#3B82F6] opacity-0 group-hover:opacity-100 transition-opacity">
                阅读 <ArrowRightIcon size={12} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
