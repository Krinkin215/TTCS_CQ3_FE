import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Filter, Plus, Edit2, Trash2, BookOpen, Eye, Check, ChevronRight, Copy, FolderInput, LogOut, MoreVertical, Gamepad2, ChevronDown, Settings, AlertTriangle } from 'lucide-react';
import VocabTable from '../src_components/VocabTable';
import SearchBar from '../src_components/SearchBar';
import ConfirmModal from '../src_components/ConfirmModal';
import ModalWrapper from '../src_components/ModalWrapper';
import FilterDropdown from '../src_components/FilterDropdown';

const ADMIN_USER_ID = 1;


const MOCK_TOPICS_DATA = [
  {
    id: 1, title: 'Animals (Động vật)', totalVocab: 45, color: 'bg-green-100 text-green-700', imageUrl: 'https://cdn-icons-png.flaticon.com/512/616/616408.png',
    lessons: [{ id: 11, name: 'Pets (Thú cưng)' }, { id: 12, name: 'Wild Animals (Động vật hoang dã)' }]
  },
  {
    id: 2, title: 'Technology (Công nghệ)', totalVocab: 60, color: 'bg-blue-100 text-blue-700', imageUrl: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png',
    lessons: [{ id: 21, name: 'Hardware (Phần cứng)' }, { id: 22, name: 'Software (Phần mềm)' }]
  },
  {
    id: 3, title: 'Travel (Du lịch)', totalVocab: 35, color: 'bg-yellow-100 text-yellow-700', imageUrl: 'https://cdn-icons-png.flaticon.com/512/2060/2060284.png',
    lessons: [{ id: 31, name: 'At the Airport (Tại sân bay)' }, { id: 32, name: 'Hotel (Khách sạn)' }]
  },
  {
    id: 4, title: 'Business (Kinh doanh)', totalVocab: 80, color: 'bg-purple-100 text-purple-700', imageUrl: 'https://cdn-icons-png.flaticon.com/512/2933/2933116.png',
    lessons: [{ id: 41, name: 'Meetings (Hội họp)' }, { id: 42, name: 'Negotiations (Đàm phán)' }]
  },
];

const MOCK_WORDS = [
  { id: 1, word: 'Vocab 1', pronunciation: '/vəʊˈkæb/', word_type: 'Danh từ', meaning: 'Nghĩa của từ 1', example: 'This is an example.', level: 1, topicId: 1, lessonId: 11, lessonName: 'Pets (Thú cưng)' },
  { id: 2, word: 'Vocab 2', pronunciation: '/vəʊˈkæb/', word_type: 'Động từ', meaning: 'Nghĩa của từ 2', example: 'This is an example.', level: 2, topicId: 1, lessonId: 12, lessonName: 'Wild Animals (Động vật hoang dã)' },
  { id: 3, word: 'Vocab 3', pronunciation: '/vəʊˈkæb/', word_type: 'Tính từ', meaning: 'Nghĩa của từ 3', example: 'This is an example.', level: 3, topicId: 1, lessonId: 11, lessonName: 'Pets (Thú cưng)' },
  { id: 4, word: 'Vocab 4', pronunciation: '/vəʊˈkæb/', word_type: 'Danh từ', meaning: 'Nghĩa của từ 4', example: 'This is an example.', level: 4, topicId: 2, lessonId: 21, lessonName: 'Hardware (Phần cứng)' },
];

export default function AdminTopicManagement() {
  const [topics, setTopics] = useState(MOCK_TOPICS_DATA);
  const [searchTerm, setSearchTerm] = useState('');

  // chọn nhiều chủ đỀ
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedTopicIds, setSelectedTopicIds] = useState([]);

  // Modals Quản lý Chủ đề
  const [showCreateTopicModal, setShowCreateTopicModal] = useState(false);
  const [showEditTopicModal, setShowEditTopicModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [newTopicName, setNewTopicName] = useState('');

  const [showCreateLessonModal, setShowCreateLessonModal] = useState(false);
  const [newLessonName, setNewLessonName] = useState('');
  const [newLessonDifficulty, setNewLessonDifficulty] = useState(1);

  // modal xóa
  const [showConfirmDeleteTopic, setShowConfirmDeleteTopic] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState(null);
  const [showConfirmDeleteWord, setShowConfirmDeleteWord] = useState(false);
  const [wordToDelete, setWordToDelete] = useState(null);

  // Modals Xem chi tiết (Danh sách từ vựng Chủ đề/Bài học)
  const [showTopicWordsModal, setShowTopicWordsModal] = useState(false);
  const [activeTopic, setActiveTopic] = useState(null);

  const [showTopicLessonsModal, setShowTopicLessonsModal] = useState(false);

  const [showLessonWordsModal, setShowLessonWordsModal] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);

  // state từ vựng trong modal
  const [modalWords, setModalWords] = useState([]);
  const [wordSearchTerm, setWordSearchTerm] = useState('');
  const [isWordSelectMode, setIsWordSelectMode] = useState(false);
  const [selectedWordIds, setSelectedWordIds] = useState([]);

  // lọc bài học trong modal chủ đỀ
  const [selectedLessonFilters, setSelectedLessonFilters] = useState([]);
  const [showLessonFilterDropdown, setShowLessonFilterDropdown] = useState(false);

  // modal di chuyển từ vựng
  const [showMoveWordModal, setShowMoveWordModal] = useState(false);
  const [movingWords, setMovingWords] = useState([]);
  const [moveTargetTopicId, setMoveTargetTopicId] = useState('');
  const [moveTargetLessonId, setMoveTargetLessonId] = useState('');
  const [moveMode, setMoveMode] = useState('full'); // 'full' = chọn cả chủ đề + bài học, 'lesson-only' = chỉ bài học trong cùng chủ đề

  // modal chỉnh sửa từ vựng
  const [showEditWordModal, setShowEditWordModal] = useState(false);
  const [editingWords, setEditingWords] = useState([]);

  // menu hành động dùng chung, tránh nhiều menu mở cùng lúc
  const [openMenuId, setOpenMenuId] = useState(null);
  // vị trí của menu đang mở (fixed position)
  const [menuAnchor, setMenuAnchor] = useState(null);

  const handleToggleMenu = (id, event) => {
    if (openMenuId === id) {
      setOpenMenuId(null);
      setMenuAnchor(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setMenuAnchor({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
      setOpenMenuId(id);
    }
  };

  const closeMenu = () => {
    setOpenMenuId(null);
    setMenuAnchor(null);
  };

  const handleEditWordChange = (id, field, value) => {
    setEditingWords(prev => prev.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  const handleSaveEditedWords = () => {
    alert('Đã lưu thay đổi từ vựng!');
    setShowEditWordModal(false);
    setEditingWords([]);
    setIsWordSelectMode(false);
    setSelectedWordIds([]);
  };

  // CÁC HÀM XỬ LÝ CHỦ ĐỀ 
  const filteredTopics = topics.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const toggleTopicSelect = (id) => {
    setSelectedTopicIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDeleteTopicConfirm = () => {
    if (topicToDelete) {
      setTopics(topics.filter(t => t.id !== topicToDelete.id));
      setTopicToDelete(null);
    } else {
      setTopics(topics.filter(t => !selectedTopicIds.includes(t.id)));
      setSelectedTopicIds([]);
      setIsSelectMode(false);
    }
    setShowConfirmDeleteTopic(false);
  };

  const handleCreateTopic = () => {
    if (!newTopicName.trim()) return;
    const newId = Date.now();
    setTopics([...topics, {
      id: newId, title: newTopicName, totalVocab: 0, color: 'bg-gray-100 text-gray-700', imageUrl: 'https://cdn-icons-png.flaticon.com/512/616/616408.png', lessons: []
    }]);
    setNewTopicName('');
    setShowCreateTopicModal(false);
  };

  const handleEditTopic = () => {
    if (!newTopicName.trim() || !editingTopic) return;
    setTopics(topics.map(t => t.id === editingTopic.id ? { ...t, title: newTopicName } : t));
    setEditingTopic(null);
    setNewTopicName('');
    setShowEditTopicModal(false);
  };

  const handleCreateLesson = () => {
    if (!newLessonName.trim() || !activeTopic) return;
    const newLessonId = Date.now();
    const updatedTopics = topics.map(t => {
      if (t.id === activeTopic.id) {
        return {
          ...t,
          lessons: [...t.lessons, { id: newLessonId, name: newLessonName, difficulty: newLessonDifficulty }]
        };
      }
      return t;
    });
    setTopics(updatedTopics);
    setActiveTopic(updatedTopics.find(t => t.id === activeTopic.id));
    setNewLessonName('');
    setNewLessonDifficulty(1);
    setShowCreateLessonModal(false);
  };

  // CÁC HÀM MỞ MODAL XEM CHI TIẾT 
  const openTopicWords = (topic) => {
    setActiveTopic(topic);
    setModalWords(MOCK_WORDS.filter(w => w.topicId === topic.id));
    setSelectedLessonFilters([]);
    setShowLessonFilterDropdown(false);
    setWordSearchTerm('');
    setIsWordSelectMode(false);
    setSelectedWordIds([]);
    setShowTopicWordsModal(true);
  };

  const openTopicLessons = (topic) => {
    setActiveTopic(topic);
    setShowTopicLessonsModal(true);
  };

  const openLessonWords = (lesson, topic) => {
    setActiveLesson(lesson);
    setActiveTopic(topic);
    setModalWords(MOCK_WORDS.filter(w => w.lessonId === lesson.id));
    setWordSearchTerm('');
    setIsWordSelectMode(false);
    setSelectedWordIds([]);
    setShowTopicLessonsModal(false);
    setShowLessonWordsModal(true);
  };

  // CÁC HÀM XỬ LÝ TỪ VỰNG 
  const toggleWordSelect = (id) => {
    setSelectedWordIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const handleWordSelectAll = (currentWordsOnPage) => {
    const allSelected = currentWordsOnPage.every(w => selectedWordIds.includes(w.id));
    if (allSelected) {
      setSelectedWordIds(selectedWordIds.filter(id => !currentWordsOnPage.some(w => w.id === id)));
    } else {
      const newIds = currentWordsOnPage.map(w => w.id).filter(id => !selectedWordIds.includes(id));
      setSelectedWordIds([...selectedWordIds, ...newIds]);
    }
  };

  const handleDeleteWordConfirm = () => {
    setWordToDelete(null);
    setSelectedWordIds([]);
    setIsWordSelectMode(false);
    setShowConfirmDeleteWord(false);
  };

  const openMoveModal = (wordsToMove, lessonOnly = false) => {
    setMovingWords(wordsToMove);
    setMoveMode(lessonOnly ? 'lesson-only' : 'full');
    setMoveTargetTopicId(activeTopic ? String(activeTopic.id) : '');
    setMoveTargetLessonId('');
    setShowMoveWordModal(true);
  };

  const handleConfirmMove = () => {
    setShowMoveWordModal(false);
    setSelectedWordIds([]);
    setIsWordSelectMode(false);
    alert('Đã di chuyển thành công!');
  };

  // cột action cho bảng từ vựng trong modal chủ đề
  const TopicActionColumn = ({ item }) => (
    <div className="flex justify-center">
      <button
        onClick={(e) => handleToggleMenu(item.id, e)}
        className="p-2 text-gray-400 hover:text-cyan-700 hover:bg-cyan-50 rounded-full transition-colors"
      >
        <MoreVertical size={20} />
      </button>
      {openMenuId === item.id && menuAnchor && createPortal(
        <div
          style={{ position: 'fixed', top: menuAnchor.top, right: menuAnchor.right }}
          className="w-48 bg-white border border-gray-100 shadow-xl rounded-lg py-1 z-[9999] text-left"
        >
          <button onClick={() => { closeMenu(); setEditingWords([item]); setShowEditWordModal(true); }} className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-cyan-50 font-medium flex items-center gap-2">
            <Edit2 size={16} /> Chỉnh sửa
          </button>
          <button onClick={() => { closeMenu(); openMoveModal([item], false); }} className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-cyan-50 font-medium flex items-center gap-2">
            <FolderInput size={16} /> Di chuyển
          </button>
          <div className="border-t border-gray-100 my-1"></div>
          <button onClick={() => { closeMenu(); setWordToDelete(item); setShowConfirmDeleteWord(true); }} className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2">
            <Trash2 size={16} /> Xóa từ
          </button>
        </div>,
        document.body
      )}
    </div>
  );

  // cột action cho bảng từ vựng trong modal bài học
  const LessonActionColumn = ({ item }) => (
    <div className="flex justify-center">
      <button
        onClick={(e) => handleToggleMenu(item.id, e)}
        className="p-2 text-gray-400 hover:text-cyan-700 hover:bg-cyan-50 rounded-full transition-colors"
      >
        <MoreVertical size={20} />
      </button>
      {openMenuId === item.id && menuAnchor && createPortal(
        <div
          style={{ position: 'fixed', top: menuAnchor.top, right: menuAnchor.right }}
          className="w-48 bg-white border border-gray-100 shadow-xl rounded-lg py-1 z-[9999] text-left"
        >
          <button onClick={() => { closeMenu(); setEditingWords([item]); setShowEditWordModal(true); }} className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-cyan-50 font-medium flex items-center gap-2">
            <Edit2 size={16} /> Chỉnh sửa
          </button>
          <button onClick={() => { closeMenu(); openMoveModal([item], true); }} className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-cyan-50 font-medium flex items-center gap-2">
            <FolderInput size={16} /> Đổi bài học
          </button>
          <div className="border-t border-gray-100 my-1"></div>
          <button onClick={() => { closeMenu(); setWordToDelete(item); setShowConfirmDeleteWord(true); }} className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2">
            <Trash2 size={16} /> Xóa từ
          </button>
        </div>,
        document.body
      )}
    </div>
  );

  let finalTopicWords = modalWords;
  if (selectedLessonFilters.length > 0) {
    finalTopicWords = finalTopicWords.filter(w => selectedLessonFilters.includes(w.lessonId));
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">

      {/* thanh công cụ */}
      <div className="bg-white rounded-[1.25rem] shadow-sm border border-gray-200 p-4 mb-6 flex justify-between items-center">
        <div className="flex gap-4 items-center w-full max-w-xl">
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm kiếm chủ đề..." className="flex-1" />
        </div>
        <div className="flex gap-3 items-center">
          {isSelectMode ? (
            <>
              <span className="text-sm font-bold text-cyan-800">Đã chọn {selectedTopicIds.length}</span>
              <button onClick={() => setIsSelectMode(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors text-sm">Hủy</button>
              {selectedTopicIds.length > 0 && (
                <button onClick={() => { setTopicToDelete(null); setShowConfirmDeleteTopic(true); }} className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl flex items-center gap-2 text-sm transition-colors">
                  <Trash2 size={16} /> Xóa ({selectedTopicIds.length})
                </button>
              )}
            </>
          ) : (
            <>
              <button onClick={() => setIsSelectMode(true)} className="px-4 py-2.5 bg-white border border-gray-200 hover:border-cyan-400 text-gray-700 font-bold rounded-xl flex items-center gap-2 transition-colors">
                <Check size={18} /> Chọn nhiều
              </button>
              <button onClick={() => setShowCreateTopicModal(true)} className="px-5 py-2.5 bg-[#0e7490] hover:bg-[#164e63] text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 transition-all flex items-center gap-2">
                <Plus size={18} /> Tạo chủ đề
              </button>
            </>
          )}
        </div>
      </div>

      {/* danh sách chủ đề */}
      <div>
        <h2 className="text-2xl font-bold text-[#083344] mb-6 border-b-2 border-gray-200 pb-2 inline-block">Chủ đề từ vựng</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTopics.map((topic) => (
            <div key={topic.id} className="relative bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all flex flex-col justify-between min-h-[14rem] group">

              {/* checkbox chọn nhiều hoặc nút xóa */}
              <div className="absolute top-4 right-4 z-10">
                {isSelectMode ? (
                  <input
                    type="checkbox"
                    checked={selectedTopicIds.includes(topic.id)}
                    onChange={() => toggleTopicSelect(topic.id)}
                    className="w-5 h-5 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500 cursor-pointer"
                  />
                ) : (
                  <button
                    onClick={() => { setTopicToDelete(topic); setShowConfirmDeleteTopic(true); }}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 p-1 ${topic.color}`}>
                  <img src={topic.imageUrl} alt={topic.title} className="w-full h-full object-contain" />
                </div>
                {/* tiêu đề và nút sửa */}
                <div className="flex items-center gap-1.5 mb-3 pr-10">
                  <h3 className="font-bold text-gray-800 line-clamp-1">{topic.title}</h3>
                  {!isSelectMode && (
                    <button
                      onClick={() => { setEditingTopic(topic); setNewTopicName(topic.title); setShowEditTopicModal(true); }}
                      className="shrink-0 p-1 text-gray-300 hover:text-cyan-600 hover:bg-cyan-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Edit2 size={15} />
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-2.5 mb-4">
                  <span className="text-xs text-gray-600 font-medium bg-gray-100/80 px-3 py-1.5 rounded-lg w-fit">
                    Số từ: {topic.totalVocab} từ
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center gap-2">
                <button onClick={() => openTopicWords(topic)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-white text-cyan-700 hover:bg-cyan-50 border border-cyan-100 transition-colors shrink-0 shadow-sm">
                  <Eye size={16} /> Xem từ
                </button>
                <button onClick={() => openTopicLessons(topic)} className="flex items-center justify-center text-[#0e7490] hover:text-white bg-cyan-50 hover:bg-[#0e7490] px-4 py-2 rounded-lg transition-all duration-300 shadow-sm border border-cyan-100 hover:border-transparent font-semibold text-sm">
                  Bài học
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* modal tạo chủ đề */}
      <ModalWrapper isOpen={showCreateTopicModal} zIndex="z-[200]">
        <h3 className="text-xl font-bold text-cyan-950 mb-4">Tạo chủ đề mới</h3>
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">Tên chủ đề</label>
          <input type="text" value={newTopicName} onChange={(e) => setNewTopicName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white outline-none" placeholder="Nhập tên chủ đề..." autoFocus />
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={() => setShowCreateTopicModal(false)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">Hủy</button>
          <button onClick={handleCreateTopic} disabled={!newTopicName.trim()} className="px-6 py-2.5 bg-[#0e7490] hover:bg-[#164e63] disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all">Xác nhận</button>
        </div>
      </ModalWrapper>

      {/* modal đổi tên chủ đề */}
      <ModalWrapper isOpen={showEditTopicModal} zIndex="z-[200]">
        <h3 className="text-xl font-bold text-cyan-950 mb-4">Đổi tên chủ đề</h3>
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">Tên chủ đề</label>
          <input type="text" value={newTopicName} onChange={(e) => setNewTopicName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white outline-none" autoFocus />
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={() => setShowEditTopicModal(false)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">Hủy</button>
          <button onClick={handleEditTopic} disabled={!newTopicName.trim()} className="px-6 py-2.5 bg-[#0e7490] hover:bg-[#164e63] disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all">Lưu thay đổi</button>
        </div>
      </ModalWrapper>

      {/* modal tạo bài học */}
      <ModalWrapper isOpen={showCreateLessonModal} zIndex="z-[200]">
        <h3 className="text-xl font-bold text-cyan-950 mb-4">Tạo bài học mới</h3>
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">Tên bài học</label>
          <input type="text" value={newLessonName} onChange={(e) => setNewLessonName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white outline-none" placeholder="Nhập tên bài học..." autoFocus />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">Độ khó</label>
          <select value={newLessonDifficulty} onChange={(e) => setNewLessonDifficulty(parseInt(e.target.value))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white outline-none font-bold text-blue-600">
            <option value={1}>A1</option>
            <option value={2}>A2</option>
            <option value={3}>B1</option>
            <option value={4}>B2</option>
            <option value={5}>C1</option>
            <option value={6}>C2</option>
          </select>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={() => setShowCreateLessonModal(false)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">Hủy</button>
          <button onClick={handleCreateLesson} disabled={!newLessonName.trim()} className="px-6 py-2.5 bg-[#0e7490] hover:bg-[#164e63] disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all">Xác nhận tạo</button>
        </div>
      </ModalWrapper>

      {/* modal từ vựng của chủ đề */}
      <ModalWrapper isOpen={showTopicWordsModal && activeTopic} zIndex="z-[100]" className="rounded-2xl w-full max-w-6xl overflow-hidden flex flex-col h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-cyan-50/30">
          <h3 className="text-2xl font-bold text-cyan-950 flex items-center gap-3">
            <BookOpen className="text-cyan-600" /> Chủ đề: {activeTopic?.title}
          </h3>

          <div className="flex items-center gap-3">
            <div className="w-60">
              <SearchBar value={wordSearchTerm} onChange={(e) => setWordSearchTerm(e.target.value)} placeholder="Tìm từ vựng..." />
            </div>

            {/* lọc bài học */}
            <FilterDropdown
              label="Lọc bài học"
              activeCount={selectedLessonFilters.length}
              onClear={() => setSelectedLessonFilters([])}
              dropdownWidth="w-60"
              position="left-0"
              title="Chọn bài học"
            >
              <label className="flex items-center gap-3 px-4 py-2.5 hover:bg-cyan-50 cursor-pointer transition-colors border-b border-gray-100">
                <input
                  type="checkbox"
                  checked={selectedLessonFilters.length === 0}
                  onChange={() => setSelectedLessonFilters([])}
                  className="w-4 h-4 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500 cursor-pointer"
                />
                <span className="text-sm font-semibold text-cyan-700">Tất cả bài học</span>
              </label>
              {activeTopic?.lessons.map(l => (
                <label key={l.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-cyan-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedLessonFilters.includes(l.id)}
                    onChange={() => setSelectedLessonFilters(prev =>
                      prev.includes(l.id) ? prev.filter(id => id !== l.id) : [...prev, l.id]
                    )}
                    className="w-4 h-4 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700">{l.name}</span>
                </label>
              ))}
            </FilterDropdown>

            {/* chọn nhiều */}
            {!isWordSelectMode ? (
              <button onClick={() => setIsWordSelectMode(true)} className="px-4 py-2 border border-cyan-200 text-cyan-700 font-bold rounded-xl hover:bg-cyan-50 text-sm">Chọn nhiều</button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => setIsWordSelectMode(false)} className="px-4 py-2 border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-sm">Hủy</button>
                {selectedWordIds.length > 0 && (
                  <>
                    <button onClick={() => { setEditingWords(modalWords.filter(w => selectedWordIds.includes(w.id))); setShowEditWordModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                    <button onClick={() => openMoveModal(modalWords.filter(w => selectedWordIds.includes(w.id)))} className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg"><FolderInput size={18} /></button>
                    <button onClick={() => setShowConfirmDeleteWord(true)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                  </>
                )}
              </div>
            )}
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
            <button onClick={() => setShowTopicWordsModal(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full"><X size={24} /></button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto bg-gray-50/30 flex-1">
          <VocabTable
            words={finalTopicWords} searchTerm={wordSearchTerm} isSelectMode={isWordSelectMode} selectedIds={selectedWordIds}
            onToggleSelect={toggleWordSelect} onSelectAll={handleWordSelectAll} ActionColumn={TopicActionColumn}
            showTopicColumn={false} showLessonColumn={true}
          />
        </div>
      </ModalWrapper>

      {/* modal bài học của chủ đề */}
      <ModalWrapper isOpen={showTopicLessonsModal && activeTopic} zIndex="z-[100]" className="rounded-[1.5rem] w-full max-w-3xl flex flex-col h-[85vh]">
        <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-cyan-50/50">
          <div>
            <h2 className="text-2xl font-black text-cyan-950 flex items-center gap-3"><Gamepad2 className="text-cyan-600" /> Danh sách bài học: {activeTopic?.title}</h2>
            <p className="text-gray-500 mt-2">Chọn một bài học dưới đây để xem danh sách từ vựng.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowCreateLessonModal(true)} className="px-4 py-2 bg-[#0e7490] hover:bg-[#164e63] text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 text-sm">
              <Plus size={16} /> Tạo bài học
            </button>
            <button onClick={() => setShowTopicLessonsModal(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"><X size={24} /></button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          <div className="space-y-4">
            {activeTopic?.lessons.map((lesson, idx) => {
              const lessonWordCount = MOCK_WORDS.filter(w => w.lessonId === lesson.id).length;
              const levelLabels = { 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2', 5: 'C1', 6: 'C2' };
              // Tính cấp độ trung bình của các từ trong bài (MOCK: dùng level của từ đầu tiên)
              const lessonWords = MOCK_WORDS.filter(w => w.lessonId === lesson.id);
              const avgLevel = lessonWords.length > 0
                ? Math.round(lessonWords.reduce((a, w) => a + w.level, 0) / lessonWords.length)
                : lesson.difficulty;
              return (
                <div key={lesson.id} className="bg-white p-5 rounded-[1.25rem] border border-cyan-100 hover:border-cyan-400 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-cyan-50 text-cyan-700 font-bold rounded-full flex items-center justify-center text-lg">{idx + 1}</div>
                    <div>
                      <h3 className="text-lg font-bold text-cyan-950">{lesson.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-500 font-medium">{lessonWordCount} từ vựng</p>
                        {avgLevel && (
                          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                            {levelLabels[avgLevel]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => openLessonWords(lesson, activeTopic)} className="px-6 py-2.5 bg-white border border-cyan-200 text-cyan-700 font-bold rounded-xl hover:bg-cyan-50 transition-colors shadow-sm">
                    Xem từ
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </ModalWrapper>

      {/* modal từ vựng của bài học */}
      <ModalWrapper isOpen={showLessonWordsModal && activeLesson} zIndex="z-[150]" className="rounded-2xl w-full max-w-6xl overflow-hidden flex flex-col h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-cyan-50/30">
          <div>
            <button onClick={() => { setShowLessonWordsModal(false); setShowTopicLessonsModal(true); }} className="text-cyan-700 hover:underline font-bold flex items-center gap-1 text-sm mb-1"><ChevronRight size={14} className="rotate-180" /> Trở về danh sách bài học</button>
            <h3 className="text-2xl font-bold text-cyan-950 flex items-center gap-3">
              <BookOpen className="text-cyan-600" /> Bài học: {activeLesson?.name}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-64">
              <SearchBar value={wordSearchTerm} onChange={(e) => setWordSearchTerm(e.target.value)} placeholder="Tìm từ vựng..." />
            </div>

            {/* chọn nhiều */}
            {!isWordSelectMode ? (
              <button onClick={() => setIsWordSelectMode(true)} className="px-4 py-2 border border-cyan-200 text-cyan-700 font-bold rounded-xl hover:bg-cyan-50 text-sm">Chọn nhiều</button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => setIsWordSelectMode(false)} className="px-4 py-2 border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-sm">Hủy</button>
                {selectedWordIds.length > 0 && (
                  <>
                    <button onClick={() => { setEditingWords(modalWords.filter(w => selectedWordIds.includes(w.id))); setShowEditWordModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                    <button onClick={() => openMoveModal(modalWords.filter(w => selectedWordIds.includes(w.id)))} className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg"><FolderInput size={18} /></button>
                    <button onClick={() => setShowConfirmDeleteWord(true)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                  </>
                )}
              </div>
            )}
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
            <button onClick={() => setShowLessonWordsModal(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full"><X size={24} /></button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto bg-gray-50/30 flex-1">
          <VocabTable
            words={modalWords} searchTerm={wordSearchTerm} isSelectMode={isWordSelectMode} selectedIds={selectedWordIds}
            onToggleSelect={toggleWordSelect} onSelectAll={handleWordSelectAll} ActionColumn={LessonActionColumn}
            showTopicColumn={false} showLessonColumn={false}
          />
        </div>
      </ModalWrapper>

      {/* modal di chuyển từ vựng */}
      <ModalWrapper isOpen={showMoveWordModal} zIndex="z-[200]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-cyan-950 flex items-center gap-2"><FolderInput className="text-cyan-600" /> Di chuyển từ vựng</h3>
          <button onClick={() => setShowMoveWordModal(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full"><X size={20} /></button>
        </div>

        <div className="bg-blue-50 text-blue-800 p-3 rounded-xl mb-6 font-medium text-sm">
          Bạn đang chọn di chuyển <strong>{movingWords.length}</strong> từ vựng.
        </div>

        <div className="space-y-4 mb-8">
          {/* chế độ full: chọn cả chủ đề lẫn bài học */}
          {moveMode === 'full' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Chọn chủ đề đích</label>
              <select value={moveTargetTopicId} onChange={e => { setMoveTargetTopicId(e.target.value); setMoveTargetLessonId(''); }} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none font-medium">
                <option value="">-- Chọn Chủ đề --</option>
                {/* chỉ hiện các chủ đỀ khác với chủ đỀ hiện tại */}
                {topics.filter(t => t.id !== activeTopic?.id).map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
          )}

          {/* chọn bài học đích */}
          {(moveMode === 'full' ? moveTargetTopicId : true) && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {moveMode === 'lesson-only'
                  ? `Chọn bài học khác (trong chủ đề: ${activeTopic?.title})`
                  : 'Chọn bài học đích'}
              </label>
              <select value={moveTargetLessonId} onChange={e => setMoveTargetLessonId(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none font-medium">
                <option value="">-- Chọn Bài học --</option>
                {(moveMode === 'lesson-only'
                  ? activeTopic?.lessons
                  : topics.find(t => t.id === parseInt(moveTargetTopicId))?.lessons
                )?.filter(l => l.id !== activeLesson?.id)
                  .map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={() => setShowMoveWordModal(false)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">Hủy</button>
          <button onClick={handleConfirmMove} disabled={!moveTargetLessonId || (moveMode === 'full' && !moveTargetTopicId)} className="px-6 py-2.5 bg-[#0e7490] hover:bg-[#164e63] disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all">Xác nhận di chuyển</button>
        </div>
      </ModalWrapper>

      {/* xác nhận xóa */}
      <ConfirmModal
        isOpen={showConfirmDeleteTopic}
        onClose={() => setShowConfirmDeleteTopic(false)}
        onConfirm={handleDeleteTopicConfirm}
        title="Xóa chủ đề"
        message={topicToDelete ? `Bạn có chắc chắn muốn xóa chủ đề "${topicToDelete.title}" và TOÀN BỘ từ vựng bên trong không? Hành động này không thể hoàn tác.` : `Bạn có chắc chắn muốn xóa ${selectedTopicIds.length} chủ đề đã chọn cùng TOÀN BỘ từ vựng bên trong không?`}
        confirmText="Xóa vĩnh viễn"
        isDanger={true}
      />

      <ConfirmModal
        isOpen={showConfirmDeleteWord}
        onClose={() => setShowConfirmDeleteWord(false)}
        onConfirm={handleDeleteWordConfirm}
        title="Xóa từ vựng"
        message={wordToDelete ? `Bạn có chắc chắn muốn xóa từ "${wordToDelete.word}" khỏi hệ thống không?` : `Bạn có chắc chắn muốn xóa ${selectedWordIds.length} từ vựng đã chọn khỏi hệ thống không?`}
        confirmText="Xóa vĩnh viễn"
        isDanger={true}
      />

      {/* modal chỉnh sửa từ vựng */}
      <ModalWrapper isOpen={showEditWordModal} zIndex="z-[200]" className="rounded-[1.5rem] w-full max-w-7xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white z-10 shrink-0">
          <h2 className="text-xl font-bold text-cyan-950 flex items-center gap-2">
            <Edit2 className="text-cyan-600" /> Chỉnh sửa {editingWords.length} từ vựng
          </h2>
          <button onClick={() => setShowEditWordModal(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-cyan-50/50 border-b border-gray-200 text-cyan-900 text-xs uppercase tracking-wider">
                  <th className="p-3 w-12 text-center">#</th>
                  <th className="p-3 w-32">Từ vựng <span className="text-red-500">*</span></th>
                  <th className="p-3 w-32">Phiên âm</th>
                  <th className="p-3 w-32">Loại từ</th>
                  <th className="p-3 w-40">Nghĩa <span className="text-red-500">*</span></th>
                  <th className="p-3 w-24 text-center">Cấp độ</th>
                  <th className="p-3 w-48">Ví dụ</th>
                </tr>
              </thead>
              <tbody>
                {editingWords.map((word, index) => (
                  <tr key={word.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="p-3 text-center text-gray-400 font-bold">{index + 1}</td>
                    <td className="p-3"><input type="text" value={word.word} onChange={(e) => handleEditWordChange(word.id, 'word', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500 outline-none text-sm font-bold text-cyan-950" /></td>
                    <td className="p-3"><input type="text" value={word.pronunciation} onChange={(e) => handleEditWordChange(word.id, 'pronunciation', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500 outline-none text-sm text-gray-600" /></td>
                    <td className="p-3">
                      <select value={word.word_type} onChange={(e) => handleEditWordChange(word.id, 'word_type', e.target.value)} className="w-full px-2 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500 outline-none text-sm text-gray-600 bg-white">
                        <option value="Danh từ">Danh từ</option>
                        <option value="Động từ">Động từ</option>
                        <option value="Tính từ">Tính từ</option>
                        <option value="Trạng từ">Trạng từ</option>
                      </select>
                    </td>
                    <td className="p-3"><input type="text" value={word.meaning} onChange={(e) => handleEditWordChange(word.id, 'meaning', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500 outline-none text-sm font-medium" /></td>
                    <td className="p-3">
                      <select value={word.level} onChange={(e) => handleEditWordChange(word.id, 'level', parseInt(e.target.value))} className="w-full px-2 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500 outline-none text-sm font-bold text-blue-600 bg-white text-center">
                        {[1, 2, 3, 4, 5, 6].map(lvl => (
                          <option key={lvl} value={lvl}>{lvl === 1 ? 'A1' : lvl === 2 ? 'A2' : lvl === 3 ? 'B1' : lvl === 4 ? 'B2' : lvl === 5 ? 'C1' : 'C2'}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3"><input type="text" value={word.example} onChange={(e) => handleEditWordChange(word.id, 'example', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500 outline-none text-sm text-gray-600 italic" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3 shrink-0 rounded-b-[1.5rem]">
          <button onClick={() => setShowEditWordModal(false)} className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 font-bold rounded-xl transition-colors">Hủy</button>
          <button onClick={handleSaveEditedWords} className="px-8 py-2.5 font-bold rounded-xl shadow-lg transition-all bg-[#0e7490] hover:bg-[#164e63] text-white">Xác nhận Lưu</button>
        </div>
      </ModalWrapper>

    </div>
  );
}
