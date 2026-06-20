import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchFriendLinks } from '@/api';
import type { FriendLink } from '@/types';

export function FriendLinksSection() {
  const [links, setLinks] = useState<FriendLink[]>([]);

  useEffect(() => {
    fetchFriendLinks()
      .then((data) => setLinks(data.links as FriendLink[]))
      .catch(() => {});
  }, []);

  if (links.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-[#E4E4E7] dark:border-[#27272A]">
      <h4 className="text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider mb-3 text-center">
        友情链接
      </h4>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {links.map((link) => (
          <Link
            key={link.id}
            to={`/redirect?url=${encodeURIComponent(link.url)}`}
            title={link.description || link.name}
            className="text-xs text-[#71717A] hover:text-[#2563EB] dark:hover:text-[#3B82F6] transition-colors duration-200 px-2 py-1 rounded hover:bg-[#F4F4F5] dark:hover:bg-[#27272A]"
          >
            {link.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
