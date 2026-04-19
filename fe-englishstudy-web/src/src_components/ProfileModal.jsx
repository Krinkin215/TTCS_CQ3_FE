import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, Camera, Flame, Trophy, Mail, Cake, Calendar, LogOut, Settings, Save } from 'lucide-react';

export default function ProfileModal({
  isOpen,
  onClose,
  user,
  isEditable = false,
  onSave,
  onLogout
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (user) setFormData(user);
    if (!isOpen) setIsEditing(false); // Reset on close
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData({ ...formData, avatarUrl: url });
    }
  };

  const handleSaveClick = () => {
    if (onSave) onSave(formData);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-[999] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 text-gray-800">
        
        {/* Nút X đóng Modal */}
        {!isEditing && (
          <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors">
            <X size={24} />
          </button>
        )}

        {isEditing ? (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center mb-6">
              <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-800 mr-3">
                <ArrowLeft size={24} />
              </button>
              <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa hồ sơ</h2>
            </div>

            <div className="flex justify-center mb-6">
              <div className="relative cursor-pointer group">
                <div className="w-24 h-24 rounded-full bg-cyan-600 text-white flex items-center justify-center text-4xl font-bold shadow-md border-4 border-white outline outline-2 outline-gray-100 group-hover:opacity-80 transition-opacity overflow-hidden">
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    formData.avatarChar || formData.username?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <div className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-gray-200 text-gray-600 group-hover:text-cyan-600 transition-colors">
                  <Camera size={18} />
                </div>
                <input type="file" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tên người dùng</label>
                <input 
                  type="text" 
                  value={formData.username || ''}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Họ và tên</label>
                <input 
                  type="text" 
                  value={formData.fullName || ''}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email</label>
                <input 
                  type="email" 
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Ngày sinh</label>
                <input 
                  type="date" 
                  value={formData.date_of_birth || ''}
                  onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all cursor-pointer"
                />
              </div>
            </div>

            <button 
              onClick={handleSaveClick}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white rounded-full py-3.5 font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <Save size={20} /> Cập nhật hồ sơ
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col items-center mt-2 mb-6">
              <div className="w-24 h-24 rounded-full bg-cyan-600 text-white flex items-center justify-center text-4xl font-bold mb-3 shadow-md border-4 border-white outline outline-2 outline-gray-100 overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                ) : (
                  user.avatarChar || user.username?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{user.username}</h2>
              <p className="text-sm font-medium text-gray-500 mt-1">{user.fullName || user.username}</p>
            </div>

            {/* Streak & XP */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3 flex flex-col items-center justify-center shadow-sm">
                <div className="flex items-center text-orange-500 mb-1">
                  <Flame size={18} className="mr-1" />
                  <span className="text-xs font-bold uppercase tracking-wider">Chuỗi học</span>
                </div>
                <span className="text-xl font-black text-orange-600">{user.streak || 2} ngày</span>
              </div>
              <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-3 flex flex-col items-center justify-center shadow-sm">
                <div className="flex items-center text-yellow-600 mb-1">
                  <Trophy size={18} className="mr-1" />
                  <span className="text-xs font-bold uppercase tracking-wider">Tổng điểm</span>
                </div>
                <span className="text-xl font-black text-yellow-700">{user.xp || '1,250'} XP</span>
              </div>
            </div>

            {/* Thông tin chi tiết */}
            <div className="bg-slate-50 border border-gray-100 rounded-2xl p-4 mb-5 space-y-3 shadow-sm">
              <div className="flex items-center text-gray-700">
                <Mail size={16} className="text-cyan-600 w-6" />
                <span className="text-sm">Email: <span className="font-semibold text-gray-900 ml-1">{user.email || 'Chưa cập nhật'}</span></span>
              </div>
              <div className="flex items-center text-gray-700">
                <Cake size={16} className="text-cyan-600 w-6" />
                <span className="text-sm">Ngày sinh: <span className="font-semibold text-gray-900 ml-1">{user.date_of_birth || 'Chưa cập nhật'}</span></span>
              </div>
              <div className="flex items-center text-gray-700">
                <Calendar size={16} className="text-cyan-600 w-6" />
                <span className="text-sm">Ngày tham gia: <span className="font-semibold text-gray-900 ml-1">{user.join_date || 'Chưa cập nhật'}</span></span>
              </div>
            </div>

            {/* Nút hành động */}
            {isEditable && (
              <div className="space-y-3">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-full py-3.5 font-bold flex items-center justify-center gap-2 transition-colors border border-cyan-100"
                >
                  <Settings size={20} /> Chỉnh sửa hồ sơ
                </button>
                
                <button 
                  onClick={onLogout}
                  className="w-full bg-white hover:bg-red-50 text-red-500 rounded-full py-3.5 font-bold flex items-center justify-center gap-2 transition-colors border border-gray-200"
                >
                  <LogOut size={20} /> Đăng xuất
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
