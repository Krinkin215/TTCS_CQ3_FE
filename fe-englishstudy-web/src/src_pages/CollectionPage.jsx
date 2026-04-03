import React, { useState } from 'react';
import VocabTable from '../src_components/VocabTable';
import AddToCollectionModal from '../src_components/AddToCollectionModal';
import FlashcardLearning from '../src_components/FlashcardLearning';
import { Plus, Edit2, Eye, Trash2, X, Check, Search, FolderClosed, AlertTriangle, Bookmark, Volume2, ChevronDown, ChevronUp, MoreVertical, Heart, FolderPlus, ChevronRight } from 'lucide-react';

const COLLECTION_NAME_LIMIT = 50;
const MOCK_COLLECTIONS = [
  { id: 0, name: 'Từ vựng của tôi', wordCount: 12, masteredVocab: 4 },
  { id: 1, name: 'Từ vựng luyện thi TOEIC', wordCount: 150, masteredVocab: 150 }, 
  { id: 2, name: 'Communication English (Part 1)', wordCount: 85, masteredVocab: 30 }, 
  { id: 3, name: 'Từ khó nhớ - A1/A2', wordCount: 42, masteredVocab: 0 }, 
  { id: 4, name: 'Chuyên ngành Công nghệ thông tin', wordCount: 210, masteredVocab: 80 },
  { id: 5, name: 'Luyện nghe IELTS Listening', wordCount: 98, masteredVocab: 98 },
];

function CollectionPage({ onNavigateToPractice }) {
  const [collections, setCollections] = useState(MOCK_COLLECTIONS);
  
  // Chọn nhiều
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  //Đổi tên
  const [editingId, setEditingId] = useState(null); 
  const [tempName, setTempName] = useState(''); 

  //  xác nhận xóa
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState(null); 
  const [openWordListId, setOpenWordListId] = useState(null);

  // tạo bồ tự mới
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  // tìm kiếm nhanh
  const [searchTerm, setSearchTerm] = useState('');

  //  DANH SÁCH TỪ VỰNG BÊN TRONG BỘ TỪ
  const [activeCollection, setActiveCollection] = useState(null); 
  const [showWordListModal, setShowWordListModal] = useState(false);
  const [collectionWords, setCollectionWords] = useState([]); 
  const [wordListSearchTerm, setWordListSearchTerm] = useState(''); 
  
  // Chọn nhiều & Xóa từ vựng
  const [isWordSelectMode, setIsWordSelectMode] = useState(false);
  const [selectedWordIds, setSelectedWordIds] = useState([]);
  const [showWordDeleteModal, setShowWordDeleteModal] = useState(false);
  const [wordToDelete, setWordToDelete] = useState(null); 

  // HỌC FLASHCARD 
  const [activeFlashcardSession, setActiveFlashcardSession] = useState(null);

  // MODAL THÊM VÀO BỘ TỪ ("Từ vựng của tôi")
  const [showAddToCollectionModal, setShowAddToCollectionModal] = useState(false);
  const [wordToAdd, setWordToAdd] = useState(null);
  const [isBulkAddMode, setIsBulkAddMode] = useState(false);
  const [addModalSearchTerm, setAddModalSearchTerm] = useState('');
  const [selectedTargetCollectionIds, setSelectedTargetCollectionIds] = useState([]);
  const [collectionVocabDB, setCollectionVocabDB] = useState([]);

  // CHỈNH SỬA TỪ VỰNG (Chỉ dành cho "Từ vựng của tôi")
  const [showEditWordModal, setShowEditWordModal] = useState(false);
  const [editingWords, setEditingWords] = useState([]);

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

    // KIỂM TRA LOGIC NHƯ KHI THÊM MỚI
    for (const word of editingWords) {
      const wordTrimmed = word.word.trim();
      
      // 1. Kiểm tra rỗng
      if (!wordTrimmed || !word.meaning.trim()) {
        emptyCount++; continue;
      }
      
      // 2. Kiểm tra định dạng từ và phiên âm
      if (!wordRegex.test(wordTrimmed)) {
        formatErrorCount++; continue;
      }
      if (word.pronunciation && word.pronunciation.trim() !== '' && !pronunRegex.test(word.pronunciation.trim())) {
        formatErrorCount++; continue;
      }
      
      // 3. Kiểm tra trùng lặp 
      const exists = collectionWords.some(v => v.id !== word.id && v.word.toLowerCase() === wordTrimmed.toLowerCase());
      if (exists) {
        duplicateCount++; continue;
      }
    }

    // NẾU CÓ LỖI -> CHẶN LẠI VÀ THÔNG BÁO
    if (emptyCount > 0 || formatErrorCount > 0 || duplicateCount > 0) {
      alert(`LỖI KIỂM TRA DỮ LIỆU:\n\n${emptyCount > 0 ? `- Có ${emptyCount} từ bị bỏ trống Từ tiếng Anh hoặc Nghĩa.\n` : ''}${formatErrorCount > 0 ? `- Có ${formatErrorCount} từ sai định dạng (Từ chỉ chứa chữ cái, Phiên âm phải bọc trong / /).\n` : ''}${duplicateCount > 0 ? `- Có ${duplicateCount} từ bị trùng lặp với từ khác trong hệ thống.\n` : ''}\nVui lòng kiểm tra và sửa lại!`);
      return; 
    }

    // NẾU HỢP LỆ -> LƯU VÀO STATE
    setCollectionWords(prev => prev.map(cw => {
      const edited = editingWords.find(ew => ew.id === cw.id);
      return edited ? edited : cw;
    }));

    alert("✅ Đã cập nhật thông tin từ vựng thành công!");
    setShowEditWordModal(false);
    setIsWordSelectMode(false);
    setSelectedWordIds([]);
  };

  const handleOpenAddToCollectionModal = (word = null) => {
    if (word) { setWordToAdd(word); setIsBulkAddMode(false); } 
    else { setWordToAdd(null); setIsBulkAddMode(true); }
    setSelectedTargetCollectionIds([]);
    setAddModalSearchTerm('');
    setShowAddToCollectionModal(true);
  };

  const targetFilteredCollections = collections.filter(c =>
    c.name.toLowerCase().includes(addModalSearchTerm.toLowerCase()) && c.id !== 0 
  );

  const handleConfirmAddToCollections = (targetCollectionIds) => {
    let addedCount = 0;
    let duplicateCount = 0;
    
    const wordIdsToProcess = isBulkAddMode ? selectedWordIds : [wordToAdd.id];
    const newDB = [...collectionVocabDB];

    wordIdsToProcess.forEach(wId => {
      targetCollectionIds.forEach(cId => {
        const isDuplicate = newDB.some(record => record.vocabId === wId && record.collectionId === cId);
        if (isDuplicate) {
          duplicateCount++; 
        } else {
          newDB.push({ vocabId: wId, collectionId: cId }); 
          addedCount++;
        }
      });
    });

    setCollectionVocabDB(newDB); 

    let alertMsg = `KẾT QUẢ THÊM VÀO BỘ TỪ:\n\n`;
    if (addedCount > 0) alertMsg += `✅ Thành công: Thêm ${addedCount} lượt từ vào các bộ.\n`;
    if (duplicateCount > 0) alertMsg += `⚠️ Bỏ qua: ${duplicateCount} lượt (Vì từ đã tồn tại sẵn trong bộ được chọn).`;
    
    alert(alertMsg);

    setShowAddToCollectionModal(false);
    if (isBulkAddMode) {
      setIsWordSelectMode(false);
      setSelectedWordIds([]);
    }
  };

  // XỬ LÝ CHỌN NHIỀU: YÊU THÍCH HÀNG LOẠT
  const unfavoritedSelectedCount = selectedWordIds.filter(id => {
    const word = collectionWords.find(w => w.id === id);
    return word && !word.isFavorite; 
  }).length;

  const handleBulkFavorite = () => {
    if (selectedWordIds.length === 0) return;

    const favoritedCount = selectedWordIds.length - unfavoritedSelectedCount;

    setCollectionWords(collectionWords.map(w =>
      selectedWordIds.includes(w.id) ? { ...w, isFavorite: true } : w
    ));

    let alertMsg = `KẾT QUẢ THÊM VÀO YÊU THÍCH:\n\n`;
    if (unfavoritedSelectedCount > 0) alertMsg += `✅ Thành công: Thêm ${unfavoritedSelectedCount} từ vào danh sách Yêu thích.\n`;
    if (favoritedCount > 0) alertMsg += `⚠️ Bỏ qua: ${favoritedCount} từ (Vì đã nằm trong danh sách Yêu thích rồi).`;

    alert(alertMsg);
    setIsWordSelectMode(false);
    setSelectedWordIds([]);
  };

  const toggleFavorite = (id) => {
    setCollectionWords(collectionWords.map(w => w.id === id ? { ...w, isFavorite: !w.isFavorite } : w));
  };

  // Tạo bộ từ mới  
  const handleCreateCollection = (e) => {
    e.preventDefault(); 
    if (!newCollectionName.trim()) return;

    const newId = collections.length > 0 ? Math.max(...collections.map(c => c.id)) + 1 : 1;
    
    const newCollection = {
      id: newId,
      name: newCollectionName.trim(),
      wordCount: 0 
    };
    
    setCollections([...collections, newCollection]);
    
    setShowCreateModal(false);
    setNewCollectionName('');
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setNewCollectionName(''); 
  };

  //Xử lý Chọn nhiều 
  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  // CHỌN TẤT CẢ BỘ TỪ VỰNG
  const handleSelectAllCollections = () => {
    const deletableCollections = filteredCollections.filter(c => c.id !== 0);

    if (selectedIds.length === deletableCollections.length && deletableCollections.length > 0) {
      setSelectedIds([]); 
    } else {
      setSelectedIds(deletableCollections.map(c => c.id)); 
    }
  };

  // xóa hàng loạt
  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) return;
    setCollectionToDelete(null); 
    setShowDeleteModal(true);    
  };

  const confirmBulkDelete = () => {
    setCollections(collections.filter(c => !selectedIds.includes(c.id)));
    setSelectedIds([]);
    setIsSelectMode(false);
    setShowDeleteModal(false); 
  };

  // Logic Xử lý Đổi tên 
  const handleWordListClick = (id) => {
    setOpenWordListId(openWordListId === id ? null : id);
    setOpenMenuId(null); 
  };

  const startEditing = (collection) => {
    setOpenWordListId(null); 
    setEditingId(collection.id);
    setTempName(collection.name);
  };

  const saveRename = () => {
    if (!tempName.trim()) return; 
    setCollections(collections.map(c => 
      c.id === editingId ? { ...c, name: tempName.trim() } : c
    ));
    setEditingId(null); 
    setTempName(''); 
  };

  const cancelRename = () => {
    setEditingId(null);
  };

  // Xử lý Xóa 1 bộ từ 
  const openDeleteModal = (collection) => {
    setCollectionToDelete(collection);
    setShowDeleteModal(true);
  };

  const confirmSingleDelete = () => {
    setCollections(collections.filter(c => c.id !== collectionToDelete.id));
    setShowDeleteModal(false);
    setCollectionToDelete(null);
  };

  // DANH SÁCH TỪ VỰNG TRONG BỘ TỪ 
  const openWordList = (collection) => {
    setActiveCollection(collection);
    const baseMockWords = [
      { word: 'Enthusiastic', pronunciation: '/ɪnˌθjuː.ziˈæs.tɪk/', word_type: 'Tính từ', level: 4, meaning: 'Nhiệt tình, hăng hái', example: 'The crowd gave an enthusiastic cheer when the team score.' },
      { word: 'Determine', pronunciation: '/dɪˈtɜː.mɪn/', word_type: 'Động từ', level: 5, meaning: 'Xác định, quyết định', example: 'Your attitude, not your aptitude, determines your altitude.' },
      { word: 'Apple', pronunciation: '/ˈæp.əl/', word_type: 'Danh từ', level: 1, meaning: 'Quả táo', example: 'An apple a day keeps the doctor away.' }
    ];
    const generatedWords = Array.from({ length: collection.wordCount }).map((_, index) => {
      const baseWord = baseMockWords[index % baseMockWords.length];
      return {
        ...baseWord,
        id: 1000 + index, 
        word: index >= baseMockWords.length ? `${baseWord.word} ${index + 1}` : baseWord.word 
      };
    });

    setCollectionWords(generatedWords);
    setShowWordListModal(true);
    setIsWordSelectMode(false);
    setSelectedWordIds([]);
    setWordListSearchTerm('');
  };

  const closeWordList = () => {
    setShowWordListModal(false);
    setActiveCollection(null);
  };

  const toggleWordSelect = (id) => {
    setSelectedWordIds(prev => prev.includes(id) ? prev.filter(wId => wId !== id) : [...prev, id]);
  };

  const handleSelectAllCurrentPageWords = (currentWords) => {
    const isAllCurrentSelected = currentWords.every(v => selectedWordIds.includes(v.id));
    if (isAllCurrentSelected && currentWords.length > 0) {
      const currentIds = currentWords.map(v => v.id);
      setSelectedWordIds(prev => prev.filter(id => !currentIds.includes(id)));
    } else {
      const newIds = currentWords.map(v => v.id).filter(id => !selectedWordIds.includes(id));
      setSelectedWordIds(prev => [...prev, ...newIds]);
    }
  };

  const handleWordDeleteClick = (word = null) => {
    setWordToDelete(word);
    setShowWordDeleteModal(true);
  };

  const confirmWordDelete = () => {
    let updatedWords = [];
    let deletedCount = 0;
    
    if (wordToDelete) { 
      updatedWords = collectionWords.filter(w => w.id !== wordToDelete.id);
      deletedCount = 1;
    } else { 
      updatedWords = collectionWords.filter(w => !selectedWordIds.includes(w.id));
      deletedCount = selectedWordIds.length;
    }
    
    setCollectionWords(updatedWords); 
    
    setCollections(collections.map(c => 
      c.id === activeCollection.id ? { ...c, wordCount: Math.max(0, c.wordCount - deletedCount) } : c
    ));

   
    setShowWordDeleteModal(false);
    setWordToDelete(null);
    setSelectedWordIds([]);
    if (updatedWords.length === 0) setIsWordSelectMode(false);
  };

  // Lọc bộ từ theo tìm kiếm
  const filteredCollections = collections.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cột Hành động 
  const CollectionWordActionColumn = ({ item }) => {
    const [openMenuId, setOpenMenuId] = useState(null);

    return (
      <div className="relative flex justify-center">
        <button 
          onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
          className="p-2 text-gray-400 hover:text-cyan-700 hover:bg-cyan-50 rounded-full transition-colors"
        >
          <MoreVertical size={20} />
        </button>

        {openMenuId === item.id && (
          <div className="absolute right-8 top-10 w-48 bg-white border border-gray-100 shadow-xl rounded-lg py-1 z-50 text-left">
            {activeCollection?.id === 0 && (
              <button 
                onClick={() => { setOpenMenuId(null); handleOpenEditModal([item]); }}
                className="w-full px-4 py-2 text-sm text-cyan-700 hover:bg-cyan-50 text-left font-medium flex items-center gap-2 border-b border-gray-100"
              >
                <Edit2 size={16} /> Chỉnh sửa
              </button>
            )}
            <button 
              onClick={() => { setOpenMenuId(null); handleOpenAddToCollectionModal(item); }}
              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-cyan-50 text-left font-medium"
            >
              Thêm vào bộ từ...
            </button>
            <button 
              onClick={() => { setOpenMenuId(null); toggleFavorite(item.id); }}
              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-cyan-50 text-left font-medium flex justify-between items-center"
            >
              Yêu thích <Heart size={16} fill={item.isFavorite ? "currentColor" : "none"} className={item.isFavorite ? "text-red-500" : "text-gray-400"}/>
            </button>
            <button 
              onClick={() => { setOpenMenuId(null); handleWordDeleteClick(item); }}
              className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
            >
              {activeCollection?.id === 0 ? 'Xóa khỏi hệ thống' : 'Xóa khỏi bộ từ này'}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen relative">
      
      {/* HEADER TRANG */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-cyan-950">Bộ từ vựng</h1>
            <p className="text-gray-500 mt-1">Quản lý và ôn tập từ vựng theo chủ đề cá nhân</p>
          </div>
          
          {/* NÚT TẠO BỘ TỪ MỚI (CHỈ HIỆN KHI CHƯA BẬT CHỌN NHIỀU) */}
          {!isSelectMode ? (
            <button 
              onClick={() => setShowCreateModal(true)} 
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg transition-colors shadow-sm"
            >
              <Plus size={20} /> Tạo bộ từ mới
            </button>
          ) : (
            // CHỌN TẤT CẢ & XÓA HÀNG LOẠT
            <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 px-4 py-1.5 rounded-lg">
              {/* CHECKBOX CHỌN TẤT CẢ */}
              <label className="flex items-center gap-2 cursor-pointer text-cyan-950 font-bold">
                <input 
                  type="checkbox" 
                  checked={selectedIds.length === filteredCollections.filter(c => c.id !== 0).length && filteredCollections.filter(c => c.id !== 0).length > 0}
                  onChange={handleSelectAllCollections}
                  className="w-5 h-5 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500 cursor-pointer"
                />
                Chọn tất cả
              </label>

              <div className="w-px h-6 bg-gray-300"></div> 

              {/* NÚT XÓA HÀNG LOẠT */}
              <button 
                onClick={handleBulkDeleteClick}
                disabled={selectedIds.length === 0}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md font-bold transition-all ${
                  selectedIds.length > 0
                    ? 'bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer'
                    : 'text-gray-400 cursor-not-allowed opacity-70'
                }`}
              >
                <Trash2 size={18} /> Xóa {selectedIds.length > 0 ? selectedIds.length : ''}
              </button>
            </div>
          )}
        </div>

        {/* NÚT CHỌN NHIỀU  */}
        <div className="flex gap-4 items-center">
          {/* Ô TÌM KIẾM NHANH */}
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm bộ từ..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-cyan-100 bg-white rounded-lg focus:ring-2 focus:ring-cyan-500 transition-all outline-none"
            />
          </div>
          <button 
            onClick={() => {
              setIsSelectMode(!isSelectMode);
              if (isSelectMode) setSelectedIds([]); 
            }}
            className={`px-5 py-2 font-bold rounded-lg transition-colors shadow-sm ${
              isSelectMode 
                ? 'bg-cyan-950 text-white' 
                : 'bg-white text-cyan-700 border border-cyan-100 hover:bg-cyan-50'
            }`}
          >
            {isSelectMode ? 'Hủy chọn' : 'Chọn nhiều'}
          </button>
        </div>
      </div>

      {/* LƯỚI HIỂN THỊ CÁC BỘ TỪ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
        {filteredCollections.map(collection => (
          <div 
            key={collection.id} 
            className={`relative bg-white rounded-2xl shadow-sm border border-cyan-100 p-5 flex flex-col justify-between min-h-[14rem] transition-all group ${
              selectedIds.includes(collection.id) ? 'ring-4 ring-cyan-500 border-cyan-500 bg-cyan-50/20' : 'hover:shadow-lg hover:-translate-y-1'
            }`}
          >
            
            {/* CHECKBOX HOẶC THÙNG RÁC */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              {isSelectMode && collection.id !== 0 ? (
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(collection.id)}
                  onChange={() => toggleSelect(collection.id)}
                  className="w-6 h-6 text-cyan-600 rounded-md border-gray-300 focus:ring-cyan-500 cursor-pointer shadow-md"
                />
              ) : !isSelectMode && collection.id !== 0 ? (
                <button 
                  onClick={() => openDeleteModal(collection)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  title="Xóa bộ từ"
                >
                  <Trash2 size={18} />
                </button>
              ) : null}
            </div>

            {/* Tiêu đề, Số từ và Tiến độ */}
            <div>
              {/* Icon Bộ từ */}
              <div className="flex items-center gap-3 mb-4">
                {collection.id === 0 ? (
                  <span className="flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-500 rounded-xl">
                    <Bookmark size={24} fill="currentColor" />
                  </span>
                ) : (
                  <span className="flex items-center justify-center w-12 h-12 bg-cyan-100/50 text-cyan-600 font-bold text-xl rounded-xl">
                    {collection.id < 10 ? `0${collection.id}` : collection.id}
                  </span>
                )}
              </div>
              
              {/* Tiêu đề & Sửa tên */}
              {editingId === collection.id ? (
                <div className="flex gap-2 items-center -ml-1 mb-3">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      value={tempName} 
                      onChange={(e) => {
                        if (e.target.value.length <= COLLECTION_NAME_LIMIT) setTempName(e.target.value);
                      }} 
                      className="w-full px-3 py-1.5 pr-16 border border-cyan-500 rounded-lg outline-none text-lg font-bold text-cyan-950 focus:ring-2 focus:ring-cyan-200 transition-all shadow-inner"
                      autoFocus
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
                      {tempName.length}/{COLLECTION_NAME_LIMIT}
                    </span>
                  </div>
                  <button onClick={saveRename} className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"><Check size={18} /></button>
                  <button onClick={cancelRename} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"><X size={18} /></button>
                </div>
              ) : (
                <div className="flex gap-2 items-start group/title mb-3 pr-8 relative">
                  <h3 title={collection.name} className="text-lg font-bold text-cyan-950 line-clamp-2 flex-1 mt-1 leading-snug">
                    {collection.name}
                  </h3>
                  {collection.id !== 0 && (
                    <button 
                      onClick={() => startEditing(collection)}
                      className="p-1.5 text-cyan-600 hover:bg-cyan-100 rounded-full opacity-0 group-hover/title:opacity-100 transition-opacity shrink-0 absolute right-0 top-1"
                      title="Đổi tên"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                </div>
              )}
              
              {/* Số từ & Tiến độ */}
              <div className="flex flex-col gap-2.5 mb-4">
                <span className="text-xs text-gray-600 font-medium bg-gray-100/80 px-3 py-1.5 rounded-lg w-fit">
                  Số từ: {collection.wordCount} từ
                </span>
                
                {collection.wordCount === 0 ? (
                   <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg w-fit">Trống</span>
                ) : collection.masteredVocab === collection.wordCount ? (
                  <span className="text-[11px] font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-lg w-fit">Đã hoàn thành</span>
                ) : collection.masteredVocab === 0 ? (
                  <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg w-fit">Chưa học</span>
                ) : (
                  <div className="flex flex-col gap-1.5 w-full pr-4 mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-cyan-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${(collection.masteredVocab / collection.wordCount) * 100}%` }}></div>
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold">{collection.masteredVocab}/{collection.wordCount} đã thuộc</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer chứa nút */}
            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center gap-2">
              <button 
                onClick={() => openWordList(collection)} 
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-white text-cyan-700 hover:bg-cyan-50 border border-cyan-100 transition-colors shrink-0 shadow-sm"
              >
                <Eye size={16} /> Xem từ
              </button>

              <button 
                 disabled={collection.wordCount === 0}
                 onClick={() => setActiveFlashcardSession({ collection })}
                 className={`flex items-center justify-end p-1.5 rounded-full transition-all duration-300 w-9 relative group/btn overflow-hidden shrink-0 shadow-sm border ${
                  collection.wordCount === 0 
                    ? 'text-gray-300 bg-gray-50 border-gray-100 cursor-not-allowed'
                    : 'text-[#0e7490] hover:text-white bg-cyan-50 hover:bg-[#0e7490] hover:w-[100px] border-cyan-100 hover:border-transparent'
                 }`}
              >
                <span className="opacity-0 whitespace-nowrap group-hover/btn:opacity-100 transition-opacity duration-300 text-xs font-bold absolute right-8">Vào học</span>
                <ChevronRight size={18} className="shrink-0 relative z-10" />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* THÔNG BÁO KHI TRỐNG */}
      {filteredCollections.length === 0 && (
        <div className="text-center p-16 mt-16 bg-white rounded-2xl border border-dashed border-cyan-200">
          <FolderClosed className="mx-auto text-cyan-200" size={64} />
          <p className="text-gray-400 mt-6 text-lg">Bạn chưa có bộ từ vựng nào hoặc không tìm thấy bộ từ vựng.</p>
          <button 
            onClick={() => setShowCreateModal(true)} 
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg transition-colors shadow-sm mx-auto mt-6"
          >
            <Plus size={20} /> Tạo bộ từ ngay
          </button>
        </div>
      )}

      {/*  XÁC NHẬN XÓA TỔNG HỢP */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-cyan-950/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-lg w-full border border-gray-100 transition-all scale-100">
            <div className="flex items-center gap-4 text-red-600 mb-6 pb-4 border-b border-gray-100">
              <AlertTriangle size={32} />
              <h2 className="text-2xl font-bold">
                {collectionToDelete ? 'Xác nhận xóa bộ từ vựng?' : 'Xác nhận xóa hàng loạt?'}
              </h2>
            </div>
            
            <p className="text-gray-700 text-lg leading-relaxed flex flex-wrap items-center gap-1.5">
              Bạn có chắc chắn muốn xóa 
              {collectionToDelete ? (
                // Nếu xóa 1 bộ
                <>
                  bộ từ vựng
                  <span title={collectionToDelete.name} className="inline-block px-2 py-0.5 bg-gray-100 rounded text-cyan-950 font-bold max-w-[200px] truncate">
                    "{collectionToDelete.name}"
                  </span>
                </>
              ) : (
                // Nếu xóa nhiều bộ
                <span className="font-bold text-red-600 px-1">
                  {selectedIds.length} bộ từ vựng đã chọn
                </span>
              )}
               không? Hành động này không thể hoàn tác.
            </p>
            
            <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-100">
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setCollectionToDelete(null); 
                }}
                className="px-6 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg font-bold hover:bg-gray-50 transition-colors"
              >
                Hủy không xóa
              </button>
              <button 
                onClick={collectionToDelete ? confirmSingleDelete : confirmBulkDelete}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-lg hover:shadow-red-500/50"
              >
                Xác nhận, xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}
      {/*TẠO BỘ TỪ MỚI*/}
      {showCreateModal && (
        <div className="fixed inset-0 bg-cyan-950/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full border border-gray-100 transition-all scale-100">
            
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-cyan-950">Tạo bộ từ mới</h2>
              <button onClick={closeCreateModal} className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCollection}>
              <div className="mb-8 relative">
                <label className="block text-sm font-bold text-gray-700 mb-2">Tên bộ từ vựng</label>
                <input 
                  type="text" 
                  value={newCollectionName}
                  onChange={(e) => {
                    if (e.target.value.length <= COLLECTION_NAME_LIMIT) {
                      setNewCollectionName(e.target.value);
                    }
                  }}
                  placeholder="Ví dụ: Luyện thi TOEIC 600+..."
                  className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-cyan-950 font-medium"
                  autoFocus
                />
                <span className="absolute right-4 top-[2.4rem] text-xs font-medium text-gray-400">
                  {newCollectionName.length}/{COLLECTION_NAME_LIMIT}
                </span>
              </div>

              <div className="flex justify-end gap-4">
                <button 
                  type="button"
                  onClick={closeCreateModal}
                  className="px-6 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg font-bold hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={!newCollectionName.trim()} 
                  className={`px-6 py-2.5 rounded-lg font-bold transition-all shadow-md ${
                    newCollectionName.trim() 
                      ? 'bg-cyan-600 text-white hover:bg-cyan-700 hover:shadow-cyan-500/50 cursor-pointer' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Tạo bộ từ
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
      {/* HIỂN THỊ DANH SÁCH TỪ VỰNG TRONG BỘ  */}
      {showWordListModal && activeCollection && (
        <div className="fixed inset-0 bg-cyan-950/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-6xl w-full border border-gray-100 flex flex-col max-h-[90vh]">
            
            {/* Header của Bảng */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-cyan-950 flex items-center gap-2">
                  <FolderClosed className="text-cyan-600" />
                  {activeCollection.name}
                </h2>
                <p className="text-gray-500 mt-1 text-sm">Đang quản lý {collectionWords.length} từ vựng trong bộ này</p>
              </div>

              {/* Các nút Góc phải  */}
              <div className="flex items-center gap-4">

                {/* THANH TÌM KIẾM */}
                <div className="relative w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Tìm từ vựng..." 
                    value={wordListSearchTerm}
                    onChange={(e) => setWordListSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all outline-none"
                  />
                </div>
                
                {/* HIỂN THỊ CÁC NÚT THAO TÁC KHI ĐANG CHỌN NHIỀU */}
                {isWordSelectMode && selectedWordIds.length > 0 && (
                  <>
                    {activeCollection?.id === 0 && (
                      <button 
                        onClick={() => handleOpenEditModal(collectionWords.filter(w => selectedWordIds.includes(w.id)))}
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-lg shadow-sm hover:bg-cyan-100 font-bold transition-colors"
                      >
                        <Edit2 size={18} /> Chỉnh sửa ({selectedWordIds.length})
                      </button>
                    )}

                    <button 
                      onClick={() => handleOpenAddToCollectionModal(null)}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 font-medium transition-colors"
                    >
                      <FolderPlus size={18} /> Thêm vào...
                    </button>

                    <button 
                      onClick={handleBulkFavorite}
                      disabled={unfavoritedSelectedCount === 0}
                      className={`flex items-center gap-2 px-4 py-2 border rounded-lg shadow-sm font-medium transition-colors ${
                        unfavoritedSelectedCount > 0 
                          ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 cursor-pointer' 
                          : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-70'
                      }`}
                    >
                      <Heart size={18} fill={unfavoritedSelectedCount > 0 ? "currentColor" : "none"} /> 
                      Yêu thích ({unfavoritedSelectedCount})
                    </button>

                    {/* NÚT XÓA */}
                    <button 
                      onClick={() => handleWordDeleteClick(null)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg shadow-sm hover:bg-red-100 font-medium transition-colors"
                    >
                      <Trash2 size={18} /> Xóa {selectedWordIds.length} từ
                    </button>
                  </>
                )}
                
                {/* NÚT CHỌN NHIỀU */}
                {collectionWords.length > 0 && (
                  <button 
                    onClick={() => {
                      setIsWordSelectMode(!isWordSelectMode);
                      if (isWordSelectMode) setSelectedWordIds([]);
                    }}
                    className={`px-4 py-2 font-bold rounded-lg transition-colors shadow-sm border ${
                      isWordSelectMode 
                        ? 'bg-cyan-950 text-white border-cyan-950' 
                        : 'bg-white text-cyan-700 border-cyan-200 hover:bg-cyan-50'
                    }`}
                  >
                    {isWordSelectMode ? 'Hủy chọn' : 'Chọn nhiều'}
                  </button>
                )}

                <div className="w-px h-8 bg-gray-200 mx-2"></div>

                <button onClick={closeWordList} className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Bảng Danh sách từ */}
            <div className="flex-1 overflow-y-auto mt-2">
              {collectionWords.length > 0 ? (
                <VocabTable 
                  words={collectionWords}
                  searchTerm={wordListSearchTerm}
                  isSelectMode={isWordSelectMode}
                  selectedIds={selectedWordIds}
                  onToggleSelect={toggleWordSelect}
                  onSelectAll={handleSelectAllCurrentPageWords}
                  ActionColumn={CollectionWordActionColumn} 
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
                  <FolderClosed size={64} className="text-cyan-100 mb-6" />
                  <p className="text-lg">Bộ từ vựng này hiện đang trống.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cảnh báo Xóa với Từ vựng của tôi */}
      {showWordDeleteModal && (
        <div className="fixed inset-0 bg-cyan-950/70 z-[110] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full border border-gray-100 scale-100 transition-all">
            <div className="flex items-center gap-4 text-red-600 mb-6 pb-4 border-b border-gray-100">
              <AlertTriangle size={32} />
              <h2 className="text-2xl font-bold">{activeCollection?.id === 0 ? 'Xác nhận xóa khỏi hệ thống?' : 'Xác nhận xóa từ vựng?'}</h2>
            </div>
            
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              {wordToDelete ? (
                <>Bạn có chắc chắn muốn xóa từ <strong>"{wordToDelete.word}"</strong> khỏi {activeCollection?.id === 0 ? 'hệ thống' : 'bộ từ vựng này'} không?</>
              ) : (
                <>Bạn có chắc chắn muốn xóa <strong className="text-red-600">{selectedWordIds.length} từ vựng</strong> đã chọn khỏi {activeCollection?.id === 0 ? 'hệ thống' : 'bộ từ vựng này'} không?</>
              )}
            </p>
            
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowWordDeleteModal(false)} className="px-6 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg font-bold hover:bg-gray-50 transition-colors">Hủy</button>
              <button onClick={confirmWordDelete} className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-lg hover:shadow-red-500/50">Xóa ngay</button>
            </div>
          </div>
        </div>
      )}

      {/* THÊM TỪ VÀO BỘ TỪ KHÁC */}
      <AddToCollectionModal 
        isOpen={showAddToCollectionModal}
        onClose={() => setShowAddToCollectionModal(false)}
        isBulkMode={isBulkAddMode}
        wordToAdd={wordToAdd}
        selectedCount={selectedWordIds.length}
        collections={collections.filter(c => c.id !== activeCollection?.id)}  
        onConfirm={handleConfirmAddToCollections}
      />
      
      {/* MODAL CHỈNH SỬA TỪ VỰNG (CHỈ DÀNH CHO "TỪ VỰNG CỦA TÔI") */}
      {showEditWordModal && (
        <div className="fixed inset-0 bg-cyan-950/70 z-[200] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-6xl flex flex-col max-h-[90vh] animate-in zoom-in duration-200 border border-gray-100 overflow-hidden">
             
             {/* Header */}
             <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white z-10 shrink-0">
                <h2 className="text-xl font-bold text-cyan-950 flex items-center gap-2">
                  <Edit2 className="text-cyan-600"/> Chỉnh sửa {editingWords.length} từ vựng
                </h2>
                <button onClick={() => setShowEditWordModal(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"><X size={24}/></button>
             </div>
             
             {/* Body: Bảng nhập liệu tương tự màn hình Thêm mới */}
             <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-cyan-50/50 border-b border-gray-200 text-cyan-900 text-xs uppercase tracking-wider">
                        <th className="p-3 w-12 text-center">#</th>
                        <th className="p-3 w-1/6">Từ vựng <span className="text-red-500">*</span></th>
                        <th className="p-3 w-1/6">Phiên âm</th>
                        <th className="p-3 w-32">Loại từ</th>
                        <th className="p-3 w-1/6">Nghĩa <span className="text-red-500">*</span></th>
                        <th className="p-3 w-28 text-center">Cấp độ</th>
                        <th className="p-3">Ví dụ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editingWords.map((word, index) => (
                         <tr key={word.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                            <td className="p-3 text-center text-gray-400 font-bold">{index + 1}</td>
                            <td className="p-3"><input type="text" value={word.word} onChange={(e) => handleEditWordChange(word.id, 'word', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500 outline-none text-sm font-bold text-cyan-950"/></td>
                            <td className="p-3"><input type="text" value={word.pronunciation} onChange={(e) => handleEditWordChange(word.id, 'pronunciation', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500 outline-none text-sm text-gray-600"/></td>
                            <td className="p-3">
                              <select value={word.word_type} onChange={(e) => handleEditWordChange(word.id, 'word_type', e.target.value)} className="w-full px-2 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500 outline-none text-sm text-gray-600 bg-white cursor-pointer">
                                <option value="Danh từ">Danh từ</option>
                                <option value="Động từ">Động từ</option>
                                <option value="Tính từ">Tính từ</option>
                                <option value="Trạng từ">Trạng từ</option>
                              </select>
                            </td>
                            <td className="p-3"><input type="text" value={word.meaning} onChange={(e) => handleEditWordChange(word.id, 'meaning', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500 outline-none text-sm font-medium"/></td>
                            <td className="p-3">
                              <select value={word.level} onChange={(e) => handleEditWordChange(word.id, 'level', parseInt(e.target.value))} className="w-full px-2 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-cyan-500 outline-none text-sm font-bold text-blue-600 bg-white cursor-pointer text-center">
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

             {/* Footer */}
             <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3 shrink-0 rounded-b-[1.5rem]">
               <button onClick={() => setShowEditWordModal(false)} className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 font-bold rounded-xl transition-colors">Hủy</button>
               <button onClick={handleSaveEditedWords} className="px-8 py-2.5 font-bold rounded-xl shadow-lg transition-all bg-[#0e7490] hover:bg-[#164e63] text-white">Xác nhận Lưu</button>
             </div>
          </div>
        </div>
      )}

      {/* MÀN HÌNH HỌC FLASHCARD TOÀN MÀN HÌNH */}
      {activeFlashcardSession && (
        <FlashcardLearning 
          collection={activeFlashcardSession.collection}
          onExit={() => setActiveFlashcardSession(null)}
          onPractice={() => {
            const currentCollectionId = activeFlashcardSession.collection.id;
            setActiveFlashcardSession(null);
            if (onNavigateToPractice) { 
               onNavigateToPractice({ mode: 'collection', collectionId: currentCollectionId }); 
            }
          }}
        />
      )}

    </div>
  );
}

export default CollectionPage;
