
import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  onAddToCart?: (product: { nome: string; preco: string; imagem: string | null; link: string }) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onAddToCart }) => {
  const isModel = message.role === 'model';

  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    const processedLines: React.ReactNode[] = [];
    let currentProduct: any = null;

    const flushProduct = (index: number) => {
      if (currentProduct) {
        // Criamos uma cópia local para evitar problemas de referência/closure
        const productData = { ...currentProduct };
        
        processedLines.push(
          <div key={`prod-${index}`} className="my-3 p-2 bg-gray-50 rounded-lg border border-gray-100 flex gap-3 items-start shadow-sm">
            {productData.imagem && (
              <div className="shrink-0">
                <img 
                  src={productData.imagem} 
                  alt="Produto" 
                  className="w-16 h-16 md:w-20 md:h-20 object-contain bg-white rounded border border-gray-200 shadow-sm"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {productData.nome && (
                <div className="font-bold text-gray-900 text-sm md:text-base leading-tight mb-1">
                  {productData.nome.replace(/\*\*/g, '')}
                </div>
              )}
              {productData.preco && <div className="text-xs text-green-700 font-semibold">{productData.preco}</div>}
              {productData.estoque && <div className="text-[10px] text-gray-500">{productData.estoque}</div>}
              
              <div className="flex flex-wrap gap-2 mt-2">
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onAddToCart) onAddToCart(productData);
                  }}
                  className="bg-[#128c7e] hover:bg-[#075e54] text-white text-[10px] font-bold px-3 py-1.5 rounded transition-all shadow-sm uppercase active:scale-95"
                >
                  Comprar
                </button>
                {productData.link && (
                  <a 
                    href={productData.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-block text-[11px] font-bold text-gray-500 hover:text-[#128c7e] py-1.5"
                  >
                    DETALHES ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        );
        currentProduct = null;
      }
    };

    lines.forEach((line, lineIdx) => {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**') && !currentProduct) {
        currentProduct = { nome: trimmedLine };
      } else if (currentProduct && trimmedLine.startsWith('Preço:')) {
        currentProduct.preco = trimmedLine;
      } else if (currentProduct && trimmedLine.startsWith('Disponibilidade:')) {
        currentProduct.estoque = trimmedLine;
      } else if (currentProduct && trimmedLine.startsWith('Link:')) {
        currentProduct.link = trimmedLine.replace('Link:', '').trim();
      } else if (currentProduct && trimmedLine.startsWith('Imagem:')) {
        currentProduct.imagem = trimmedLine.replace('Imagem:', '').trim();
        flushProduct(lineIdx);
      } else {
        if (currentProduct && trimmedLine !== "") {
          flushProduct(lineIdx);
        }
        
        if (trimmedLine === "" && currentProduct) {
          // Mantém agrupamento
        } else {
          const parts = line.split(/(\*\*.*?\*\*)/g);
          processedLines.push(
            <div key={`line-${lineIdx}`} className="min-h-[1.2em] mb-1">
              {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={index} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
                }
                return <span key={index}>{part}</span>;
              })}
            </div>
          );
        }
      }
    });

    if (currentProduct) flushProduct(9999);
    return processedLines;
  };
  
  return (
    <div className={`flex w-full mb-4 ${isModel ? 'justify-start' : 'justify-end'}`}>
      <div 
        className={`max-w-[88%] md:max-w-[75%] rounded-lg px-3 py-2 shadow-sm relative ${
          isModel 
            ? 'bg-white text-gray-800 rounded-tl-none border-l-4 border-l-[#128c7e]' 
            : 'bg-[#dcf8c6] text-gray-800 rounded-tr-none'
        }`}
      >
        <div className="text-[13px] md:text-sm whitespace-pre-wrap leading-relaxed">
          {renderFormattedText(message.text)}
        </div>
        
        <div className="text-[10px] text-gray-400 text-right mt-1.5 flex items-center justify-end gap-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {!isModel && (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4fc3f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
              <polyline points="15 6 9 12 4 12" opacity="0.5"></polyline>
            </svg>
          )}
        </div>

        <div 
          className={`absolute top-0 w-0 h-0 border-t-[10px] border-t-transparent ${
            isModel 
              ? '-left-2 border-r-[10px] border-r-white' 
              : '-right-2 border-l-[10px] border-l-[#dcf8c6]'
          }`}
        />
      </div>
    </div>
  );
};

export default ChatMessage;
