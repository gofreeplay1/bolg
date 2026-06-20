import { useEffect, useState, useRef, useCallback } from 'react';
import { GithubIcon, TwitterIcon, QqIcon, WechatIcon } from '@/components/Icons';
import { useSettingsStore } from '@/store';
import { FriendLinksSection } from '@/components/FriendLinksSection';
import { VisitorCounter } from '@/components/VisitorCounter';

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  github: GithubIcon,
  twitter: TwitterIcon,
  qq: QqIcon,
  wechat: WechatIcon,
  weixin: WechatIcon,
};

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} 天`);
  if (hours > 0 || days > 0) parts.push(`${hours} 小时`);
  if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes} 分钟`);
  parts.push(`${seconds} 秒`);
  return parts.join(' ');
}

export function Footer() {
  const { settings, hydrate } = useSettingsStore();
  const [elapsed, setElapsed] = useState('');

  // 从设置中读取建站时间
  const siteStartDate = (settings.footer as any).siteStartDate;

  const updateElapsed = useCallback(() => {
    if (siteStartDate) {
      const start = new Date(siteStartDate).getTime();
      if (!isNaN(start)) {
        setElapsed(formatElapsed(Date.now() - start));
      }
    }
  }, [siteStartDate]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    updateElapsed();
    const timer = setInterval(updateElapsed, 1000);
    return () => clearInterval(timer);
  }, [updateElapsed]);

  const { brandName, tagline, socialLinks, copyright } = settings.footer;
  const icpBeian = (settings.footer as any).icpBeian || '';
  const gonganBeian = (settings.footer as any).gonganBeian || '';
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#E4E4E7] dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#18181B]">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-lg font-bold text-[#09090B] dark:text-white">{brandName}</span>
            <p className="text-sm text-[#71717A]">{tagline}</p>
          </div>

          <div className="flex items-center gap-4">
            {socialLinks.map((link) => {
              const Icon = iconMap[link.icon] || GithubIcon;
              return (
                <a
                  key={link.label + link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-[#71717A] hover:text-[#09090B] dark:hover:text-white hover:bg-[#E4E4E7] dark:hover:bg-[#27272A] transition-all duration-200 cursor-pointer"
                  aria-label={link.label}
                >
                  <Icon size={18} />
                </a>
              );
            })}
          </div>
        </div>

        {/* Site running time */}
        {elapsed && (
          <div className="mt-4 text-center">
            <p className="text-xs text-[#A1A1AA]">
              🕐 本站已运行 <span className="font-mono text-[#71717A] dark:text-[#A1A1AA]">{elapsed}</span>
            </p>
          </div>
        )}

        <div className="mt-4 pt-6 border-t border-[#E4E4E7] dark:border-[#27272A] text-center">
          <div className="mb-2">
            <VisitorCounter />
          </div>
          <p className="text-xs text-[#71717A]">
            {copyright.replace('{year}', String(year))}
          </p>
          {/* 备案信息 */}
          {(icpBeian || gonganBeian) && (
            <div className="mt-2 flex items-center justify-center gap-4 flex-wrap">
              {icpBeian && (
                <a
                  href="https://beian.miit.gov.cn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#A1A1AA] hover:text-[#2563EB] transition-colors"
                >
                  {icpBeian}
                </a>
              )}
              {gonganBeian && (
                <a
                  href="https://www.beian.gov.cn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#A1A1AA] hover:text-[#2563EB] transition-colors inline-flex items-center gap-1"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  {gonganBeian}
                </a>
              )}
            </div>
          )}
        </div>

        <FriendLinksSection />
      </div>
    </footer>
  );
}
