import { useState, useEffect, useCallback } from 'react';
import * as api from '@/api';
import type { Tag } from '@/types';

const PRESET_COLORS = [
  '#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED',
  '#DB2777', '#0891B2', '#4F46E5', '#EA580C', '#65A30D',
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

export function TagsManagerPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formColor, setFormColor] = useState('#2563EB');
  const [formError, setFormError] = useState('');

  const loadTags = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.fetchTags();
      setTags(data.tags as Tag[]);
    } catch (err: any) {
      showMsg('❌ 加载标签失败: ' + err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const resetForm = () => {
    setFormName('');
    setFormDesc('');
    setFormColor('#2563EB');
    setFormError('');
  };

  const openCreate = () => {
    resetForm();
    setEditingSlug(null);
    setShowCreate(true);
  };

  const openEdit = (tag: Tag) => {
    setFormName(tag.name);
    setFormDesc(tag.description || '');
    setFormColor(tag.color || '#2563EB');
    setFormError('');
    setEditingSlug(tag.slug);
    setShowCreate(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim()) {
      setFormError('请输入标签名称');
      return;
    }

    try {
      if (editingSlug) {
        await api.updateTag(editingSlug, {
          name: formName.trim(),
          description: formDesc.trim(),
          color: formColor,
        });
        showMsg('✅ 标签已更新');
      } else {
        await api.createTag({
          name: formName.trim(),
          description: formDesc.trim(),
          color: formColor,
        });
        showMsg('✅ 标签已创建');
      }
      setShowCreate(false);
      resetForm();
      loadTags();
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleDelete = async (slug: string) => {
    try {
      await api.deleteTag(slug);
      showMsg('✅ 标签已删除');
      setDeleteConfirm(null);
      loadTags();
    } catch (err: any) {
      showMsg('❌ 删除失败: ' + err.message);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const data = await api.syncTagsFromPosts();
      showMsg(`✅ ${data.message}`);
      loadTags();
    } catch (err: any) {
      showMsg('❌ 同步失败: ' + err.message);
    }
    setSyncing(false);
  };

  const inputClass =
    'w-full px-3 py-2 bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-lg text-sm text-[#09090B] dark:text-white placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all';
  const btnPrimary =
    'px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-lg hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 cursor-pointer';
  const btnOutline =
    'px-3 py-1.5 border border-[#E4E4E7] dark:border-[#27272A] rounded-lg text-sm text-[#71717A] hover:text-[#09090B] dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] transition-all cursor-pointer';
  const btnDanger =
    'px-3 py-1.5 text-sm text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all cursor-pointer';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#09090B] dark:text-white">标签管理</h1>
          <p className="text-sm text-[#71717A] mt-1">管理网站标签，支持自定义颜色和描述</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSync} disabled={syncing} className={btnOutline}>
            {syncing ? '同步中...' : '从文章同步'}
          </button>
          <button onClick={openCreate} className={btnPrimary}>
            + 新建标签
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-4 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-sm rounded-lg border border-emerald-200 dark:border-emerald-800">
          {message}
        </div>
      )}

      {/* Tags List */}
      {loading ? (
        <div className="text-center py-20 text-[#A1A1AA] text-sm">加载中...</div>
      ) : tags.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#A1A1AA] text-sm mb-3">暂无标签</p>
          <button onClick={handleSync} className={btnPrimary}>
            从文章同步标签
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E4E4E7] dark:border-[#27272A]">
                  <th className="text-left px-5 py-3 font-medium text-[#71717A]">标签</th>
                  <th className="text-left px-5 py-3 font-medium text-[#71717A]">Slug</th>
                  <th className="text-left px-5 py-3 font-medium text-[#71717A]">描述</th>
                  <th className="text-center px-5 py-3 font-medium text-[#71717A]">文章数</th>
                  <th className="text-right px-5 py-3 font-medium text-[#71717A]">操作</th>
                </tr>
              </thead>
              <tbody>
                {tags.map((tag) => (
                  <tr
                    key={tag.id}
                    className="border-b border-[#F4F4F5] dark:border-[#27272A] last:border-0 hover:bg-[#FAFAFA] dark:hover:bg-[#18181B]/50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="font-medium text-[#09090B] dark:text-white">{tag.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#A1A1AA] font-mono text-xs">{tag.slug}</td>
                    <td className="px-5 py-3 text-[#71717A] max-w-[200px] truncate">
                      {tag.description || '-'}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full text-xs font-medium bg-[#F4F4F5] dark:bg-[#27272A] text-[#71717A]">
                        {tag.post_count}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(tag)} className={btnOutline}>
                          编辑
                        </button>
                        <button onClick={() => setDeleteConfirm(tag.slug)} className={btnDanger}>
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#18181B] rounded-xl border border-[#E4E4E7] dark:border-[#27272A] p-6 w-full max-w-md shadow-2xl mx-4">
            <h2 className="text-lg font-bold text-[#09090B] dark:text-white mb-4">
              {editingSlug ? '编辑标签' : '新建标签'}
            </h2>

            {formError && (
              <div className="mb-3 px-3 py-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-lg">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#09090B] dark:text-white mb-1.5">
                  标签名称 <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className={inputClass}
                  placeholder="例如：React"
                />
                {formName.trim() && (
                  <p className="text-xs text-[#A1A1AA] mt-1">
                    Slug: {slugify(formName)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#09090B] dark:text-white mb-1.5">
                  描述
                </label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className={inputClass}
                  placeholder="标签描述（可选）"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#09090B] dark:text-white mb-1.5">
                  颜色
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormColor(color)}
                      className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                        formColor === color
                          ? 'border-[#09090B] dark:border-white scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-9 h-9 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="flex-1 px-2 py-1.5 bg-[#FAFAFA] dark:bg-[#09090B] border border-[#E4E4E7] dark:border-[#27272A] rounded text-xs font-mono text-[#09090B] dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreate(false);
                  resetForm();
                }}
                className={btnOutline}
              >
                取消
              </button>
              <button onClick={handleSubmit} className={btnPrimary}>
                {editingSlug ? '保存修改' : '创建标签'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#18181B] rounded-xl border border-[#E4E4E7] dark:border-[#27272A] p-6 w-full max-w-sm shadow-2xl mx-4">
            <h2 className="text-lg font-bold text-[#09090B] dark:text-white mb-2">确认删除</h2>
            <p className="text-sm text-[#71717A] mb-1">
              确定要删除标签 <span className="font-medium text-[#09090B] dark:text-white">{deleteConfirm}</span> 吗？
            </p>
            <p className="text-xs text-[#EF4444] mb-4">此操作不可撤销，但不会删除文章中的标签引用。</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className={btnOutline}>
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-[#EF4444] text-white text-sm font-medium rounded-lg hover:bg-[#DC2626] transition-colors cursor-pointer"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
