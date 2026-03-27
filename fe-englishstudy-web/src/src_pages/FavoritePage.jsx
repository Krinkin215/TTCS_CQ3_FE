import React, { useState, useEffect } from 'react';
import { Volume2, MoreVertical, FolderPlus, Trash2, Search, X } from 'lucide-react';
import VocabTable from '../src_components/VocabTable';

const MOCK_FAVORITES = [
  { id: 1, word: 'Enthusiastic', pronunciation: '/ɪnˌθjuː.ziˈæs.tɪk/', type: 'Tính từ', meaning: 'Nhiệt tình, hăng hái', example: 'The crowd gave an enthusiastic cheer.', level: 'B2' },
  { id: 2, word: 'Determine', pronunciation: '/dɪˈtɜː.mɪn/', type: 'Động từ', meaning: 'Xác định, quyết định', example: 'Your attitude determines your altitude.', level: 'B1' },
  { id: 3, word: 'Apple', pronunciation: '/ˈæp.əl/', type: 'Danh từ', meaning: 'Quả táo', example: 'I eat an apple every day.', level: 'A1' },
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

  const confirmAddWordToCollections = () => {
    if (selectedCollectionIds.length === 0) return;
    
    if (isBulkAddMode) {
      alert(`Đã thêm ${selectedIds.length} từ vựng vào ${selectedCollectionIds.length} bộ từ!`);
      setIsSelectMode(false); 
      setSelectedIds([]);    
    } else {
      alert(`Đã thêm từ "${wordToAdd.word}" vào ${selectedCollectionIds.length} bộ từ!`);
    }
    
    setShowAddToCollectionModal(false);
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

      {/*THÊM TỪ VÀO BỘ TỪ VỰNG */}
      {showAddToCollectionModal && (wordToAdd || isBulkAddMode) && (
        <div className="fixed inset-0 bg-cyan-950/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-gray-100 flex flex-col max-h-[85vh] animate-in zoom-in duration-200">
            
            {/* Header Modal */}
            <div className="flex justify-between items-center p-5 pb-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-cyan-950">Lưu vào bộ từ</h2>
                <p className="text-sm text-gray-500 mt-0.5 truncate max-w-[200px]">
                  {isBulkAddMode ? (
                    <span>Đang chọn: <span className="font-bold text-cyan-700">{selectedIds.length} từ vựng</span></span>
                  ) : (
                    <span>Từ: <span className="font-bold text-cyan-700">{wordToAdd?.word}</span></span>
                  )}
                </p>
              </div>
              <button 
                onClick={() => setShowAddToCollectionModal(false)} 
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Thanh Tìm Kiếm & Nút Chọn tất cả*/}
            <div className="p-4 border-b border-gray-50 shrink-0 bg-gray-50/50">
              <div className="flex items-center justify-between gap-4">
                
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm bộ từ..." 
                    value={modalSearchTerm}
                    onChange={(e) => setModalSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer shrink-0" title="Chọn tất cả">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">tất cả</span>
                  <input 
                    type="checkbox" 
                    checked={selectedCollectionIds.length === modalFilteredCollections.length && modalFilteredCollections.length > 0}
                    onChange={handleSelectAllModalCollections}
                    className="w-5 h-5 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500 cursor-pointer"
                  />
                </label>

              </div>
            </div>

            {/* Danh sách các bộ từ  */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
              {modalFilteredCollections.length > 0 ? (
                modalFilteredCollections.map(collection => (
                  <label 
                    key={collection.id}
                    className="flex items-center justify-between p-3 hover:bg-cyan-50 rounded-xl cursor-pointer transition-colors group"
                  >
                    <span className="text-gray-700 font-medium group-hover:text-cyan-900 transition-colors truncate pr-4">
                      {collection.name}
                    </span>
                    
                    <input 
                      type="checkbox" 
                      checked={selectedCollectionIds.includes(collection.id)}
                      onChange={() => toggleModalCollectionSelect(collection.id)}
                      className="w-5 h-5 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500 cursor-pointer shrink-0"
                    />
                  </label>
                ))
              ) : (
                <div className="py-8 text-center text-gray-400 text-sm">
                  Không tìm thấy bộ từ nào.
                </div>
              )}
            </div>

            {/*Các nút bấm */}
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-gray-50/50 rounded-b-2xl">
              <button 
                onClick={() => setShowAddToCollectionModal(false)}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={confirmAddWordToCollections}
                disabled={selectedCollectionIds.length === 0}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${
                  selectedCollectionIds.length > 0
                    ? 'bg-cyan-600 text-white hover:bg-cyan-700 cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Thêm vào ({selectedCollectionIds.length})
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default FavoritePage;