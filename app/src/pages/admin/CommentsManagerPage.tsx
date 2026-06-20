import { useEffect, useState } from 'react';
import { useCommentsStore } from '@/store';
import { SearchIcon } from '@/components/Icons';
import { TrashIcon, EyeIcon, CheckIcon } from '@/components/AdminIcons';

export function CommentsManagerPage() {
  const { comments, stats, loading, hydrate, reviewComment, deleteComment } = useCommentsStore();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    hydrate(statusFilter ? { status: statusFilter } : undefined);
  }, [hydrate, statusFilter]);

  const handleReview = async (id: number, status: 'approved' | 'rejected') => {
    await reviewComment(id, status);
  };

  const handleDelete = async (id: number) => {
    await deleteComment(id);
    setDeleteConfirm(null);
  };

  const pendingCount = stats.find((s) => s.status === 'pending')?.count || 0;
  const approvedCount = stats.find((s) => s.status === 'approved')?.count || 0;
  const rejectedCount = stats.find((s) => s.status === 'rejected')?.count || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#09090B] dark:text-white">评论管理</h1>
          <p className="text-sm text-[#71717A] dark:text-[#A1A1AA] mt-1">
            共 {comments.length} 条评论
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setStatusFilter(statusFilter === 'pending' ? '' : 'pending')}
          className={`p-4 rounded-xl border transition-all duration-200 text-left cursor-pointer ${
            statusFilter === 'pending'
              ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20'
              : 'border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18181B] hover:border-yellow-300'
          }`}
        >
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingCount}</div>
          <div className="text-sm text-[#71717A] dark:text-[#A1A1AA] mt-1">待审核</div>
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === 'approved' ? '' : 'approved')}
          className={`p-4 rounded-xl border transition-all duration-200 text-left cursor-pointer ${
            statusFilter === 'approved'
              ? 'border-green-400 bg-green-50 dark:bg-green-950/20'
              : 'border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18181B] hover:border-green-300'
          }`}
        >
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{approvedCount}</div>
          <div className="text-sm text-[#71717A] dark:text-[#A1A1AA] mt-1">已通过</div>
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === 'rejected' ? '' : 'rejected')}
          className={`p-4 rounded-xl border transition-all duration-200 text-left cursor-pointer ${
            statusFilter === 'rejected'
              ? 'border-red-400 bg-red-50 dark:bg-red-950/20'
              : 'border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18181B] hover:border-red-300'
          }`}
        >
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{rejectedCount}</div>
          <div className="text-sm text-[#71717A] dark:text-[#A1A1AA] mt-1">已拒绝</div>
        </button>
      </div>

      {/* Comments List */}
      <div className="bg-white dark:bg-[#18181B] rounded-xl border border-[#E4E4E7] dark:border-[#27272A] overflow-hidden">
        {loading ? (
          <div className="px-5 py-12 text-center text-sm text-[#A1A1AA]">加载中...</div>
        ) : comments.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-[#71717A] dark:text-[#A1A1AA]">暂无评论</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E4E4E7] dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#09090B]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider">评论内容</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider hidden md:table-cell">文章</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider hidden lg:table-cell">状态</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E4E7] dark:divide-[#27272A]">
              {comments.map((comment) => (
                <tr key={comment.id} className="hover:bg-[#FAFAFA] dark:hover:bg-[#09090B] transition-colors duration-150">
                  <td className="px-5 py-3.5">
                    <div className="min-w-0 max-w-md">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-[#09090B] dark:text-white">{comment.author}</span>
                        <span className="text-xs text-[#A1A1AA]">{new Date(comment.created_at).toLocaleString('zh-CN')}</span>
                      </div>
                      <p className="text-sm text-[#3F3F46] dark:text-[#D4D4D8] line-clamp-2">{comment.content}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-xs font-mono text-[#2563EB] dark:text-[#3B82F6]">{comment.post_slug}</span>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      comment.status === 'approved'
                        ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                        : comment.status === 'rejected'
                        ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400'
                    }`}>
                      {comment.status === 'approved' ? '已通过' : comment.status === 'rejected' ? '已拒绝' : '待审核'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {comment.status !== 'approved' && (
                        <button
                          onClick={() => handleReview(comment.id, 'approved')}
                          className="p-2 rounded-lg text-[#A1A1AA] hover:text-[#059669] hover:bg-green-50 dark:hover:bg-green-950/20 transition-all duration-200 cursor-pointer"
                          title="通过"
                        >
                          <CheckIcon size={15} />
                        </button>
                      )}
                      {comment.status !== 'rejected' && (
                        <button
                          onClick={() => handleReview(comment.id, 'rejected')}
                          className="p-2 rounded-lg text-[#A1A1AA] hover:text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 cursor-pointer"
                          title="拒绝"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteConfirm(comment.id)}
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

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#18181B] rounded-xl border border-[#E4E4E7] dark:border-[#27272A] p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-[#09090B] dark:text-white mb-2">确认删除</h3>
            <p className="text-sm text-[#71717A] dark:text-[#A1A1AA] mb-6">确定要删除这条评论吗？此操作不可撤销。</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium text-[#71717A] hover:text-[#09090B] dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] rounded-lg transition-all duration-200 cursor-pointer">取消</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-sm font-medium bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg transition-all duration-200 cursor-pointer">删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
