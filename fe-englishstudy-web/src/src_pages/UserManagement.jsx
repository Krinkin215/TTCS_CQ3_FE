import React, { useState, useMemo } from 'react';
import { Search, Menu, Trash2, CheckSquare, Square, X, Mail, Cake, Calendar, Trophy, Flame, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import SearchBar from '../src_components/SearchBar';
import Pagination from '../src_components/Pagination';
import ConfirmModal from '../src_components/ConfirmModal';
import ProfileModal from '../src_components/ProfileModal';

const MOCK_USERS = [
  {
    id: '1',
    username: 'pmd1506',
    fullName: 'Phạm Minh Đức',
    email: 'pmducc1506@gmail.com',
    date_of_birth: '2004-06-15',
    joinDate: '02/03/2026',
    streak: 2,
    totalXP: 1250,
    avatarChar: 'P',
    avatarUrl: null
  },
  {
    id: '2',
    username: 'nguyenvana',
    fullName: 'Nguyễn Văn A',
    email: 'nva@example.com',
    date_of_birth: '1999-01-01',
    joinDate: '10/01/2026',
    streak: 5,
    totalXP: 3400,
    avatarChar: 'N',
    avatarUrl: null
  },
  {
    id: '3',
    username: 'tranthib',
    fullName: 'Trần Thị B',
    email: 'ttb@example.com',
    date_of_birth: '2002-12-20',
    joinDate: '15/02/2026',
    streak: 0,
    totalXP: 800,
    avatarChar: 'T',
    avatarUrl: null
  },
  {
    id: '4',
    username: 'lequangk',
    fullName: 'Lê Quang K',
    email: 'lequangk@example.com',
    date_of_birth: '1995-05-10',
    joinDate: '20/03/2026',
    streak: 12,
    totalXP: 5600,
    avatarChar: 'L',
    avatarUrl: null
  },
  {
    id: '5',
    username: 'hoangminht',
    fullName: 'Hoàng Minh T',
    email: 'hm_t@example.com',
    date_of_birth: '2000-08-25',
    joinDate: '05/04/2026',
    streak: 1,
    totalXP: 250,
    avatarChar: 'H',
    avatarUrl: null
  },
  ...Array.from({ length: 35 }).map((_, i) => ({
    id: `${i + 6}`,
    username: `student_${i + 6}`,
    fullName: `Học viên ${i + 6}`,
    email: `student${i + 6}@example.com`,
    date_of_birth: `2005-01-${String((i % 28) + 1).padStart(2, '0')}`,
    joinDate: `${String((i % 28) + 1).padStart(2, '0')}/04/2026`,
    streak: i % 5,
    totalXP: i * 50 + 100,
    avatarChar: 'H',
    avatarUrl: null
  }))
];

export default function UserManagement() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');

  // Trạng thái phân trang & Sắp xếp
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState(null);
  const itemsPerPage = 10;

  // Trạng thái lựa chọn
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // Trạng thái modal
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedProfileUser, setSelectedProfileUser] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Lọc và sắp xếp người dùng
  const processedUsers = useMemo(() => {
    let result = users;

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(user =>
        user.username.toLowerCase().includes(lowerSearch) ||
        user.email.toLowerCase().includes(lowerSearch) ||
        user.fullName.toLowerCase().includes(lowerSearch)
      );
    }

    // Sắp xếp theo tên người dùng
    if (sortOrder) {
      result = [...result].sort((a, b) => {
        const nameA = a.username.toLowerCase();
        const nameB = b.username.toLowerCase();
        if (nameA < nameB) return sortOrder === 'asc' ? -1 : 1;
        if (nameA > nameB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [users, searchTerm, sortOrder]);

  const totalPages = Math.ceil(processedUsers.length / itemsPerPage) || 1;

  // Người dùng trên trang hiện tại
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [processedUsers, currentPage]);

  // Các hàm xử lý
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const toggleSort = (order) => {
    if (sortOrder === order) {
      setSortOrder(null);
    } else {
      setSortOrder(order);
    }
    setCurrentPage(1);
  };

  const handleOpenProfile = (user) => {
    setSelectedProfileUser(user);
    setIsProfileModalOpen(true);
  };

  const handleToggleMultiSelect = () => {
    setIsMultiSelectMode(!isMultiSelectMode);
    setSelectedUserIds([]);
  };

  const handleToggleSelectUser = (userId) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    const paginatedIds = paginatedUsers.map(u => u.id);
    const areAllCurrentPageSelected = paginatedIds.length > 0 && paginatedIds.every(id => selectedUserIds.includes(id));

    if (areAllCurrentPageSelected) {
      // Bỏ chọn trang hiện tại
      setSelectedUserIds(prev => prev.filter(id => !paginatedIds.includes(id)));
    } else {
      // Chọn trang hiện tại (thêm vào các lựa chọn đã có)
      setSelectedUserIds(prev => {
        const newSelection = new Set([...prev, ...paginatedIds]);
        return Array.from(newSelection);
      });
    }
  };

  const handleDeleteClick = (user = null) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      setUsers(users.filter(u => u.id !== userToDelete.id));
    } else {
      setUsers(users.filter(u => !selectedUserIds.includes(u.id)));
      setIsMultiSelectMode(false);
      setSelectedUserIds([]);
    }
    setIsDeleteModalOpen(false);
    setUserToDelete(null);

    // Điều chỉnh phân trang nếu cần
    const remainingItems = userToDelete ? users.length - 1 : users.length - selectedUserIds.length;
    const newTotalPages = Math.ceil(remainingItems / itemsPerPage) || 1;
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Quản lý User</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Danh sách người dùng hệ thống</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Thanh tìm kiếm */}
          <SearchBar 
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Tìm kiếm tài khoản, email..."
            className="w-full sm:w-72"
          />

          {/* Nút xóa đã chọn */}
          {isMultiSelectMode && selectedUserIds.length > 0 && (
            <button
              onClick={() => handleDeleteClick(null)}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl font-bold shadow-sm transition-colors whitespace-nowrap"
            >
              <Trash2 size={18} />
              Xóa ({selectedUserIds.length})
            </button>
          )}

          {/* Nút chuyển đổi chọn nhiều */}
          <button
            onClick={handleToggleMultiSelect}
            className={`px-4 py-2.5 rounded-xl font-bold shadow-sm transition-all whitespace-nowrap border ${isMultiSelectMode
              ? 'bg-slate-800 text-white hover:bg-slate-900 border-transparent'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
          >
            {isMultiSelectMode ? 'Hủy chọn' : 'Chọn nhiều'}
          </button>
        </div>
      </div>

      {/* Khung chứa bảng */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-sm uppercase tracking-wider">
                <th className="py-4 px-6 w-16 text-center">STT</th>
                <th className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    Người dùng
                    <div className="flex flex-col">
                      <button
                        onClick={() => toggleSort('asc')}
                        className={`p-0.5 rounded transition-colors ${sortOrder === 'asc' ? 'text-cyan-600 bg-cyan-50' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'}`}
                        title="Sắp xếp A-Z"
                      >
                        <ArrowUp size={14} strokeWidth={3} />
                      </button>
                      <button
                        onClick={() => toggleSort('desc')}
                        className={`p-0.5 rounded -mt-0.5 transition-colors ${sortOrder === 'desc' ? 'text-cyan-600 bg-cyan-50' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'}`}
                        title="Sắp xếp Z-A"
                      >
                        <ArrowDown size={14} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </th>
                <th className="py-4 px-6 w-24 text-center">Profile</th>
                <th className="py-4 px-6 w-24 text-center">
                  {isMultiSelectMode ? (
                    <button
                      onClick={handleSelectAll}
                      className="text-cyan-600 hover:text-cyan-800 transition-colors flex justify-center w-full"
                    >
                      {paginatedUsers.length > 0 && paginatedUsers.every(u => selectedUserIds.includes(u.id)) ? (
                        <CheckSquare size={20} className="text-cyan-600" />
                      ) : (
                        <Square size={20} />
                      )}
                    </button>
                  ) : (
                    'Xóa'
                  )}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user, index) => {
                  const isSelected = selectedUserIds.includes(user.id);
                  const stt = index + 1 + (currentPage - 1) * itemsPerPage;
                  return (
                    <tr key={user.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-cyan-50/50' : ''}`}>
                      <td className="py-4 px-6 text-center text-slate-500 font-bold">
                        {stt}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#0e7490] text-white flex items-center justify-center font-bold shadow-sm shrink-0 overflow-hidden border-2 border-white">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              user.avatarChar
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-base">{user.username}</p>
                            <p className="text-sm text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleOpenProfile(user)}
                          className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-full transition-colors mx-auto block"
                          title="Xem hồ sơ"
                        >
                          <Menu size={20} />
                        </button>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {isMultiSelectMode ? (
                          <button
                            onClick={() => handleToggleSelectUser(user.id)}
                            className="p-2 transition-colors mx-auto block text-slate-400 hover:text-cyan-600"
                          >
                            {isSelected ? (
                              <CheckSquare size={20} className="text-cyan-600" />
                            ) : (
                              <Square size={20} />
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors mx-auto block"
                            title="Xóa tài khoản"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-400 font-medium">
                    Không tìm thấy người dùng nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Điều khiển phân trang */}
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={processedUsers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          itemName="tài khoản"
        />
      </div>

      {/* modal hồ sơ người dùng */}
      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={selectedProfileUser ? {
          ...selectedProfileUser,
          xp: selectedProfileUser.totalXP,
          join_date: selectedProfileUser.joinDate,
          date_of_birth: selectedProfileUser.date_of_birth.split('-').reverse().join('/')
        } : null}
        isEditable={false}
      />

      {/* xác nhận xóa modal */}
      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        message={userToDelete
          ? `Bạn có chắc chắn muốn xóa tài khoản "${userToDelete.username}" không? Hành động này không thể hoàn tác.`
          : `Bạn có chắc chắn muốn xóa ${selectedUserIds.length} tài khoản đã chọn không? Hành động này không thể hoàn tác.`
        }
        isDanger={true}
      />

    </div>
  );
}
