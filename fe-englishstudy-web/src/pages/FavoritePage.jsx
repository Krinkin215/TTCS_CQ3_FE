import { toast } from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { Volume2, MoreVertical, FolderPlus, Trash2, Search, X } from 'lucide-react';
import VocabTable from '../components/VocabTable';
import AddToCollectionModal from '../components/AddToCollectionModal';
import SearchBar from '../components/SearchBar';


const ITEMS_PER_PAGE = 10;


function FavoritePage() {
  const [favorites, setFavorites] = useState([]);
  const [collections, setCollections] = useState([]);
  

  const [openExampleId, setOpenExampleId] = useState(null); 

  const [searchTerm, setSearchTerm] = useState(''); 
  
  // modal thêm vào bộ từ
  const [showAddToCollectionModal, setShowAddToCollectionModal] = useState(false);
  const [wordToAdd, setWordToAdd] = useState(null);
  const [modalSearchTerm, setModalSearchTerm] = useState(''); 
  const [selectedCollectionIds, setSelectedCollectionIds] = useState([]); 
  const [collectionVocabDB, setCollectionVocabDB] = useState([]);

  const modalFilteredCollections = collections.filter(c =>
    c.name.toLowerCase().includes(modalSearchTerm.toLowerCase())
  );

  const handleOpenAddToCollectionModal = (word) => {
    setWordToAdd(word);
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
    
    const wordIdsToProcess = [wordToAdd.id];
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
    
    toast.error(alertMsg);

    setShowAddToCollectionModal(false);
  };





  const playAudio = (word) => {
    console.log(`Đang phát âm thanh từ: ${word}`);

  };


  const handleRemoveSingle = (id) => {
    setFavorites(favorites.filter(item => item.id !== id));
  };





  const filteredFavorites = favorites.filter(item => 
    item.word.toLowerCase().includes(searchTerm.toLowerCase())
  );




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
      
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-cyan-950">Từ vựng yêu thích</h1>
          <p className="text-gray-500 mt-1">Quản lý và ôn tập các từ vựng bạn đã đánh dấu</p>
        </div>

        
        <div className="flex gap-4 items-center">
          
          
          <SearchBar 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm từ vựng..."
            className="w-64"
          />


        </div>
      </div>

      <VocabTable 
        words={favorites}
        searchTerm={searchTerm}
        ActionColumn={FavoriteActionColumn} 
      />

      {/* modal thêm vào bộ từ */}
      <AddToCollectionModal 
        isOpen={showAddToCollectionModal}
        onClose={() => setShowAddToCollectionModal(false)}
        wordToAdd={wordToAdd}
        collections={collections}
        onConfirm={handleConfirmAddToCollections}
      />

    </div>
  );
}

export default FavoritePage;