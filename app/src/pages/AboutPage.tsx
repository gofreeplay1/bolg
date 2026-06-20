import { useEffect } from 'react';
import { UserIcon, GithubIcon, TwitterIcon, ArrowRightIcon } from '@/components/Icons';
import { Link } from 'react-router-dom';
import { useSettingsStore } from '@/store';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  github: GithubIcon,
  twitter: TwitterIcon,
};

export function AboutPage() {
  const { settings, hydrate } = useSettingsStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const { name, tagline, bio, socialLinks } = settings.about;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#F4F4F5] dark:bg-[#27272A] mb-6">
            <UserIcon size={40} className="text-[#71717A] dark:text-[#A1A1AA]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#09090B] dark:text-white tracking-tight mb-4">
            {name}
          </h1>
          <p className="text-lg text-[#71717A] dark:text-[#A1A1AA] max-w-lg mx-auto">
            {tagline}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-[#18181B] rounded-xl border border-[#E4E4E7] dark:border-[#27272A] p-8 mb-8">
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{bio}</ReactMarkdown>
          </div>
        </div>

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            {socialLinks.map((link) => {
              const Icon = iconMap[link.icon] || GithubIcon;
              return (
                <a
                  key={link.label + link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#F4F4F5] dark:bg-[#27272A] rounded-xl text-sm font-medium text-[#09090B] dark:text-white hover:bg-[#E4E4E7] dark:hover:bg-[#3F3F46] transition-colors duration-200 cursor-pointer"
                >
                  <Icon size={18} />
                  {link.label}
                </a>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#2563EB] dark:text-[#3B82F6] hover:underline transition-all duration-200 cursor-pointer"
          >
            浏览文章
            <ArrowRightIcon size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
