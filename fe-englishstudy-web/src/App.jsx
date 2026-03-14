import React, { useState } from 'react';
import LoginPage from './src_pages/LoginPage';
import RegisterPage from './src_pages/RegisterPage';
import HomePage from './src_pages/HomePage';

function App() {
  // Biến state này sẽ lưu trữ xem người dùng đang ở trang nào ('login' hoặc 'register')
  const [currentPage, setCurrentPage] = useState('login');

  return (
    <>
      {currentPage === 'login' && (
        <LoginPage 
          onNavigateToRegister={() => setCurrentPage('register')} 
          onLoginSuccess={() => setCurrentPage('home')} 
        />
      )}
      {currentPage === 'register' && (
        <RegisterPage 
          onNavigateToLogin={() => setCurrentPage('login')} 
        />
      )}
      {currentPage === 'home' && (
        <HomePage 
          onLogout={() => setCurrentPage('login')} 
        />
      )}
    </>
  );
}

export default App;