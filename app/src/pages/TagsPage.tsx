import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchPublicTags, fetchPublicPostsByTag } from '@/api';
import { PostCard } from '@/components/PostCard';
import { TagIcon } from '@/components/Icons';
import type { PostMeta } from '@/types';

export function TagsPage() {
  const [searchParams] = useSearchParams();
  const initialTag = searchParams.get('tag');

  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(initialTag);
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicTags()
      .then((data) => setTags(data.tags))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedTag) {
      setPosts([]);
      return;
    }
    setLoading(true);
    fetchPublicPostsByTag(selectedTag)
      .then((data) => setPosts(data.posts as PostMeta[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedTag]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#09090B] dark:text-white tracking-tight mb-3">
            标签
          </h1>
          <p className="text-[#71717A] dark:text-[#A1A1AA]">按标签浏览文章</p>
        </div>

        {/* Tags Cloud */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                selectedTag === tag
                  ? 'bg-[#2563EB] text-white shadow-md'
                  : 'bg-[#F4F4F5] dark:bg-[#27272A] text-[#71717A] dark:text-[#A1A1AA] hover:bg-[#E4E4E7] dark:hover:bg-[#3F3F46] hover:text-[#09090B] dark:hover:text-white'
              }`}
            >
              <TagIcon size={13} />
              {tag}
            </button>
          ))}
        </div>

        {/* Posts for selected tag */}
        {selectedTag && (
          <div>
            <h2 className="text-lg font-semibold text-[#09090B] dark:text-white mb-6 flex items-center gap-2">
              <TagIcon size={16} />
              标签: {selectedTag}
              <span className="text-sm font-normal text-[#A1A1AA] ml-1">({posts.length} 篇)</span>
            </h2>
            {loading ? (
              <div className="text-center py-8 text-[#A1A1AA] text-sm">加载中...</div>
            ) : posts.length > 0 ? (
              <div className="flex flex-col gap-6">
                {posts.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-[#A1A1AA]">
                该标签下暂无文章
              </div>
            )}
          </div>
        )}

        {!selectedTag && tags.length === 0 && (
          <div className="text-center py-12 text-[#A1A1AA]">暂无标签</div>
        )}
      </div>
    </div>
  );
}
