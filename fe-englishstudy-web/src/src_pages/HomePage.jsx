import React, { useState, useRef } from 'react';
import { 
  Home, Heart, Library, LayoutGrid, Gamepad2, Trophy, 
  ChevronLeft, ChevronRight, Zap, BookOpen, User, Flame, ChevronDown, ChevronsUpDown,
  X, Mail, Calendar, Pencil, Download, LogOut, Cake, Camera, Save, ArrowLeft,
  Eye, MoreVertical, FolderPlus, Search 
} from 'lucide-react';
import ProfileModal from '../src_components/ProfileModal';
import FavoritePage from './FavoritePage';
import CollectionPage from './CollectionPage';
import VocabularyPage from './VocabularyPage';
import LeaderboardPage from './LeaderboardPage';
import PracticePage from './PracticePage'; 
import VocabTable from '../src_components/VocabTable';
import AddToCollectionModal from '../src_components/AddToCollectionModal';
import FlashcardLearning from '../src_components/FlashcardLearning';

const MOCK_COLLECTIONS = [
  { id: 1, name: 'Từ vựng luyện thi TOEIC' },
  { id: 2, name: 'Communication English' },
  { id: 3, name: 'Từ khó nhớ - A1/A2' }
];

const MOCK_TOPICS_DATA = [
  { 
    id: 1, title: 'Animals (Động vật)', totalVocab: 45, masteredVocab: 45, color: 'bg-green-100 text-green-700', 
    lessons: [
      {id: 11, name: 'Pets (Thú cưng)', wordCount: 20, masteredCount: 20, difficulty: 1}, 
      {id: 12, name: 'Wild Animals (Động vật hoang dã)', wordCount: 25, masteredCount: 25, difficulty: 2} 
    ],
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/616/616408.png' 
  },
  { 
    id: 2, title: 'Technology (Công nghệ)', totalVocab: 60, masteredVocab: 24, color: 'bg-blue-100 text-blue-700', 
    lessons: [
      {id: 21, name: 'Hardware (Phần cứng)', wordCount: 30, masteredCount: 15, difficulty: 3}, 
      {id: 22, name: 'Software (Phần mềm)', wordCount: 30, masteredCount: 9, difficulty: 4}   
    ],
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' 
  },
  { 
    id: 3, title: 'Travel (Du lịch)', totalVocab: 35, masteredVocab: 0, color: 'bg-yellow-100 text-yellow-700', 
    lessons: [
      {id: 31, name: 'At the Airport (Tại sân bay)', wordCount: 15, masteredCount: 0, difficulty: 2}, 
      {id: 32, name: 'Hotel (Khách sạn)', wordCount: 20, masteredCount: 0, difficulty: 3}     
    ],
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/2060/2060284.png' 
  }, 
  { 
    id: 4, title: 'Business (Kinh doanh)', totalVocab: 80, masteredVocab: 15, color: 'bg-purple-100 text-purple-700', 
    lessons: [
      {id: 41, name: 'Meetings (Hội họp)', wordCount: 40, masteredCount: 10, difficulty: 4},
      {id: 42, name: 'Negotiations (Đàm phán)', wordCount: 40, masteredCount: 5, difficulty: 5}
    ],
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/2933/2933116.png' 
  },
];

function HomePage({ onLogout, onNavigateToPractice }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [topicWordSearchTerm, setTopicWordSearchTerm] = useState('');

  // modal chọn bài học
  const [showLearningModal, setShowLearningModal] = useState(false);
  const [activeLearningTopic, setActiveLearningTopic] = useState(null);
  const [learningSearchTerm, setLearningSearchTerm] = useState('');
  const [learningDifficultyFilter, setLearningDifficultyFilter] = useState('all');


  const [activeFlashcardSession, setActiveFlashcardSession] = useState(null);

  const handleOpenLearning = (topic) => {
    setActiveLearningTopic(topic);
    setLearningSearchTerm('');
    setLearningDifficultyFilter('all');
    setShowLearningModal(true);
  };

  // streak và lịch
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date()); 
  
  const MOCK_STUDIED_DATES = [
    '2026-03-15', 
    '2026-03-16', 
    '2026-03-17' 
  ];

  const [activeMenu, setActiveMenu] = useState('Trang chủ');

  const [vocabFilter, setVocabFilter] = useState(null);
  const [practiceInitialFilters, setPracticeInitialFilters] = useState(null);

  const navigateToVocabWithFilter = (status) => {
    setVocabFilter(status);
    setActiveMenu('Từ vựng');
  };


  const [userData, setUserData] = useState({
    username: 'pmd1506',
    fullName: 'Phạm Minh Đức',
    email: 'pmducc1506@gmail.com',
    date_of_birth: '2004-06-15', 
    joinDate: '02/03/2026',
    avatarChar: 'P',
    avatarUrl: null
  });

  const [favoriteVocabDB, setFavoriteVocabDB] = useState([2000, 2002]); 
  const [collectionVocabDB, setCollectionVocabDB] = useState([]); 
  
  const [showTopicWordListModal, setShowTopicWordListModal] = useState(false);
  const [activeTopic, setActiveTopic] = useState(null);
  const [topicWords, setTopicWords] = useState([]);
  
  const [isTopicWordSelectMode, setIsTopicWordSelectMode] = useState(false);
  const [selectedTopicWordIds, setSelectedTopicWordIds] = useState([]);

  const [showLessonFilter, setShowLessonFilter] = useState(false);
  const [lessonSearchTerm, setLessonSearchTerm] = useState('');
  const [selectedLessonIds, setSelectedLessonIds] = useState([]);

  const [showAddToCollectionModal, setShowAddToCollectionModal] = useState(false);
  const [wordToAdd, setWordToAdd] = useState(null);
  const [isBulkAddMode, setIsBulkAddMode] = useState(false);

  const openTopicWordList = (topic) => {
    setActiveTopic(topic);
    const allLessonIds = topic.lessons.map(l => l.id);
    setSelectedLessonIds(allLessonIds); 
    
    const generatedWords = Array.from({ length: topic.totalVocab }).map((_, index) => {
      const lesson = topic.lessons[index % topic.lessons.length];
      return {
        id: 2000 + index, word: `Vocab ${index + 1}`, pronunciation: '/vəʊˈkæb/', word_type: 'Danh từ', 
        meaning: `Nghĩa của từ ${index + 1}`, level: (index % 6) + 1, example: 'This is an example.',
        lessonId: lesson.id, lessonName: lesson.name
      };
    });

    setTopicWords(generatedWords);
    setShowTopicWordListModal(true);
    setIsTopicWordSelectMode(false);
    setSelectedTopicWordIds([]);
    setShowLessonFilter(false);
    setTopicWordSearchTerm('');
  };

  const closeTopicWordList = () => {
    setShowTopicWordListModal(false);
    setActiveTopic(null);
  };

  const unfavoritedTopicWordCount = selectedTopicWordIds.filter(id => !favoriteVocabDB.includes(id)).length;
  const handleBulkFavoriteTopic = () => {
    if (selectedTopicWordIds.length === 0) return;
    const newFavorites = selectedTopicWordIds.filter(id => !favoriteVocabDB.includes(id));
    const favoritedCount = selectedTopicWordIds.length - newFavorites.length;
    setFavoriteVocabDB(prev => [...prev, ...newFavorites]);
    
    let alertMsg = `KẾT QUẢ:\n✅ Đã thêm ${newFavorites.length} từ vào Yêu thích.\n`;
    if (favoritedCount > 0) alertMsg += `⚠️ Bỏ qua ${favoritedCount} từ đã có sẵn.`;
    alert(alertMsg);
    
    setIsTopicWordSelectMode(false);
    setSelectedTopicWordIds([]);
  };

  const handleOpenAddToCollection = (word = null) => {
    setWordToAdd(word);
    setIsBulkAddMode(!word);
    setShowAddToCollectionModal(true);
  };

  const handleConfirmAddToCollections = (targetCollectionIds) => {
    let added = 0, duplicate = 0;
    const wordIdsToProcess = isBulkAddMode ? selectedTopicWordIds : [wordToAdd.id];
    const newDB = [...collectionVocabDB];

    wordIdsToProcess.forEach(wId => {
      targetCollectionIds.forEach(cId => {
        if (newDB.some(record => record.vocabId === wId && record.collectionId === cId)) {
          duplicate++;
        } else {
          newDB.push({ vocabId: wId, collectionId: cId }); added++;
        }
      });
    });
    setCollectionVocabDB(newDB);
    alert(`KẾT QUẢ:\n✅ Đã thêm ${added} lượt từ.\n⚠️ Bỏ qua ${duplicate} lượt trùng lặp.`);
    setShowAddToCollectionModal(false);
    if (isBulkAddMode) { setIsTopicWordSelectMode(false); setSelectedTopicWordIds([]); }
  };

  const topicsRef = useRef(null);
  const mainRef = useRef(null);
  const isScrollingRef = useRef(false); 
  const scrollTimeoutRef = useRef(null);

  const scrollToTopics = () => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    isScrollingRef.current = true;
    
    topicsRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    scrollTimeoutRef.current = setTimeout(() => { 
      isScrollingRef.current = false; 
    }, 800);
  };
  
  const scrollToTop = () => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    isScrollingRef.current = true;
    
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    
    scrollTimeoutRef.current = setTimeout(() => { 
      isScrollingRef.current = false; 
    }, 800);
  };
  const handleScroll = () => {
    if (isScrollingRef.current) return; 
    if (!mainRef.current || !topicsRef.current) return;
    const mainRect = mainRef.current.getBoundingClientRect();
    const topicsRect = topicsRef.current.getBoundingClientRect();
    const distance = topicsRect.top - mainRect.top;
    
    setActiveMenu(prevMenu => {
      if (prevMenu !== 'Trang chủ' && prevMenu !== 'Chủ đề') return prevMenu;
      const targetMenu = distance <= 300 ? 'Chủ đề' : 'Trang chủ';
      return prevMenu !== targetMenu ? targetMenu : prevMenu;
    });
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
    { name: 'Từ vựng', icon: <BookOpen size={22} />, active: activeMenu === 'Từ vựng', onClick: () => { setActiveMenu('Từ vựng'); setVocabFilter(null); } },
    
    { 
      name: 'Chủ đề', 
      icon: <LayoutGrid size={22} />, 
      active: activeMenu === 'Chủ đề', 
      onClick: () => { 
        setActiveMenu('Chủ đề'); 
        setTimeout(() => {
          scrollToTopics();
        }, 100); 
      } 
    },
    { name: 'Luyện tập', icon: <Gamepad2 size={22} />, active: activeMenu === 'Luyện tập', onClick: () => { setPracticeInitialFilters(null); setActiveMenu('Luyện tập'); } },
    { name: 'Bảng xếp hạng', icon: <Trophy size={22} />, active: activeMenu === 'Bảng xếp hạng', onClick: () => setActiveMenu('Bảng xếp hạng') },
  ];


  const today = new Date();
  

  const currentWeekStart = new Date(today);
  const dayOfWeek = currentWeekStart.getDay(); 
  const diffToMonday = currentWeekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  currentWeekStart.setDate(diffToMonday);

  const currentWeekDaysStr = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(currentWeekStart.getDate() + i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const daysStudiedThisWeek = currentWeekDaysStr.filter(dateStr => MOCK_STUDIED_DATES.includes(dateStr)).length;

  let currentStreak = 0;
  let checkDate = new Date(today);
  const todayStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
  
  if (!MOCK_STUDIED_DATES.includes(todayStr)) {
     checkDate.setDate(checkDate.getDate() - 1); 
  }
  
  while(true) {
    const y = checkDate.getFullYear();
    const m = String(checkDate.getMonth() + 1).padStart(2, '0');
    const d = String(checkDate.getDate()).padStart(2, '0');
    const dStr = `${y}-${m}-${d}`;
    
    if (MOCK_STUDIED_DATES.includes(dStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1); 
    } else {
      break; 
    }
  }

  //  TẠO LỊCH STREAK 
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); 
  const emptyDaysBefore = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 

  //  CÁC MỐC THỜI GIAN GIỚI HẠN 
  const joinParts = userData.joinDate.split('/'); 
  const joinYear = parseInt(joinParts[2]);
  const joinMonth = parseInt(joinParts[1]) - 1; 
  
  const currentRealDate = new Date(); 
  const currentRealYear = currentRealDate.getFullYear();
  const currentRealMonth = currentRealDate.getMonth();

  const isPrevDisabled = year === joinYear && month === joinMonth;
  const isNextDisabled = year === currentRealYear && month === currentRealMonth;

  const prevMonth = () => { if (!isPrevDisabled) setCurrentCalendarDate(new Date(year, month - 1, 1)); };
  const nextMonth = () => { if (!isNextDisabled) setCurrentCalendarDate(new Date(year, month + 1, 1)); };

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    let newMonth = month;
    if (newYear === joinYear && newMonth < joinMonth) newMonth = joinMonth;
    if (newYear === currentRealYear && newMonth > currentRealMonth) newMonth = currentRealMonth;
    setCurrentCalendarDate(new Date(newYear, newMonth, 1));
  };
  const handleMonthChange = (e) => { setCurrentCalendarDate(new Date(year, parseInt(e.target.value), 1)); };

  const availableYears = Array.from({ length: currentRealYear - joinYear + 1 }, (_, i) => joinYear + i);
  const startM = year === joinYear ? joinMonth : 0;
  const endM = year === currentRealYear ? currentRealMonth : 11;
  const availableMonths = Array.from({ length: endM - startM + 1 }, (_, i) => startM + i);

  // ĐẾM CHUỖI 
  const getStreakUpToDate = (targetYear, targetMonth, targetDate) => {
    let streak = 0;
    let currDate = new Date(targetYear, targetMonth, targetDate);
    
    while(true) {
      const y = currDate.getFullYear();
      const m = String(currDate.getMonth() + 1).padStart(2, '0');
      const d = String(currDate.getDate()).padStart(2, '0');
      const dStr = `${y}-${m}-${d}`;
      
      if (MOCK_STUDIED_DATES.includes(dStr)) {
        streak++;
        currDate.setDate(currDate.getDate() - 1); 
      } else {
        break; 
      }
    }
    return streak;
  };

  // cột action cho bảng từ vựng trong modal chủ đề
  const TopicWordActionColumn = ({ item }) => {
    const [openMenuId, setOpenMenuId] = useState(null);
    const isFav = favoriteVocabDB.includes(item.id);

    return (
      <div className="relative flex justify-center">
        <button onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)} className="p-2 text-gray-400 hover:text-cyan-700 hover:bg-cyan-50 rounded-full transition-colors">
          <MoreVertical size={20} />
        </button>
        {openMenuId === item.id && (
          <div className="absolute right-8 top-10 w-48 bg-white border border-gray-100 shadow-xl rounded-lg py-1 z-50 text-left">
            <button onClick={() => { setOpenMenuId(null); handleOpenAddToCollection(item); }} className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-cyan-50 font-medium flex items-center gap-2">
              <FolderPlus size={16}/> Thêm vào bộ từ
            </button>
            <button onClick={() => { setOpenMenuId(null); setFavoriteVocabDB(prev => prev.includes(item.id) ? prev.filter(v => v !== item.id) : [...prev, item.id]); }} className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-cyan-50 font-medium flex justify-between items-center">
              Yêu thích <Heart size={16} fill={isFav ? "currentColor" : "none"} className={isFav ? "text-red-500" : "text-gray-400"}/>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-gray-800">
      
      {/* sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#083344] text-white transition-all duration-300 flex flex-col relative shadow-xl z-20`}
      >
        
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-6 bg-[#0e7490] rounded-full p-1 text-white hover:bg-[#164e63] shadow-md"
        >
          {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        
        <div className="h-20 flex items-center justify-center font-extrabold text-2xl tracking-wide border-b border-[#164e63]">
          {isSidebarOpen ? <span className="text-white">Eng<span className="text-[#38bdf8]">Learn</span></span> : 'E'}
        </div>

        
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

      {/* nội dung chính */}
      <main ref={mainRef} onScroll={handleScroll} className="flex-1 overflow-y-auto h-screen scroll-smooth">
        {(activeMenu === 'Trang chủ' || activeMenu === 'Chủ đề') && (
        <div className="max-w-7xl mx-auto p-8">
          
          
          <div className="flex justify-end items-center mb-8 gap-4">
            <div 
              onClick={() => setIsStreakModalOpen(true)} 
              className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md hover:scale-105 hover:bg-orange-50 transition-all cursor-pointer border border-orange-100"
            >
              <span className="font-bold text-cyan-900">Chuỗi</span>
              <div className="w-px h-5 bg-gray-200 mx-3"></div>
              <span className="font-bold text-cyan-900 flex items-center gap-2">
                <span>
                  {currentStreak === 0 ? (
                    <span className="text-red-600 font-extrabold text-lg mr-1">{currentStreak}</span>
                  ) : (
                    <span className="mr-1">{currentStreak}</span>
                  )} 
                  Ngày
                </span>
                <Flame className="text-orange-500" size={20} fill="currentColor" />
              </span>
            </div>
          </div>

          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            
            <div 
              onClick={() => {
                setPracticeInitialFilters({ mode: 'smart' });
                setActiveMenu('Luyện tập');
              }}
              className="bg-gradient-to-br from-[#0e7490] to-[#164e63] rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between relative overflow-hidden group cursor-pointer"
            >
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2">Ôn tập thông minh</h3>
                <p className="text-[#bae6fd] text-sm leading-relaxed max-w-[80%]">AI đã chuẩn bị sẵn các từ vựng bạn sắp quên. Ôn tập ngay để nhớ lâu hơn!</p>
              </div>
              <button className="mt-6 bg-white text-[#0e7490] w-fit px-6 py-2.5 rounded-full font-bold shadow-md hover:scale-105 hover:shadow-xl transition-all z-10">
                Bắt đầu ôn tập
              </button>
              <Zap className="absolute -bottom-6 -right-6 text-white opacity-10 group-hover:scale-110 transition-transform duration-500" size={120} />
            </div>

            
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col">
              <h3 className="text-lg font-bold text-[#083344] mb-4">Thống kê từ vựng</h3>
              <div className="grid grid-cols-2 gap-3 flex-1">
                
                <div onClick={() => navigateToVocabWithFilter('Tổng từ đã học')} className="bg-blue-50 rounded-xl p-3 flex flex-col items-center justify-center text-center hover:-translate-y-1 hover:shadow-md cursor-pointer transition-all">
                  <span className="text-blue-600 font-bold text-xl">120</span>
                  <span className="text-sm text-gray-500 font-medium mt-1">Tổng từ đã học</span>
                </div>
                
                <div onClick={() => navigateToVocabWithFilter('Đã thuộc')} className="bg-green-50 rounded-xl p-3 flex flex-col items-center justify-center text-center hover:-translate-y-1 hover:shadow-md cursor-pointer transition-all">
                  <span className="text-green-600 font-bold text-xl">85</span>
                  <span className="text-sm text-gray-500 font-medium mt-1">Đã thuộc (Mastered)</span>
                </div>
                
                <div onClick={() => navigateToVocabWithFilter('Chưa thuộc')} className="bg-orange-50 rounded-xl p-3 flex flex-col items-center justify-center text-center hover:-translate-y-1 hover:shadow-md cursor-pointer transition-all">
                  <span className="text-orange-500 font-bold text-xl">35</span>
                  <span className="text-sm text-gray-500 font-medium mt-1 leading-tight">Chưa thuộc (Learning)</span>
                </div>
                
                <div onClick={() => navigateToVocabWithFilter('Chưa học')} className="bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center border border-gray-100 text-center hover:-translate-y-1 hover:shadow-md cursor-pointer transition-all">
                  <span className="text-gray-400 font-bold text-xl">500+</span>
                  <span className="text-sm text-gray-400 font-medium mt-1">Chưa học (New)</span>
                </div>
                
              </div>
            </div>

            
            <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-center items-center relative overflow-hidden">
              <h3 className="text-sm font-bold mb-3 opacity-90 uppercase tracking-wider z-10 text-center">Tuần này bạn đã học được</h3>
              
              <div className="flex items-baseline mb-6 z-10">
                <span className={`text-6xl font-black transition-all ${
                  daysStudiedThisWeek === 0 
                    ? 'text-red-700 drop-shadow-md' 
                    : 'text-white'
                }`}>
                  {daysStudiedThisWeek}
                </span>
                <span className="text-3xl ml-3 font-bold text-white opacity-90">
                  ngày
                </span>
              </div>

              <div className="flex w-full justify-between px-2 z-10">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, idx) => {
                  const dateStr = currentWeekDaysStr[idx];
                  const hasStudied = MOCK_STUDIED_DATES.includes(dateStr);
                  
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        hasStudied 
                          ? 'bg-white text-orange-500 shadow-md scale-110' 
                          : 'bg-white/20'
                      }`}>
                        {hasStudied ? <Flame size={18} fill="currentColor" /> : ''}
                      </div>
                      <span className="text-xs font-medium opacity-80">{day}</span>
                    </div>
                  );
                })}
              </div>
              
              <Flame className="absolute -bottom-10 -right-4 text-white opacity-10 pointer-events-none" size={150} />
            </div>

          </div>

          {/* truy cập nhanh */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-[#083344] mb-4 text-center">Truy cập nhanh</h2>
            <div className="flex justify-center gap-4 flex-wrap">
              <button 
                onClick={() => {
                  setActiveMenu('Chủ đề');
                  scrollToTopics();
                }} 
                className="flex items-center px-6 py-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-[#0e7490] hover:shadow-md transition-all group min-w-[200px]"
              >
                <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
                  <BookOpen size={24} />
                </div>
                <div className="ml-4 text-left">
                  <p className="font-bold text-gray-800">Học bài</p>
                  <p className="text-xs text-gray-500">Khám phá chủ đề</p>
                </div>
              </button>

              <button 
                onClick={() => { setPracticeInitialFilters(null); setActiveMenu('Luyện tập'); }}
                className="flex items-center px-6 py-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-purple-500 hover:shadow-md transition-all group min-w-[200px]"
              >
                <div className="bg-purple-100 p-3 rounded-full text-purple-600 group-hover:scale-110 transition-transform">
                  <Gamepad2 size={24} />
                </div>
                <div className="ml-4 text-left">
                  <p className="font-bold text-gray-800">Luyện tập</p>
                  <p className="text-xs text-gray-500">Flashcard & Game</p>
                </div>
              </button>

              <button 
                onClick={() => setActiveMenu('Bảng xếp hạng')}
                className="flex items-center px-6 py-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-yellow-500 hover:shadow-md transition-all group min-w-[200px]"
              >
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

          {/* danh sách chủ đề */}
          <div ref={topicsRef} className="pt-8">
            <h2 className="text-2xl font-bold text-[#083344] mb-6 border-b-2 border-gray-200 pb-2 inline-block">Chủ đề từ vựng</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {MOCK_TOPICS_DATA.map((topic) => (
                <div key={topic.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between min-h-[14rem]">
                  
                  
                  <div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 p-1 ${topic.color}`}>
                      <img 
                        src={topic.imageUrl} 
                        alt={topic.title} 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-3 line-clamp-1" title={topic.title}>{topic.title}</h3>
                    
                    
                    <div className="flex flex-col gap-2.5 mb-4">
                      <span className="text-xs text-gray-600 font-medium bg-gray-100/80 px-3 py-1.5 rounded-lg w-fit">
                        Số từ: {topic.totalVocab} từ
                      </span>
                      
                      
                      {topic.masteredVocab === topic.totalVocab ? (
                        <span className="text-[11px] font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-lg w-fit">
                          Đã hoàn thành
                        </span>
                      ) : topic.masteredVocab === 0 ? (
                        <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg w-fit">
                          Chưa học
                        </span>
                      ) : (
                        <div className="flex flex-col gap-1.5 w-full pr-4 mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-cyan-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${(topic.masteredVocab / topic.totalVocab) * 100}%` }}></div>
                          </div>
                          <span className="text-[10px] text-gray-500 font-bold">{topic.masteredVocab}/{topic.totalVocab} đã thuộc</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center gap-2">
                    
                    <button 
                      onClick={() => openTopicWordList(topic)}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-white text-cyan-700 hover:bg-cyan-50 border border-cyan-100 transition-colors shrink-0 shadow-sm"
                    >
                      <Eye size={16} /> Xem từ
                    </button>

                    
                    <button 
                      onClick={() => handleOpenLearning(topic)}
                      className="flex items-center justify-end text-[#0e7490] hover:text-white bg-cyan-50 hover:bg-[#0e7490] p-1.5 rounded-full transition-all duration-300 w-9 hover:w-[100px] relative group overflow-hidden shrink-0 shadow-sm border border-cyan-100 hover:border-transparent"
                    >
                      <span className="opacity-0 whitespace-nowrap group-hover:opacity-100 transition-opacity duration-300 text-xs font-bold absolute right-8">Vào học</span>
                      <ChevronRight size={18} className="shrink-0 relative z-10" />
                    </button>
                    
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="h-40"></div>

        </div>
        )}

        {activeMenu === 'Yêu thích' && <FavoritePage />}

        {activeMenu === 'Bộ từ vựng' && <CollectionPage onNavigateToPractice={(filters) => { setPracticeInitialFilters(filters); setActiveMenu('Luyện tập'); }} />}

        {activeMenu === 'Từ vựng' && <VocabularyPage initialFilter={vocabFilter} />}

        {activeMenu === 'Luyện tập' && (
          <PracticePage 
            initialFilters={practiceInitialFilters} 
            onBack={() => setActiveMenu('Trang chủ')} 
          />
        )}

        {activeMenu === 'Bảng xếp hạng' && <LeaderboardPage />}
        
      </main>
      {/* hồ sơ người dùng */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={{...userData, streak: 2, xp: '1,250', join_date: '01/01/2026'}}
        isEditable={true}
        onSave={(updatedData) => {
          setUserData(updatedData);
          setIsProfileModalOpen(false);
        }}
        onLogout={onLogout}
      />

      {/* lịch streak */}
      {isStreakModalOpen && (
        <div className="fixed inset-0 bg-cyan-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in duration-200">
            
            <button onClick={() => setIsStreakModalOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-red-500 transition-colors p-1">
              <X size={24} />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Flame size={36} fill="currentColor" />
              </div>
              <h2 className="text-2xl font-black text-cyan-950">Chuỗi ngày học</h2>
              <p className="text-gray-500 mt-1.5 font-medium">
                {currentStreak === 0 ? (
                  <span>Bạn đang có chuỗi <strong className="text-red-600 text-xl mx-1">0</strong> ngày. Vào học ngay nào! 🔥</span>
                ) : (
                  <span>Bạn đang có chuỗi <strong className="text-orange-500 text-xl mx-1">{currentStreak}</strong> ngày liên tiếp!</span>
                )}
              </p>
            </div>

            
            <div className="flex justify-between items-center mb-6 bg-cyan-50 p-2 rounded-xl border border-cyan-100">
              <button 
                onClick={prevMonth} 
                disabled={isPrevDisabled}
                className={`p-2 rounded-lg transition-colors ${isPrevDisabled ? 'text-cyan-200 cursor-not-allowed' : 'text-cyan-700 hover:bg-cyan-100'}`}
              >
                <ChevronLeft size={20} />
              </button>
              
              
              <div className="flex gap-2">
              <div className="relative">
                <select 
                  value={month} 
                  onChange={handleMonthChange}
                  className="w-full bg-white border border-cyan-200 text-cyan-900 font-bold py-1.5 pl-3 pr-9 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer text-sm appearance-none"
                >
                  {availableMonths.map(m => (
                    <option key={m} value={m}>Tháng {m + 1}</option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-500 pointer-events-none">
                  <ChevronDown size={18} strokeWidth={2.5} />
                </span>
              </div>
              
              <div className="relative">
                <select 
                  value={year} 
                  onChange={handleYearChange}
                  className="w-full bg-white border border-cyan-200 text-cyan-900 font-bold py-1.5 pl-3 pr-9 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer text-sm appearance-none"
                >
                  {availableYears.map(y => (
                    <option key={y} value={y}>Năm {y}</option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-500 pointer-events-none">
                  <ChevronDown size={18} strokeWidth={2.5} />
                </span>
              </div>
              </div>

              <button 
                onClick={nextMonth} 
                disabled={isNextDisabled}
                className={`p-2 rounded-lg transition-colors ${isNextDisabled ? 'text-cyan-200 cursor-not-allowed' : 'text-cyan-700 hover:bg-cyan-100'}`}
              >
                <ChevronRight size={20} />
              </button>
            </div>

            
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
                  <div key={day} className="text-center text-xs font-bold text-gray-400 py-2">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: emptyDaysBefore }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-10"></div>
                ))}
                
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dateNum = i + 1;
                  const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;
                  
                  const hasStudied = MOCK_STUDIED_DATES.includes(dateString);
                  const streakCount = hasStudied ? getStreakUpToDate(year, month, dateNum) : 0;
                  
                  const isToday = year === currentRealYear && month === currentRealMonth && dateNum === currentRealDate.getDate();

                  return (
                    <div key={dateNum} className="relative flex justify-center group cursor-default">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        hasStudied 
                          ? 'bg-orange-100 text-orange-600 shadow-sm border border-orange-200' 
                          : isToday
                            ? 'bg-cyan-50 text-cyan-700 ring-2 ring-cyan-400 ring-offset-1 font-extrabold shadow-sm' 
                            : 'text-gray-600 hover:bg-gray-200'
                      }`}>
                        {hasStudied ? <Flame size={18} fill="currentColor" /> : dateNum}
                      </div>

                      {hasStudied && (
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-cyan-950 text-white text-xs font-bold py-1.5 px-3 rounded-lg pointer-events-none whitespace-nowrap z-10 shadow-xl">
                          Đã đạt {streakCount} ngày
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-cyan-950"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* modal danh sách từ của chủ đề */}
      {showTopicWordListModal && activeTopic && (
        <div className="fixed inset-0 bg-cyan-950/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-6xl w-full border border-gray-100 flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-cyan-950 flex items-center gap-2">
                  <BookOpen className="text-cyan-600" /> Chủ đề: {activeTopic.title}
                </h2>
              </div>

              <div className="flex items-center gap-4">

                
                <div className="relative w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Tìm từ vựng..." 
                    value={topicWordSearchTerm}
                    onChange={(e) => setTopicWordSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all outline-none"
                  />
                </div>

                {/* lọc bài học */}
                <div className="relative">
                  <button onClick={() => setShowLessonFilter(!showLessonFilter)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 text-gray-700">
                    Lọc bài học ({selectedLessonIds.length}/{activeTopic.lessons.length}) <ChevronDown size={16}/>
                  </button>
                  {showLessonFilter && (
                    <div className="absolute top-full mt-2 right-0 w-64 bg-white border border-gray-200 shadow-xl rounded-xl z-50 overflow-hidden">
                      <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                          <input type="text" placeholder="Tìm bài học..." value={lessonSearchTerm} onChange={e=>setLessonSearchTerm(e.target.value)} className="w-full pl-8 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:ring-1 focus:ring-cyan-500"/>
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto p-2 scrollbar-thin">
                        <label className="flex items-center gap-2 p-2 hover:bg-cyan-50 rounded cursor-pointer font-bold text-cyan-900 text-sm border-b border-gray-50">
                          <input type="checkbox" checked={selectedLessonIds.length === activeTopic.lessons.length && activeTopic.lessons.length > 0} onChange={() => setSelectedLessonIds(selectedLessonIds.length === activeTopic.lessons.length ? [] : activeTopic.lessons.map(l=>l.id))} className="rounded text-cyan-600 w-4 h-4 cursor-pointer"/>
                          Chọn tất cả bài học
                        </label>
                        {activeTopic.lessons.filter(l => l.name.toLowerCase().includes(lessonSearchTerm.toLowerCase())).map(lesson => (
                          <label key={lesson.id} className="flex items-center gap-2 p-2 hover:bg-cyan-50 rounded cursor-pointer text-sm font-medium text-gray-700">
                            <input type="checkbox" checked={selectedLessonIds.includes(lesson.id)} onChange={()=>setSelectedLessonIds(prev => prev.includes(lesson.id) ? prev.filter(id => id !== lesson.id) : [...prev, lesson.id])} className="rounded text-cyan-600 w-4 h-4 cursor-pointer"/>
                            {lesson.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                
                {isTopicWordSelectMode && selectedTopicWordIds.length > 0 && (
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenAddToCollection(null)} className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 font-medium text-sm">
                      <FolderPlus size={16} /> Thêm vào...
                    </button>
                    <button onClick={handleBulkFavoriteTopic} disabled={unfavoritedTopicWordCount === 0} className={`flex items-center gap-2 px-3 py-2 border rounded-lg shadow-sm font-medium text-sm ${unfavoritedTopicWordCount > 0 ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'}`}>
                      <Heart size={16} fill={unfavoritedTopicWordCount > 0 ? "currentColor" : "none"} /> Yêu thích ({unfavoritedTopicWordCount})
                    </button>
                  </div>
                )}
                
                <button onClick={() => { setIsTopicWordSelectMode(!isTopicWordSelectMode); if(isTopicWordSelectMode) setSelectedTopicWordIds([]); }} className={`px-4 py-2 font-bold rounded-lg shadow-sm border text-sm ${isTopicWordSelectMode ? 'bg-cyan-950 text-white border-cyan-950' : 'bg-white text-cyan-700 border-cyan-200 hover:bg-cyan-50'}`}>
                  {isTopicWordSelectMode ? 'Hủy chọn' : 'Chọn nhiều'}
                </button>

                <div className="w-px h-8 bg-gray-200 mx-1"></div>
                <button onClick={closeTopicWordList} className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full"><X size={24} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <VocabTable 
                words={topicWords.filter(w => selectedLessonIds.includes(w.lessonId))}
                searchTerm={topicWordSearchTerm}
                isSelectMode={isTopicWordSelectMode}
                selectedIds={selectedTopicWordIds}
                onToggleSelect={(id) => setSelectedTopicWordIds(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id])}
                onSelectAll={(currentWords) => {
                  const isAllSelected = currentWords.every(v => selectedTopicWordIds.includes(v.id));
                  if (isAllSelected) setSelectedTopicWordIds(prev => prev.filter(id => !currentWords.map(w=>w.id).includes(id)));
                  else setSelectedTopicWordIds(prev => [...new Set([...prev, ...currentWords.map(w=>w.id)])]);
                }}
                ActionColumn={TopicWordActionColumn} 
              />
            </div>
          </div>
        </div>
      )}

      {/* modal thêm vào bộ từ */}
      <AddToCollectionModal 
        isOpen={showAddToCollectionModal}
        onClose={() => setShowAddToCollectionModal(false)}
        isBulkMode={isBulkAddMode}
        wordToAdd={wordToAdd}
        selectedCount={selectedTopicWordIds.length}
        collections={MOCK_COLLECTIONS}  
        onConfirm={handleConfirmAddToCollections}
      />

      {/* modal chọn bài học */}
      {showLearningModal && activeLearningTopic && (
        <div className="fixed inset-0 bg-cyan-950/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-gray-100 flex flex-col max-h-[85vh] animate-in zoom-in duration-200">
            
            
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0 bg-cyan-50/50 rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-black text-cyan-950 flex items-center gap-3">
                  <Gamepad2 className="text-[#0e7490]" size={28} /> 
                  Vào học: {activeLearningTopic.title}
                </h2>
                <p className="text-gray-500 mt-1 font-medium">Chọn một bài học dưới đây để bắt đầu quá trình luyện tập.</p>
              </div>
              <button onClick={() => setShowLearningModal(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors self-start">
                <X size={24} />
              </button>
            </div>

            
            <div className="p-4 border-b border-gray-100 flex gap-4 bg-white shrink-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm bài học..." 
                  value={learningSearchTerm}
                  onChange={(e) => setLearningSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all outline-none"
                />
              </div>
              <div className="relative w-48">
                <select 
                  value={learningDifficultyFilter}
                  onChange={(e) => setLearningDifficultyFilter(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-cyan-900 focus:ring-2 focus:ring-cyan-500 transition-all outline-none appearance-none cursor-pointer"
                >
                  <option value="all">Tất cả độ khó</option>
                  <option value="1">A1 - Cơ bản</option>
                  <option value="2">A2 - Sơ cấp</option>
                  <option value="3">B1 - Trung cấp</option>
                  <option value="4">B2 - Thượng cấp</option>
                  <option value="5">C1 - Nâng cao</option>
                  <option value="6">C2 - Thành thạo</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-700 pointer-events-none" size={16} />
              </div>
            </div>

            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 scrollbar-thin">
              {activeLearningTopic.lessons
                .filter(lesson => lesson.name.toLowerCase().includes(learningSearchTerm.toLowerCase()))
                .filter(lesson => learningDifficultyFilter === 'all' || lesson.difficulty === parseInt(learningDifficultyFilter))
                .map((lesson, index) => {
                  const difficultyLabels = { 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2', 5: 'C1', 6: 'C2' };
                  
                  return (
                    <div key={lesson.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-4 hover:border-cyan-400 hover:shadow-md transition-all group">
                      
                      
                      <div className="flex items-center justify-between gap-4">
                        
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-10 h-10 rounded-full bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold border border-cyan-100 shrink-0">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 text-lg group-hover:text-cyan-700 transition-colors">{lesson.name}</h4>
                            <div className="flex items-center gap-3 mt-1.5 shrink-0">
                               <span className="text-[11px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                                 Độ khó: {difficultyLabels[lesson.difficulty]}
                               </span>
                            </div>
                          </div>
                        </div>

                        
                        <button 
                          onClick={() => {
                            setShowLearningModal(false); 
                            setActiveFlashcardSession({ topic: activeLearningTopic, lesson }); 
                          }}
                          className="px-6 py-2.5 bg-white border-2 border-cyan-500 text-cyan-600 font-bold rounded-xl group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-[#0e7490] group-hover:text-white group-hover:border-transparent group-hover:-translate-y-0.5 group-hover:shadow-lg group-hover:shadow-cyan-500/30 transition-all duration-300 shrink-0"
                        >
                          Học bài
                        </button>
                      </div>

                      
                      <div className="mt-1 flex flex-col gap-1.5 w-full pr-1">
                          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-cyan-500 h-1.5 rounded-full transition-all duration-500" 
                              style={{ width: `${(lesson.masteredCount / lesson.wordCount) * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold">
                             <span>Số lượng: {lesson.wordCount} từ</span>
                             <span className={lesson.masteredCount === lesson.wordCount ? 'text-green-600' : ''}>
                                {lesson.masteredCount}/{lesson.wordCount} đã thuộc
                             </span>
                          </div>
                      </div>

                    </div>
                  );
              })}
              
              {activeLearningTopic.lessons.filter(lesson => lesson.name.toLowerCase().includes(learningSearchTerm.toLowerCase())).length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <p>Không tìm thấy bài học nào phù hợp với bộ lọc.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* flashcard */}
      {activeFlashcardSession && (
        <FlashcardLearning 
          topic={activeFlashcardSession.topic}
          lesson={activeFlashcardSession.lesson}  
          onExit={() => {
            setActiveFlashcardSession(null);
            setShowLearningModal(true); 
          }}
          onNextLesson={(nextLesson) => setActiveFlashcardSession({ topic: activeFlashcardSession.topic, lesson: nextLesson })}
          onPrevLesson={(prevLesson) => setActiveFlashcardSession({ topic: activeFlashcardSession.topic, lesson: prevLesson })}
          onPractice={() => {
            setPracticeInitialFilters({
              mode: 'topic',
              topicId: activeFlashcardSession.topic.id,
              lessonId: activeFlashcardSession.lesson.id
            });
            setActiveFlashcardSession(null);
            setActiveMenu('Luyện tập');
          }}
        />
      )}

    </div> 
  );
}
export default HomePage;