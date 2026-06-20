import { useState, useEffect, useMemo } from 'react';
import { usePagesStore } from '@/store';
import { Link } from 'react-router-dom';
import type { CustomPage } from '@/types';

export function PagesManagerPage() {
  const { pages, hydrate, createPage, updatePage, deletePage } = usePagesStore();
  const [search, setSearch] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Form state
  const [formSlug, setFormSlug] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formPublished, setFormPublished] = useState(true);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const filteredPages = useMemo(() => {
    if (!search.trim()) return pages;
    const q = search.toLowerCase();
    return pages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
  }, [pages, search]);

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const openCreate = () => {
    setEditingPage(null);
    setFormSlug('');
    setFormTitle('');
    setFormContent('');
    setFormPublished(true);
    setShowEditor(true);
  };

  const openEdit = (page: CustomPage) => {
    setEditingPage(page);
    setFormSlug(page.slug);
    setFormTitle(page.title);
    setFormContent(page.content);
    setFormPublished(!!page.is_published);
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!formSlug.trim() || !formTitle.trim()) {
      showMsg('❌ Slug 和标题不能为空');
      return;
    }
    setSaving(true);
    try {
      if (editingPage) {
        await updatePage(editingPage.slug, {
          title: formTitle,
          content: formContent,
          is_published: formPublished ? 1 : 0,
          newSlug: formSlug !== editingPage.slug ? formSlug : undefined,
        });
        showMsg('✅ 页面已更新');
      } else {
        await createPage({
          slug: formSlug,
          title: formTitle,
          content: formContent,
          is_published: formPublished ? 1 : 0,
        });
        showMsg('✅ 页面已创建');
      }
      setShowEditor(false);
    } catch (err: any) {
      showMsg('❌ ' + (err.message || '保存失败'));
    }
    setSaving(false);
  };

  const handleDelete = async (slug: string) => {
    try {
      await deletePage(slug);
      setDeleteConfirm(null);
      showMsg('✅ 页面已删除');
    } catch {
      showMsg('❌ 删除失败');
    }
  };

  const inputClass =
    'w-full px-3 py-2 bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-lg text-sm text-[#09090B] dark:text-white placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all';
  const labelClass = 'block text-sm font-medium text-[#09090B] dark:text-white mb-1.5';
  const btnPrimary =
    'px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-lg hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 cursor-pointer';
  const btnOutline =
    'px-3 py-1.5 border border-[#E4E4E7] dark:border-[#27272A] rounded-lg text-sm text-[#71717A] hover:text-[#09090B] dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] transition-all cursor-pointer';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#09090B] dark:text-white">页面管理</h1>
          <p className="text-sm text-[#71717A] mt-1">管理自定义独立页面（如关于页面、联系页面等）</p>
        </div>
        <button onClick={openCreate} className={btnPrimary}>
          + 新建页面
        </button>
      </div>

      {message && (
        <div className="mb-4 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-sm rounded-lg border border-emerald-200 dark:border-emerald-800">
          {message}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputClass} pl-10`}
          placeholder="搜索页面..."
        />
      </div>

      {/* Pages Table */}
      <div className="bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E4E4E7] dark:border-[#27272A]">
              <th className="text-left px-6 py-3 text-xs font-medium text-[#71717A] uppercase">标题</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-[#71717A] uppercase">Slug</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-[#71717A] uppercase">状态</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-[#71717A] uppercase">更新时间</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-[#71717A] uppercase">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredPages.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#71717A]">
                  暂无页面，点击"新建页面"创建第一个
                </td>
              </tr>
            ) : (
              filteredPages.map((page) => (
                <tr
                  key={page.id}
                  className="border-b border-[#E4E4E7] dark:border-[#27272A] last:border-0 hover:bg-[#FAFAFA] dark:hover:bg-[#18181B]/50"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[#09090B] dark:text-white">
                      {page.title}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-[#F4F4F5] dark:bg-[#27272A] px-2 py-0.5 rounded text-[#2563EB]">
                      /{page.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                        page.is_published
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                          : 'bg-[#F4F4F5] dark:bg-[#27272A] text-[#71717A]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          page.is_published ? 'bg-emerald-500' : 'bg-[#A1A1AA]'
                        }`}
                      />
                      {page.is_published ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#71717A]">
                    {new Date(page.updated_at).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {page.is_published ? (
                        <Link
                          to={`/page/${page.slug}`}
                          target="_blank"
                          className="p-2 text-[#71717A] hover:text-[#2563EB] rounded-lg hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] transition-all cursor-pointer"
                          title="预览"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </Link>
                      ) : null}
                      <button
                        onClick={() => openEdit(page)}
                        className="p-2 text-[#71717A] hover:text-[#2563EB] rounded-lg hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] transition-all cursor-pointer"
                        title="编辑"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(page.slug)}
                        className="p-2 text-[#71717A] hover:text-[#EF4444] rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                        title="删除"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-[#18181B] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <div className="p-6 border-b border-[#E4E4E7] dark:border-[#27272A] flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#09090B] dark:text-white">
                {editingPage ? '编辑页面' : '新建页面'}
              </h2>
              <button
                onClick={() => setShowEditor(false)}
                className="p-2 text-[#71717A] hover:text-[#09090B] dark:hover:text-white rounded-lg hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] transition-all cursor-pointer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>页面 Slug</label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className={inputClass}
                    placeholder="about"
                  />
                  <p className="text-xs text-[#71717A] mt-1">访问路径: /{formSlug || '...'} （也支持 /page/{formSlug || '...'}）</p>
                </div>
                <div>
                  <label className={labelClass}>页面标题</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className={inputClass}
                    placeholder="关于我"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>页面内容（支持 Markdown）</label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className={`${inputClass} min-h-[250px] font-mono`}
                  placeholder="## 页面内容..."
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formPublished}
                    onChange={(e) => setFormPublished(e.target.checked)}
                    className="w-4 h-4 rounded border-[#D4D4D8] text-[#2563EB] focus:ring-[#2563EB]"
                  />
                  <span className="text-sm text-[#09090B] dark:text-white">发布</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-[#E4E4E7] dark:border-[#27272A] flex items-center justify-end gap-3">
              <button onClick={() => setShowEditor(false)} className={btnOutline}>
                取消
              </button>
              <button onClick={handleSave} disabled={saving} className={btnPrimary}>
                {saving ? '保存中...' : '保存页面'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-[#18181B] rounded-xl shadow-2xl p-6 mx-4 max-w-sm w-full">
            <h3 className="text-lg font-bold text-[#09090B] dark:text-white mb-2">确认删除</h3>
            <p className="text-sm text-[#71717A] mb-6">
              确定要删除页面 <code className="bg-[#F4F4F5] dark:bg-[#27272A] px-1.5 py-0.5 rounded text-[#EF4444]">{deleteConfirm}</code> 吗？此操作不可撤销。
            </p>
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
