import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import {
  LayoutDashboardIcon,
  FileTextIcon,
  PlusIcon,
  LogOutIcon,
} from '@/components/AdminIcons';
import { SettingsIcon, FileIcon, LinkIcon, TagIcon } from '@/components/AdminIcons';
import { SunIcon, MoonIcon } from '@/components/Icons';
import { useState, useEffect } from 'react';

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isDark, setIsDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
    }
  }, []);

  const toggleDark = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const sidebarLinks = [
    {
      to: '/admin',
      label: '仪表盘',
      icon: <LayoutDashboardIcon size={18} />,
      exact: true,
    },
    {
      to: '/admin/posts',
      label: '文章管理',
      icon: <FileTextIcon size={18} />,
    },
    {
      to: '/admin/comments',
      label: '评论管理',
      icon: <PlusIcon size={18} />,
    },
    {
      to: '/admin/pages',
      label: '页面管理',
      icon: <FileIcon size={18} />,
    },
    {
      to: '/admin/links',
      label: '友情链接',
      icon: <LinkIcon size={18} />,
    },
    {
      to: '/admin/tags',
      label: '标签管理',
      icon: <TagIcon size={18} />,
    },
    {
      to: '/admin/settings',
      label: '网站设置',
      icon: <SettingsIcon size={18} />,
    },
  ];

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <div className="flex h-screen bg-[#F4F4F5] dark:bg-[#09090B]">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-60' : 'w-0 md:w-16'
        } bg-white dark:bg-[#18181B] border-r border-[#E4E4E7] dark:border-[#27272A] flex flex-col transition-all duration-300 overflow-hidden shrink-0`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-[#E4E4E7] dark:border-[#27272A]">
          <Link
            to="/admin"
            className={`text-lg font-bold text-[#09090B] dark:text-white tracking-tight whitespace-nowrap ${
              !sidebarOpen && 'md:hidden'
            }`}
          >
            Blog Admin
          </Link>
          {!sidebarOpen && (
            <span className="hidden md:block text-lg font-bold text-[#2563EB]">B</span>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                isActive(link.to, link.exact)
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-[#71717A] hover:text-[#09090B] dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#27272A]'
              }`}
            >
              <span className="shrink-0">{link.icon}</span>
              <span className={!sidebarOpen ? 'md:hidden' : ''}>{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-[#E4E4E7] dark:border-[#27272A] p-3 space-y-1">
          <button
            onClick={toggleDark}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#71717A] hover:text-[#09090B] dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] transition-all duration-200 cursor-pointer"
          >
            {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
            <span className={!sidebarOpen ? 'md:hidden' : ''}>主题</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 cursor-pointer"
          >
            <LogOutIcon size={18} />
            <span className={!sidebarOpen ? 'md:hidden' : ''}>退出登录</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white dark:bg-[#18181B] border-b border-[#E4E4E7] dark:border-[#27272A] flex items-center justify-between px-6 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-[#71717A] hover:text-[#09090B] dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] transition-all duration-200 cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" x2="21" y1="6" y2="6" />
              <line x1="3" x2="21" y1="12" y2="12" />
              <line x1="3" x2="21" y1="18" y2="18" />
            </svg>
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#71717A]">
              欢迎，<span className="font-medium text-[#09090B] dark:text-white">{user?.username}</span>
            </span>
            <Link
              to="/"
              target="_blank"
              className="text-sm text-[#2563EB] hover:underline"
            >
              查看博客
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
