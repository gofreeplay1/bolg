import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/store';

export function DonateFloating() {
  const { settings, hydrate } = useSettingsStore();
  const [show, setShow] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const donateQrCode = settings.appearance?.donateQrCode;
  const donateText = settings.appearance?.donateText || '如果文章对你有帮助，欢迎赞赏支持~';

  // 没有设置赞赏码则不显示
  if (!donateQrCode) return null;

  return (
    <>
      {/* 悬浮按钮 */}
      <button
        onClick={() => setShow(!show)}
        className="fixed right-6 bottom-24 z-40 w-12 h-12 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center cursor-pointer group"
        title="赞赏支持"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/* 弹窗 */}
      {show && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShow(false)}
        >
          <div
            className="bg-white dark:bg-[#18181B] rounded-2xl shadow-2xl p-8 max-w-sm w-[90%] mx-auto transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#09090B] dark:text-white">赞赏支持</h3>
              <button
                onClick={() => setShow(false)}
                className="p-1.5 rounded-lg text-[#71717A] hover:text-[#09090B] dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] transition-colors cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-[#71717A] dark:text-[#A1A1AA] mb-6 text-center">
              {donateText}
            </p>

            <div className="flex justify-center">
              <img
                src={donateQrCode}
                alt="赞赏二维码"
                className="w-48 h-48 object-contain rounded-xl border border-[#E4E4E7] dark:border-[#27272A]"
              />
            </div>

            <p className="text-xs text-[#A1A1AA] mt-4 text-center">
              扫码赞赏，感谢支持 ❤️
            </p>
          </div>
        </div>
      )}
    </>
  );
}
