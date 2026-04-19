import React, { useState } from 'react';
import LoginPage from './src_pages/LoginPage';
import RegisterPage from './src_pages/RegisterPage';
import HomePage from './src_pages/HomePage';
import PracticePage from './src_pages/PracticePage'; 
import AdminHomePage from './src_pages/AdminHomePage';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [userRole, setUserRole] = useState('user');

  return (
    <div className="min-h-screen bg-gray-50">
      
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
        <RegisterPage 
          onNavigateToLogin={() => setCurrentPage('login')} 
        />
      )}

      {/* 3. HIỂN THỊ TRANG CHỦ CHO USER */}
      {currentPage === 'home' && userRole === 'user' && (
        <HomePage onLogout={() => setCurrentPage('login')} />
      )}

      {/* 4. HIỂN THỊ TRANG CHỦ RIÊNG BIỆT CHO ADMIN */}
      {currentPage === 'home' && userRole === 'admin' && (
        <AdminHomePage onLogout={() => setCurrentPage('login')} />
      )}
      
    </div>
  );
}

export default App;