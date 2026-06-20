import { useState, useEffect, useRef } from 'react';
import { useSettingsStore } from '@/store';
import type { NavLink, SocialLink } from '@/types';
import * as api from '@/api';

export function SiteSettingsPage() {
  const { settings, hydrate, updateSetting } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<'site' | 'header' | 'footer' | 'about' | 'appearance'>('site');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Local editable state
  const [siteName, setSiteName] = useState(settings.site.name);
  const [siteDesc, setSiteDesc] = useState(settings.site.description);
  const [welcomeTitle, setWelcomeTitle] = useState(settings.site.welcomeTitle || '');
  const [welcomeSubtitle, setWelcomeSubtitle] = useState(settings.site.welcomeSubtitle || '');
  const [postCopyright, setPostCopyright] = useState((settings.site as any).postCopyright || '');
  const [navLinks, setNavLinks] = useState<NavLink[]>(settings.header.navLinks);
  const [brandName, setBrandName] = useState(settings.footer.brandName);
  const [tagline, setTagline] = useState(settings.footer.tagline);
  const [copyright, setCopyright] = useState(settings.footer.copyright);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(settings.footer.socialLinks);
  const [siteStartDate, setSiteStartDate] = useState((settings.footer as any).siteStartDate || '');
  const [icpBeian, setIcpBeian] = useState((settings.footer as any).icpBeian || '');
  const [gonganBeian, setGonganBeian] = useState((settings.footer as any).gonganBeian || '');
  const [aboutName, setAboutName] = useState(settings.about.name);
  const [aboutTagline, setAboutTagline] = useState(settings.about.tagline);
  const [aboutBio, setAboutBio] = useState(settings.about.bio);
  const [aboutSocial, setAboutSocial] = useState<SocialLink[]>(settings.about.socialLinks);

  // Appearance state
  const [siteLogo, setSiteLogo] = useState(settings.appearance?.siteLogo || '');
  const [siteBackground, setSiteBackground] = useState(settings.appearance?.siteBackground || '');
  const [loginBackground, setLoginBackground] = useState(settings.appearance?.loginBackground || '');
  const [donateQrCode, setDonateQrCode] = useState(settings.appearance?.donateQrCode || '');
  const [donateText, setDonateText] = useState(settings.appearance?.donateText || '');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSiteBg, setUploadingSiteBg] = useState(false);
  const [uploadingLoginBg, setUploadingLoginBg] = useState(false);
  const [uploadingDonateQr, setUploadingDonateQr] = useState(false);

  // Splash screen state
  const [splashEnabled, setSplashEnabled] = useState(settings.appearance?.splash?.enabled || false);
  const [splashTitle, setSplashTitle] = useState(settings.appearance?.splash?.title || '');
  const [splashSubtitle, setSplashSubtitle] = useState(settings.appearance?.splash?.subtitle || '');
  const [splashBackground, setSplashBackground] = useState(settings.appearance?.splash?.background || '');
  const [uploadingSplashBg, setUploadingSplashBg] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const siteBgInputRef = useRef<HTMLInputElement>(null);
  const loginBgInputRef = useRef<HTMLInputElement>(null);
  const donateQrInputRef = useRef<HTMLInputElement>(null);
  const splashBgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Sync local state when settings load
  useEffect(() => {
    setSiteName(settings.site.name);
    setSiteDesc(settings.site.description);
    setWelcomeTitle(settings.site.welcomeTitle || '');
    setWelcomeSubtitle(settings.site.welcomeSubtitle || '');
    setPostCopyright((settings.site as any).postCopyright || '');
    setNavLinks(settings.header.navLinks);
    setBrandName(settings.footer.brandName);
    setTagline(settings.footer.tagline);
    setCopyright(settings.footer.copyright);
    setSocialLinks(settings.footer.socialLinks);
    setSiteStartDate((settings.footer as any).siteStartDate || '');
    setIcpBeian((settings.footer as any).icpBeian || '');
    setGonganBeian((settings.footer as any).gonganBeian || '');
    setAboutName(settings.about.name);
    setAboutTagline(settings.about.tagline);
    setAboutBio(settings.about.bio);
    setAboutSocial(settings.about.socialLinks);
    setSiteLogo(settings.appearance?.siteLogo || '');
    setSiteBackground(settings.appearance?.siteBackground || '');
    setLoginBackground(settings.appearance?.loginBackground || '');
    setDonateQrCode(settings.appearance?.donateQrCode || '');
    setDonateText(settings.appearance?.donateText || '');
    setSplashEnabled(settings.appearance?.splash?.enabled || false);
    setSplashTitle(settings.appearance?.splash?.title || '');
    setSplashSubtitle(settings.appearance?.splash?.subtitle || '');
    setSplashBackground(settings.appearance?.splash?.background || '');
  }, [settings]);

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSaveSite = async () => {
    setSaving(true);
    try {
      await updateSetting('site', { name: siteName, description: siteDesc, welcomeTitle, welcomeSubtitle, postCopyright });
      showMsg('✅ 网站基本信息已保存');
    } catch {
      showMsg('❌ 保存失败');
    }
    setSaving(false);
  };

  const handleSaveHeader = async () => {
    setSaving(true);
    try {
      await updateSetting('header', { navLinks: navLinks.filter((l) => l.label && l.to) });
      showMsg('✅ 导航栏设置已保存');
    } catch {
      showMsg('❌ 保存失败');
    }
    setSaving(false);
  };

  const handleSaveFooter = async () => {
    setSaving(true);
    try {
      await updateSetting('footer', {
        brandName,
        tagline,
        socialLinks: socialLinks.filter((l) => l.label),
        copyright,
        siteStartDate: siteStartDate || undefined,
        icpBeian: icpBeian || undefined,
        gonganBeian: gonganBeian || undefined,
      });
      showMsg('✅ 页脚设置已保存');
    } catch {
      showMsg('❌ 保存失败');
    }
    setSaving(false);
  };

  const handleSaveAbout = async () => {
    setSaving(true);
    try {
      await updateSetting('about', {
        name: aboutName,
        tagline: aboutTagline,
        bio: aboutBio,
        socialLinks: aboutSocial.filter((l) => l.label),
      });
      showMsg('✅ 关于页面设置已保存');
    } catch {
      showMsg('❌ 保存失败');
    }
    setSaving(false);
  };

  // 读取文件为 base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 通用上传处理
  const handleFileUpload = async (
    file: File,
    category: string,
    setUploading: (v: boolean) => void,
    setUrl: (url: string) => void,
    label: string
  ) => {
    // 文件类型验证
    if (!file.type.startsWith('image/')) {
      showMsg(`❌ 请选择图片文件（当前类型: ${file.type || '未知'}）`);
      return;
    }
    // 文件大小验证
    if (file.size > 10 * 1024 * 1024) {
      showMsg(`❌ 图片大小不能超过 10MB（当前: ${(file.size / 1024 / 1024).toFixed(2)}MB）`);
      return;
    }
    setUploading(true);
    try {
      const data = await fileToBase64(file);
      const result = await api.uploadSiteImage(data, file.name, category);
      setUrl(result.url);
      showMsg(`✅ ${label}上传成功`);
    } catch (err: any) {
      showMsg(`❌ ${label}上传失败: ${err.message}`);
    }
    setUploading(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleFileUpload(file, 'logo', setUploadingLogo, setSiteLogo, 'Logo');
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleSiteBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleFileUpload(file, 'background', setUploadingSiteBg, setSiteBackground, '网站背景图');
    if (siteBgInputRef.current) siteBgInputRef.current.value = '';
  };

  const handleLoginBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleFileUpload(file, 'background', setUploadingLoginBg, setLoginBackground, '登录背景图');
    if (loginBgInputRef.current) loginBgInputRef.current.value = '';
  };

  const handleDonateQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleFileUpload(file, 'donate', setUploadingDonateQr, setDonateQrCode, '赞赏二维码');
    if (donateQrInputRef.current) donateQrInputRef.current.value = '';
  };

  const handleSplashBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleFileUpload(file, 'background', setUploadingSplashBg, setSplashBackground, '欢迎页背景图');
    if (splashBgInputRef.current) splashBgInputRef.current.value = '';
  };

  const handleSaveAppearance = async () => {
    setSaving(true);
    try {
      await updateSetting('appearance', {
        siteLogo,
        siteBackground,
        loginBackground,
        donateQrCode,
        donateText,
        splash: {
          enabled: splashEnabled,
          title: splashTitle,
          subtitle: splashSubtitle,
          background: splashBackground,
        },
      });
      showMsg('✅ 外观设置已保存');
    } catch {
      showMsg('❌ 保存失败');
    }
    setSaving(false);
  };

  const tabs = [
    { key: 'site' as const, label: '网站信息' },
    { key: 'header' as const, label: '导航栏' },
    { key: 'footer' as const, label: '页脚' },
    { key: 'about' as const, label: '关于页面' },
    { key: 'appearance' as const, label: '外观设置' },
  ];

  const inputClass =
    'w-full px-3 py-2 bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-lg text-sm text-[#09090B] dark:text-white placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all';
  const textareaClass = `${inputClass} min-h-[200px] font-mono`;
  const labelClass = 'block text-sm font-medium text-[#09090B] dark:text-white mb-1.5';
  const btnPrimary =
    'px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-lg hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 cursor-pointer';
  const btnOutline =
    'px-3 py-1.5 border border-[#E4E4E7] dark:border-[#27272A] rounded-lg text-sm text-[#71717A] hover:text-[#09090B] dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] transition-all cursor-pointer';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#09090B] dark:text-white">网站设置</h1>
        <p className="text-sm text-[#71717A] mt-1">管理网站的基本信息、导航栏、页脚和关于页面内容</p>
      </div>

      {message && (
        <div className="mb-4 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-sm rounded-lg border border-emerald-200 dark:border-emerald-800">
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F4F4F5] dark:bg-[#27272A] rounded-lg p-1 mb-6 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
              activeTab === tab.key
                ? 'bg-white dark:bg-[#18181B] text-[#09090B] dark:text-white shadow-sm'
                : 'text-[#71717A] hover:text-[#09090B] dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Site Info */}
      {activeTab === 'site' && (
        <div className="bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-6 space-y-4">
          <div>
            <label className={labelClass}>网站名称</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className={inputClass}
              placeholder="我的博客"
            />
          </div>
          <div>
            <label className={labelClass}>网站描述</label>
            <input
              type="text"
              value={siteDesc}
              onChange={(e) => setSiteDesc(e.target.value)}
              className={inputClass}
              placeholder="记录思考，分享知识"
            />
          </div>
          <div className="border-t border-[#E4E4E7] dark:border-[#27272A] pt-4">
            <p className="text-sm font-medium text-[#09090B] dark:text-white mb-3">首页欢迎语</p>
          </div>
          <div>
            <label className={labelClass}>欢迎标题</label>
            <input
              type="text"
              value={welcomeTitle}
              onChange={(e) => setWelcomeTitle(e.target.value)}
              className={inputClass}
              placeholder="欢迎来到我的博客"
            />
          </div>
          <div>
            <label className={labelClass}>欢迎副标题</label>
            <input
              type="text"
              value={welcomeSubtitle}
              onChange={(e) => setWelcomeSubtitle(e.target.value)}
              className={inputClass}
              placeholder="记录技术探索、分享开发经验，每一篇文章都是一次深度思考的结晶"
            />
          </div>
          <div className="border-t border-[#E4E4E7] dark:border-[#27272A] pt-4">
            <p className="text-sm font-medium text-[#09090B] dark:text-white mb-3">文章版权声明</p>
          </div>
          <div>
            <label className={labelClass}>版权声明文本</label>
            <p className="text-xs text-[#71717A] mb-2">支持变量：{'{title}'} = 文章标题，{'{date}'} = 发布日期，{'{year}'} = 当前年份。留空则不显示。</p>
            <textarea
              value={postCopyright}
              onChange={(e) => setPostCopyright(e.target.value)}
              className={inputClass + ' min-h-[80px]'}
              placeholder="本文版权归作者所有，如需转载请注明出处。"
            />
          </div>
          <button onClick={handleSaveSite} disabled={saving} className={btnPrimary}>
            {saving ? '保存中...' : '保存网站信息'}
          </button>
        </div>
      )}

      {/* Header / Navbar */}
      {activeTab === 'header' && (
        <div className="bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-6 space-y-4">
          <p className="text-sm text-[#71717A]">配置顶部导航栏的链接，每个链接包含显示名称和跳转路径。</p>
          {navLinks.map((link, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-1 flex gap-3">
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => {
                    const updated = [...navLinks];
                    updated[i] = { ...updated[i], label: e.target.value };
                    setNavLinks(updated);
                  }}
                  className={inputClass}
                  placeholder="显示名称"
                />
                <input
                  type="text"
                  value={link.to}
                  onChange={(e) => {
                    const updated = [...navLinks];
                    updated[i] = { ...updated[i], to: e.target.value };
                    setNavLinks(updated);
                  }}
                  className={inputClass}
                  placeholder="路径 (如 /about)"
                />
              </div>
              <button
                onClick={() => setNavLinks(navLinks.filter((_, j) => j !== i))}
                className="p-2 text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all cursor-pointer shrink-0"
                title="删除"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
          <button
            onClick={() => setNavLinks([...navLinks, { to: '', label: '' }])}
            className={btnOutline}
          >
            + 添加导航链接
          </button>
          <div className="pt-2">
            <button onClick={handleSaveHeader} disabled={saving} className={btnPrimary}>
              {saving ? '保存中...' : '保存导航栏设置'}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      {activeTab === 'footer' && (
        <div className="bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-6 space-y-4">
          <div>
            <label className={labelClass}>品牌名称</label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className={inputClass}
              placeholder="Blog"
            />
          </div>
          <div>
            <label className={labelClass}>标语</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className={inputClass}
              placeholder="记录思考，分享知识"
            />
          </div>
          <div>
            <label className={labelClass}>版权信息（使用 {'{year}'} 表示年份）</label>
            <input
              type="text"
              value={copyright}
              onChange={(e) => setCopyright(e.target.value)}
              className={inputClass}
              placeholder="© {year} Blog."
            />
          </div>

          <div>
            <label className={labelClass}>社交链接</label>
            <p className="text-xs text-[#71717A] mb-2">支持 icon: github, twitter, qq, wechat</p>
            {socialLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-3 mb-2">
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => {
                    const updated = [...socialLinks];
                    updated[i] = { ...updated[i], label: e.target.value };
                    setSocialLinks(updated);
                  }}
                  className={inputClass}
                  placeholder="显示名称"
                />
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => {
                    const updated = [...socialLinks];
                    updated[i] = { ...updated[i], url: e.target.value };
                    setSocialLinks(updated);
                  }}
                  className={inputClass}
                  placeholder="URL"
                />
                <select
                  value={link.icon}
                  onChange={(e) => {
                    const updated = [...socialLinks];
                    updated[i] = { ...updated[i], icon: e.target.value };
                    setSocialLinks(updated);
                  }}
                  className={inputClass + ' w-28'}
                >
                  <option value="github">github</option>
                  <option value="twitter">twitter</option>
                  <option value="qq">qq</option>
                  <option value="wechat">wechat</option>
                </select>
                <button
                  onClick={() => setSocialLinks(socialLinks.filter((_, j) => j !== i))}
                  className="p-2 text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all cursor-pointer shrink-0"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={() => setSocialLinks([...socialLinks, { label: '', url: '', icon: 'github' }])}
              className={btnOutline}
            >
              + 添加社交链接
            </button>
          </div>

          <div>
            <label className={labelClass}>网站建设开始时间</label>
            <p className="text-xs text-[#71717A] mb-2">设置后，页脚将显示网站已运行时间（精确到秒）</p>
            <input
              type="datetime-local"
              value={siteStartDate}
              onChange={(e) => setSiteStartDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="border-t border-[#E4E4E7] dark:border-[#27272A] pt-4">
            <p className="text-sm font-medium text-[#09090B] dark:text-white mb-3">网站备案信息</p>
          </div>
          <div>
            <label className={labelClass}>ICP 备案号</label>
            <p className="text-xs text-[#71717A] mb-2">例如: 京ICP备2024000001号，将自动链接至工信部备案查询网站</p>
            <input
              type="text"
              value={icpBeian}
              onChange={(e) => setIcpBeian(e.target.value)}
              className={inputClass}
              placeholder="京ICP备2024000001号"
            />
          </div>
          <div>
            <label className={labelClass}>公安备案号</label>
            <p className="text-xs text-[#71717A] mb-2">例如: 京公网安备 11010000000001号，将自动链接至公安部备案查询网站</p>
            <input
              type="text"
              value={gonganBeian}
              onChange={(e) => setGonganBeian(e.target.value)}
              className={inputClass}
              placeholder="京公网安备 11010000000001号"
            />
          </div>

          <button onClick={handleSaveFooter} disabled={saving} className={btnPrimary}>
            {saving ? '保存中...' : '保存页脚设置'}
          </button>
        </div>
      )}

      {/* About Page */}
      {activeTab === 'about' && (
        <div className="bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-6 space-y-4">
          <div>
            <label className={labelClass}>标题</label>
            <input
              type="text"
              value={aboutName}
              onChange={(e) => setAboutName(e.target.value)}
              className={inputClass}
              placeholder="关于我"
            />
          </div>
          <div>
            <label className={labelClass}>副标题</label>
            <input
              type="text"
              value={aboutTagline}
              onChange={(e) => setAboutTagline(e.target.value)}
              className={inputClass}
              placeholder="全栈开发者"
            />
          </div>
          <div>
            <label className={labelClass}>个人介绍（支持 Markdown）</label>
            <textarea
              value={aboutBio}
              onChange={(e) => setAboutBio(e.target.value)}
              className={textareaClass}
              rows={12}
              placeholder="## 关于我..."
            />
          </div>
          <div>
            <label className={labelClass}>社交链接</label>
            {aboutSocial.map((link, i) => (
              <div key={i} className="flex items-center gap-3 mb-2">
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => {
                    const updated = [...aboutSocial];
                    updated[i] = { ...updated[i], label: e.target.value };
                    setAboutSocial(updated);
                  }}
                  className={inputClass}
                  placeholder="显示名称"
                />
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => {
                    const updated = [...aboutSocial];
                    updated[i] = { ...updated[i], url: e.target.value };
                    setAboutSocial(updated);
                  }}
                  className={inputClass}
                  placeholder="URL"
                />
                <select
                  value={link.icon}
                  onChange={(e) => {
                    const updated = [...aboutSocial];
                    updated[i] = { ...updated[i], icon: e.target.value };
                    setAboutSocial(updated);
                  }}
                  className={inputClass + ' w-28'}
                >
                  <option value="github">github</option>
                  <option value="twitter">twitter</option>
                </select>
                <button
                  onClick={() => setAboutSocial(aboutSocial.filter((_, j) => j !== i))}
                  className="p-2 text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all cursor-pointer shrink-0"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={() => setAboutSocial([...aboutSocial, { label: '', url: '', icon: 'github' }])}
              className={btnOutline}
            >
              + 添加社交链接
            </button>
          </div>
          <button onClick={handleSaveAbout} disabled={saving} className={btnPrimary}>
            {saving ? '保存中...' : '保存关于页面设置'}
          </button>
        </div>
      )}

      {/* Appearance */}
      {activeTab === 'appearance' && (
        <div className="bg-white dark:bg-[#18181B] border border-[#E4E4E7] dark:border-[#27272A] rounded-xl p-6 space-y-6">
          {/* Site Logo */}
          <div>
            <label className={labelClass}>网站 Logo</label>
            <p className="text-xs text-[#71717A] mb-2">显示在导航栏的网站标志，建议使用正方形图片</p>
            <div className="flex items-center gap-4">
              {siteLogo && (
                <img
                  src={siteLogo}
                  alt="Logo preview"
                  className="w-12 h-12 rounded-lg object-cover border border-[#E4E4E7] dark:border-[#27272A]"
                />
              )}
              <div className="flex-1">
                <input
                  type="text"
                  value={siteLogo}
                  onChange={(e) => setSiteLogo(e.target.value)}
                  className={inputClass}
                  placeholder="输入图片URL或上传本地图片"
                />
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo}
                className={btnOutline}
              >
                {uploadingLogo ? '上传中...' : '本地上传'}
              </button>
            </div>
          </div>

          {/* Site Background */}
          <div>
            <label className={labelClass}>网站背景图</label>
            <p className="text-xs text-[#71717A] mb-2">全站背景图片（可选），设置后将替换默认背景色</p>
            <div className="flex items-center gap-4">
              {siteBackground && (
                <img
                  src={siteBackground}
                  alt="Background preview"
                  className="w-20 h-12 rounded-lg object-cover border border-[#E4E4E7] dark:border-[#27272A]"
                />
              )}
              <div className="flex-1">
                <input
                  type="text"
                  value={siteBackground}
                  onChange={(e) => setSiteBackground(e.target.value)}
                  className={inputClass}
                  placeholder="输入图片URL或上传本地图片"
                />
              </div>
              <input
                ref={siteBgInputRef}
                type="file"
                accept="image/*"
                onChange={handleSiteBgUpload}
                className="hidden"
              />
              <button
                onClick={() => siteBgInputRef.current?.click()}
                disabled={uploadingSiteBg}
                className={btnOutline}
              >
                {uploadingSiteBg ? '上传中...' : '本地上传'}
              </button>
              {siteBackground && (
                <button
                  onClick={() => setSiteBackground('')}
                  className="px-3 py-1.5 text-sm text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer"
                >
                  清除
                </button>
              )}
            </div>
          </div>

          {/* Login Background */}
          <div>
            <label className={labelClass}>管理后台登录页背景图</label>
            <p className="text-xs text-[#71717A] mb-2">登录页面的背景图片（可选）</p>
            <div className="flex items-center gap-4">
              {loginBackground && (
                <img
                  src={loginBackground}
                  alt="Login bg preview"
                  className="w-20 h-12 rounded-lg object-cover border border-[#E4E4E7] dark:border-[#27272A]"
                />
              )}
              <div className="flex-1">
                <input
                  type="text"
                  value={loginBackground}
                  onChange={(e) => setLoginBackground(e.target.value)}
                  className={inputClass}
                  placeholder="输入图片URL或上传本地图片"
                />
              </div>
              <input
                ref={loginBgInputRef}
                type="file"
                accept="image/*"
                onChange={handleLoginBgUpload}
                className="hidden"
              />
              <button
                onClick={() => loginBgInputRef.current?.click()}
                disabled={uploadingLoginBg}
                className={btnOutline}
              >
                {uploadingLoginBg ? '上传中...' : '本地上传'}
              </button>
              {loginBackground && (
                <button
                  onClick={() => setLoginBackground('')}
                  className="px-3 py-1.5 text-sm text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer"
                >
                  清除
                </button>
              )}
            </div>
          </div>

          {/* Splash Screen - 全屏欢迎页 */}
          <div className="border-t border-[#E4E4E7] dark:border-[#27272A] pt-4">
            <p className="text-sm font-medium text-[#09090B] dark:text-white mb-3">全屏欢迎页</p>
            <p className="text-xs text-[#71717A] mb-4">
              开启后，访问网站首页时先显示全屏欢迎页，向下滚动或上滑鼠标滚轮后进入博客主页。
            </p>
          </div>

          {/* Enable toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className={labelClass}>启用欢迎页</label>
              <p className="text-xs text-[#71717A]">仅在网站首页显示</p>
            </div>
            <button
              onClick={() => setSplashEnabled(!splashEnabled)}
              className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                splashEnabled ? 'bg-[#2563EB]' : 'bg-[#D4D4D8] dark:bg-[#3F3F46]'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  splashEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {splashEnabled && (
            <>
              <div>
                <label className={labelClass}>欢迎标题</label>
                <input
                  type="text"
                  value={splashTitle}
                  onChange={(e) => setSplashTitle(e.target.value)}
                  className={inputClass}
                  placeholder="欢迎来到我的博客"
                />
              </div>
              <div>
                <label className={labelClass}>欢迎副标题</label>
                <input
                  type="text"
                  value={splashSubtitle}
                  onChange={(e) => setSplashSubtitle(e.target.value)}
                  className={inputClass}
                  placeholder="记录技术探索，分享开发经验"
                />
              </div>
              <div>
                <label className={labelClass}>欢迎页背景图</label>
                <p className="text-xs text-[#71717A] mb-2">建议使用深色调图片，留空则使用默认深色渐变背景</p>
                <div className="flex items-center gap-4">
                  {splashBackground && (
                    <img
                      src={splashBackground}
                      alt="Splash bg preview"
                      className="w-20 h-12 rounded-lg object-cover border border-[#E4E4E7] dark:border-[#27272A]"
                    />
                  )}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={splashBackground}
                      onChange={(e) => setSplashBackground(e.target.value)}
                      className={inputClass}
                      placeholder="输入图片URL或上传本地图片"
                    />
                  </div>
                  <input
                    ref={splashBgInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleSplashBgUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => splashBgInputRef.current?.click()}
                    disabled={uploadingSplashBg}
                    className={btnOutline}
                  >
                    {uploadingSplashBg ? '上传中...' : '本地上传'}
                  </button>
                  {splashBackground && (
                    <button
                      onClick={() => setSplashBackground('')}
                      className="px-3 py-1.5 text-sm text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer"
                    >
                      清除
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Donate QR Code */}
          <div className="border-t border-[#E4E4E7] dark:border-[#27272A] pt-4">
            <p className="text-sm font-medium text-[#09090B] dark:text-white mb-3">文章赞赏设置</p>
          </div>
          <div>
            <label className={labelClass}>赞赏二维码</label>
            <p className="text-xs text-[#71717A] mb-2">文章页面右下角悬浮赞赏按钮的二维码图片，留空则不显示赞赏按钮</p>
            <div className="flex items-center gap-4">
              {donateQrCode && (
                <img
                  src={donateQrCode}
                  alt="Donate QR preview"
                  className="w-12 h-12 rounded-lg object-cover border border-[#E4E4E7] dark:border-[#27272A]"
                />
              )}
              <div className="flex-1">
                <input
                  type="text"
                  value={donateQrCode}
                  onChange={(e) => setDonateQrCode(e.target.value)}
                  className={inputClass}
                  placeholder="输入图片URL或上传本地图片"
                />
              </div>
              <input
                ref={donateQrInputRef}
                type="file"
                accept="image/*"
                onChange={handleDonateQrUpload}
                className="hidden"
              />
              <button
                onClick={() => donateQrInputRef.current?.click()}
                disabled={uploadingDonateQr}
                className={btnOutline}
              >
                {uploadingDonateQr ? '上传中...' : '本地上传'}
              </button>
              {donateQrCode && (
                <button
                  onClick={() => setDonateQrCode('')}
                  className="px-3 py-1.5 text-sm text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer"
                >
                  清除
                </button>
              )}
            </div>
          </div>
          <div>
            <label className={labelClass}>赞赏提示文字</label>
            <input
              type="text"
              value={donateText}
              onChange={(e) => setDonateText(e.target.value)}
              className={inputClass}
              placeholder="如果文章对你有帮助，欢迎赞赏支持~"
            />
          </div>

          <button onClick={handleSaveAppearance} disabled={saving} className={btnPrimary}>
            {saving ? '保存中...' : '保存外观设置'}
          </button>
        </div>
      )}
    </div>
  );
}
