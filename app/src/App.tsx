import { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useAuthStore, usePostsStore, useSettingsStore } from '@/store';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SplashScreen } from '@/components/SplashScreen';
import { AdminGuard } from '@/components/AdminGuard';
import { AdminLayout } from '@/components/AdminLayout';
import { HomePage } from '@/pages/HomePage';
import { PostPage } from '@/pages/PostPage';
import { TagsPage } from '@/pages/TagsPage';
import { AboutPage } from '@/pages/AboutPage';
import { LoginPage } from '@/pages/admin/LoginPage';
import { DashboardPage } from '@/pages/admin/DashboardPage';
import { PostsListPage } from '@/pages/admin/PostsListPage';
import { SiteSettingsPage } from '@/pages/admin/SiteSettingsPage';
import { PagesManagerPage } from '@/pages/admin/PagesManagerPage';
import { CommentsManagerPage } from '@/pages/admin/CommentsManagerPage';
import { FriendLinksPage } from '@/pages/admin/FriendLinksPage';
import { TagsManagerPage } from '@/pages/admin/TagsManagerPage';
import { CustomPage } from '@/pages/CustomPage';
import { CustomPageDirect } from '@/pages/CustomPageDirect';
import { RedirectPage } from '@/pages/RedirectPage';
import { DownloadConfirmPage } from '@/pages/DownloadConfirmPage';

function AppInitializer({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const hydrate = usePostsStore((s) => s.hydrate);

  useEffect(() => {
    checkAuth();
    hydrate();
  }, [checkAuth, hydrate]);

  return <>{children}</>;
}

function BlogLayout() {
  const { settings, hydrate } = useSettingsStore();
  const location = useLocation();
  const splashSettings = settings.appearance?.splash;
  const splashEnabled = splashSettings?.enabled;

  // SplashScreen 状态：仅在首页且功能开启时显示
  const isHomePage = location.pathname === '/';
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // 离开首页时重置 splash 状态
  useEffect(() => {
    if (!isHomePage) {
      setSplashDone(true);
    }
  }, [isHomePage]);

  const handleSplashEnter = useCallback(() => {
    setSplashDone(true);
  }, []);

  const showSplash = splashEnabled && isHomePage && !splashDone;

  const siteBackground = settings.appearance?.siteBackground;

  return (
    <div
      className="flex flex-col min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] relative"
      style={
        siteBackground
          ? {
              backgroundImage: `url(${siteBackground})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
            }
          : undefined
      }
    >
      {/* Splash Screen - 全屏欢迎页 */}
      {showSplash && <SplashScreen onEnter={handleSplashEnter} />}

      {/* Dark mode overlay: dims the background image when dark mode is active */}
      {siteBackground && (
        <div className="fixed inset-0 pointer-events-none z-0 bg-black/0 dark:bg-black/55 transition-colors duration-300" />
      )}
      <Navbar />
      <main className="flex-1 relative z-[1]">
        {/* When background image is set, add a semi-transparent overlay to ensure content readability.
            Light mode: light overlay; Dark mode: dark overlay */}
        {siteBackground && (
          <>
            <div className="absolute inset-0 pointer-events-none bg-[#FAFAFA]/85 dark:bg-[#09090B]/85 transition-colors duration-300" />
          </>
        )}
        <div className="relative z-[1]">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/post/:slug" element={<PostPage />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/page/:slug" element={<CustomPage />} />
            <Route path="/redirect" element={<RedirectPage />} />
            <Route path="/download" element={<DownloadConfirmPage />} />
            <Route path="/:slug" element={<CustomPageDirect />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppInitializer>
        <Routes>
          {/* Blog Frontend */}
          <Route path="/*" element={<BlogLayout />} />

          {/* Admin */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminGuard />}>
            <Route element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="posts" element={<PostsListPage />} />
              <Route path="comments" element={<CommentsManagerPage />} />
              <Route path="pages" element={<PagesManagerPage />} />
              <Route path="links" element={<FriendLinksPage />} />
              <Route path="tags" element={<TagsManagerPage />} />
              <Route path="settings" element={<SiteSettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </AppInitializer>
    </BrowserRouter>
  );
}

export default App;
