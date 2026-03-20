import React, { useState } from 'react';
import { Volume2, MoreVertical, FolderPlus, Trash2, Search } from 'lucide-react';

// Dữ liệu mẫu 
const MOCK_FAVORITES = [
  { id: 1, word: 'Enthusiastic', pronunciation: '/ɪnˌθjuː.ziˈæs.tɪk/', type: 'Tính từ', meaning: 'Nhiệt tình, hăng hái', example: 'The crowd gave an enthusiastic cheer.', level: 'B2' },
  { id: 2, word: 'Determine', pronunciation: '/dɪˈtɜː.mɪn/', type: 'Động từ', meaning: 'Xác định, quyết định', example: 'Your attitude determines your altitude.', level: 'B1' },
  { id: 3, word: 'Apple', pronunciation: '/ˈæp.əl/', type: 'Danh từ', meaning: 'Quả táo', example: 'I eat an apple every day.', level: 'A1' },
];

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
  const [openMenuId, setOpenMenuId] = useState(null); 

  const [searchTerm, setSearchTerm] = useState(''); 
  const [showCollectionDropdown, setShowCollectionDropdown] = useState(false); 
  const [collectionSearchTerm, setCollectionSearchTerm] = useState(''); 

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
    setOpenMenuId(null); 
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

  // Lọc bộ từ vựng trong dropdown
  const filteredCollections = MOCK_COLLECTIONS.filter(c =>
    c.name.toLowerCase().includes(collectionSearchTerm.toLowerCase())
  );

  // Chọn tất cả / Bỏ chọn tất cả
  const handleSelectAll = () => {
    if (selectedIds.length === filteredFavorites.length && filteredFavorites.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredFavorites.map(item => item.id));
    }
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
              <div className="relative">
                <button 
                  onClick={() => setShowCollectionDropdown(!showCollectionDropdown)}
                  disabled={selectedIds.length === 0}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg shadow-sm font-medium transition-colors ${
                    selectedIds.length > 0
                      ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer'
                      : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-70'
                  }`}
                >
                  <FolderPlus size={18} /> Thêm vào...
                </button>

                {/* KHUNG DROP-DOWN DANH SÁCH BỘ TỪ */}
                {showCollectionDropdown && selectedIds.length > 0 && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-100 shadow-2xl rounded-xl p-3 z-50">
                    <input 
                      type="text" 
                      placeholder="Tìm bộ từ..." 
                      value={collectionSearchTerm}
                      onChange={(e) => setCollectionSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm mb-2 outline-none focus:border-[#0e7490]"
                    />
                    <div className="max-h-48 overflow-y-auto">
                      {filteredCollections.length > 0 ? filteredCollections.map(c => (
                        <button 
                          key={c.id}
                          onClick={() => {
                            alert(`Đã thêm ${selectedIds.length} từ vào bộ: ${c.name}`);
                            setShowCollectionDropdown(false);
                            setSelectedIds([]);
                            setIsSelectMode(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-[#0e7490] hover:text-white rounded-md transition-colors truncate"
                        >
                          {c.name}
                        </button>
                      )) : (
                        <p className="text-xs text-gray-400 text-center py-2">Không tìm thấy bộ từ.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

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
              setOpenMenuId(null);
              setShowCollectionDropdown(false); 
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

      {/* BẢNG DANH SÁCH */}
      <div className="bg-white rounded-2xl shadow-sm border border-cyan-100 pb-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cyan-50 border-b border-cyan-100 text-cyan-900 text-sm uppercase tracking-wider [&>th:first-child]:rounded-tl-2xl [&>th:last-child]:rounded-tr-2xl">
              <th className="p-4 font-semibold w-16 text-center">STT</th>
              <th className="p-4 font-semibold">Từ vựng</th>
              <th className="p-4 font-semibold">Phiên âm</th>
              <th className="p-4 font-semibold">Loại từ</th>
              <th className="p-4 font-semibold">Nghĩa</th>
              <th className="p-4 font-semibold text-center">Cấp độ</th>
              <th className="p-4 font-semibold text-center">Audio</th>
              {!isSelectMode ? (
                <th className="p-4 font-semibold text-center">Hành động</th>
                ) : (
                /*  CHECKBOX CHỌN TẤT CẢ */
                <th className="p-4 font-semibold text-center w-16"><input 
                  type="checkbox" 
                  checked={selectedIds.length === filteredFavorites.length && filteredFavorites.length > 0}
                  onChange={handleSelectAll}
                  className="w-5 h-5 text-[#0e7490] rounded border-gray-300 focus:ring-[#0e7490] cursor-pointer"
                /></th>
            )}
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {filteredFavorites.map((item, index) => (
              <React.Fragment key={item.id}>
                <tr className="border-b border-gray-100 hover:bg-cyan-50/50 transition-colors">
                  <td className="p-4 text-center text-gray-400 font-medium">{index + 1}</td>
                  
                  {/* Cột Từ Vựng & Nút Ví dụ */}
                  <td className="p-4">
                    <span className="font-bold text-cyan-950 text-lg block">{item.word}</span>
                    <button 
                      onClick={() => setOpenExampleId(openExampleId === item.id ? null : item.id)}
                      className="text-xs text-cyan-600 bg-cyan-100 px-2 py-1 rounded mt-1 hover:bg-cyan-200 transition-colors"
                    >
                      {openExampleId === item.id ? 'Đóng ví dụ' : 'Xem ví dụ'}
                    </button>
                  </td>
                  
                  <td className="p-4 text-gray-500">{item.pronunciation}</td>
                  <td className="p-4"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">{item.type}</span></td>
                  <td className="p-4 font-medium">{item.meaning}</td>
                  <td className="p-4 text-center"><span className="font-bold text-blue-600">{item.level}</span></td>
                  
                  {/* Cột Audio */}
                  <td className="p-4 text-center">
                    <button onClick={() => playAudio(item.word)} className="p-2 text-cyan-600 hover:bg-cyan-100 rounded-full transition-colors">
                      <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                      </svg>
                    </button>
                  </td>

                    {!isSelectMode ? (
                    /* Cột Menu 3 chấm (Chỉ hiện khi KHÔNG bật Chọn nhiều) */
                    <td className="p-4 text-center relative">
                        <button 
                        onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                        className="p-2 text-gray-400 hover:text-cyan-700 hover:bg-cyan-50 rounded-full transition-colors"
                        >
                        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                        </svg>
                        </button>

                        {openMenuId === item.id && (
                        <div className="absolute right-8 top-12 w-48 bg-white border border-gray-100 shadow-2xl rounded-lg py-1 z-50 text-left">
                            <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-cyan-50 text-left">Thêm vào bộ từ...</button>
                            <button 
                            onClick={() => handleRemoveSingle(item.id)}
                            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                            >
                            Bỏ yêu thích
                            </button>
                        </div>
                        )}
                    </td>
                    ) : (
                    /* Cột Checkbox (Chỉ hiện khi BẬT Chọn nhiều) */
                    <td className="p-4 text-center">
                        <input 
                        type="checkbox" 
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="w-5 h-5 text-cyan-600 rounded focus:ring-cyan-500 cursor-pointer"
                        />
                    </td>
                    )}

                  
                </tr>

                {/* Dòng ẩn hiển thị Ví dụ  */}
                {openExampleId === item.id && (
                  <tr className="bg-slate-50 border-b border-cyan-100">
                    <td colSpan={8} className="p-4 px-12">
                      <div className="border-l-4 border-cyan-500 pl-4 py-2">
                        <p className="text-sm font-semibold text-gray-500 mb-1">Ví dụ sử dụng:</p>
                        <p className="text-gray-800 italic">"{item.example}"</p>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        
        {favorites.length === 0 && (
          <div className="p-8 text-center text-gray-400">Bạn chưa có từ vựng yêu thích nào.</div>
        )}
      </div>

    </div>
  );
}

export default FavoritePage;