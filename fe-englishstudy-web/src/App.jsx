import React, { useState } from 'react';
import LoginPage from './src_pages/LoginPage';
import RegisterPage from './src_pages/RegisterPage';
import HomePage from './src_pages/HomePage';
import PracticePage from './src_pages/PracticePage'; 

function App() {
  const [currentPage, setCurrentPage] = useState('login');

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* 1. HIỂN THỊ TRANG ĐĂNG NHẬP */}
      {currentPage === 'login' && (
        <LoginPage 
          onNavigateToRegister={() => setCurrentPage('register')} 
          onLoginSuccess={() => setCurrentPage('home')} 
        />
      )}

      {/* 2. HIỂN THỊ TRANG ĐĂNG KÝ */}
      {currentPage === 'register' && (
        <RegisterPage 
          onNavigateToLogin={() => setCurrentPage('login')} 
        />
      )}

      {/* 3. HIỂN THỊ TRANG CHỦ */}
      {currentPage === 'home' && (
        <HomePage 
          onLogout={() => setCurrentPage('login')} 
        />
      )}
      
    </div>
  );
}

export default App;