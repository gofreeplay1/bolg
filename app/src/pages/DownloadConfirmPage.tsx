import { useSearchParams, Link } from 'react-router-dom';
import { useState } from 'react';

// 获取文件扩展名
function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

// 获取文件类型图标
function getFileIcon(ext: string): string {
  const iconMap: Record<string, string> = {
    pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊',
    ppt: '📽️', pptx: '📽️', zip: '📦', rar: '📦', '7z': '📦',
    tar: '📦', gz: '📦', exe: '⚙️', msi: '⚙️', apk: '📱',
    iso: '💿', img: '🖼️', jpg: '🖼️', jpeg: '🖼️', png: '🖼️',
    gif: '🖼️', svg: '🖼️', webp: '🖼️', mp4: '🎬', avi: '🎬',
    mkv: '🎬', mov: '🎬', mp3: '🎵', wav: '🎵', flac: '🎵',
    html: '🌐', htm: '🌐', css: '🎨', js: '📜', ts: '📜',
    json: '📋', xml: '📋', txt: '📃', md: '📃',
  };
  return iconMap[ext] || '📁';
}

// 获取文件类型中文名
function getFileTypeName(ext: string): string {
  const typeMap: Record<string, string> = {
    pdf: 'PDF 文档', doc: 'Word 文档', docx: 'Word 文档',
    xls: 'Excel 表格', xlsx: 'Excel 表格',
    ppt: 'PowerPoint 演示', pptx: 'PowerPoint 演示',
    zip: '压缩包', rar: '压缩包', '7z': '压缩包', tar: '压缩包', gz: '压缩包',
    exe: '可执行文件', msi: '安装程序', apk: 'Android 应用',
    iso: '光盘镜像', img: '磁盘镜像',
    jpg: '图片', jpeg: '图片', png: '图片', gif: '图片', svg: '图片', webp: '图片',
    mp4: '视频', avi: '视频', mkv: '视频', mov: '视频',
    mp3: '音频', wav: '音频', flac: '音频',
    html: '网页文件', htm: '网页文件', css: '样式表', js: '脚本文件', ts: '脚本文件',
    json: '数据文件', xml: '数据文件', txt: '文本文件', md: '文本文档',
  };
  return typeMap[ext] || '文件';
}

// 判断是否是高风险文件类型
function isHighRiskFile(ext: string): boolean {
  return ['exe', 'msi', 'bat', 'cmd', 'ps1', 'vbs', 'sh', 'apk', 'dmg', 'app'].includes(ext);
}

export function DownloadConfirmPage() {
  const [searchParams] = useSearchParams();
  const targetUrl = searchParams.get('url') || '';
  const displayName = searchParams.get('name') || '';
  const displaySize = searchParams.get('size') || '';
  const [agreed, setAgreed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // 解码并验证 URL
  let decodedUrl = '';
  let isValidUrl = false;
  let isExternal = false;
  try {
    decodedUrl = decodeURIComponent(targetUrl);
    isExternal = /^https?:\/\//i.test(decodedUrl);
    isValidUrl = isExternal || decodedUrl.startsWith('/uploads/');
  } catch {
    decodedUrl = '';
  }

  // 获取文件名
  const filename = decodedUrl.split('/').pop()?.split('?')[0] || displayName || '未知文件';
  const ext = getFileExtension(filename);

  const handleProceed = () => {
    if (!isValidUrl) return;
    setConfirmed(true);
    // 直接下载/跳转
    if (isExternal) {
      window.open(decodedUrl, '_blank', 'noopener,noreferrer');
    } else {
      // 站内文件直接下载
      const a = document.createElement('a');
      a.href = decodedUrl;
      a.download = filename;
      a.click();
    }
  };

  const handleDownloadClick = () => {
    if (!isValidUrl) return;
    if (isExternal) {
      window.open(decodedUrl, '_blank', 'noopener,noreferrer');
    } else {
      const a = document.createElement('a');
      a.href = decodedUrl;
      a.download = filename;
      a.click();
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-[#FAFAFA] dark:bg-[#09090B] px-6">
      <div className="max-w-md w-full bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-2xl p-8 shadow-lg">
        {/* Header Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center mb-6">
          <span className="text-3xl">{getFileIcon(ext)}</span>
        </div>

        <h1 className="text-xl font-bold text-[#09090B] dark:text-white mb-1 text-center">
          {isExternal ? '外部资源下载' : '文件下载'}
        </h1>

        <p className="text-sm text-[#71717A] dark:text-[#A1A1AA] mb-6 text-center">
          {isExternal
            ? '您即将访问外部资源，请确认来源可靠后再继续。'
            : '请确认您要下载的文件信息，下载前请注意文件安全。'}
        </p>

        {/* File Info */}
        {isValidUrl && (
          <div className="mb-4 space-y-2">
            {displayName && (
              <div className="p-3 bg-[#F4F4F5] dark:bg-[#27272A] rounded-lg">
                <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mb-1">文件名</p>
                <p className="text-sm text-[#09090B] dark:text-white font-medium break-all">
                  {displayName}
                </p>
              </div>
            )}
            {displaySize && (
              <div className="p-3 bg-[#F4F4F5] dark:bg-[#27272A] rounded-lg">
                <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mb-1">文件大小</p>
                <p className="text-sm text-[#09090B] dark:text-white font-medium">
                  {displaySize}
                </p>
              </div>
            )}
            <div className="p-3 bg-[#F4F4F5] dark:bg-[#27272A] rounded-lg">
              <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mb-1">文件类型</p>
              <p className="text-sm text-[#09090B] dark:text-white font-medium">
                {getFileTypeName(ext)}{ext ? ` (.${ext})` : ''}
              </p>
            </div>
            {isExternal && (
              <div className="p-3 bg-[#F4F4F5] dark:bg-[#27272A] rounded-lg">
                <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] mb-1">来源地址</p>
                <p className="text-sm text-[#09090B] dark:text-white font-mono break-all">
                  {new URL(decodedUrl).hostname}
                </p>
              </div>
            )}
          </div>
        )}

        {!isValidUrl && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">
              链接无效或未提供目标地址
            </p>
          </div>
        )}

        {/* Risk Warnings */}
        {isValidUrl && (
          <div className="mb-6 space-y-2">
            {/* High risk file warning */}
            {isHighRiskFile(ext) && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" x2="12" y1="9" y2="13" />
                  <line x1="12" x2="12.01" y1="17" y2="17" />
                </svg>
                <div>
                  <p className="text-xs font-medium text-red-600 dark:text-red-400">高风险文件警告</p>
                  <p className="text-xs text-red-500 dark:text-red-500 mt-0.5">
                    该文件类型可能存在安全风险（可执行程序/安装包）。请确保您信任该文件的来源，并在下载后先进行病毒扫描再打开。
                  </p>
                </div>
              </div>
            )}

            {/* External link warning */}
            {isExternal && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" x2="12" y1="9" y2="13" />
                  <line x1="12" x2="12.01" y1="17" y2="17" />
                </svg>
                <div>
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400">外部资源提示</p>
                  <p className="text-xs text-amber-500 dark:text-amber-500 mt-0.5">
                    该资源位于外部服务器，本站无法保证其安全性和可用性。请在确认来源可靠后再继续访问。
                  </p>
                </div>
              </div>
            )}

            {/* General safety tips */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="16" y2="12" />
                <line x1="12" x2="12.01" y1="8" y2="8" />
              </svg>
              <div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">安全提示</p>
                <ul className="text-xs text-blue-500 dark:text-blue-500 mt-0.5 space-y-0.5 list-disc list-inside">
                  <li>下载前请确认文件来源可信</li>
                  <li>下载后建议使用杀毒软件扫描</li>
                  <li>不要随意打开来源不明的可执行文件</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Agreement checkbox */}
        {isValidUrl && (
          <label className="flex items-start gap-2 mb-6 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[#D4D4D8] dark:border-[#52525B] text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
            />
            <span className="text-xs text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
              我已了解文件下载的相关风险，确认要{isExternal ? '访问该外部资源' : '下载该文件'}
            </span>
          </label>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {confirmed ? (
            <button
              onClick={handleDownloadClick}
              className="w-full py-2.5 rounded-lg text-sm font-medium bg-[#059669] hover:bg-[#047857] text-white transition-all cursor-pointer"
            >
              再次下载
            </button>
          ) : (
            <button
              onClick={handleProceed}
              disabled={!isValidUrl || !agreed}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isValidUrl && agreed
                  ? isHighRiskFile(ext)
                    ? 'bg-[#EF4444] hover:bg-[#DC2626] text-white'
                    : isExternal
                      ? 'bg-[#D97706] hover:bg-[#B45309] text-white'
                      : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
                  : 'bg-[#E4E4E7] dark:bg-[#27272A] text-[#A1A1AA] cursor-not-allowed'
              }`}
            >
              {isHighRiskFile(ext) ? '我已知晓风险，继续下载' : isExternal ? '确认访问' : '确认下载'}
            </button>
          )}

          <Link
            to="/"
            className="w-full py-2.5 rounded-lg text-sm font-medium border border-[#E4E4E7] dark:border-[#27272A] text-[#71717A] hover:text-[#09090B] dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] transition-all text-center"
          >
            取消，返回首页
          </Link>
        </div>

        {confirmed && (
          <p className="mt-4 text-xs text-[#059669] dark:text-[#34D399] text-center">
            ✅ 下载已开始，如未自动开始请点击上方按钮
          </p>
        )}

        <p className="mt-4 text-xs text-[#A1A1AA] text-center">
          请注意：本站不对外部内容的安全性和可用性负责，请谨慎操作。
        </p>
      </div>
    </div>
  );
}
