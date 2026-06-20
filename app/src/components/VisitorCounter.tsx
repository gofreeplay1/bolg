import { useState, useEffect } from 'react';
import { fetchVisitorTotal, recordVisit } from '@/api';

export function VisitorCounter() {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    // 记录本次访问并获取总数
    const init = async () => {
      try {
        // 先记录访问
        await recordVisit();
      } catch {
        // 记录失败不影响显示
      }
      try {
        const data = await fetchVisitorTotal();
        if (mounted) setTotal(data.total);
      } catch {
        // 获取失败静默处理
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  if (total === null) return null;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-[#A1A1AA]">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      累计访客: {total.toLocaleString()}
    </span>
  );
}
