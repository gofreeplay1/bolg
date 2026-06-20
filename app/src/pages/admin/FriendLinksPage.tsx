import { useEffect, useState } from 'react';
import { useFriendLinksStore } from '@/store';
import { PlusIcon, EditIcon, TrashIcon, EyeIcon } from '@/components/AdminIcons';

export function FriendLinksPage() {
  const { links, loading, hydrate, createLink, updateLink, deleteLink } = useFriendLinksStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setUrl('');
    setDescription('');
    setSortOrder(links.length);
    setIsVisible(true);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (link: typeof links[0]) => {
    setEditingId(link.id);
    setName(link.name);
    setUrl(link.url);
    setDescription(link.description);
    setSortOrder(link.sort_order);
    setIsVisible(link.is_visible === 1);
    setErrors({});
    setShowModal(true);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = '请输入链接名称';
    if (!url.trim()) newErrors.url = '请输入链接地址';
    if (url.trim() && !/^https?:\/\/.+/.test(url.trim())) newErrors.url = '请输入有效的 URL（以 http:// 或 https:// 开头）';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      if (editingId) {
        await updateLink(editingId, { name, url, description, sort_order: sortOrder, is_visible: isVisible ? 1 : 0 });
      } else {
        await createLink({ name, url, description, sort_order: sortOrder, is_visible: isVisible ? 1 : 0 });
      }
      setShowModal(false);
    } catch (err: any) {
      setErrors({ _general: '保存失败: ' + err.message });
    }
  };

  const handleDelete = async (id: number) => {
    await deleteLink(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#09090B] dark:text-white">友情链接</h1>
          <p className="text-sm text-[#71717A] dark:text-[#A1A1AA] mt-1">
            共 {links.length} 个链接
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm cursor-pointer"
        >
          <PlusIcon size={16} />
          添加链接
        </button>
      </div>

      {/* Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12 text-sm text-[#A1A1AA]">加载中...</div>
        ) : links.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-sm text-[#71717A] dark:text-[#A1A1AA]">暂无友情链接</p>
            <button onClick={openCreate} className="inline-flex items-center gap-1.5 mt-3 text-sm text-[#2563EB] hover:underline cursor-pointer">
              <PlusIcon size={14} /> 添加第一个链接
            </button>
          </div>
        ) : (
          links.map((link) => (
            <div
              key={link.id}
              className={`bg-white dark:bg-[#18181B] rounded-xl border p-4 transition-all duration-200 ${
                link.is_visible ? 'border-[#E4E4E7] dark:border-[#27272A]' : 'border-[#E4E4E7] dark:border-[#27272A] opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-[#09090B] dark:text-white truncate">{link.name}</h3>
                    {link.is_visible === 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-[#F4F4F5] dark:bg-[#27272A] text-[#A1A1AA] shrink-0">隐藏</span>
                    )}
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#2563EB] dark:text-[#3B82F6] hover:underline block truncate mb-1"
                  >
                    {link.url}
                  </a>
                  {link.description && (
                    <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] truncate">{link.description}</p>
                  )}
                  <p className="text-xs text-[#A1A1AA] mt-2">排序: {link.sort_order}</p>
                </div>
                <div className="flex items-center gap-1 ml-3 shrink-0">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-[#A1A1AA] hover:text-[#2563EB] hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-200"
                    title="预览"
                  >
                    <EyeIcon size={14} />
                  </a>
                  <button
                    onClick={() => openEdit(link)}
                    className="p-2 rounded-lg text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] transition-all duration-200 cursor-pointer"
                    title="编辑"
                  >
                    <EditIcon size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(link.id)}
                    className="p-2 rounded-lg text-[#A1A1AA] hover:text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 cursor-pointer"
                    title="删除"
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#18181B] rounded-xl border border-[#E4E4E7] dark:border-[#27272A] p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-[#09090B] dark:text-white mb-4">
              {editingId ? '编辑友情链接' : '添加友情链接'}
            </h3>

            {errors._general && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                {errors._general}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#09090B] dark:text-white mb-1.5">
                  名称 <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="网站名称"
                  className={`w-full px-3 py-2 bg-white dark:bg-[#18181B] border rounded-lg text-sm text-[#09090B] dark:text-white placeholder-[#A1A1AA] focus:outline-none focus:ring-1 transition-all duration-200 ${
                    errors.name ? 'border-red-300 dark:border-red-800' : 'border-[#E4E4E7] dark:border-[#27272A] focus:border-[#2563EB] focus:ring-[#2563EB]'
                  }`}
                />
                {errors.name && <p className="text-xs text-[#EF4444] mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#09090B] dark:text-white mb-1.5">
                  链接地址 <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className={`w-full px-3 py-2 bg-white dark:bg-[#18181B] border rounded-lg text-sm text-[#09090B] dark:text-white placeholder-[#A1A1AA] focus:outline-none focus:ring-1 transition-all duration-200 ${
                    errors.url ? 'border-red-300 dark:border-red-800' : 'border-[#E4E4E7] dark:border-[#27272A] focus:border-[#2563EB] focus:ring-[#2563EB]'
                  }`}
                />
                {errors.url && <p className="text-xs text-[#EF4444] mt-1">{errors.url}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#09090B] dark:text-white mb-1.5">描述</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="简短描述（选填）"
                  className="w-full px-3 py-2 bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-lg text-sm text-[#09090B] dark:text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6] focus:ring-1 focus:ring-[#2563EB] transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#09090B] dark:text-white mb-1.5">排序</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-lg text-sm text-[#09090B] dark:text-white focus:outline-none focus:border-[#2563EB] dark:focus:border-[#3B82F6] focus:ring-1 focus:ring-[#2563EB] transition-all duration-200"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={(e) => setIsVisible(e.target.checked)}
                  className="w-4 h-4 rounded border-[#D4D4D8] text-[#2563EB] focus:ring-[#2563EB]"
                />
                <span className="text-sm text-[#09090B] dark:text-white">前台可见</span>
              </label>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-[#71717A] hover:text-[#09090B] dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] rounded-lg transition-all duration-200 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg transition-all duration-200 cursor-pointer"
              >
                {editingId ? '更新' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#18181B] rounded-xl border border-[#E4E4E7] dark:border-[#27272A] p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-[#09090B] dark:text-white mb-2">确认删除</h3>
            <p className="text-sm text-[#71717A] dark:text-[#A1A1AA] mb-6">确定要删除这个友情链接吗？此操作不可撤销。</p>
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
