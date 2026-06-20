import { useSearchParams, Link } from 'react-router-dom';

export function RedirectPage() {
  const [searchParams] = useSearchParams();
  const targetUrl = searchParams.get('url') || '';

  // 解码并验证 URL
  let decodedUrl = '';
  let isValidUrl = false;
  try {
    decodedUrl = decodeURIComponent(targetUrl);
    isValidUrl = /^https?:\/\//i.test(decodedUrl);
  } catch {
    decodedUrl = '';
  }

  const handleProceed = () => {
    if (isValidUrl) {
      window.location.href = decodedUrl;
    }
  };

  const isDownload = /\.(zip|rar|7z|tar|gz|pdf|doc|docx|xls|xlsx|ppt|pptx|exe|msi|dmg|apk|iso|img)$/i.test(decodedUrl);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] dark:bg-[#09090B] px-6">
      <div className="max-w-md w-full bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-2xl p-8 shadow-lg text-center">
        {/* Warning Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" x2="12" y1="9" y2="13" />
            <line x1="12" x2="12.01" y1="17" y2="17" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-[#09090B] dark:text-white mb-2">
          {isDownload ? '即将下载文件' : '即将离开本站'}
        </h1>

        <p className="text-sm text-[#71717A] dark:text-[#A1A1AA] mb-2">
          {isDownload
            ? '您即将下载一个外部文件，请确认来源可靠后再继续。'
            : '您即将访问一个外部链接，请确认该链接安全可靠后再继续。'}
        </p>

        {isValidUrl && (
          <div className="mb-6 p-3 bg-[#F4F4F5] dark:bg-[#27272A] rounded-lg">
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mb-1 break-all">
              目标{isDownload ? '文件' : '链接'}：
            </p>
            <p className="text-sm text-[#09090B] dark:text-white font-mono break-all">
              {decodedUrl}
            </p>
          </div>
        )}

        {!isValidUrl && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">
              链接无效或未提供目标地址
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleProceed}
            disabled={!isValidUrl}
            className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              isValidUrl
                ? 'bg-[#D97706] hover:bg-[#B45309] text-white'
                : 'bg-[#E4E4E7] dark:bg-[#27272A] text-[#A1A1AA] cursor-not-allowed'
            }`}
          >
            {isDownload ? '确认下载' : '继续访问'}
          </button>

          <Link
            to="/"
            className="w-full py-2.5 rounded-lg text-sm font-medium border border-[#E4E4E7] dark:border-[#27272A] text-[#71717A] hover:text-[#09090B] dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] transition-all text-center"
          >
            返回首页
          </Link>
        </div>

        <p className="mt-4 text-xs text-[#A1A1AA]">
          请注意：本站不对外部内容的安全性负责，请谨慎操作。
        </p>
      </div>
    </div>
  );
}
