import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Xác nhận", isDanger = true }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-cyan-950/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDanger ? 'bg-red-50 text-red-500' : 'bg-cyan-50 text-cyan-600'}`}>
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500">{message}</p>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center gap-3">
          <button onClick={onClose} className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors">Hủy</button>
          <button onClick={onConfirm} className={`px-6 py-2.5 text-white font-bold rounded-xl shadow-md transition-colors ${isDanger ? 'bg-red-500 hover:bg-red-600' : 'bg-cyan-600 hover:bg-cyan-700'}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}