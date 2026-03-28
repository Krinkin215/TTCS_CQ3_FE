import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export default function AddToCollectionModal({ 
  isOpen, 
  onClose, 
  isBulkMode, 
  wordToAdd, 
  selectedCount, 
  collections, 
  onConfirm 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTargetIds, setSelectedTargetIds] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedTargetIds([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredCollections = collections.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) && c.id !== 0
  );

  const toggleSelect = (id) => {
    setSelectedTargetIds(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTargetIds.length === filteredCollections.length && filteredCollections.length > 0) {
      setSelectedTargetIds([]);
    } else {
      setSelectedTargetIds(filteredCollections.map(c => c.id));
    }
  };

  const handleSubmit = () => {
    onConfirm(selectedTargetIds); 
  };

  return (
    <div className="fixed inset-0 bg-cyan-950/70 z-[200] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-gray-100 flex flex-col max-h-[85vh] animate-in zoom-in duration-200">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-5 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-cyan-950">Lưu vào bộ từ</h2>
            <p className="text-sm text-gray-500 mt-0.5 truncate max-w-[200px]">
              {isBulkMode ? (
                <span>Đang chọn: <span className="font-bold text-cyan-700">{selectedCount} từ vựng</span></span>
              ) : (
                <span>Từ: <span className="font-bold text-cyan-700">{wordToAdd?.word}</span></span>
              )}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* TOOLBAR TÌM KIẾM */}
        <div className="p-4 border-b border-gray-50 shrink-0 bg-gray-50/50">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Tìm kiếm bộ từ..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer shrink-0" title="Chọn tất cả">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tất cả</span>
              <input 
                type="checkbox" 
                checked={selectedTargetIds.length === filteredCollections.length && filteredCollections.length > 0}
                onChange={handleSelectAll}
                className="w-5 h-5 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* DANH SÁCH BỘ TỪ */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {filteredCollections.length > 0 ? (
            filteredCollections.map(collection => (
              <label key={collection.id} className="flex items-center justify-between p-3 hover:bg-cyan-50 rounded-xl cursor-pointer transition-colors group">
                <span className="text-gray-700 font-medium group-hover:text-cyan-900 truncate pr-4">{collection.name}</span>
                <input 
                  type="checkbox" 
                  checked={selectedTargetIds.includes(collection.id)}
                  onChange={() => toggleSelect(collection.id)}
                  className="w-5 h-5 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500 cursor-pointer shrink-0"
                />
              </label>
            ))
          ) : (
            <div className="py-8 text-center text-gray-400 text-sm">Không tìm thấy bộ từ nào.</div>
          )}
        </div>

        {/* FOOTER NÚT BẤM */}
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-gray-50/50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors">
            Hủy
          </button>
          <button 
            onClick={handleSubmit}
            disabled={selectedTargetIds.length === 0}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${
              selectedTargetIds.length > 0 ? 'bg-cyan-600 text-white hover:bg-cyan-700 cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Thêm vào ({selectedTargetIds.length})
          </button>
        </div>

      </div>
    </div>
  );
}