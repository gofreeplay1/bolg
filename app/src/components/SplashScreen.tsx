import { useState, useEffect, useCallback } from 'react';
import { useSettingsStore } from '@/store';

export function SplashScreen({ onEnter }: { onEnter: () => void }) {
  const { settings } = useSettingsStore();
  const splash = settings.appearance?.splash;
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleEnter = useCallback(() => {
    if (!visible || exiting) return;
    setExiting(true);
    // 动画结束后通知父组件
    setTimeout(() => {
      setVisible(false);
      onEnter();
    }, 800);
  }, [visible, exiting, onEnter]);

  // 监听鼠标滚轮上滑（deltaY < 0 表示向上滚动）
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY < -20) {
        handleEnter();
      } else if (e.deltaY > 0) {
        // 下滚显示进度提示
        setScrollProgress((prev) => Math.min(prev + Math.abs(e.deltaY) * 0.5, 100));
        if (e.deltaY > 80) {
          handleEnter();
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [handleEnter]);

  // 监听触摸滑动（移动端）
  useEffect(() => {
    let startY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const endY = e.changedTouches[0].clientY;
      if (startY - endY > 50) {
        handleEnter();
      }
    };
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleEnter]);

  // 监听键盘
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === ' ') {
        e.preventDefault();
        handleEnter();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleEnter]);

  if (!visible) return null;

  const bgImage = splash?.background;
  const title = splash?.title || '';
  const subtitle = splash?.subtitle || '';

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-all duration-800 ${
        exiting ? 'opacity-0 translate-y-[-8%]' : 'opacity-100 translate-y-0'
      }`}
      style={{
        background: bgImage
          ? `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.45)), url(${bgImage}) center/cover no-repeat`
          : 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)',
        transitionDuration: '800ms',
      }}
    >
      {/* 暗色模式下的额外遮罩 */}
      <div className="absolute inset-0 bg-black/0 dark:bg-black/25 pointer-events-none" />

      {/* 内容区 */}
      <div className="relative z-10 text-center px-6 max-w-2xl">
        {title && (
          <h1
            className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight"
            style={{
              textShadow: '0 2px 20px rgba(0,0,0,0.3)',
              animation: exiting ? 'none' : 'splashFadeInUp 1s ease-out',
            }}
          >
            {title}
          </h1>
        )}

        {subtitle && (
          <p
            className="text-lg md:text-xl text-white/80 leading-relaxed"
            style={{
              textShadow: '0 1px 10px rgba(0,0,0,0.3)',
              animation: exiting ? 'none' : 'splashFadeInUp 1s ease-out 0.2s both',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* 底部滚动提示 */}
      <div
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-opacity duration-500 ${
          exiting ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <span className="text-white/60 text-sm tracking-widest uppercase">向下滚动</span>
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center p-1.5">
          <div
            className="w-1.5 h-2.5 bg-white/70 rounded-full animate-bounce"
            style={{
              animationDuration: '1.5s',
              transform: `translateY(${Math.min(scrollProgress * 0.08, 6)}px)`,
            }}
          />
        </div>
      </div>

      {/* 右上角跳过按钮 */}
      <button
        onClick={handleEnter}
        className={`absolute top-6 right-6 z-20 px-4 py-2 text-sm text-white/70 hover:text-white border border-white/30 hover:border-white/60 rounded-full backdrop-blur-sm transition-all cursor-pointer ${
          exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        跳过 →
      </button>

      {/* CSS 动画定义 */}
      <style>{`
        @keyframes splashFadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
