
import React from 'react';
import { STORE_URL, STORE_NAME } from '../constants';
import { CartItem } from '../types';

interface StoreSidebarProps {
  cart: CartItem[];
  onRemoveFromCart: (id: string) => void;
  onCheckout: () => void;
  onOpenAdmin: () => void;
  taxa: number;
}

const StoreSidebar: React.FC<StoreSidebarProps> = ({ cart, onRemoveFromCart, onCheckout, onOpenAdmin, taxa }) => {
  const subtotal = cart.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
  const total = subtotal > 0 ? subtotal + taxa : 0;

  return (
    <div className="hidden lg:flex flex-col w-80 bg-white border-l border-gray-200 h-full p-4 overflow-y-auto">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-[#075e54] mb-1">{STORE_NAME}</h2>
          <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold italic">"Alimentando a Igreja com a Palavra de Deus"</p>
        </div>
        <button 
          onClick={onOpenAdmin}
          className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
          title="Administrador"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </button>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            Meu Carrinho
          </h3>
          <span className="bg-[#128c7e] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
            {cart.reduce((acc, i) => acc + i.quantidade, 0)} itens
          </span>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-10 opacity-60">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            <p className="text-sm text-gray-400">Seu carrinho está vazio</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-3 p-2 bg-gray-50 rounded border border-gray-100 items-center">
                <img src={item.imagem || ''} className="w-10 h-10 object-contain bg-white rounded shadow-xs" alt="" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-gray-800 truncate">{item.nome}</p>
                  <p className="text-[10px] text-gray-500 font-medium">{item.quantidade}x ${item.preco.toFixed(2)}</p>
                </div>
                <button 
                  onClick={() => onRemoveFromCart(item.id)}
                  className="text-red-400 hover:text-red-600 p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {cart.length > 0 && (
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 font-medium">Subtotal:</span>
              <span className="text-xs font-bold text-gray-800">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 font-medium">Taxa de Envio:</span>
              <span className="text-xs font-bold text-gray-800">${taxa.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-sm font-bold text-gray-700">Total:</span>
              <span className="text-lg font-black text-[#128c7e]">${total.toFixed(2)}</span>
            </div>
            <button 
              onClick={onCheckout}
              className="w-full mt-2 py-2.5 bg-[#128c7e] hover:bg-[#075e54] text-white text-center rounded-lg font-bold text-sm transition-all shadow-md active:scale-95 uppercase tracking-wide"
            >
              Finalizar Compra
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h3 className="font-black text-gray-400 uppercase text-[10px] tracking-widest">Atendimento</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-lg">📍</span>
            <div>
              <p className="text-[11px] font-bold text-gray-700">Everett, MA</p>
              <p className="text-[10px] text-gray-500 font-medium">Distribuidor Oficial</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">🕒</span>
            <div>
              <p className="text-[11px] font-bold text-gray-700">Horário</p>
              <p className="text-[10px] text-gray-500 font-medium">Seg - Sex: 09h às 17h</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreSidebar;
