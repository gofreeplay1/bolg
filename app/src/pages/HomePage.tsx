import { useState, useMemo, useEffect } from 'react';
import { usePostsStore, useSettingsStore } from '@/store';
import { PostCard } from '@/components/PostCard';
import { TagIcon, SearchIcon } from '@/components/Icons';

export function HomePage() {
  const allPosts = usePostsStore((s) => s.allPosts);
  const allTags = usePostsStore((s) => s.allTags);
  const { settings, hydrate } = useSettingsStore();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const welcomeTitle = settings.site.welcomeTitle || '';
  const welcomeSubtitle = settings.site.welcomeSubtitle || '';

  const filteredPosts = useMemo(() => {
    let result = allPosts;

    if (selectedTag) {
      result = result.filter((post) => post.tags.includes(selectedTag));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.description.toLowerCase().includes(query) ||
          post.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return result;
  }, [allPosts, selectedTag, searchQuery]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        {/* Hero - 仅在填写了欢迎语时显示 */}
        {(welcomeTitle || welcomeSubtitle) && (
          <div className="text-center mb-12">
            {welcomeTitle && (
              <h1 className="text-4xl md:text-5xl font-bold text-[#09090B] dark:text-white tracking-tight mb-4">
                {welcomeTitle}
              </h1>
            )}
            {welcomeSubtitle && (
              <p className="text-lg text-[#71717A] dark:text-[#A1A1AA] max-w-lg mx-auto">
                {welcomeSubtitle}
              </p>
            )}
          </div>
        )}

        {/* Search */}
        <div className="relative mb-8">
          <SearchIcon
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
          />
          <input
            type="text"
            placeholder="搜索文章..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl text-sm text-[#09090B] dark:text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6] focus:ring-1 focus:ring-[#2563EB] dark:focus:ring-[#3B82F6] transition-all duration-200"
          />
        </div>

        {/* Tags Filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
              selectedTag === null
                ? 'bg-[#2563EB] text-white'
                : 'bg-[#F4F4F5] dark:bg-[#27272A] text-[#71717A] dark:text-[#A1A1AA] hover:bg-[#E4E4E7] dark:hover:bg-[#3F3F46]'
            }`}
          >
            全部
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                selectedTag === tag
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-[#F4F4F5] dark:bg-[#27272A] text-[#71717A] dark:text-[#A1A1AA] hover:bg-[#E4E4E7] dark:hover:bg-[#3F3F46]'
              }`}
            >
              <TagIcon size={12} />
              {tag}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        {filteredPosts.length > 0 ? (
          <div className="flex flex-col gap-6">
            {filteredPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-[#71717A] dark:text-[#A1A1AA] text-lg">没有找到匹配的文章</p>
            <p className="text-[#A1A1AA] dark:text-[#71717A] text-sm mt-2">
              尝试更换搜索关键词或清除筛选条件
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
