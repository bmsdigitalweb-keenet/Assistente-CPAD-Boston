
import React, { useState } from 'react';
import { CustomerInfo, PaymentInfo } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  taxa: number;
  onComplete: (customer: CustomerInfo, payment: PaymentInfo) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, subtotal, taxa, onComplete }) => {
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState<CustomerInfo>({
    nome: '', email: '', telefone: '', endereco: '', numero: '', bairro: '', cidade: '', estado: '', zip: ''
  });
  const [paymentData, setPaymentData] = useState<PaymentInfo>({
    nomeCartao: '', numeroCartao: '', validade: '', cvv: ''
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Limpar erros ao digitar
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Filtros de entrada para números
    if (name === 'numeroCartao' || name === 'cvv') {
      const numericValue = value.replace(/\D/g, '');
      setPaymentData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }

    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

  const validatePayment = () => {
    const newErrors: { [key: string]: string } = {};

    // Validação Número do Cartão (16 dígitos)
    if (paymentData.numeroCartao.length !== 16) {
      newErrors.numeroCartao = "O cartão deve ter exatamente 16 números.";
    }

    // Validação Validade (5 caracteres, ex: 12/28)
    if (paymentData.validade.length !== 5) {
      newErrors.validade = "Use o formato MM/AA (5 caracteres).";
    } else if (!/^\d{2}\/\d{2}$/.test(paymentData.validade)) {
      newErrors.validade = "Formato inválido. Use MM/AA.";
    }

    // Validação CVV (3 dígitos)
    if (paymentData.cvv.length !== 3) {
      newErrors.cvv = "O CVV deve ter exatamente 3 números.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePayment()) {
      return;
    }

    onComplete(formData, paymentData);
    setSuccess(true);
    setTimeout(() => {
      onClose();
      setStep(1);
      setSuccess(false);
      setFormData({ nome: '', email: '', telefone: '', endereco: '', numero: '', bairro: '', cidade: '', estado: '', zip: '' });
      setPaymentData({ nomeCartao: '', numeroCartao: '', validade: '', cvv: '' });
      setErrors({});
    }, 3000);
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-8 flex flex-col items-center text-center animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Compra Realizada!</h2>
          <p className="text-gray-600">Obrigado por comprar na CPAD Boston. Sua encomenda será processada em breve pela ASSIA.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-[#075e54] px-6 py-4 flex items-center justify-between text-white">
          <h2 className="text-lg font-bold">Finalizar Compra</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 flex items-center justify-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-[#128c7e] text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <div className={`w-12 h-1 ${step >= 2 ? 'bg-[#128c7e]' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-[#128c7e] text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
          </div>

          {step === 1 ? (
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-4">
              <h3 className="font-bold text-gray-800 text-sm mb-2 border-b pb-1">Informações de Entrega</h3>
              <input required name="nome" value={formData.nome} onChange={handleInputChange} type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white" placeholder="Nome Completo" />
              <div className="grid grid-cols-2 gap-3">
                <input required name="email" value={formData.email} onChange={handleInputChange} type="email" className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white" placeholder="E-mail" />
                <input required name="telefone" value={formData.telefone} onChange={handleInputChange} type="tel" className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white" placeholder="WhatsApp / Telefone" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input required name="endereco" value={formData.endereco} onChange={handleInputChange} type="text" className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white" placeholder="Endereço" />
                <input required name="numero" value={formData.numero} onChange={handleInputChange} type="text" className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white" placeholder="Nº" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input required name="bairro" value={formData.bairro} onChange={handleInputChange} type="text" className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white" placeholder="Bairro" />
                <input required name="zip" value={formData.zip} onChange={handleInputChange} type="text" className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white" placeholder="Zip/CEP" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input required name="cidade" value={formData.cidade} onChange={handleInputChange} type="text" className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white" placeholder="Cidade" />
                <input required name="estado" value={formData.estado} onChange={handleInputChange} type="text" className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white" placeholder="Estado" />
              </div>
              <button type="submit" className="w-full bg-[#128c7e] text-white py-3 rounded-xl font-bold">PRÓXIMO PASSO</button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-bold text-gray-800 text-sm mb-2 border-b pb-1">Pagamento com Cartão</h3>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-900">
                <div className="flex justify-between"><span>Subtotal:</span><span className="font-medium">${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between font-medium"><span>Taxa de Envio:</span><span className="text-[#128c7e]">${taxa.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold border-t mt-2 pt-1 text-base"><span>Total:</span><span className="text-gray-900">${(subtotal + taxa).toFixed(2)}</span></div>
              </div>
              
              <div className="space-y-3 bg-gray-800 p-4 rounded-xl shadow-inner relative">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dados do Cartão (Seguro)</p>
                
                <div>
                  <input required name="nomeCartao" value={paymentData.nomeCartao} onChange={handlePaymentChange} type="text" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-white/30" placeholder="Nome Completo (como no cartão)" />
                </div>

                <div>
                  <input required name="numeroCartao" value={paymentData.numeroCartao} onChange={handlePaymentChange} type="text" maxLength={16} className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-sm text-white placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-white/30 ${errors.numeroCartao ? 'border-red-500' : 'border-gray-600'}`} placeholder="Número do Cartão (16 dígitos)" />
                  {errors.numeroCartao && <p className="text-[10px] text-red-400 mt-1 font-bold">{errors.numeroCartao}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input required name="validade" value={paymentData.validade} onChange={handlePaymentChange} type="text" maxLength={5} className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-sm text-white placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-white/30 ${errors.validade ? 'border-red-500' : 'border-gray-600'}`} placeholder="MM/AA" />
                    {errors.validade && <p className="text-[10px] text-red-400 mt-1 font-bold">{errors.validade}</p>}
                  </div>
                  <div>
                    <input required name="cvv" value={paymentData.cvv} onChange={handlePaymentChange} type="text" maxLength={3} className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-sm text-white placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-white/30 ${errors.cvv ? 'border-red-500' : 'border-gray-600'}`} placeholder="CVV (3 dígitos)" />
                    {errors.cvv && <p className="text-[10px] text-red-400 mt-1 font-bold">{errors.cvv}</p>}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                 <button type="button" onClick={() => setStep(1)} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold text-gray-700">VOLTAR</button>
                 <button type="submit" className="flex-[2] bg-[#128c7e] text-white py-3 rounded-xl font-bold active:scale-95 transition-transform">PAGAR AGORA</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
