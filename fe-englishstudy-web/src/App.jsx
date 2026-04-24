import React, { useState, useEffect } from 'react';
import LoginPage from './src_pages/LoginPage';
import RegisterPage from './src_pages/RegisterPage';
import HomePage from './src_pages/HomePage';
import PracticePage from './src_pages/PracticePage'; 
import AdminHomePage from './src_pages/AdminHomePage';
import { getMe, logout as doLogout } from './src_utils/services/authService';
import { getAccessToken } from './src_utils/tokenStorage';

function App() {
  const getInitialPage = () => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) return 'home';
    if (path.startsWith('/home')) return 'home';
    if (path === '/register') return 'register';
    return 'login';
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const [userRole, setUserRole] = useState(window.location.pathname.startsWith('/admin') ? 'admin' : 'user');
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = getAccessToken();
        if (!token) return;
        const principal = await getMe();
        const roles = principal?.roles ?? principal?.authorities ?? [];
        const rolesStr = Array.isArray(roles)
          ? roles.map(r => (typeof r === 'string' ? r : r?.authority ?? r?.role ?? '')).join(',')
          : String(roles);
        const isAdmin = /ADMIN/i.test(rolesStr);
        setUserRole(isAdmin ? 'admin' : 'user');
        setCurrentPage('home');
      } catch {
        // Backend không khả dụng → kiểm tra mock role
        const mockRole = localStorage.getItem('mockRole');
        if (mockRole === 'admin' || mockRole === 'user') {
          setUserRole(mockRole);
          setCurrentPage('home');
        } else {
          doLogout();
        }
      } finally {
        setIsBootstrapping(false);
      }
    };
    bootstrap();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      if (p === '/register') setCurrentPage('register');
      else if (p === '/login' || p === '/') setCurrentPage('login');
      else if (p.startsWith('/admin')) { setCurrentPage('home'); setUserRole('admin'); }
      else if (p.startsWith('/home')) { setCurrentPage('home'); setUserRole('user'); }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (currentPage === 'login') {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.history.pushState(null, '', '/login');
      }
      document.title = 'Đăng nhập - EngLearn';
    } else if (currentPage === 'register') {
      if (window.location.pathname !== '/register') {
        window.history.pushState(null, '', '/register');
      }
      document.title = 'Đăng ký - EngLearn';
    }
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-gray-50">
      {isBootstrapping && (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-gray-500 font-bold">Đang tải...</div>
        </div>
      )}
      {!isBootstrapping && (
        <>
          {/* 1. HIỂN THỊ TRANG ĐĂNG NHẬP */}
          {currentPage === 'login' && (
            <LoginPage
              onNavigateToRegister={() => setCurrentPage('register')}
              onLoginSuccess={(role) => {
                setUserRole(role);
                setCurrentPage('home');
              }}
            />
          )}

          {/* 2. HIỂN THỊ TRANG ĐĂNG KÝ */}
          {currentPage === 'register' && (
            <RegisterPage onNavigateToLogin={() => setCurrentPage('login')} />
          )}

          {/* 3. HIỂN THỊ TRANG CHỦ CHO USER */}
          {currentPage === 'home' && userRole === 'user' && (
            <HomePage onLogout={() => { doLogout(); localStorage.removeItem('mockRole'); setCurrentPage('login'); }} />
          )}

          {/* 4. HIỂN THỊ TRANG CHỦ RIÊNG BIỆT CHO ADMIN */}
          {currentPage === 'home' && userRole === 'admin' && (
            <AdminHomePage onLogout={() => { doLogout(); localStorage.removeItem('mockRole'); setCurrentPage('login'); }} />
          )}
        </>
      )}
    </div>
  );
}

export default App;