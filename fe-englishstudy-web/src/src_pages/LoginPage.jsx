import React from 'react';

function LoginPage({ onNavigateToRegister, onLoginSuccess }) {
  return (
    // Phần bao ngoài: Chiếm toàn bộ màn hình, căn giữa form, và đổi nền thành màu xanh nước biển đậm
    <div className="min-h-screen flex items-center justify-center bg-cyan-900">
      {/*Phần đóng khung*/}
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        
        {/* Tiêu đề */}
        <div className="text-center mb-8">
          {/* Đổi màu tiêu đề chính thành màu xanh đen đậm */}
          <h1 className="text-4xl font-extrabold text-cyan-950">EngLearn</h1>
          <p className="text-gray-500 mt-2">Học tiếng Anh mỗi ngày</p>
        </div>

        {/* Form nhập liệu */}
        {/* SỬA THẺ FORM VÀ THÊM HÀM XỬ LÝ */}
        <form 
          className="space-y-6" 
          onSubmit={(e) => {
            e.preventDefault();
            onLoginSuccess(); 
          }}
        >
          <div>
            <label className="block text-sm font-medium text-[#164e63] mb-1">Tên đăng nhập</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0284c7] outline-none transition-all"
              placeholder="Nhập username..." required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#164e63] mb-1">Mật khẩu</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0284c7] outline-none transition-all"
              placeholder="••••••••" required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-[#0e7490] hover:bg-[#164e63] text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg"
          >
            Đăng nhập
          </button>
        </form>

        {/* Phần footer */}
       {/* Phần footer */}
        <p className="text-center text-sm text-gray-900 mt-6">
          Chưa có tài khoản? 
          <button 
            onClick={onNavigateToRegister} 
            className="text-blue-700 font-semibold hover:underline ml-1 focus:outline-none"
          >
            Đăng ký
          </button>
        </p>

      </div>
    </div>
  );
}

export default LoginPage;