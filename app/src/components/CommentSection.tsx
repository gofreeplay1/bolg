import { useState, useEffect } from 'react';
import { fetchComments, submitComment } from '@/api';
import type { Comment } from '@/types';

export function CommentSection({ postSlug }: { postSlug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadComments = () => {
    setLoading(true);
    fetchComments(postSlug)
      .then((data) => setComments(data.comments as Comment[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadComments();
  }, [postSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;

    setSubmitting(true);
    setMessage(null);
    try {
      const data = await submitComment(postSlug, author.trim(), content.trim());
      setMessage({ type: 'success', text: data.message || '评论已提交，等待审核' });
      setAuthor('');
      setContent('');
      // Don't reload - comment is pending review
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '提交失败' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-16 border-t border-[#E4E4E7] dark:border-[#27272A] pt-12">
      <h2 className="text-xl font-bold text-[#09090B] dark:text-white mb-8">
        评论 {comments.length > 0 && <span className="text-[#A1A1AA] font-normal">({comments.length})</span>}
      </h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-10 space-y-4">
        <div>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="你的昵称"
            maxLength={50}
            className="w-full px-4 py-2.5 bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-lg text-sm text-[#09090B] dark:text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6] focus:ring-1 focus:ring-[#2563EB] transition-all duration-200"
          />
        </div>
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的评论..."
            rows={3}
            maxLength={2000}
            className="w-full px-4 py-2.5 bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-lg text-sm text-[#09090B] dark:text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6] focus:ring-1 focus:ring-[#2563EB] transition-all duration-200 resize-none"
          />
        </div>
        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
          }`}>
            {message.text}
          </div>
        )}
        <button
          type="submit"
          disabled={submitting || !author.trim() || !content.trim()}
          className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#A1A1AA] disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer"
        >
          {submitting ? '提交中...' : '发表评论'}
        </button>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="text-sm text-[#A1A1AA] py-4">加载评论中...</div>
      ) : comments.length === 0 ? (
        <div className="text-sm text-[#A1A1AA] py-8 text-center">
          暂无评论，来发表第一条评论吧
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center text-sm font-bold shrink-0">
                {comment.author.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-[#09090B] dark:text-white">{comment.author}</span>
                  <span className="text-xs text-[#A1A1AA]">
                    {new Date(comment.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <p className="text-sm text-[#3F3F46] dark:text-[#D4D4D8] leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
