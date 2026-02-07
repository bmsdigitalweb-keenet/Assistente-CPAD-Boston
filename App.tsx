
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatService } from './services/geminiService';
import { Message, QuickOption, CartItem, Order, CustomerInfo, PaymentInfo, OrderStatus } from './types';
import { QUICK_OPTIONS, STORE_NAME, WHATSAPP_LINK } from './constants';
import ChatMessage from './components/ChatMessage';
import StoreSidebar from './components/StoreSidebar';
import CheckoutModal from './components/CheckoutModal';
import AdminModal from './components/AdminModal';

const SHIPPING_TAX = 6.99;

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasKey, setHasKey] = useState<boolean>(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
    
    const savedOrders = localStorage.getItem('cpad_orders');
    if (savedOrders) {
      const parsed = JSON.parse(savedOrders).map((o: any) => ({
        ...o,
        data: new Date(o.data)
      }));
      setOrders(parsed);
    }
  }, []);

  useEffect(() => {
    const greeting: Message = {
      id: 'greeting',
      role: 'model',
      text: `A paz do Senhor! Sou a ASSIA, sua assistente da CPAD Boston 😊\nComo posso te ajudar hoje?\n\nEscolha uma das opções abaixo ou digite o nome do livro ou Bíblia que procura:`,
      timestamp: new Date(),
    };
    setMessages([greeting]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
      // Força recarregamento do serviço ou apenas avisa o usuário
      const systemMsg: Message = {
        id: Date.now().toString(),
        role: 'model',
        text: "_Chave de API atualizada com sucesso. Como posso ajudar?_",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMsg]);
    }
  };

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim()) return;
    const userMessage: Message = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    try {
      const responseText = await chatService.sendMessage(text);
      const modelMessage: Message = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: new Date() };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  }, []);

  const addToCart = (product: { nome: string; preco: string; imagem: string | null; link: string }) => {
    const cleanName = product.nome.replace(/\*\*/g, '').trim();
    const priceMatch = product.preco.match(/(\d+[.,]\d+)/);
    const numericPrice = priceMatch ? parseFloat(priceMatch[0].replace(',', '.')) : 0;
    const productId = cleanName.toLowerCase().replace(/\s+/g, '-');
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing) return prev.map(item => item.id === productId ? { ...item, quantidade: item.quantidade + 1 } : item);
      return [...prev, { id: productId, nome: cleanName, preco: numericPrice, imagem: product.imagem, quantidade: 1 }];
    });
  };

  const handleCompletePurchase = (customer: CustomerInfo, payment: PaymentInfo) => {
    const subtotal = cart.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
    const numericId = Date.now().toString() + Math.floor(Math.random() * 900 + 100).toString();
    
    const newOrder: Order = {
      id: numericId,
      data: new Date(),
      cliente: customer,
      pagamento: payment,
      itens: [...cart],
      subtotal,
      taxa: SHIPPING_TAX,
      total: subtotal + SHIPPING_TAX,
      status: 'Processando'
    };
    
    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    localStorage.setItem('cpad_orders', JSON.stringify(updatedOrders));
    setCart([]);
  };

  const deleteOrder = (id: string) => {
    const updated = orders.filter(o => o.id !== id);
    setOrders(updated);
    localStorage.setItem('cpad_orders', JSON.stringify(updated));
  };

  const updateOrder = (id: string, customer: CustomerInfo, status?: OrderStatus) => {
    const updated = orders.map(o => {
      if (o.id === id) {
        return { 
          ...o, 
          cliente: customer, 
          status: status || o.status 
        };
      }
      return o;
    });
    setOrders(updated);
    localStorage.setItem('cpad_orders', JSON.stringify(updated));
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + item.preco * item.quantidade, 0);

  return (
    <div className="flex h-screen w-full bg-[#dadbd3] overflow-hidden">
      <div className="flex flex-col flex-1 max-w-5xl mx-auto bg-white shadow-2xl overflow-hidden relative">
        <header className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#075e54] font-bold text-lg">AS</div>
            <div>
              <h1 className="font-semibold text-base leading-none">{STORE_NAME}</h1>
              <span className="text-[10px] text-green-200 opacity-90 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>Online
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleOpenKeySelector}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              title="Trocar Chave de API"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3L15.5 7.5z"></path></svg>
            </button>
            <button onClick={() => setIsAdminOpen(true)} className="lg:hidden p-2 text-white/80 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></button>
            <div className="lg:hidden relative">
               <button onClick={() => setIsCheckoutOpen(true)} className="p-2 bg-white/10 rounded-full">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                 {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">{cart.reduce((a, b) => a + b.quantidade, 0)}</span>}
               </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#e5ddd5]" ref={scrollRef} style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundRepeat: 'repeat', backgroundSize: '400px' }}>
          {messages.map((msg) => <ChatMessage key={msg.id} message={msg} onAddToCart={addToCart} />)}
          {isTyping && <div className="flex justify-start mb-4"><div className="bg-white rounded-lg px-3 py-2 shadow-sm flex items-center gap-1"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span></div></div>}
        </div>

        <footer className="bg-[#f0f2f5] p-3 border-t border-gray-200 shrink-0">
          <div className="flex gap-2 overflow-x-auto pb-3 mb-1 no-scrollbar">
            {QUICK_OPTIONS.map((opt) => <button key={opt.id} onClick={() => opt.action === 'REDIRECT_WHATSAPP' ? window.open(WHATSAPP_LINK, '_blank') : handleSend(opt.action)} className="whitespace-nowrap px-4 py-1.5 bg-white border border-gray-300 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-100 shadow-sm">{opt.label}</button>)}
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)} 
              placeholder="Digite sua mensagem..." 
              className="flex-1 bg-white border-none rounded-lg px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400" 
            />
            <button onClick={() => handleSend(inputValue)} disabled={!inputValue.trim() || isTyping} className="w-10 h-10 bg-[#128c7e] text-white rounded-full flex items-center justify-center shadow-md transition-all active:scale-90"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button>
          </div>
        </footer>
      </div>

      <StoreSidebar cart={cart} onRemoveFromCart={(id) => setCart(prev => prev.filter(i => i.id !== id))} onCheckout={() => setIsCheckoutOpen(true)} onOpenAdmin={() => setIsAdminOpen(true)} taxa={SHIPPING_TAX} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} subtotal={cartSubtotal} taxa={SHIPPING_TAX} onComplete={handleCompletePurchase} />
      <AdminModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} orders={orders} onDeleteOrder={deleteOrder} onUpdateOrder={updateOrder} />
    </div>
  );
};

export default App;
