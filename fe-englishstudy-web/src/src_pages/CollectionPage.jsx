import React, { useState } from 'react';
import { Plus, Edit2, Eye, Trash2, X, Check, Search, FolderClosed, AlertTriangle, Bookmark, Volume2, ChevronDown, ChevronUp } from 'lucide-react';

const COLLECTION_NAME_LIMIT = 50;
const MOCK_COLLECTIONS = [
  { id: 0, name: 'Từ vựng của tôi', wordCount: 12 },
  { id: 1, name: 'Từ vựng luyện thi TOEIC', wordCount: 150 },
  { id: 2, name: 'Communication English (Part 1)', wordCount: 85 },
  { id: 3, name: 'Từ khó nhớ - A1/A2', wordCount: 42 },
  { id: 4, name: 'Chuyên ngành Công nghệ thông tin', wordCount: 210 },
  { id: 5, name: 'Luyện nghe IELTS Listening', wordCount: 98 },
];

function CollectionPage() {
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
  
  // Chọn nhiều & Xóa từ vựng
  const [isWordSelectMode, setIsWordSelectMode] = useState(false);
  const [selectedWordIds, setSelectedWordIds] = useState([]);
  const [showWordDeleteModal, setShowWordDeleteModal] = useState(false);
  const [wordToDelete, setWordToDelete] = useState(null); 
  const [openWordExampleId, setOpenWordExampleId] = useState(null);

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
    
    setCollections([newCollection, ...collections]);
    
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
    const mockWords = [
      { id: 101, word: 'Enthusiastic', pronunciation: '/ɪnˌθjuː.ziˈæs.tɪk/', type: 'Tính từ', level: 'B2', meaning: 'Nhiệt tình, hăng hái', example: 'The crowd gave an enthusiastic cheer when the team score.' },
      { id: 102, word: 'Determine', pronunciation: '/dɪˈtɜː.mɪn/', type: 'Động từ', level: 'C1', meaning: 'Xác định, quyết định', example: 'Your attitude, not your aptitude, determines your altitude.' },
      { id: 103, word: 'Apple', pronunciation: '/ˈæp.əl/', type: 'Danh từ', level: 'A1', meaning: 'Quả táo', example: 'An apple a day keeps the doctor away.' }
    ];
    setCollectionWords(collection.wordCount > 0 ? mockWords.slice(0, collection.wordCount) : []);
    setShowWordListModal(true);
    setIsWordSelectMode(false);
    setSelectedWordIds([]);
    setOpenWordExampleId(null);
  };

  const closeWordList = () => {
    setShowWordListModal(false);
    setActiveCollection(null);
    setOpenWordExampleId(null);
  };

  const toggleWordSelect = (id) => {
    setSelectedWordIds(prev => prev.includes(id) ? prev.filter(wId => wId !== id) : [...prev, id]);
  };

  const handleSelectAllWords = () => {
    if (selectedWordIds.length === collectionWords.length && collectionWords.length > 0) {
      setSelectedWordIds([]);
    } else {
      setSelectedWordIds(collectionWords.map(w => w.id));
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

      {/*  LƯỚI HIỂN THỊ CÁC BỘ TỪ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-y-8 pb-10">
        {filteredCollections.map(collection => (
          <div 
            key={collection.id} 
            className={`relative bg-white rounded-2xl shadow-sm border border-cyan-100 p-5 flex flex-col justify-between min-h-[12rem] transition-all group ${
              selectedIds.includes(collection.id) ? 'ring-4 ring-cyan-500 border-cyan-500 bg-cyan-50/20' : ''
            }`}
          >
            
            {/* CHECKBOX CHỌN NHIỀU */}
            {isSelectMode && collection.id !== 0 && (
              <div className="absolute top-4 right-4 z-10">
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(collection.id)}
                  onChange={() => toggleSelect(collection.id)}
                  className="w-6 h-6 text-cyan-600 rounded-md border-gray-300 focus:ring-cyan-500 cursor-pointer shadow-md"
                />
              </div>
            )}

            {/*  PHẦN TRÊN CARD  */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                {collection.id === 0 ? (
                  <span className="flex items-center justify-center w-10 h-10 bg-orange-100 text-orange-500 rounded-full">
                    <Bookmark size={20} fill="currentColor" />
                  </span>
                ) : (
                  <span className="flex items-center justify-center w-10 h-10 bg-cyan-100/50 text-cyan-600 font-bold text-xl rounded-full">
                    {collection.id < 10 ? `0${collection.id}` : collection.id}
                  </span>
                )}
              </div>
              
              {editingId === collection.id ? (
                // Chế độ đang sửa tên
                <div className="flex gap-2 items-center -ml-1">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      value={tempName} 
                      onChange={(e) => {
                        const newName = e.target.value;
                        if (newName.length <= COLLECTION_NAME_LIMIT) {
                          setTempName(newName);
                        }
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
                // Chế độ hiển thị bình thường
                <div className="flex gap-2 items-start group/title">
                  <h3 title={collection.name} className="text-lg font-bold text-cyan-950 truncate flex-1 mt-1">
                    {collection.name}
                  </h3>
                  {collection.id !== 0 && (
                    <button 
                      onClick={() => startEditing(collection)}
                      className="p-1.5 text-cyan-600 hover:bg-cyan-100 rounded-full opacity-0 group-hover/title:opacity-100 transition-opacity shrink-0"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                </div>
              )}
              
              <p className="text-xs text-gray-500 font-medium bg-gray-100/50 px-3 py-1 rounded-full w-fit mt-3">Số từ: {collection.wordCount} từ</p>
            </div>

            {/*PHẦN DƯỚI CARD  */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
              <button 
                onClick={() => openWordList(collection)} 
                className="flex items-center gap-2 px-3.5 py-1.5 text-sm font-semibold rounded-lg bg-white text-cyan-700 hover:bg-cyan-50 border border-cyan-100 transition-colors"
              >
                <Eye size={17} /> Xem từ
              </button>

              {collection.id !== 0 ? (
                <button 
                  onClick={() => openDeleteModal(collection)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={20} />
                </button>
              ) : (
                <div className="w-9 h-9"></div> 
              )}
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
                {isWordSelectMode && selectedWordIds.length > 0 && (
                  <button 
                    onClick={() => handleWordDeleteClick(null)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg shadow-sm hover:bg-red-100 font-medium transition-colors"
                  >
                    <Trash2 size={18} /> Xóa {selectedWordIds.length} từ
                  </button>
                )}
                
                {collectionWords.length > 0 && activeCollection.id !== 0 &&  (
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
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
              {collectionWords.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-white z-10 shadow-sm outline outline-1 outline-gray-100">
                    <tr className="bg-cyan-50 text-cyan-900 text-sm uppercase tracking-wider [&>th:first-child]:rounded-tl-lg [&>th:last-child]:rounded-tr-lg">
                      <th className="p-4 font-semibold text-center w-12 border-b border-cyan-100">STT</th>
                      <th className="p-4 font-semibold border-b border-cyan-100">Từ vựng</th>
                      <th className="p-4 font-semibold border-b border-cyan-100">Phiên âm</th>
                      <th className="p-4 font-semibold border-b border-cyan-100">Loại từ</th>
                      <th className="p-4 font-semibold border-b border-cyan-100">Cấp độ</th> 
                      <th className="p-4 font-semibold border-b border-cyan-100">Nghĩa</th>
                      <th className="p-4 font-semibold text-center border-b border-cyan-100">Audio</th>
                      {activeCollection.id !== 0 && (
                        !isWordSelectMode ? (
                          <th className="p-4 font-semibold text-center w-16 border-b border-cyan-100">Xóa</th>
                        ) : (
                          <th className="p-4 font-semibold text-center w-16 border-b border-cyan-100">
                            <input 
                              type="checkbox" 
                              checked={selectedWordIds.length === collectionWords.length && collectionWords.length > 0}
                              onChange={handleSelectAllWords}
                              className="w-5 h-5 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500 cursor-pointer"
                            />
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {collectionWords.map((item, index) => (
                      <React.Fragment key={item.id}>
                        <tr className="border-b border-gray-100 hover:bg-cyan-50/50 transition-colors group/row">
                          <td className="p-4 text-center text-gray-400 font-medium">{index + 1}</td>
                          <td className="p-4 font-bold text-cyan-950 text-base">{item.word}</td>
                          <td className="p-4 text-gray-500 text-sm">{item.pronunciation}</td>
                          <td className="p-4 whitespace-nowrap"><span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap">{item.type}</span></td>
                          
                          <td className="p-4">
                            <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded text-xs font-bold whitespace-nowrap">
                              {item.level}
                            </span>
                          </td>
                          
                          <td className="p-4">
                            <button 
                              onClick={() => setOpenWordExampleId(openWordExampleId === item.id ? null : item.id)}
                              className="w-full flex items-center justify-between gap-3 text-sm font-semibold text-left hover:text-cyan-700 group/meaning"
                            >
                              <span className="flex-1">{item.meaning}</span>
                              <span className={`text-gray-300 transition-colors ${openWordExampleId === item.id ? 'text-cyan-600' : 'group-hover/meaning:text-cyan-500'}`}>
                                {openWordExampleId === item.id ? (
                                  <ChevronUp size={20} />
                                ) : (
                                  <ChevronDown size={20} />
                                )}
                              </span>
                            </button>
                          </td>
                          
                          <td className="p-4 text-center">
                            <button className="p-2 text-cyan-600 hover:bg-cyan-100 rounded-full transition-colors">
                              <Volume2 size={18} />
                            </button>
                          </td>
                          
                          {activeCollection.id !== 0 && (
                            !isWordSelectMode ? (
                              <td className="p-4 text-center">
                                <button 
                                  onClick={() => handleWordDeleteClick(item)}
                                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover/row:opacity-100"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            ) : (
                              <td className="p-4 text-center">
                                <input 
                                  type="checkbox" 
                                  checked={selectedWordIds.includes(item.id)}
                                  onChange={() => toggleWordSelect(item.id)}
                                  className="w-5 h-5 text-cyan-600 rounded focus:ring-cyan-500 cursor-pointer"
                                />
                              </td>
                            )
                          )}
                        </tr>

                        {openWordExampleId === item.id && (
                          <tr className="bg-gray-50/70 border-b border-gray-100">
                            <td colSpan={activeCollection.id !== 0 ? 8 : 7} className="p-4 px-12 text-sm text-gray-600 italic">
                              <span className="font-semibold text-cyan-700 mr-2 not-italic">Ví dụ:</span>
                              "{item.example}"
                            </td>
                          </tr>
                        )}
                        
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
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

      {/* XÁC NHẬN XÓA TỪ VỰNG KHỎI BỘ TỪ  */}
      {showWordDeleteModal && (
        <div className="fixed inset-0 bg-cyan-950/70 z-[110] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full border border-gray-100 scale-100 transition-all">
            <div className="flex items-center gap-4 text-red-600 mb-6 pb-4 border-b border-gray-100">
              <AlertTriangle size={32} />
              <h2 className="text-2xl font-bold">Xác nhận xóa từ vựng?</h2>
            </div>
            
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              {wordToDelete ? (
                <>Bạn có chắc chắn muốn xóa từ <strong>"{wordToDelete.word}"</strong> khỏi bộ từ vựng này không?</>
              ) : (
                <>Bạn có chắc chắn muốn xóa <strong className="text-red-600">{selectedWordIds.length} từ vựng</strong> đã chọn khỏi bộ từ vựng này không?</>
              )}
              
              {selectedWordIds.length === collectionWords.length && !wordToDelete && (
                <span className="block mt-3 text-red-500 font-bold bg-red-50 p-2 rounded">
                  ⚠️ Lưu ý: Bạn đang xóa TẤT CẢ từ vựng trong bộ này!
                </span>
              )}
            </p>
            
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setShowWordDeleteModal(false)}
                className="px-6 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg font-bold hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={confirmWordDelete}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-lg hover:shadow-red-500/50"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default CollectionPage;