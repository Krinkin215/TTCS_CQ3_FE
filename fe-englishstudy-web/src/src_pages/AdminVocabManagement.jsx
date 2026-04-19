import React, { useState, useRef } from 'react';
import { Search, X, Filter, Plus, Upload, ChevronDown, Trash2, Edit2, FileSpreadsheet, MoreVertical } from 'lucide-react';
import VocabTable from '../src_components/VocabTable'; 
import SearchBar from '../src_components/SearchBar';
import ConfirmModal from '../src_components/ConfirmModal';

const ADMIN_USER_ID = 1;

const MOCK_VOCABULARIES = [
  { id: 1, word: 'Enthusiastic', pronunciation: '/ɪnˌθjuː.ziˈæs.tɪk/', word_type: 'Tính từ', meaning: 'Nhiệt tình, hăng hái', example: 'The crowd gave an enthusiastic cheer.', level: 4, created_by: ADMIN_USER_ID, topic: 'Kinh doanh (Business)', lesson: 'Bài học 1' },
  { id: 2, word: 'Determine', pronunciation: '/dɪˈtɜː.mɪn/', word_type: 'Động từ', meaning: 'Xác định, quyết định', example: 'Your attitude determines your altitude.', level: 3, created_by: ADMIN_USER_ID, topic: 'Công nghệ (Technology)', lesson: 'Bài học 2' },
  { id: 3, word: 'Fascinating', pronunciation: '/ˈfæs.ən.eɪ.tɪŋ/', word_type: 'Tính từ', meaning: 'Hấp dẫn, lôi cuốn', example: 'I found the whole movie fascinating.', level: 4, created_by: ADMIN_USER_ID, topic: 'Du lịch (Travel)', lesson: 'Bài học 1' },
  { id: 4, word: 'Accomplish', pronunciation: '/əˈkʌm.plɪʃ/', word_type: 'Động từ', meaning: 'Hoàn thành, đạt được', example: 'The students accomplished the task in less than ten minutes.', level: 5, created_by: ADMIN_USER_ID, topic: 'Kinh doanh (Business)', lesson: 'Bài học 3' },
];

const MOCK_TOPICS = [
  { id: 1, name: 'Động vật (Animals)' },
  { id: 2, name: 'Công nghệ (Technology)' },
  { id: 3, name: 'Kinh doanh (Business)' },
  { id: 4, name: 'Du lịch (Travel)' }
];

const MOCK_LESSONS = [
  { id: 1, name: 'Bài học 1' },
  { id: 2, name: 'Bài học 2' },
  { id: 3, name: 'Bài học 3' },
  { id: 4, name: 'Bài học 4' }
];

const FILTER_OPTIONS = {
  types: ['Danh từ', 'Động từ', 'Tính từ', 'Trạng từ'],
  levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
};

export default function AdminVocabManagement() {
  
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [vocabularies, setVocabularies] = useState(MOCK_VOCABULARIES);
  
  // modal thêm từ mới
  const [showAddWordModal, setShowAddWordModal] = useState(false);
  const [showImportDropdown, setShowImportDropdown] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  
  const fileInputRef = useRef(null);

  const defaultDraftRow = { id: Date.now(), word: '', pronunciation: '', word_type: 'Danh từ', meaning: '', level: 1, example: '', topic: '', lesson: '' };
  const [draftWords, setDraftWords] = useState([{ ...defaultDraftRow }]);
  const [isSaving, setIsSaving] = useState(false); 

  // modal chỉnh sửa
  const [showEditWordModal, setShowEditWordModal] = useState(false);
  const [editingWords, setEditingWords] = useState([]);

  // modal xóa
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [wordToDelete, setWordToDelete] = useState(null);

  // bộ lọc
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [openFilterDropdown, setOpenFilterDropdown] = useState(null); 
  const [filterSearch, setFilterSearch] = useState({ topics: '', lessons: '' });

  const initialFilters = { topics: [], lessons: [], types: [], levels: [] };
  const [activeFilters, setActiveFilters] = useState(initialFilters); 
  const [draftFilters, setDraftFilters] = useState(initialFilters);

  // menu hành động dùng chung, tránh nhiều menu mở cùng lúc
  const [openMenuId, setOpenMenuId] = useState(null);

  const toggleDraftFilter = (category, value) => {
    setDraftFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value) ? prev[category].filter(v => v !== value) : [...prev[category], value]
    }));
  };

  const toggleAllDraftFilter = (category, allValues) => {
    setDraftFilters(prev => ({
      ...prev,
      [category]: prev[category].length === allValues.length && allValues.length > 0 ? [] : allValues
    }));
  };

  const applyFilters = () => {
    setActiveFilters(draftFilters);
    setShowFilterModal(false);
    setOpenFilterDropdown(null);
  };

  const clearFilters = () => {
    setDraftFilters(initialFilters);
  };

  const LEVEL_STR_TO_INT = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };

  const filteredVocabularies = vocabularies.filter(word => {
    if (activeFilters.types.length > 0 && !activeFilters.types.includes(word.word_type)) return false;
    // cấp độ lưu dạng chuỗi ('A1'...) nhưng word.level là số nguyên, cần chuyển đổi
    if (activeFilters.levels.length > 0) {
      const levelInts = activeFilters.levels.map(l => LEVEL_STR_TO_INT[l]).filter(Boolean);
      if (!levelInts.includes(word.level)) return false;
    }
    
    if (activeFilters.topics.length > 0) {
      const topicObj = MOCK_TOPICS.find(t => t.name === word.topic);
      if (!topicObj || !activeFilters.topics.includes(topicObj.id)) return false;
    }
    
    if (activeFilters.lessons.length > 0) {
      const lessonObj = MOCK_LESSONS.find(l => l.name === word.lesson);
      if (!lessonObj || !activeFilters.lessons.includes(lessonObj.id)) return false;
    }

    return true;
  });


  const handleAddDraftRow = () => setDraftWords([...draftWords, { ...defaultDraftRow, id: Date.now() }]);
  const handleRemoveDraftRow = (id) => setDraftWords(draftWords.filter(w => w.id !== id));
  const handleDraftChange = (id, field, value) => {
    setDraftWords(draftWords.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  const handleCloseAddModal = () => {
    const hasUnsavedData = draftWords.some(w => w.word.trim() || w.meaning.trim());
    if (hasUnsavedData) {
      setShowExitWarning(true);
    } else {
      forceCloseAddModal();
    }
  };

  const forceCloseAddModal = () => {
    setShowAddWordModal(false);
    setShowExitWarning(false);
    setDraftWords([{ ...defaultDraftRow }]);
  };

  const handleSaveNewWords = async () => {
    const wordsToProcess = draftWords.filter(w => w.word.trim() && w.meaning.trim());

    if (wordsToProcess.length === 0) {
      alert("⚠️ Vui lòng nhập ít nhất 1 từ vựng có đủ TỪ TIẾNG ANH và NGHĨA!");
      return;
    }

    setIsSaving(true); 
    
    let addedCount = 0;
    let duplicateCount = 0;
    let formatErrorCount = 0;
    const currentVocabs = [...vocabularies];

    const wordRegex = /^[a-zA-Z\s-]+$/; 
    const pronunRegex = /^\/.*\/$/;     

    for (const newWord of wordsToProcess) {
      const wordTrimmed = newWord.word.trim();

      if (!wordRegex.test(wordTrimmed)) { formatErrorCount++; continue; }
      if (newWord.pronunciation && newWord.pronunciation.trim() !== '' && !pronunRegex.test(newWord.pronunciation.trim())) { formatErrorCount++; continue; }

      const exists = currentVocabs.some(v => v.word.toLowerCase() === wordTrimmed.toLowerCase());
      if (exists) { duplicateCount++; continue; }

      currentVocabs.unshift({ 
        ...newWord, 
        word: wordTrimmed, 
        id: Date.now() + Math.random(), 
        created_by: ADMIN_USER_ID 
      });
      addedCount++;
    }

    setVocabularies(currentVocabs);
    setIsSaving(false); 

    let alertMsg = `KẾT QUẢ THÊM TỪ VỰNG:\n\n`;
    if (addedCount > 0) alertMsg += `✅ Thành công: Thêm ${addedCount} từ mới.\n`;
    if (duplicateCount > 0) alertMsg += `⚠️ Bỏ qua: ${duplicateCount} từ (Đã có sẵn trong hệ thống).\n`;
    if (formatErrorCount > 0) alertMsg += `❌ Lỗi định dạng: ${formatErrorCount} từ (Có chứa số/kí tự lạ hoặc phiên âm thiếu dấu / /).\n`;

    alert(alertMsg);

    if (addedCount > 0) forceCloseAddModal();
  };

  const triggerFileInput = () => {
    setShowImportDropdown(false);
    fileInputRef.current?.click();
  };
  
  const handleFileUpload = (e) => {
    if (e.target.files.length > 0) alert(`Đã tải lên file: ${e.target.files[0].name}. (Cần Backend để parse file này)`);
    e.target.value = null;
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleSelectAllCurrentPage = (currentWords) => {
    const isAllCurrentSelected = currentWords.every(v => selectedIds.includes(v.id));
    if (isAllCurrentSelected && currentWords.length > 0) {
      const currentIds = currentWords.map(v => v.id);
      setSelectedIds(prev => prev.filter(id => !currentIds.includes(id)));
    } else {
      const newIds = currentWords.map(v => v.id).filter(id => !selectedIds.includes(id));
      setSelectedIds(prev => [...prev, ...newIds]);
    }
  };


  const handleOpenEditModal = (wordsToEdit) => {
    setEditingWords(JSON.parse(JSON.stringify(wordsToEdit)));
    setShowEditWordModal(true);
  };

  const handleEditWordChange = (id, field, value) => {
    setEditingWords(prev => prev.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  const handleSaveEditedWords = () => {
    const wordRegex = /^[a-zA-Z\s-]+$/;
    const pronunRegex = /^\/.*\/$/;
    let formatErrorCount = 0;
    let duplicateCount = 0;
    let emptyCount = 0;

    for (const word of editingWords) {
      const wordTrimmed = word.word.trim();
      
      if (!wordTrimmed || !word.meaning.trim()) { emptyCount++; continue; }
      
      if (!wordRegex.test(wordTrimmed)) { formatErrorCount++; continue; }
      if (word.pronunciation && word.pronunciation.trim() !== '' && !pronunRegex.test(word.pronunciation.trim())) { formatErrorCount++; continue; }
      
      const exists = vocabularies.some(v => v.id !== word.id && v.word.toLowerCase() === wordTrimmed.toLowerCase());
      if (exists) { duplicateCount++; continue; }
    }

    if (emptyCount > 0 || formatErrorCount > 0 || duplicateCount > 0) {
      alert(`LỖI KIỂM TRA DỮ LIỆU:\n\n${emptyCount > 0 ? `- Có ${emptyCount} từ bị bỏ trống Từ tiếng Anh hoặc Nghĩa.\n` : ''}${formatErrorCount > 0 ? `- Có ${formatErrorCount} từ sai định dạng (Từ chỉ chứa chữ cái, Phiên âm phải bọc trong / /).\n` : ''}${duplicateCount > 0 ? `- Có ${duplicateCount} từ bị trùng lặp với từ khác trong hệ thống.\n` : ''}\nVui lòng kiểm tra và sửa lại!`);
      return; 
    }

    setVocabularies(prev => prev.map(cw => {
      const edited = editingWords.find(ew => ew.id === cw.id);
      return edited ? edited : cw;
    }));

    alert("✅ Đã cập nhật thông tin từ vựng thành công!");
    setShowEditWordModal(false);
    setIsSelectMode(false);
    setSelectedIds([]);
  };

  const handleOpenDeleteModal = (word = null) => {
    setWordToDelete(word);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (wordToDelete) {
      setVocabularies(vocabularies.filter(v => v.id !== wordToDelete.id));
    } else {
      setVocabularies(vocabularies.filter(v => !selectedIds.includes(v.id)));
      setIsSelectMode(false);
      setSelectedIds([]);
    }
    setShowDeleteModal(false);
    setWordToDelete(null);
  };

  const AdminActionColumn = ({ item }) => {
    return (
      <div className="relative flex justify-center">
        <button 
          onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
          className="p-2 text-gray-400 hover:text-cyan-700 hover:bg-cyan-50 rounded-full transition-colors"
        >
          <MoreVertical size={20} />
        </button>

        {openMenuId === item.id && (
          <div className="absolute right-8 top-0 w-36 bg-white border border-gray-100 shadow-xl rounded-lg py-1 z-50 text-left">
            <button 
              onClick={() => { handleOpenEditModal([item]); setOpenMenuId(null); }}
              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-cyan-50 text-left font-medium flex items-center gap-2"
            >
              <Edit2 size={16} /> Chỉnh sửa
            </button>
            <button 
              onClick={() => { handleOpenDeleteModal(item); setOpenMenuId(null); }}
              className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left font-medium flex items-center gap-2"
            >
              <Trash2 size={16} /> Xóa từ
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderFilterDropdown = (title, category, options, isObject = false, searchKey = null) => {
    const isOpen = openFilterDropdown === category;
    let displayOptions = options;
    
    if (searchKey) {
      displayOptions = options.filter(opt => 
        (isObject ? opt.name : opt).toLowerCase().includes(filterSearch[searchKey].toLowerCase())
      );
    }

    const allValues = options.map(opt => isObject ? opt.id : opt);
    const isAllSelected = draftFilters[category].length === allValues.length && allValues.length > 0;

    return (
      <div className="col-span-1 flex flex-col justify-start">
        <label className="block text-sm font-bold text-gray-700 mb-1.5">{title}</label>
        <div className="relative">
          <div 
            onClick={() => setOpenFilterDropdown(isOpen ? null : category)}
            className={`w-full px-4 py-2.5 border rounded-xl cursor-pointer flex justify-between items-center transition-colors ${isOpen ? 'bg-cyan-50 border-cyan-400' : 'bg-white border-gray-300 hover:border-cyan-400'}`}
          >
            <span className="text-gray-700 font-medium truncate pr-2">
              {draftFilters[category].length === 0 
                ? 'Tất cả' 
                : draftFilters[category].length === allValues.length 
                  ? 'Đã chọn tất cả' 
                  : `Đã chọn (${draftFilters[category].length})`}
            </span>
            <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-cyan-600' : ''}`} />
          </div>

          {isOpen && (
            <div className="absolute z-[100] top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 flex flex-col overflow-hidden">
              {searchKey && (
                <div className="p-2 border-b border-gray-100 shrink-0">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input type="text" placeholder="Tìm kiếm..." value={filterSearch[searchKey]} onChange={(e) => setFilterSearch({...filterSearch, [searchKey]: e.target.value})} className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-cyan-500 outline-none" />
                  </div>
                </div>
              )}
              <div className="overflow-y-auto p-2 flex-1 scrollbar-thin">
                <label className="flex items-center gap-3 p-2.5 hover:bg-cyan-50 rounded-lg cursor-pointer border-b border-gray-50 group">
                  <input type="checkbox" checked={isAllSelected} onChange={() => toggleAllDraftFilter(category, allValues)} className="w-4 h-4 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500 cursor-pointer" />
                  <span className="font-bold text-cyan-900 group-hover:text-cyan-700">Chọn tất cả</span>
                </label>
                {displayOptions.length > 0 ? displayOptions.map(opt => {
                  const val = isObject ? opt.id : opt;
                  const label = isObject ? opt.name : opt;
                  return (
                    <label key={val} className="flex items-center gap-3 p-2.5 hover:bg-cyan-50 rounded-lg cursor-pointer group">
                      <input type="checkbox" checked={draftFilters[category].includes(val)} onChange={() => toggleDraftFilter(category, val)} className="w-4 h-4 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500 cursor-pointer shrink-0" />
                      <span className="text-gray-700 font-medium group-hover:text-cyan-900 truncate">{label}</span>
                    </label>
                  );
                }) : (
                  <div className="p-4 text-center text-gray-400 text-sm">Không tìm thấy kết quả.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      
      {/* thanh công cụ */}
      <div className="bg-white rounded-[1.25rem] shadow-sm border border-gray-200 p-4 mb-6 flex justify-between items-center transition-all">
        
        <div className="flex gap-4 items-center w-full max-w-xl">
          <SearchBar 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm từ vựng..."
            className="flex-1"
          />
          <button 
            onClick={() => { setDraftFilters(activeFilters); setShowFilterModal(true); setOpenFilterDropdown(null); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200 font-semibold transition-colors shrink-0 shadow-sm relative"
          >
            <Filter size={18} /> Bộ lọc
            {Object.values(activeFilters).some(arr => arr.length > 0) && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
        </div>

        <div className="flex gap-3 items-center">
          {!isSelectMode && (
            <button 
              onClick={() => setShowAddWordModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl shadow-sm transition-colors mr-2"
            >
              <Plus size={20} /> Thêm từ
            </button>
          )}

          {isSelectMode && (
            <>
              <button 
                onClick={() => handleOpenEditModal(vocabularies.filter(w => selectedIds.includes(w.id)))}
                disabled={selectedIds.length === 0}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl shadow-sm font-bold transition-colors ${
                  selectedIds.length > 0
                    ? 'bg-white text-cyan-700 border-cyan-300 hover:bg-cyan-50 cursor-pointer'
                    : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-70'
                }`}
              >
                <Edit2 size={18} /> Chỉnh sửa ({selectedIds.length})
              </button>

              <button 
                onClick={() => handleOpenDeleteModal(null)}
                disabled={selectedIds.length === 0}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl shadow-sm font-bold transition-colors ${
                  selectedIds.length > 0 
                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 cursor-pointer' 
                    : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-70'
                }`}
              >
                <Trash2 size={18} /> Xóa ({selectedIds.length})
              </button>
            </>
          )}
          
          <button 
            onClick={() => {
              setIsSelectMode(!isSelectMode);
              if (isSelectMode) setSelectedIds([]); 
            }}
            className={`px-6 py-2.5 font-bold rounded-xl shadow-sm transition-colors ${
              isSelectMode 
                ? 'bg-[#164e63] text-white' 
                : 'bg-[#0e7490] hover:bg-[#164e63] text-white'
            }`}
          >
            {isSelectMode ? 'Hủy chọn' : 'Chọn nhiều'}
          </button>
        </div>
      </div>


      <VocabTable 
        words={filteredVocabularies}
        searchTerm={searchTerm}
        isSelectMode={isSelectMode}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onSelectAll={handleSelectAllCurrentPage}
        ActionColumn={AdminActionColumn} 
        showTopicColumn={true}
        showLessonColumn={true}
      />
      
      {/* modal thêm từ vựng */}
      {showAddWordModal && (
        <div className="fixed inset-0 bg-cyan-950/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-7xl flex flex-col max-h-[90vh] animate-in zoom-in duration-200 border border-gray-100 relative overflow-hidden">
            
            <div className="p-5 border-b border-gray-100 shrink-0 bg-white z-20">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-2xl font-black text-cyan-950">Thêm từ vựng mới</h2>
                <button onClick={handleCloseAddModal} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex gap-3 items-center">
                <div className="relative">
                  <button 
                    onClick={() => setShowImportDropdown(!showImportDropdown)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0e7490] hover:bg-[#164e63] text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
                  >
                    <Upload size={18} /> Nhập file <ChevronDown size={16} className={`transition-transform ${showImportDropdown ? 'rotate-180' : ''}`}/>
                  </button>
                  {showImportDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl py-2 z-50">
                      <button onClick={triggerFileInput} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-cyan-50 text-gray-700 font-medium text-sm transition-colors"><FileSpreadsheet size={18} className="text-emerald-600"/> Nhập file CSV (.csv)</button>
                      <button onClick={triggerFileInput} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-cyan-50 text-gray-700 font-medium text-sm transition-colors"><FileSpreadsheet size={18} className="text-emerald-600"/> Nhập file Excel (.xlsx)</button>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                      <tr className="bg-cyan-50/50 border-b border-gray-200 text-cyan-900 text-xs uppercase tracking-wider">
                        <th className="p-3 w-12 text-center">#</th>
                        <th className="p-3 w-32">Chủ đề</th>
                        <th className="p-3 w-32">Bài học</th>
                        <th className="p-3 w-32">Từ vựng <span className="text-red-500">*</span></th>
                        <th className="p-3 w-32">Phiên âm</th>
                        <th className="p-3 w-32">Loại từ</th>
                        <th className="p-3 w-40">Nghĩa <span className="text-red-500">*</span></th>
                        <th className="p-3 w-24 text-center">Cấp độ</th>
                        <th className="p-3 w-48">Ví dụ</th>
                        <th className="p-3 w-12 text-center"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {draftWords.map((word, index) => (
                        <tr key={word.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                          <td className="p-3 text-center text-gray-400 font-bold">{index + 1}</td>
                          <td className="p-3">
                            <input type="text" placeholder="Tên chủ đề..." value={word.topic || ''} onChange={(e) => handleDraftChange(word.id, 'topic', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500 outline-none text-sm text-gray-700"/>
                          </td>
                          <td className="p-3">
                            <input type="text" placeholder="Tên bài học..." value={word.lesson || ''} onChange={(e) => handleDraftChange(word.id, 'lesson', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500 outline-none text-sm text-gray-700"/>
                          </td>
                          <td className="p-3"><input type="text" placeholder="Apple" value={word.word} onChange={(e) => handleDraftChange(word.id, 'word', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500 outline-none text-sm font-bold text-cyan-950"/></td>
                          <td className="p-3"><input type="text" placeholder="/ˈæp.əl/" value={word.pronunciation} onChange={(e) => handleDraftChange(word.id, 'pronunciation', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500 outline-none text-sm text-gray-600"/></td>
                          <td className="p-3">
                            <select 
                              value={word.word_type} 
                              onChange={(e) => handleDraftChange(word.id, 'word_type', e.target.value)} 
                              className="w-full px-2 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500 outline-none text-sm text-gray-600 bg-white"
                            >
                              <option value="Danh từ">Danh từ</option>
                              <option value="Động từ">Động từ</option>
                              <option value="Tính từ">Tính từ</option>
                              <option value="Trạng từ">Trạng từ</option>
                            </select>
                          </td>
                          <td className="p-3"><input type="text" placeholder="Quả táo" value={word.meaning} onChange={(e) => handleDraftChange(word.id, 'meaning', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500 outline-none text-sm font-medium"/></td>
                          <td className="p-3">
                            <select 
                              value={word.level} 
                              onChange={(e) => handleDraftChange(word.id, 'level', parseInt(e.target.value))} 
                              className="w-full px-2 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500 outline-none text-sm font-bold text-blue-600 bg-white text-center"
                            >
                              {[1, 2, 3, 4, 5, 6].map(lvl => (
                                <option key={lvl} value={lvl}>{lvl === 1 ? 'A1' : lvl === 2 ? 'A2' : lvl === 3 ? 'B1' : lvl === 4 ? 'B2' : lvl === 5 ? 'C1' : 'C2'}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3"><input type="text" placeholder="I eat an apple." value={word.example} onChange={(e) => handleDraftChange(word.id, 'example', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500 outline-none text-sm text-gray-600 italic"/></td>
                          <td className="p-3 text-center">
                            {draftWords.length > 1 && (
                              <button onClick={() => handleRemoveDraftRow(word.id)} className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded transition-colors"><Trash2 size={16}/></button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button onClick={handleAddDraftRow} className="w-full py-3 bg-gray-50 hover:bg-cyan-50 text-cyan-700 text-sm font-bold flex justify-center items-center gap-2 border-t border-gray-200 transition-colors">
                    <Plus size={18}/> Thêm dòng
                  </button>
                </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3 shrink-0 rounded-b-[1.5rem]">
              <button onClick={handleCloseAddModal} className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 font-bold rounded-xl transition-colors">
                Hủy
              </button>
              <button 
                onClick={handleSaveNewWords}
                disabled={isSaving}
                className={`px-8 py-2.5 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 ${
                  isSaving 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-[#65a30d] hover:bg-[#4d7c0f] text-white hover:shadow-xl hover:-translate-y-0.5'
                }`}
              >
                {isSaving ? 'Đang kiểm tra dữ liệu...' : 'Lưu từ vựng'}
              </button>
            </div>
          </div>
        </div>
      )}


      <ConfirmModal 
        isOpen={showExitWarning}
        onClose={() => setShowExitWarning(false)}
        onConfirm={forceCloseAddModal}
        title="Bạn có chắc chắn muốn thoát?"
        message="Các thông tin bạn vừa nhập sẽ không được lưu lại."
        confirmText="Thoát và Hủy bỏ"
        cancelText="Ở lại"
        isDanger={true}
      />

      {/* modal chỉnh sửa từ vựng */}
      {showEditWordModal && (
        <div className="fixed inset-0 bg-cyan-950/70 z-[200] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-7xl flex flex-col max-h-[90vh] animate-in zoom-in duration-200 border border-gray-100 overflow-hidden">
             
             <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white z-10 shrink-0">
                <h2 className="text-xl font-bold text-cyan-950 flex items-center gap-2">
                  <Edit2 className="text-cyan-600"/> Chỉnh sửa {editingWords.length} từ vựng
                </h2>
                <button onClick={() => setShowEditWordModal(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"><X size={24}/></button>
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
                            <td className="p-3"><input type="text" value={word.word} onChange={(e) => handleEditWordChange(word.id, 'word', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500 outline-none text-sm font-bold text-cyan-950"/></td>
                            <td className="p-3"><input type="text" value={word.pronunciation} onChange={(e) => handleEditWordChange(word.id, 'pronunciation', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500 outline-none text-sm text-gray-600"/></td>
                            <td className="p-3">
                              <select value={word.word_type} onChange={(e) => handleEditWordChange(word.id, 'word_type', e.target.value)} className="w-full px-2 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500 outline-none text-sm text-gray-600 bg-white">
                                <option value="Danh từ">Danh từ</option>
                                <option value="Động từ">Động từ</option>
                                <option value="Tính từ">Tính từ</option>
                                <option value="Trạng từ">Trạng từ</option>
                              </select>
                            </td>
                            <td className="p-3"><input type="text" value={word.meaning} onChange={(e) => handleEditWordChange(word.id, 'meaning', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500 outline-none text-sm font-medium"/></td>
                            <td className="p-3">
                              <select value={word.level} onChange={(e) => handleEditWordChange(word.id, 'level', parseInt(e.target.value))} className="w-full px-2 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500 outline-none text-sm font-bold text-blue-600 bg-white text-center">
                                {[1, 2, 3, 4, 5, 6].map(lvl => (
                                  <option key={lvl} value={lvl}>{lvl === 1 ? 'A1' : lvl === 2 ? 'A2' : lvl === 3 ? 'B1' : lvl === 4 ? 'B2' : lvl === 5 ? 'C1' : 'C2'}</option>
                                ))}
                              </select>
                            </td>
                            <td className="p-3"><input type="text" value={word.example} onChange={(e) => handleEditWordChange(word.id, 'example', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500 outline-none text-sm text-gray-600 italic"/></td>
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
          </div>
        </div>
      )}

      {/* xác nhận xóa */}
      <ConfirmModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa khỏi hệ thống?"
        message={
          wordToDelete ? (
            <span className="flex flex-wrap items-center gap-1.5">Bạn có chắc chắn muốn xóa từ <strong>"{wordToDelete.word}"</strong> vĩnh viễn khỏi hệ thống không?</span>
          ) : (
            <span className="flex flex-wrap items-center gap-1.5">Bạn có chắc chắn muốn xóa <strong className="text-red-600">{selectedIds.length} từ vựng</strong> đã chọn vĩnh viễn khỏi hệ thống không?</span>
          )
        }
        confirmText="Xóa ngay"
        cancelText="Hủy"
        isDanger={true}
      />

      {/* modal bộ lọc */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-cyan-950/70 z-[150] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-2xl flex flex-col animate-in zoom-in duration-200 border border-gray-100">
            
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-cyan-50/30 rounded-t-[1.5rem]">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-100 p-2 rounded-lg text-cyan-600"><Filter size={20} /></div>
                <h2 className="text-xl font-black text-cyan-950">Bộ lọc từ vựng</h2>
              </div>
              <button onClick={() => { setShowFilterModal(false); setOpenFilterDropdown(null); }} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-6 relative min-h-[320px]">
               {renderFilterDropdown("Chủ đề", "topics", MOCK_TOPICS, true, "topics")}
               {renderFilterDropdown("Bài học", "lessons", MOCK_LESSONS, true, "lessons")}
               {renderFilterDropdown("Loại từ", "types", FILTER_OPTIONS.types)}
               {renderFilterDropdown("Cấp độ", "levels", FILTER_OPTIONS.levels)}
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center rounded-b-[1.5rem]">
              <button onClick={clearFilters} className="px-5 py-2.5 text-gray-500 font-bold hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                Xóa bộ lọc
              </button>
              <div className="flex gap-3">
                <button onClick={() => setShowFilterModal(false)} className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">
                  Hủy
                </button>
                <button onClick={applyFilters} className="px-8 py-2.5 bg-[#0e7490] hover:bg-[#164e63] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  Áp dụng bộ lọc
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}