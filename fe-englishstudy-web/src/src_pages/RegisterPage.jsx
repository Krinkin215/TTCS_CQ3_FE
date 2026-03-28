import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';


function RegisterPage({ onNavigateToLogin }) {
    // 1. Tạo state để lưu trữ dữ liệu người dùng nhập
  const [formData, setFormData] = useState({
    fullName: '',
    date_of_birth: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  // 2. Tạo state để lưu trữ thông báo lỗi
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: ''
  });

  // Hai state mới để quản lý việc ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Hàm kiểm tra độ mạnh của mật khẩu
  const validatePassword = (pass) => {
    if (pass.length > 0 && pass.length < 8) {
      return "Mật khẩu phải có ít nhất 8 ký tự.";
    }
    // Regex kiểm tra có ít nhất 1 chữ cái và 1 chữ số
    const hasLetter = /[a-zA-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    
    if (pass.length >= 8 && (!hasLetter || !hasNumber)) {
      return "Mật khẩu phải bao gồm cả chữ cái và chữ số.";
    }
    return ""; // Không có lỗi
  };

  // Hàm xử lý khi người dùng gõ vào các ô input
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Cập nhật dữ liệu
    setFormData({
      ...formData,
      [name]: value
    });

    // Kiểm tra lỗi ngay lúc người dùng đang gõ
    if (name === 'password') {
      const passError = validatePassword(value);
      setErrors(prev => ({ ...prev, password: passError }));
      
      // Nếu đã gõ xác nhận mật khẩu rồi thì kiểm tra lại luôn xem có khớp không
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: "Mật khẩu xác nhận không khớp." }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: "" }));
      }
    }

    if (name === 'confirmPassword') {
      if (value !== formData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: "Mật khẩu xác nhận không khớp." }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: "" }));
      }
    }
  };

  // Hàm xử lý khi bấm nút Đăng ký
  const handleSubmit = (e) => {
    e.preventDefault(); 
    
    // 1. Kiểm tra xem các trường có bị bỏ trống không 
    if (!formData.fullName || !formData.email || !formData.username || !formData.date_of_birth) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // 2. Kiểm tra lỗi mật khẩu
    const passError = validatePassword(formData.password);
    if (passError || formData.password !== formData.confirmPassword || !formData.password) {
      alert("Vui lòng kiểm tra lại thông tin mật khẩu!");
      return;
    }

    // 3. Thông báo thành công 
    alert("Đăng ký tài khoản thành công! Mời bạn đăng nhập.");

    // 4. Gọi lệnh chuyển về trang Đăng nhập
    onNavigateToLogin();
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#164e63] py-8">
      
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        
        {/* Tiêu đề */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-[#083344]">EngLearn</h1>
          <p className="text-gray-500 mt-2">Tạo tài khoản mới</p>
        </div>

        {/* Form nhập liệu */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-[#164e63] mb-1">Họ và tên đầy đủ</label>
            <input 
              type="text" name="fullName"
              value={formData.fullName} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0284c7] outline-none"
              placeholder="Ví dụ: Nguyễn Văn A" required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-900 mb-1">Ngày sinh</label>
            <input 
              type="date" 
              name="date_of_birth"          
              value={formData.date_of_birth} 
              onChange={handleChange}        
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#164e63] mb-1">Email</label>
            <input 
              type="email" name="email"
              value={formData.email} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0284c7] outline-none"
              placeholder="email@example.com" required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cyan-900 mb-1">Tên người dùng</label>
            <input 
              type="text" 
              name="username"         
              value={formData.username} 
              onChange={handleChange}   
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
              placeholder="Nhập tên người dùng..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#164e63] mb-1">Mật khẩu</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                value={formData.password} onChange={handleChange}
                className={`w-full pl-4 pr-12 py-2.5 rounded-lg border focus:ring-2 outline-none transition-all ${
                  errors.password ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-[#0284c7]'
                }`}
                placeholder="••••••••" required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#083344] focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center">
                <span className="mr-1">⚠️</span> {errors.password}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#164e63] mb-1">Xác nhận lại mật khẩu</label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                name="confirmPassword"
                value={formData.confirmPassword} onChange={handleChange}
                className={`w-full pl-4 pr-12 py-2.5 rounded-lg border focus:ring-2 outline-none transition-all ${
                  errors.confirmPassword ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-[#0284c7]'
                }`}
                placeholder="••••••••" required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#083344] focus:outline-none"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center">
                <span className="mr-1">⚠️</span> {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Nút bấm Đăng ký */}
          <div className="pt-2">
            <button 
              type="submit"
            className="w-full bg-[#0e7490] hover:bg-[#164e63] text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg"
            >
              Đăng ký ngay
            </button>
          </div>
        </form>

        {/* Phần footer chuyển trang */}
        <p className="text-center text-sm text-gray-900 mt-6">
          Đã có tài khoản? 
          {/* Nút bấm để chuyển về Đăng nhập */}
          <button 
            onClick={onNavigateToLogin} 
            className="text-[#0369a1] font-semibold hover:underline ml-1 focus:outline-none"
          >
            Đăng nhập
          </button>
        </p>

      </div>
    </div>
  );
}

export default RegisterPage;