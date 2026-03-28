import React, { useState, useEffect } from 'react';
import { Volume2, MoreVertical, FolderPlus, Trash2, Search, X } from 'lucide-react';
import VocabTable from '../src_components/VocabTable';
import AddToCollectionModal from '../src_components/AddToCollectionModal';

const CURRENT_USER_ID = 5; 
const ADMIN_USER_ID = 1;

const MOCK_FAVORITES = [
  { id: 1, word: 'Enthusiastic', pronunciation: '/ɪnˌθjuː.ziˈæs.tɪk/', word_type: 'Tính từ', meaning: 'Nhiệt tình, hăng hái', example: 'The crowd gave an enthusiastic cheer.', level: 4, created_by: ADMIN_USER_ID },
  { id: 2, word: 'Determine', pronunciation: '/dɪˈtɜː.mɪn/', word_type: 'Động từ', meaning: 'Xác định, quyết định', example: 'Your attitude determines your altitude.', level: 3, created_by: ADMIN_USER_ID },
  { id: 3, word: 'Apple', pronunciation: '/ˈæp.əl/', word_type: 'Danh từ', meaning: 'Quả táo', example: 'I eat an apple every day.', level: 1, created_by: CURRENT_USER_ID },
];

const ITEMS_PER_PAGE = 10;

const MOCK_COLLECTIONS = [
  { id: 1, name: 'Từ vựng luyện thi TOEIC' },
  { id: 2, name: 'Communication English' },
  { id: 3, name: 'Từ khó nhớ - A1/A2' },
];

function FavoritePage() {
  const [favorites, setFavorites] = useState(MOCK_FAVORITES);
  
  // Các state quản lý tương tác UI
  const [isSelectMode, setIsSelectMode] = useState(false); 
  const [selectedIds, setSelectedIds] = useState([]); 
  const [openExampleId, setOpenExampleId] = useState(null); 

  const [searchTerm, setSearchTerm] = useState(''); 
  
  // MODAL THÊM VÀO BỘ TỪ
  const [showAddToCollectionModal, setShowAddToCollectionModal] = useState(false);
  const [wordToAdd, setWordToAdd] = useState(null); 
  const [isBulkAddMode, setIsBulkAddMode] = useState(false); 
  const [modalSearchTerm, setModalSearchTerm] = useState(''); 
  const [selectedCollectionIds, setSelectedCollectionIds] = useState([]); 
  const [collectionVocabDB, setCollectionVocabDB] = useState([]);

  const modalFilteredCollections = MOCK_COLLECTIONS.filter(c =>
    c.name.toLowerCase().includes(modalSearchTerm.toLowerCase())
  );

  const handleOpenAddToCollectionModal = (word = null) => {
    if (word) {
      setWordToAdd(word);
      setIsBulkAddMode(false); 
    } else {
      setWordToAdd(null);
      setIsBulkAddMode(true);  
    }
    setSelectedCollectionIds([]); 
    setModalSearchTerm('');       
    setShowAddToCollectionModal(true);
  };

  const toggleModalCollectionSelect = (id) => {
    setSelectedCollectionIds(prev => prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]);
  };

  const handleSelectAllModalCollections = () => {
    if (selectedCollectionIds.length === modalFilteredCollections.length && modalFilteredCollections.length > 0) {
      setSelectedCollectionIds([]);
    } else {
      setSelectedCollectionIds(modalFilteredCollections.map(c => c.id));
    }
  };

  const handleConfirmAddToCollections = (targetCollectionIds) => {
    let addedCount = 0;
    let duplicateCount = 0;
    
    const wordIdsToProcess = isBulkAddMode ? selectedIds : [wordToAdd.id];
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
      setIsSelectMode(false);
      setSelectedIds([]);
    }
  };

  // Xử lý tick chọn 1 ô checkbox
  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Phát âm thanh (mô phỏng)
  const playAudio = (word) => {
    console.log(`Đang phát âm thanh từ: ${word}`);
    // Thực tế sẽ dùng: new Audio('link_audio').play();
  };

  // xóa 1 từ vựng 
  const handleRemoveSingle = (id) => {
    setFavorites(favorites.filter(item => item.id !== id));
  };

  //  xóa nhiều từ vựng 
  const handleRemoveBulk = () => {
    if (selectedIds.length === 0) return;
    setFavorites(favorites.filter(item => !selectedIds.includes(item.id)));
    setSelectedIds([]); 
    setIsSelectMode(false); 
  };

  // Lọc từ vựng theo ô tìm kiếm
  const filteredFavorites = favorites.filter(item => 
    item.word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Chọn tất cả / Bỏ chọn tất cả
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

  const FavoriteActionColumn = ({ item }) => {
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
            <button 
              onClick={() => handleOpenAddToCollectionModal(item)}
              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-cyan-50 text-left font-medium"
            >
              Thêm vào bộ từ...
            </button>
            <button 
              onClick={() => handleRemoveSingle(item.id)}
              className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
            >
              Bỏ yêu thích
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      
      {/* HEADER TRANG */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-cyan-950">Từ vựng yêu thích</h1>
          <p className="text-gray-500 mt-1">Quản lý và ôn tập các từ vựng bạn đã đánh dấu</p>
        </div>

        {/* CÁC NÚT HÀNH ĐỘNG GÓC PHẢI */}
        <div className="flex gap-4 items-center">
          
          {/*Ô TÌM KIẾM TỪ VỰNG */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm từ vựng..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-white rounded-lg focus:ring-2 focus:ring-[#0e7490] transition-all outline-none"
            />
          </div>

          {isSelectMode && (
            <>
              {/*NÚT THÊM VÀO BỘ TỪ */}
              <button 
                onClick={() => handleOpenAddToCollectionModal(null)}
                disabled={selectedIds.length === 0}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg shadow-sm font-medium transition-colors ${
                  selectedIds.length > 0
                    ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer'
                    : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-70'
                }`}
              >
                <FolderPlus size={18} /> Thêm vào...
              </button>

              {/* NÚT BỎ YÊU THÍCH  */}
              <button 
                onClick={handleRemoveBulk}
                disabled={selectedIds.length === 0}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg shadow-sm font-medium transition-colors ${
                  selectedIds.length > 0 
                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 cursor-pointer' 
                    : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-70'
                }`}
              >
                <Trash2 size={18} /> Bỏ yêu thích ({selectedIds.length})
              </button>
            </>
          )}
          
          <button 
            onClick={() => {
              setIsSelectMode(!isSelectMode);
              if (isSelectMode) setSelectedIds([]); 
            }}
            className={`px-5 py-2 font-bold rounded-lg shadow-sm transition-colors ${
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
        words={favorites}
        searchTerm={searchTerm}
        isSelectMode={isSelectMode}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onSelectAll={handleSelectAllCurrentPage}
        ActionColumn={FavoriteActionColumn} 
      />

      {/*THÊM TỪ VÀO BỘ TỪ VỰNG */}\
      <AddToCollectionModal 
        isOpen={showAddToCollectionModal}
        onClose={() => setShowAddToCollectionModal(false)}
        isBulkMode={isBulkAddMode}
        wordToAdd={wordToAdd}
        selectedCount={selectedIds.length}
        collections={MOCK_COLLECTIONS}
        onConfirm={handleConfirmAddToCollections}
      />

    </div>
  );
}

export default FavoritePage;