import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  itemName = "mục",
  showPageNumbers = false
}) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalItems === 0) return null;

  return (
    <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between text-sm rounded-b-2xl mt-auto">
      <span className="text-slate-500 font-medium">
        Hiển thị <span className="font-bold text-slate-800">{startIndex + 1}</span> đến <span className="font-bold text-slate-800">{endIndex}</span> trong số <span className="font-bold text-slate-800">{totalItems}</span> {itemName}
      </span>
      
      <div className="flex items-center gap-1.5">
        <button 
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          title="Trang đầu"
        >
          <ChevronsLeft size={18} />
        </button>
        <button 
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          title="Trang trước"
        >
          <ChevronLeft size={18} />
        </button>
        
        {showPageNumbers ? (
          <div className="flex gap-1 mx-2">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => onPageChange(idx + 1)}
                className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                  currentPage === idx + 1 
                    ? 'bg-cyan-600 text-white shadow-md' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        ) : (
          <span className="px-4 font-bold text-slate-700">Trang {currentPage} / {totalPages}</span>
        )}

        <button 
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          title="Trang sau"
        >
          <ChevronRight size={18} />
        </button>
        <button 
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          title="Trang cuối"
        >
          <ChevronsRight size={18} />
        </button>
      </div>
    </div>
  );
}
