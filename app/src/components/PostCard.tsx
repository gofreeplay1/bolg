import { Link } from 'react-router-dom';
import { CalendarIcon, ClockIcon, TagIcon, ArrowRightIcon } from '@/components/Icons';
import type { PostMeta } from '@/types';

export function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link
      to={`/post/${post.slug}`}
      className="group block p-6 bg-white dark:bg-[#18181B] rounded-xl border border-[#E4E4E7] dark:border-[#27272A] hover:border-[#2563EB] dark:hover:border-[#3B82F6] hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      <h2 className="text-xl font-bold text-[#09090B] dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-[#3B82F6] transition-colors duration-200 mb-3">
        {post.title}
      </h2>
      <p className="text-sm text-[#71717A] dark:text-[#A1A1AA] mb-4 line-clamp-2">
        {post.description}
      </p>
      <div className="flex flex-wrap items-center gap-4 text-xs text-[#A1A1AA] dark:text-[#71717A] mb-4">
        <span className="flex items-center gap-1.5">
          <CalendarIcon size={14} />
          {post.date}
        </span>
        <span className="flex items-center gap-1.5">
          <ClockIcon size={14} />
          {post.readingTime} 分钟阅读
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F4F4F5] dark:bg-[#27272A] text-[#71717A] dark:text-[#A1A1AA]"
            >
              <TagIcon size={12} />
              {tag}
            </span>
          ))}
        </div>
        <span className="flex items-center gap-1 text-sm font-medium text-[#2563EB] dark:text-[#3B82F6] opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-0 group-hover:translate-x-1">
          阅读
          <ArrowRightIcon size={16} />
        </span>
      </div>
    </Link>
  );
}
