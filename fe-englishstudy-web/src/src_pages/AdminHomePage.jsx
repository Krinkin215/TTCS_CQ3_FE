import React, { useState } from 'react';
import { LayoutGrid, Users, BookOpen, BarChart3, LogOut, ShieldCheck, Bell, Library, Trophy } from 'lucide-react';
import LeaderboardPage from './LeaderboardPage';
import UserManagement from './UserManagement';
import AdminVocabManagement from './AdminVocabManagement';
import AdminTopicManagement from './AdminTopicManagement';

export default function AdminHomePage({ onLogout }) {
  const [timeFilter, setTimeFilter] = useState('week');
  const [activeTab, setActiveTab] = useState('dashboard');

  const chartData = {
    week: [
      { label: 'T2', subLabel: '13/04', value: 320 },
      { label: 'T3', subLabel: '14/04', value: 450 },
      { label: 'T4', subLabel: '15/04', value: 410 },
      { label: 'T5', subLabel: '16/04', value: 680 },
      { label: 'T6', subLabel: '17/04', value: 520 },
      { label: 'T7', subLabel: '18/04 (Nay)', value: 850 },
      { label: 'CN', subLabel: '19/04', value: 710 },
    ],
    month: [
      { label: 'Tuần 1', subLabel: '01/04 - 07/04', value: 2500 },
      { label: 'Tuần 2', subLabel: '08/04 - 14/04', value: 3200 },
      { label: 'Tuần 3', subLabel: '15/04 - 21/04', value: 3940 },
      { label: 'Tuần 4', subLabel: '22/04 - 28/04', value: 4100 },
      { label: 'Tuần 5', subLabel: '29/04 - 30/04', value: 1200 },
    ],
    year: [
      { label: 'Quý 1', subLabel: 'Th.1 - Th.3', value: 35000 },
      { label: 'Quý 2', subLabel: 'Th.4 - Th.6', value: 45940 },
      { label: 'Quý 3', subLabel: 'Th.7 - Th.9', value: 42000 },
      { label: 'Quý 4', subLabel: 'Th.10 - Th.12', value: 48000 },
    ]
  };

  const currentData = chartData[timeFilter];
  const maxLearningValue = Math.max(...currentData.map(d => d.value));
  const todayLearningCount = chartData.week.find(d => d.label === 'T7').value;

  const stats = [
    { label: 'Tổng người dùng', value: '1,284', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Từ vựng hệ thống', value: '15,400', icon: BookOpen, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: 'Lượt học hôm nay', value: todayLearningCount.toLocaleString(), icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const renderNavBtn = (id, icon, label) => {
    const Icon = icon;
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive ? 'bg-cyan-800 text-white shadow-md' : 'text-cyan-300 hover:bg-cyan-900'}`}
      >
        <Icon size={20} /> {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* sidebar */}
      <aside className="w-64 bg-cyan-950 text-white flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-cyan-900">
          <h1 className="text-2xl font-black">EngLearn <span className="text-xs bg-cyan-600 px-2 py-1 rounded ml-1">ADMIN</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {renderNavBtn('dashboard', LayoutGrid, 'Dashboard')}
          {renderNavBtn('users', Users, 'Quản lý User')}
          {renderNavBtn('vocabs', BookOpen, 'Quản lý Từ vựng')}
          {renderNavBtn('topics', Library, 'Quản lý Chủ đề')}
          {renderNavBtn('leaderboard', Trophy, 'Bảng xếp hạng')}
        </nav>
        <button onClick={onLogout} className="m-4 flex items-center gap-3 px-4 py-3 hover:bg-red-900/30 text-red-400 rounded-xl font-bold transition-colors">
          <LogOut size={20} /> Đăng xuất
        </button>
      </aside>

      {/* khu vực nội dung chính */}
      <main className="flex-1 overflow-y-auto">

        {/* 1. HIỂN THỊ DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="p-8">
            <header className="flex justify-between items-center mb-8">
              <div>
                <div className="flex items-center gap-2 text-cyan-700 mb-1">
                  <ShieldCheck size={18} />
                  <span className="font-bold text-sm uppercase tracking-wider">Hệ thống quản trị</span>
                </div>
                <h2 className="text-3xl font-black text-slate-900">Chào mừng quay trở lại, Admin!</h2>
                <p className="text-slate-500 font-medium">Đây là trang chủ dành riêng cho quản trị viên hệ thống.</p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}><stat.icon size={28} /></div>
                  <div><p className="text-sm font-bold text-slate-400 uppercase tracking-tight">{stat.label}</p><p className="text-3xl font-black text-slate-800">{stat.value}</p></div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Lưu lượng học tập</h3>
                  <p className="text-sm text-slate-400 font-medium mt-1">Số lượt học tập</p>
                </div>
                <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="bg-slate-50 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl focus:ring-cyan-500 focus:border-cyan-500 block p-2.5 outline-none cursor-pointer hover:bg-slate-100 transition-colors">
                  <option value="week">Tuần này</option><option value="month">Tháng này</option><option value="year">Năm nay</option>
                </select>
              </div>
              <div className="h-64 flex items-end gap-2 md:gap-4 lg:gap-6 pt-12 border-b border-slate-100 pb-2">
                {currentData.map((data, index) => {
                  const heightPercentage = (data.value / maxLearningValue) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group h-full justify-end cursor-pointer">
                      <div className="w-full max-w-[40px] bg-cyan-100 group-hover:bg-cyan-500 transition-all duration-300 rounded-t-xl relative flex justify-center" style={{ height: `${heightPercentage}%` }}>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-md pointer-events-none z-10">
                          {data.value} lượt<div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-col items-center text-center">
                        <span className="text-sm text-slate-700 font-bold group-hover:text-cyan-600 transition-colors">{data.label}</span>
                        <span className="text-[10px] md:text-xs text-slate-400 font-medium mt-0.5 whitespace-nowrap">{data.subLabel}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 2. HIỂN THỊ TRANG BẢNG XẾP HẠNG  */}
        {activeTab === 'leaderboard' && (
          <div className="bg-slate-50">
            <LeaderboardPage isAdmin={true} />
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-slate-50 h-full">
            <UserManagement />
          </div>
        )}

        {activeTab === 'vocabs' && (
          <div className="bg-slate-50 h-full">
            <AdminVocabManagement />
          </div>
        )}

        {activeTab === 'topics' && (
          <div className="bg-slate-50 h-full">
            <AdminTopicManagement />
          </div>
        )}

        {/* 3. CÁC TÍNH NĂNG CHƯA HOÀN THIỆN */}
        {[''].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center h-[80vh] text-slate-300">
            <Library size={80} className="mb-6 opacity-40" />
            <h2 className="text-2xl font-bold text-slate-400">Giao diện tính năng đang được phát triển...</h2>
          </div>
        )}

      </main>
    </div>
  );
}