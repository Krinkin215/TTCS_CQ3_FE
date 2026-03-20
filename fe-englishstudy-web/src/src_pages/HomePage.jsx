import React, { useState, useRef } from 'react';
import { 
  Home, Heart, Library, LayoutGrid, Gamepad2, Trophy, 
  ChevronLeft, ChevronRight, Zap, BookOpen, User, Flame,
  X, Mail, Calendar, Pencil, Download, LogOut, Cake, Camera, Save, ArrowLeft
} from 'lucide-react';
import FavoritePage from './FavoritePage';
import CollectionPage from './CollectionPage';

function HomePage({ onLogout }) {
  // State quản lý việc thu gọn/mở rộng Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [activeMenu, setActiveMenu] = useState('Trang chủ');

  // QUẢN LÝ DỮ LIỆU NGƯỜI DÙNG & CHẾ ĐỘ SỬA
  const [userData, setUserData] = useState({
    username: 'pmd1506',
    fullName: 'Phạm Minh Đức',
    email: 'pmducc1506@gmail.com',
    dob: '2004-06-15', 
    joinDate: '02/03/2026',
    avatarChar: 'P',
    avatarUrl: null
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState(userData);
  const handleOpenEdit = () => {
    setEditFormData(userData);
    setIsEditingProfile(true); 
  };
  const handleSaveProfile = () => {
    const firstChar = editFormData.fullName ? editFormData.fullName.charAt(0).toUpperCase() : 'U';
    setUserData({ ...editFormData, avatarChar: firstChar }); 
    setIsEditingProfile(false); 
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0]; 
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setEditFormData({ ...editFormData, avatarUrl: imageUrl });
    }
  };
  
  // Ref dùng để cuộn trang chủ và chủ đề
  const topicsRef = useRef(null);
  const mainRef = useRef(null);

  const scrollToTopics = () => {
    topicsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const scrollToTop = () => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // theo dõi vị trí cuộn trang
  const handleScroll = () => {
    if (!topicsRef.current) return;
    const topicsPosition = topicsRef.current.getBoundingClientRect().top;
    if (topicsPosition <= 250) {
      setActiveMenu('Chủ đề');
    } else {
      setActiveMenu('Trang chủ');
    }
  };

  const menuItems = [
    { 
      name: 'Trang chủ', 
      icon: <Home size={22} />, 
      active: activeMenu === 'Trang chủ', 
      onClick: () => { setActiveMenu('Trang chủ'); scrollToTop(); } 
    },
    { name: 'Yêu thích', icon: <Heart size={22} />, active: activeMenu === 'Yêu thích', onClick: () => setActiveMenu('Yêu thích') },
    { name: 'Bộ từ vựng', icon: <Library size={22} />, active: activeMenu === 'Bộ từ vựng', onClick: () => setActiveMenu('Bộ từ vựng') },
    { name: 'Từ vựng', icon: <BookOpen size={22} />, active: activeMenu === 'Từ vựng', onClick: () => setActiveMenu('Từ vựng') },
    
    { 
      name: 'Chủ đề', 
      icon: <LayoutGrid size={22} />, 
      active: activeMenu === 'Chủ đề', 
      onClick: () => { setActiveMenu('Chủ đề'); scrollToTopics(); } 
    },
    { name: 'Luyện tập', icon: <Gamepad2 size={22} />, active: activeMenu === 'Luyện tập', onClick: () => setActiveMenu('Luyện tập') },
    { name: 'Bảng xếp hạng', icon: <Trophy size={22} />, active: activeMenu === 'Bảng xếp hạng', onClick: () => setActiveMenu('Bảng xếp hạng') },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-gray-800">
      
      {/* SIDEBAR */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#083344] text-white transition-all duration-300 flex flex-col relative shadow-xl z-20`}
      >
        {/* Nút thu gọn / mở rộng */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-6 bg-[#0e7490] rounded-full p-1 text-white hover:bg-[#164e63] shadow-md"
        >
          {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        {/* Logo */}
        <div className="h-20 flex items-center justify-center font-extrabold text-2xl tracking-wide border-b border-[#164e63]">
          {isSidebarOpen ? <span className="text-white">Eng<span className="text-[#38bdf8]">Learn</span></span> : 'E'}
        </div>

        {/* Menu Items */}
        <div className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto">
          {menuItems.map((item, index) => (
            <button 
              key={index}
              onClick={item.onClick}
              className={`flex items-center p-3 rounded-xl transition-colors ${
                item.active 
                  ? 'bg-[#164e63] text-[#38bdf8] font-semibold' 
                  : 'text-gray-300 hover:bg-[#164e63] hover:text-white'
              } ${!isSidebarOpen && 'justify-center'}`}
              title={!isSidebarOpen ? item.name : ''}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {isSidebarOpen && <span className="ml-4 truncate">{item.name}</span>}
            </button>
          ))}
        </div>

        {/* User Profile */}
        {/* User Profile (Góc dưới trái) */}
        <div className="p-4 border-t border-[#164e63]">
          <div 
            className={`flex items-center cursor-pointer hover:bg-[#164e63] p-2 rounded-xl transition-colors ${!isSidebarOpen && 'justify-center'}`}
            onClick={() => setIsProfileModalOpen(true)}
          >
            <div className="w-10 h-10 rounded-full bg-[#0e7490] text-white flex items-center justify-center font-bold shadow-md overflow-hidden shrink-0">
              {userData.avatarUrl ? (
                <img src={userData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                userData.avatarChar
              )}
            </div>
            {isSidebarOpen && (
              <div className="ml-3 truncate">
                <p className="font-semibold text-sm truncate">{userData.fullName}</p>
                <p className="text-xs text-[#38bdf8]">Nhấn để xem hồ sơ</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* NỘI DUNG CHÍNH */}
      <main ref={mainRef} onScroll={handleScroll} className="flex-1 overflow-y-auto h-screen scroll-smooth">
        {/* CHỈ HIỆN KHI Ở TRANG CHỦ HOẶC CHỦ ĐỀ */}
        {(activeMenu === 'Trang chủ' || activeMenu === 'Chủ đề') && (
        <div className="max-w-7xl mx-auto p-8">
          
          {/* Top Header (Số từ vựng & Lửa) */}
          <div className="flex justify-end items-center mb-8 gap-4">
            <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md hover:scale-105 hover:bg-orange-50 transition-all cursor-pointer">
              <Flame className="text-orange-500 mr-2" size={20} />
              <span className="font-bold text-gray-700">2 Ngày</span>
            </div>
          </div>

          {/* 3 KHUNG LỚN ĐẦU TRANG */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* Khung 1: Ôn tập thông minh */}
            <div className="bg-gradient-to-br from-[#0e7490] to-[#164e63] rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between relative overflow-hidden group cursor-pointer">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2">Ôn tập thông minh</h3>
                <p className="text-[#bae6fd] text-sm leading-relaxed max-w-[80%]">AI đã chuẩn bị sẵn các từ vựng bạn sắp quên. Ôn tập ngay để nhớ lâu hơn!</p>
              </div>
              <button className="mt-6 bg-white text-[#0e7490] w-fit px-6 py-2.5 rounded-full font-bold shadow-md hover:scale-105 hover:shadow-xl transition-all z-10">
                Bắt đầu ôn tập
              </button>
              <Zap className="absolute -bottom-6 -right-6 text-white opacity-10 group-hover:scale-110 transition-transform duration-500" size={120} />
            </div>

            {/* Khung 2: Tổng hợp từ vựng */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col">
              <h3 className="text-lg font-bold text-[#083344] mb-4">Thống kê từ vựng</h3>
              <div className="grid grid-cols-2 gap-3 flex-1">
                
                <div className="bg-blue-50 rounded-xl p-3 flex flex-col items-center justify-center text-center hover:-translate-y-1 hover:shadow-md cursor-pointer transition-all">
                  <span className="text-blue-600 font-bold text-xl">120</span>
                  <span className="text-sm text-gray-500 font-medium mt-1">Tổng từ đã học</span>
                </div>
                
                <div className="bg-green-50 rounded-xl p-3 flex flex-col items-center justify-center text-center hover:-translate-y-1 hover:shadow-md cursor-pointer transition-all">
                  <span className="text-green-600 font-bold text-xl">85</span>
                  <span className="text-sm text-gray-500 font-medium mt-1">Đã thuộc (Mastered)</span>
                </div>
                
                <div className="bg-orange-50 rounded-xl p-3 flex flex-col items-center justify-center text-center hover:-translate-y-1 hover:shadow-md cursor-pointer transition-all">
                  <span className="text-orange-500 font-bold text-xl">35</span>
                  <span className="text-sm text-gray-500 font-medium mt-1 leading-tight">Chưa thuộc (Learning)</span>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center border border-gray-100 text-center hover:-translate-y-1 hover:shadow-md cursor-pointer transition-all">
                  <span className="text-gray-400 font-bold text-xl">500+</span>
                  <span className="text-sm text-gray-400 font-medium mt-1">Chưa học (New)</span>
                </div>
                
              </div>
            </div>

            {/* Khung 3: Chuỗi ngày học */}
            <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-center items-center">
              <h3 className="text-lg font-bold mb-1 opacity-90">CHUỖI NGÀY HỌC</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-6xl font-black">2</span>
                <span className="text-xl ml-2 font-medium opacity-90">ngày</span>
              </div>
              <div className="flex w-full justify-between px-2">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${idx === 3 || idx === 4 ? 'bg-white text-orange-500 shadow-md' : 'bg-white/20'}`}>
                      {idx === 3 || idx === 4 ? <Flame size={18} /> : ''}
                    </div>
                    <span className="text-xs font-medium opacity-80">{day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TRUY CẬP NHANH */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-[#083344] mb-4 text-center">Truy cập nhanh</h2>
            <div className="flex justify-center gap-4 flex-wrap">
              <button onClick={scrollToTopics} className="flex items-center px-6 py-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-[#0e7490] hover:shadow-md transition-all group min-w-[200px]">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
                  <BookOpen size={24} />
                </div>
                <div className="ml-4 text-left">
                  <p className="font-bold text-gray-800">Học bài</p>
                  <p className="text-xs text-gray-500">Khám phá chủ đề</p>
                </div>
              </button>

              <button className="flex items-center px-6 py-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-purple-500 hover:shadow-md transition-all group min-w-[200px]">
                <div className="bg-purple-100 p-3 rounded-full text-purple-600 group-hover:scale-110 transition-transform">
                  <Gamepad2 size={24} />
                </div>
                <div className="ml-4 text-left">
                  <p className="font-bold text-gray-800">Luyện tập</p>
                  <p className="text-xs text-gray-500">Flashcard & Game</p>
                </div>
              </button>

              <button className="flex items-center px-6 py-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-yellow-500 hover:shadow-md transition-all group min-w-[200px]">
                <div className="bg-yellow-100 p-3 rounded-full text-yellow-600 group-hover:scale-110 transition-transform">
                  <Trophy size={24} />
                </div>
                <div className="ml-4 text-left">
                  <p className="font-bold text-gray-800">Xếp hạng</p>
                  <p className="text-xs text-gray-500">Xem thành tích</p>
                </div>
              </button>
            </div>
          </div>

          {/* CHỦ ĐỀ HỌC (Topics) */}
          <div ref={topicsRef} className="pt-8">
            <h2 className="text-2xl font-bold text-[#083344] mb-6 border-b-2 border-gray-200 pb-2 inline-block">Chủ đề từ vựng</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card Chủ đề mẫu */}
              {[
                { title: 'Animals (Động vật)', vocab: 45, color: 'bg-green-100 text-green-700' },
                { title: 'Technology (Công nghệ)', vocab: 60, color: 'bg-blue-100 text-blue-700' },
                { title: 'Travel (Du lịch)', vocab: 35, color: 'bg-yellow-100 text-yellow-700' },
                { title: 'Business (Kinh doanh)', vocab: 80, color: 'bg-purple-100 text-purple-700' },
              ].map((topic, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl mb-4 ${topic.color}`}>
                    {topic.title.charAt(0)}
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">{topic.title}</h3>
                  <p className="text-sm text-gray-500">{topic.vocab} từ vựng</p>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-semibold text-[#0e7490] bg-[#0e7490]/10 px-2 py-1 rounded">Chưa học</span>
                    <button className="text-[#0e7490] hover:text-[#164e63]">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Không gian trống ở dưới để cuộn thoải mái */}
          <div className="h-40"></div>

        </div>
        )}

        {/* CHỈ HIỆN KHI BẤM VÀO MENU YÊU THÍCH */}
        {activeMenu === 'Yêu thích' && <FavoritePage />}

        {/* 👈 THÊM DÒNG NÀY ĐỂ HIỂN THỊ TRANG BỘ TỪ VỰNG */}
        {activeMenu === 'Bộ từ vựng' && <CollectionPage />}
        
      </main>
      {/* HỒ SƠ NGƯỜI DÙNG */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200 text-gray-800">
            
            {/* Nút X đóng Modal */}
            {!isEditingProfile && (
              <button onClick={() => setIsProfileModalOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors">
                <X size={24} />
              </button>
            )}

            {/* CHẾ ĐỘ SỬA HỒ SƠ */}
            {isEditingProfile ? (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center mb-6">
                  <button onClick={() => setIsEditingProfile(false)} className="text-gray-500 hover:text-gray-800 mr-3">
                    <ArrowLeft size={24} />
                  </button>
                  <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa hồ sơ</h2>
                </div>

                {/* Chỉnh sửa Avatar */}
                <div className="flex justify-center mb-6">
                  <div className="relative cursor-pointer group">
                    <div className="w-24 h-24 rounded-full bg-[#0e7490] text-white flex items-center justify-center text-4xl font-bold shadow-md border-4 border-white outline outline-2 outline-gray-100 group-hover:opacity-80 transition-opacity overflow-hidden">
                     
                      {editFormData.avatarUrl ? (
                        <img src={editFormData.avatarUrl} alt="Avatar preview" className="w-full h-full object-cover" />
                      ) : (
                        editFormData.avatarChar
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-gray-200 text-gray-600 group-hover:text-[#0e7490] transition-colors">
                      <Camera size={18} />
                    </div>
                    <input type="file" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                  </div>
                </div>

                {/* Các trường nhập liệu */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tên người dùng</label>
                    <input 
                      type="text" 
                      value={editFormData.username}
                      onChange={(e) => setEditFormData({...editFormData, username: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:border-[#0e7490] focus:ring-1 focus:ring-[#0e7490] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Họ và tên</label>
                    <input 
                      type="text" 
                      value={editFormData.fullName}
                      onChange={(e) => setEditFormData({...editFormData, fullName: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:border-[#0e7490] focus:ring-1 focus:ring-[#0e7490] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email</label>
                    <input 
                      type="email" 
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:border-[#0e7490] focus:ring-1 focus:ring-[#0e7490] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Ngày sinh</label>
                    <input 
                      type="date" 
                      value={editFormData.dob}
                      onChange={(e) => setEditFormData({...editFormData, dob: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:border-[#0e7490] focus:ring-1 focus:ring-[#0e7490] transition-all cursor-pointer"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleSaveProfile}
                  className="w-full bg-[#0e7490] hover:bg-[#164e63] text-white rounded-full py-3.5 font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  <Save size={20} /> Cập nhật hồ sơ
                </button>
              </div>
            ) : (

            /* CHẾ ĐỘ XEM HỒ SƠ */
              <div className="animate-in fade-in duration-300">
                <div className="flex flex-col items-center mt-2 mb-6">
                  <div className="w-24 h-24 rounded-full bg-[#0e7490] text-white flex items-center justify-center text-4xl font-bold mb-3 shadow-md border-4 border-white outline outline-2 outline-gray-100 overflow-hidden">
                    
                     {userData.avatarUrl ? (
                        <img src={userData.avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                      ) : (
                        userData.avatarChar
                      )}
                  </div>
                  <h2 className="text-2xl font-black text-[#083344] tracking-tight">{userData.username}</h2>
                  <p className="text-sm font-medium text-gray-500 mt-1">{userData.fullName}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3 flex flex-col items-center justify-center shadow-sm">
                    <div className="flex items-center text-orange-500 mb-1">
                      <Flame size={18} className="mr-1" />
                      <span className="text-xs font-bold uppercase tracking-wider">Chuỗi học</span>
                    </div>
                    <span className="text-xl font-black text-orange-600">2 ngày</span>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-3 flex flex-col items-center justify-center shadow-sm">
                    <div className="flex items-center text-yellow-600 mb-1">
                      <Trophy size={18} className="mr-1" />
                      <span className="text-xs font-bold uppercase tracking-wider">Tổng điểm</span>
                    </div>
                    <span className="text-xl font-black text-yellow-700">1,250 XP</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-gray-100 rounded-2xl p-4 mb-5 space-y-3 shadow-sm">
                  <div className="flex items-center text-gray-700">
                    <Mail size={16} className="text-[#0e7490] w-6" />
                    <span className="text-sm">Email: <span className="font-semibold text-gray-900 ml-1">{userData.email}</span></span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Cake size={16} className="text-[#0e7490] w-6" />
                    <span className="text-sm">Ngày sinh: <span className="font-semibold text-gray-900 ml-1">{userData.dob.split('-').reverse().join('/')}</span></span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Calendar size={16} className="text-[#0e7490] w-6" />
                    <span className="text-sm">Ngày tham gia: <span className="font-semibold text-gray-900 ml-1">{userData.joinDate}</span></span>
                  </div>
                </div>

                <button 
                  onClick={handleOpenEdit} 
                  className="w-full border border-gray-200 rounded-full py-3 mb-6 flex items-center justify-center gap-2 hover:bg-slate-50 font-semibold text-gray-700 transition-colors"
                >
                  <Pencil size={18} /> Chỉnh sửa hồ sơ
                </button>

                <div className="border-t border-gray-100 -mx-6 mb-4"></div>

                <button onClick={onLogout} className="w-full flex justify-end items-center gap-2 text-[#0ea5e9] hover:text-[#0284c7] font-bold">
                  <LogOut size={18} /> Đăng xuất
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
export default HomePage;