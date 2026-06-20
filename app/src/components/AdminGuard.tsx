import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store';

export function AdminGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initialized = useAuthStore((s) => s.initialized);

  // checkAuth 尚未完成时显示加载状态，避免误判为未登录
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F4F5] dark:bg-[#09090B]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#71717A] dark:text-[#A1A1AA]">验证登录状态...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
