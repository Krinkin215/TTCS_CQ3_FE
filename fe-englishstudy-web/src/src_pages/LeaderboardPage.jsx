import React, { useState, useMemo } from 'react';
import { Trophy, Flame, Medal, Award, Crown, Star } from 'lucide-react';

const CURRENT_USER_ID = 5;

const generateMockUsers = () => {
  const users = Array.from({ length: 50 }).map((_, i) => ({
    id: i + 1,
    username: i + 1 === CURRENT_USER_ID ? 'Phạm Minh Đức (Bạn)' : `Người dùng ${i + 1}`,
    email: i + 1 === CURRENT_USER_ID ? 'pmducc1506@gmail.com' : `user${i + 1}@student.ptit.edu.vn`,
    avatarUrl: `https://i.pravatar.cc/150?u=${i + 10}`,
    totalScore: Math.floor(Math.random() * 15000) + 500,
    streak: Math.floor(Math.random() * 120) + 1,
    isCurrentUser: i + 1 === CURRENT_USER_ID
  }));
  return users;
};

const MOCK_DATA = generateMockUsers();

function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState('day'); 
  const [sortBy, setSortBy] = useState('score'); 

  // SẮP XẾP VÀ XẾP HẠNG
  const rankedUsers = useMemo(() => {
    let sorted = [...MOCK_DATA];

    // Ở đây nếu có API thật, bộ lọc thời gian sẽ được gọi ở Backend. 
    // Tạm thời trên UI ta xáo trộn nhẹ điểm số để thấy sự thay đổi khi bấm filter
    if (timeFilter !== 'all') {
       sorted = sorted.map(u => ({ ...u, totalScore: Math.floor(u.totalScore * Math.random()), streak: Math.floor(u.streak * Math.random()) }));
    }

    // Sắp xếp theo Tiêu chí
    sorted.sort((a, b) => {
      if (sortBy === 'score') return b.totalScore - a.totalScore;
      return b.streak - a.streak;
    });

    // Gán hạng (Rank)
    return sorted.map((user, index) => ({ ...user, rank: index + 1 }));
  }, [timeFilter, sortBy]);

  const top3 = rankedUsers.slice(0, 3);
  const remainingUsers = rankedUsers.slice(3, 100); 
  const currentUserRankInfo = rankedUsers.find(u => u.isCurrentUser);
  const isOutsideTop100 = currentUserRankInfo && currentUserRankInfo.rank > 100;

  // Bục vinh danh (Top 3)
  const PodiumCard = ({ user, position }) => {
    if (!user) return null;
    
    const isFirst = position === 1;
    const isSecond = position === 2;
    
    const height = isFirst ? 'h-56' : isSecond ? 'h-48' : 'h-40';
    const bgColor = isFirst ? 'bg-gradient-to-t from-yellow-200 to-yellow-50 border-yellow-300' 
                  : isSecond ? 'bg-gradient-to-t from-gray-200 to-gray-50 border-gray-300' 
                  : 'bg-gradient-to-t from-orange-200 to-orange-50 border-orange-300';
    
    return (
      <div className={`flex flex-col items-center justify-end ${isFirst ? 'z-10 -mx-4' : 'z-0'} w-1/3 max-w-[190px]`}>
        <div className="relative mb-6 flex flex-col items-center">
          {isFirst && <Crown className="absolute -top-8 text-yellow-500 fill-yellow-500 animate-bounce" size={32} />}
          <img 
            src={user.avatarUrl} 
            alt={user.username} 
            className={`rounded-full object-cover border-4 shadow-md ${isFirst ? 'w-24 h-24 border-yellow-400' : 'w-20 h-20 border-gray-300'}`}
          />
          <div className={`absolute -bottom-3 w-8 h-8 rounded-full flex items-center justify-center font-black text-white shadow-lg ${isFirst ? 'bg-yellow-500' : isSecond ? 'bg-gray-400' : 'bg-orange-500'}`}>
            {user.rank}
          </div>
        </div>
        
        <div className={`w-full ${height} ${bgColor} border rounded-t-2xl shadow-lg flex flex-col items-center p-4 text-center transition-all hover:-translate-y-2`}>
          <h3 className={`font-bold truncate w-full mt-2 ${isFirst ? 'text-lg text-yellow-900' : 'text-base text-gray-800'}`}>
            {user.username}
          </h3>
          
          <div className="mt-auto w-full flex flex-col gap-1.5 items-center border-t border-black/10 pt-2.5">
            
            {/* 1. Hiển thị Tổng Điểm */}
            <div className={`flex items-center gap-1.5 w-full justify-center px-2 py-1 rounded-lg ${sortBy === 'score' ? 'bg-yellow-500/15' : ''}`}>
              <Trophy size={sortBy === 'score' ? 18 : 14} className={sortBy === 'score' ? 'text-yellow-600' : 'text-gray-400'} />
              <span className={`font-black ${sortBy === 'score' ? 'text-xl text-yellow-700' : 'text-sm text-gray-500'}`}>
                {user.totalScore.toLocaleString()}
              </span>
              {sortBy === 'score' && <span className="text-xs text-yellow-600 font-bold">điểm</span>}
            </div>

            {/* 2. Hiển thị Streak Lửa */}
            <div className={`flex items-center gap-1.5 w-full justify-center px-2 py-1 rounded-lg ${sortBy === 'streak' ? 'bg-orange-500/15' : ''}`}>
              <Flame size={sortBy === 'streak' ? 18 : 14} className={sortBy === 'streak' ? 'text-orange-500' : 'text-gray-400'} />
              <span className={`font-black ${sortBy === 'streak' ? 'text-xl text-orange-600' : 'text-sm text-gray-500'}`}>
                {user.streak}
              </span>
              {sortBy === 'streak' && <span className="text-xs text-orange-500 font-bold">ngày</span>}
            </div>

          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen flex flex-col">
      
      {/* KHU VỰC ĐIỀU KHIỂN */}
      <div className="flex flex-col items-center mb-10 space-y-6">
        
        {/* Tiêu đề & Bộ lọc Thời gian */}
        <div className="w-full flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-cyan-950">Bảng xếp hạng</h1>
            <p className="text-gray-500 mt-1 font-medium">Vinh danh những cá nhân xuất sắc nhất</p>
          </div>

          <div className="flex bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
            {[
              { id: 'day', label: 'Ngày' },
              { id: 'week', label: 'Tuần' },
              { id: 'month', label: 'Tháng' },
              { id: 'year', label: 'Năm' },
              { id: 'all', label: 'Tất cả' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTimeFilter(tab.id)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                  timeFilter === tab.id 
                    ? 'bg-cyan-600 text-white shadow-md' 
                    : 'text-gray-500 hover:text-cyan-700 hover:bg-cyan-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Nút Toggle Chuyển đổi Xếp hạng */}
        <div className="flex bg-gray-100 p-1.5 rounded-2xl w-[400px] shadow-inner relative border border-gray-200">
          <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-md transition-all duration-300 ease-in-out ${sortBy === 'score' ? 'left-1.5' : 'left-[calc(50%+4.5px)]'}`}></div>
          
          <button 
            onClick={() => setSortBy('score')}
            className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl text-sm font-black z-10 transition-colors ${sortBy === 'score' ? 'text-yellow-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Trophy size={18} className={sortBy === 'score' ? 'animate-pulse' : ''} /> TỔNG ĐIỂM
          </button>
          
          <button 
            onClick={() => setSortBy('streak')}
            className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl text-sm font-black z-10 transition-colors ${sortBy === 'streak' ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Flame size={18} className={sortBy === 'streak' ? 'animate-pulse' : ''}/> STREAK
          </button>
        </div>
      </div>

      {/* BỤC VINH DANH */}
      <div className="flex justify-center items-end gap-2 mb-8 max-w-4xl mx-auto w-full pt-16 relative z-0">
        <PodiumCard user={top3[1]} position={2} /> 
        <PodiumCard user={top3[0]} position={1} /> 
        <PodiumCard user={top3[2]} position={3} /> 
      </div>

      {/* DANH SÁCH XẾP HẠNG */}
      <div className="max-w-4xl mx-auto w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-1 max-h-[500px] relative">
        
        {/* Header của Bảng */}
        <div className="flex items-center px-6 py-4 bg-cyan-50 border-b border-cyan-100 text-xs font-extrabold text-cyan-900 uppercase tracking-wider sticky top-0 z-30">
          <div className="w-16 text-center">Hạng</div>
          <div className="flex-1 pl-4">Người dùng</div>
          
          {/* Cột 3: Sẽ là cột không được chọn  */}
          <div className={`w-32 text-center ${sortBy === 'score' ? 'text-gray-400' : ''}`}>
            {sortBy === 'score' ? 'Streak' : 'Tổng điểm'}
          </div>
          
          {/* Cột 4: Nằm ngoài cùng, là cột đang được chọn */}
          <div className={`w-32 text-center ${sortBy === 'score' ? 'text-yellow-600' : 'text-orange-500'}`}>
            {sortBy === 'score' ? 'Tổng điểm' : 'Streak'}
          </div>
        </div>

        {/* Khung cuộn chứa danh sách */}
        <div className="overflow-y-auto flex-1 scrollbar-thin scroll-smooth relative">
          {remainingUsers.map((user) => (
            <div 
              key={user.id} 
              className={`flex items-center px-6 py-3 transition-colors ${
                user.isCurrentUser 
                  ? 'bg-white sticky top-0 bottom-0 z-20 border-y-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'bg-white hover:bg-gray-50 border-b border-gray-50'
              }`}
            >
              <div className="w-16 flex justify-center">
                <span className={`font-black text-lg ${user.isCurrentUser ? 'text-cyan-700' : 'text-gray-400'}`}>
                  {user.rank}
                </span>
              </div>
              
              <div className="flex-1 flex items-center gap-4 pl-4">
                <img src={user.avatarUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                <div className="flex flex-col">
                  <span className={`font-bold ${user.isCurrentUser ? 'text-cyan-900' : 'text-gray-800'}`}>
                    {user.username}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">{user.email}</span>
                </div>
              </div>

              {/* Cột Dữ liệu 1 */}
              <div className="w-32 text-center text-sm font-bold text-gray-400 flex items-center justify-center gap-1.5">
                {sortBy === 'score' ? (
                  <>{user.streak} <Flame size={14} /></>
                ) : (
                  <>{user.totalScore.toLocaleString()} <Trophy size={14}/></>
                )}
              </div>

              {/* Cột Dữ liệu 2 */}
              <div className={`w-32 text-center font-black text-base flex items-center justify-center gap-1.5 ${
                sortBy === 'score' ? 'text-yellow-600 bg-yellow-50/50 py-1 rounded-lg' : 'text-orange-500 bg-orange-50/50 py-1 rounded-lg'
              }`}>
                {sortBy === 'score' ? (
                  <>{user.totalScore.toLocaleString()} <Trophy size={16} fill="currentColor" className="text-yellow-500"/></>
                ) : (
                  <>{user.streak} <Flame size={16} fill="currentColor" className="text-orange-400"/></>
                )}
              </div>
            </div>
          ))}
          {isOutsideTop100 && (
            <div className="py-12 bg-white" /> 
          )}
        </div>
      </div>
      
    </div>
  );
}

export default LeaderboardPage;