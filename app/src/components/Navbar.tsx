import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MenuIcon, XIcon, SunIcon, MoonIcon } from '@/components/Icons';
import { useSettingsStore } from '@/store';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { settings, hydrate } = useSettingsStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

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

  const siteName = settings.site.name;
  const navLinks = settings.header.navLinks;
  const siteLogo = settings.appearance?.siteLogo;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 dark:bg-[#18181B]/90 backdrop-blur-md shadow-sm border-b border-[#E4E4E7] dark:border-[#27272A]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-[#09090B] dark:text-white hover:text-[#2563EB] dark:hover:text-[#3B82F6] transition-colors duration-200"
        >
          {siteLogo && (
            <img src={siteLogo} alt={siteName} className="h-8 w-8 rounded-lg object-cover" />
          )}
          {siteName}
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isExternal = link.to.startsWith('http://') || link.to.startsWith('https://');
            const to = isExternal ? `/redirect?url=${encodeURIComponent(link.to)}` : link.to;
            return (
              <Link
                key={link.to + link.label}
                to={to}
                className={`text-sm font-medium transition-colors duration-200 ${
                  location.pathname === link.to
                    ? 'text-[#2563EB] dark:text-[#3B82F6]'
                    : 'text-[#71717A] hover:text-[#09090B] dark:hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <button
            onClick={toggleDark}
            className="p-2 rounded-lg text-[#71717A] hover:text-[#09090B] dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] transition-all duration-200 cursor-pointer"
            aria-label="切换主题"
          >
            {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleDark}
            className="p-2 rounded-lg text-[#71717A] hover:text-[#09090B] dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] transition-all duration-200 cursor-pointer"
            aria-label="切换主题"
          >
            {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg text-[#71717A] hover:text-[#09090B] dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] transition-all duration-200 cursor-pointer"
            aria-label="菜单"
          >
            {isMenuOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#18181B]">
          <div className="px-6 py-4 flex flex-col gap-3">
            {navLinks.map((link) => {
              const isExternal = link.to.startsWith('http://') || link.to.startsWith('https://');
              const to = isExternal ? `/redirect?url=${encodeURIComponent(link.to)}` : link.to;
              return (
                <Link
                  key={link.to + link.label}
                  to={to}
                  className={`text-sm font-medium py-2 transition-colors duration-200 ${
                    location.pathname === link.to
                      ? 'text-[#2563EB] dark:text-[#3B82F6]'
                      : 'text-[#71717A] hover:text-[#09090B] dark:hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
