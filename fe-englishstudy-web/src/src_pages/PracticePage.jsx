import React, { useState, useMemo, useEffect } from 'react';
import { 
  Gamepad2, BookOpen, Brain, Settings, HelpCircle, 
  History, BarChart2, Search, CheckSquare, X, Play, Clock, 
  RotateCcw, Target, Trophy, Flame, ChevronRight 
} from 'lucide-react';

const MOCK_COLLECTIONS = [
  { id: 1, name: 'Từ vựng TOEIC' }, { id: 2, name: 'Giao tiếp hàng ngày' }, { id: 3, name: 'Từ vựng của tôi' }
];
const MOCK_TOPICS = [
  { id: 1, name: 'Animals (Động vật)', lessons: [{id: 11, name: 'Pets', wordCount: 20, difficulty: 1}, {id: 12, name: 'Wild Animals', wordCount: 25, difficulty: 2}] },
  { id: 2, name: 'Technology (Công nghệ)', lessons: [{id: 21, name: 'Hardware', wordCount: 30, difficulty: 3}, {id: 22, name: 'Software', wordCount: 30, difficulty: 4}] }
];
const STATUS_OPTIONS = [
  { id: 'LEARNING', name: 'Đang học (Cam)' }, { id: 'MASTERED', name: 'Đã thuộc (Xanh)' }, { id: 'NEW', name: 'Chưa học' }
];

export default function PracticePage({ onBack, initialFilters }) {
  const [activeMode, setActiveMode] = useState('collection'); 
  const [activeTab, setActiveTab] = useState('history'); 
  const [showSettings, setShowSettings] = useState(false);
  const [instructionGame, setInstructionGame] = useState(null); 

  // Filter States

  // Filter States
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedLessons, setSelectedLessons] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [wordCount, setWordCount] = useState(20);

  // Settings State
  const [gameSettings, setGameSettings] = useState({
    timePerQuestion: 15,
    autoNext: true,
    autoNextDelay: 2
  });

  // Tự động tick chọn bộ lọc 
  useEffect(() => {
    if (initialFilters) {
      setActiveMode(initialFilters.mode);
      
      if (initialFilters.mode === 'collection') {
        setSelectedCollections([initialFilters.collectionId]);
        setSelectedTopics([]); setSelectedLessons([]);
      } else if (initialFilters.mode === 'topic') {
        setSelectedTopics([initialFilters.topicId]);
        setSelectedLessons([initialFilters.lessonId]);
        setSelectedCollections([]);
      } else if (initialFilters.mode === 'smart') {
        setSelectedCollections([]); setSelectedTopics([]); setSelectedLessons([]);
      }
      setSelectedStatuses([]); 
    }
  }, [initialFilters]);

  // Hộp chọn 
  const FilterBox = ({ title, options, selectedIds, onChange, placeholder }) => {
    const [search, setSearch] = useState('');
    const filtered = options.filter(o => o.name.toLowerCase().includes(search.toLowerCase()));
    const isAllSelected = filtered.length > 0 && filtered.every(o => selectedIds.includes(o.id));

    const toggleAll = () => {
      if (isAllSelected) {
        onChange(selectedIds.filter(id => !filtered.find(o => o.id === id)));
      } else {
        const newIds = [...new Set([...selectedIds, ...filtered.map(o => o.id)])];
        onChange(newIds);
      }
    };

    const toggleOne = (id) => {
      onChange(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id]);
    };

    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-64">
        <div className="p-3 bg-gray-50 border-b border-gray-100 font-bold text-cyan-900 shrink-0">{title}</div>
        <div className="p-2 shrink-0 border-b border-gray-100 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" placeholder={placeholder} value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
            <input type="checkbox" checked={isAllSelected} onChange={toggleAll} className="w-4 h-4 text-cyan-600 rounded" />
            <span className="text-sm font-bold text-gray-700">Chọn tất cả</span>
          </label>
          {filtered.map(opt => (
            <label key={opt.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
              <input type="checkbox" checked={selectedIds.includes(opt.id)} onChange={() => toggleOne(opt.id)} className="w-4 h-4 text-cyan-600 rounded" />
              <span className="text-sm text-gray-600">{opt.name}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  // Tính toán Lesson khả dụng dựa trên Topic đã chọn
  const availableLessons = useMemo(() => {
    return MOCK_TOPICS.filter(t => selectedTopics.includes(t.id)).flatMap(t => t.lessons);
  }, [selectedTopics]);

  // Tính toán số lượng từ sẵn sàng dựa trên bộ lọc
  const availableCount = useMemo(() => {
    let total = 0;
    if (activeMode === 'collection') {
      const selected = MOCK_COLLECTIONS.filter(c => selectedCollections.includes(c.id));
      total = selected.reduce((sum, c) => sum + (c.wordCount || 50), 0);
    } else if (activeMode === 'topic') {
      const selected = availableLessons.filter(l => selectedLessons.includes(l.id));
      total = selected.reduce((sum, l) => sum + (l.wordCount || 20), 0);
    } else {
      total = 100;
    }
    if (selectedStatuses.length > 0 && selectedStatuses.length < 3) {
      total = Math.floor(total * (selectedStatuses.length / 3));
    }
    return total;
  }, [activeMode, selectedCollections, selectedLessons, selectedStatuses, availableLessons]);

  // 👋 THÊM MỚI: Tính độ khó trung bình của các từ đang chọn (Mặc định là 3 nếu không rõ)
  const avgDifficulty = useMemo(() => {
    if (activeMode === 'topic' && selectedLessons.length > 0) {
      const selectedL = availableLessons.filter(l => selectedLessons.includes(l.id));
      const totalDiff = selectedL.reduce((sum, l) => sum + (l.difficulty || 3), 0);
      return totalDiff / selectedL.length;
    }
    return 3; 
  }, [activeMode, selectedLessons, availableLessons]);

  useEffect(() => {
    if (activeMode === 'topic' && selectedLessons.length === 1) {
      setWordCount(availableCount);
    } else if (wordCount > availableCount && availableCount >= 20) {
      setWordCount(availableCount);
    }
  }, [availableCount, activeMode, selectedLessons.length]);

  // Thuật toán tính Điểm Động
  const getDynamicPoints = (baseModifier) => {
    const timeBonus = (30 - gameSettings.timePerQuestion) * 0.5;
    const diffBonus = avgDifficulty * 2;
    const rawScore = baseModifier * (10 + diffBonus + timeBonus);
    return Math.round(rawScore);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 pb-20">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-cyan-950 flex items-center gap-3">
              <Gamepad2 className="text-[#0e7490]" size={32} /> Khu vực Luyện tập
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Tùy chỉnh bộ lọc và chọn game để bắt đầu ôn tập.</p>
          </div>
          {onBack && (
            <button onClick={onBack} className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg font-bold hover:bg-gray-50 transition-colors">
              Trở về
            </button>
          )}
        </div>

        {/* 1. CHỌN CHẾ ĐỘ */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex gap-2">
          {[
            { id: 'collection', icon: BookOpen, label: 'Bộ từ vựng' },
            { id: 'topic', icon: CheckSquare, label: 'Chủ đề' },
            { id: 'smart', icon: Brain, label: 'Ôn tập thông minh' }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                activeMode === mode.id ? 'bg-cyan-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <mode.icon size={20} /> {mode.label}
            </button>
          ))}
        </div>

        {/* 2. KHUNG BỘ LỌC */}
        {activeMode !== 'smart' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-cyan-950 mb-4">Thiết lập dữ liệu học</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeMode === 'collection' ? (
                <>
                  <FilterBox title="Chọn Bộ từ vựng" options={MOCK_COLLECTIONS} selectedIds={selectedCollections} onChange={setSelectedCollections} placeholder="Tìm bộ từ..." />
                  <FilterBox title="Trạng thái từ vựng" options={STATUS_OPTIONS} selectedIds={selectedStatuses} onChange={setSelectedStatuses} placeholder="Tìm trạng thái..." />
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 flex flex-col justify-center items-center">
                    <label className="font-bold text-cyan-900 mb-4">Số lượng từ muốn ôn (Tối thiểu 20)</label>
                    <input 
                      type="number" min="20" max={availableCount} value={wordCount} 
                      onChange={e => {
                        const val = parseInt(e.target.value);
                        setWordCount(val > availableCount ? availableCount : val);
                      }}
                      className="w-32 text-center text-3xl font-black text-cyan-700 bg-white border-2 border-cyan-200 rounded-xl py-3 focus:border-cyan-500 outline-none"
                    />
                    <p className="text-[10px] text-gray-400 mt-2 italic">Tối đa: {availableCount} từ</p>
                  </div>
                </>
              ) : (
                <>
                  <FilterBox title="Chọn Chủ đề" options={MOCK_TOPICS} selectedIds={selectedTopics} onChange={setSelectedTopics} placeholder="Tìm chủ đề..." />
                  <FilterBox title="Chọn Bài học" options={availableLessons} selectedIds={selectedLessons} onChange={setSelectedLessons} placeholder="Tìm bài học..." />
                  <div className="space-y-6">
                    <FilterBox title="Trạng thái từ vựng" options={STATUS_OPTIONS} selectedIds={selectedStatuses} onChange={setSelectedStatuses} placeholder="Tìm trạng thái..." />
                  </div>
                </>
              )}
            </div>
            
            {activeMode === 'topic' && (
              <div className="mt-6 flex items-center justify-between bg-cyan-50 p-4 rounded-xl border border-cyan-100">
                 <span className="font-bold text-cyan-800">Số lượng từ vựng cần chọn:</span>
                 {selectedLessons.length === 1 ? (
                   <span className="px-4 py-1.5 bg-white rounded-lg font-bold text-gray-600 border border-cyan-200 shadow-sm">
                     Cố định theo bài học ({availableCount} từ)
                   </span>
                 ) : (
                   <div className="flex items-center gap-3">
                     <span className="text-sm text-cyan-700">Tùy chỉnh:</span>
                     <input 
                       type="number" min="20" max={availableCount} 
                       value={wordCount} 
                       onChange={e => {
                         const val = parseInt(e.target.value);
                         setWordCount(val > availableCount ? availableCount : val);
                       }} 
                       className="w-24 px-3 py-1.5 rounded-lg border border-cyan-200 outline-none text-center font-bold" 
                     />
                   </div>
                 )}
              </div>
            )}
          </div>
        )}

        {/* 3. CHỌN GAME */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-black text-cyan-950">Chọn Game</h2>
              <button onClick={() => setShowSettings(true)} className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-full transition-colors" title="Cài đặt Game">
                <Settings size={22} />
              </button>
            </div>
            <div className="px-4 py-2 bg-[#84cc16]/10 text-[#65a30d] rounded-xl font-bold border border-[#84cc16]/20 transition-all">
              Sẵn sàng: {availableCount} từ vựng
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Game Cards */}
            {[
              { id: 'quiz', name: 'Trắc nghiệm', icon: CheckSquare, color: 'bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-500', baseModifier: 1 },
              { id: 'match', name: 'Nối từ', icon: Gamepad2, color: 'bg-purple-50 text-purple-600 border-purple-200 hover:border-purple-500', baseModifier: 1.2 },
              { id: 'listen', name: 'Nghe - Viết', icon: () => <div className="font-bold text-2xl">🎧</div>, color: 'bg-orange-50 text-orange-600 border-orange-200 hover:border-orange-500', baseModifier: 1.5 }
            ].map(game => (
              <div key={game.id} className={`relative flex flex-col items-center p-8 rounded-2xl border-2 transition-all cursor-pointer group ${game.color} hover:-translate-y-1 hover:shadow-xl`}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setInstructionGame(game); }}
                  className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-cyan-600 bg-white rounded-full shadow-sm z-10" 
                  title="Hướng dẫn chơi"
                >
                  <HelpCircle size={20} />
                </button>
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  {typeof game.icon === 'function' ? <game.icon /> : <game.icon size={40} />}
                </div>
                <h3 className="text-xl font-black mb-6">{game.name}</h3>
                
                <span className="mt-auto px-4 py-1.5 bg-white/60 rounded-lg text-sm font-bold backdrop-blur-sm border border-white transition-all">
                  +{getDynamicPoints(game.baseModifier)} điểm / câu
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. LỊCH SỬ & THỐNG KÊ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button onClick={() => setActiveTab('history')} className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold text-lg transition-colors ${activeTab === 'history' ? 'border-b-2 border-cyan-600 text-cyan-700 bg-cyan-50/30' : 'text-gray-500 hover:bg-gray-50'}`}>
              <History size={20} /> Lịch sử chơi
            </button>
            <button onClick={() => setActiveTab('stats')} className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold text-lg transition-colors ${activeTab === 'stats' ? 'border-b-2 border-cyan-600 text-cyan-700 bg-cyan-50/30' : 'text-gray-500 hover:bg-gray-50'}`}>
              <BarChart2 size={20} /> Thống kê
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'history' ? (
              <div className="space-y-4">
                {/* Lịch sử List */}
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><CheckSquare size={24}/></div>
                      <div>
                        <h4 className="font-bold text-cyan-950">Trắc nghiệm từ vựng</h4>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1"><Clock size={12}/> 14:30 - 14:45 (Hôm nay)</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                       <div className="text-center">
                         <div className="text-sm font-bold text-green-600">18 Đúng</div>
                         <div className="text-sm font-bold text-red-500">2 Sai</div>
                       </div>
                       <div className="w-px h-8 bg-gray-200"></div>
                       <div className="text-center w-20">
                         <div className="text-xs text-gray-500 uppercase font-bold">Điểm</div>
                         <div className="text-lg font-black text-yellow-600">+180</div>
                       </div>
                       <button className="px-4 py-2 bg-white border border-gray-200 text-cyan-700 font-bold rounded-lg hover:bg-cyan-50 transition-colors text-sm">
                         Chi tiết
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {/* Thống kê Tổng quan */}
                <div className="grid grid-cols-4 gap-6">
                  {[
                    { label: 'Số lượt chơi', value: '42', icon: Play, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Độ chính xác', value: '85%', icon: Target, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Tổng điểm', value: '4,520', icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                    { label: 'Kỷ lục cao nhất', value: '450', icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50' }
                  ].map((stat, i) => (
                    <div key={i} className="p-5 border border-gray-100 rounded-2xl bg-white shadow-sm flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
                        <stat.icon size={24} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-400">{stat.label}</div>
                        <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Thống kê theo Game */}
                <div>
                  <h3 className="font-bold text-lg text-cyan-900 mb-4">Chi tiết theo Trò chơi</h3>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-y border-gray-200 text-gray-500 text-sm">
                        <th className="py-3 px-4 font-bold">Trò chơi</th>
                        <th className="py-3 px-4 font-bold text-center">Số lượt</th>
                        <th className="py-3 px-4 font-bold text-center">Độ chính xác</th>
                        <th className="py-3 px-4 font-bold text-center">Tổng điểm</th>
                        <th className="py-3 px-4 font-bold text-center">Điểm cao nhất</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="py-4 px-4 font-bold text-cyan-900 flex items-center gap-2"><CheckSquare size={18} className="text-blue-500"/> Trắc nghiệm</td>
                        <td className="py-4 px-4 text-center font-medium">25</td>
                        <td className="py-4 px-4 text-center font-bold text-green-600">88%</td>
                        <td className="py-4 px-4 text-center font-bold text-yellow-600">2,500</td>
                        <td className="py-4 px-4 text-center font-bold text-orange-500">250</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MODAL CÀI ĐẶT GAME */}
      {showSettings && (
        <div className="fixed inset-0 bg-cyan-950/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-cyan-50/50">
              <h3 className="font-black text-xl text-cyan-900 flex items-center gap-2"><Settings size={22}/> Cài đặt Game</h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="flex justify-between font-bold text-gray-700 mb-2">
                  <span>Thời gian mỗi câu (giây)</span> <span className="text-cyan-600">{gameSettings.timePerQuestion}s</span>
                </label>
                <input type="range" min="5" max="30" step="1" value={gameSettings.timePerQuestion} onChange={e => setGameSettings({...gameSettings, timePerQuestion: e.target.value})} className="w-full accent-cyan-600"/>
              </div>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-bold text-gray-700">Tự động chuyển câu (Khi đúng)</span>
                <input type="checkbox" checked={gameSettings.autoNext} onChange={e => setGameSettings({...gameSettings, autoNext: e.target.checked})} className="w-5 h-5 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500 cursor-pointer"/>
              </label>

              {gameSettings.autoNext && (
                <div className="pl-4 border-l-2 border-cyan-200">
                  <label className="flex justify-between font-bold text-gray-600 mb-2 text-sm">
                    <span>Thời gian chờ chuyển (giây)</span> <span className="text-cyan-600">{gameSettings.autoNextDelay}s</span>
                  </label>
                  <input type="range" min="0" max="5" step="0.5" value={gameSettings.autoNextDelay} onChange={e => setGameSettings({...gameSettings, autoNextDelay: e.target.value})} className="w-full accent-cyan-500"/>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowSettings(false)} className="px-5 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-xl">Hủy</button>
              <button onClick={() => setShowSettings(false)} className="px-6 py-2 bg-cyan-600 text-white font-bold hover:bg-cyan-700 rounded-xl shadow-md">Lưu cài đặt</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HƯỚNG DẪN TRÒ CHƠI */}
      {instructionGame && (
        <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-20 h-20 bg-cyan-50 text-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md text-3xl">
                {instructionGame.id === 'quiz' ? '📝' : instructionGame.id === 'match' ? '🧩' : '🎧'}
              </div>
              <h3 className="text-2xl font-black text-cyan-950 mb-4">Cách chơi: {instructionGame.name}</h3>
              <div className="text-left space-y-4 text-gray-600 font-medium">
                {instructionGame.id === 'quiz' && (
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Hệ thống sẽ đưa ra một từ tiếng Anh/Nghĩa.</li>
                    <li>Bạn có 4 đáp án để lựa chọn.</li>
                    <li>Chọn đáp án đúng nhất trong thời gian quy định.</li>
                  </ul>
                )}
                {instructionGame.id === 'match' && (
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Nối các cặp Từ tiếng Anh và Nghĩa tiếng Việt tương ứng.</li>
                    <li>Lần lượt click vào 2 ô để ghép cặp.</li>
                    <li>Ghép đúng toàn bộ trong thời gian ngắn nhất để đạt điểm cao.</li>
                  </ul>
                )}
                {instructionGame.id === 'listen' && (
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Nghe âm thanh phát ra của từ vựng.</li>
                    <li>Nhập chính xác từ bạn nghe được vào ô trống.</li>
                    <li>Gợi ý sẽ xuất hiện nếu bạn nhập sai nhiều lần.</li>
                  </ul>
                )}
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
              <button onClick={() => setInstructionGame(null)} className="px-10 py-3 bg-cyan-600 text-white font-bold rounded-2xl hover:bg-cyan-700 shadow-lg transition-all">
                Đã rõ!
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}