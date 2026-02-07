
import React, { useState, useMemo } from 'react';
import { Order, CustomerInfo, OrderStatus } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onDeleteOrder: (id: string) => void;
  onUpdateOrder: (id: string, customer: CustomerInfo, status?: OrderStatus) => void;
}

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, orders, onDeleteOrder, onUpdateOrder }) => {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pedidos'>('dashboard');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CustomerInfo | null>(null);

  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const totals = {
      dia: 0,
      semana: 0,
      mes: 0,
      ano: 0,
      pedidosConcluidos: 0,
      pedidosProcessando: 0,
      pedidosCancelados: 0
    };

    orders.forEach(order => {
      const orderDate = new Date(order.data);
      const isConcluido = order.status === 'Concluído';
      
      if (isConcluido) {
        if (orderDate >= today) totals.dia += order.total;
        if (orderDate >= last7Days) totals.semana += order.total;
        if (orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()) totals.mes += order.total;
        if (orderDate.getFullYear() === now.getFullYear()) totals.ano += order.total;
      }

      if (order.status === 'Concluído') totals.pedidosConcluidos++;
      if (order.status === 'Processando') totals.pedidosProcessando++;
      if (order.status === 'Cancelado') totals.pedidosCancelados++;
    });

    return totals;
  }, [orders]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'assia1972') {
      setIsLoggedIn(true);
    } else {
      alert('Senha incorreta!');
    }
  };

  const startEdit = (order: Order) => {
    setEditingId(order.id);
    setEditForm({ ...order.cliente });
  };

  const saveEdit = (id: string, status?: OrderStatus) => {
    if (editForm) {
      onUpdateOrder(id, editForm, status);
      setEditingId(null);
    } else {
      const order = orders.find(o => o.id === id);
      if (order) onUpdateOrder(id, order.cliente, status);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <div className="bg-white rounded-3xl w-full max-w-sm p-10 shadow-2xl border border-gray-100">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-800 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900">Admin Login</h2>
            <p className="text-gray-500 text-sm">Acesso restrito à gerência</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              autoFocus
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-gray-900/10 focus:bg-white text-center text-xl font-bold text-gray-900 transition-all"
              placeholder="••••••••"
            />
            <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-2xl font-bold shadow-xl transition-all active:scale-[0.98]">ENTRAR NO PAINEL</button>
            <button type="button" onClick={onClose} className="w-full text-gray-400 text-sm font-semibold py-2">CANCELAR</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-4 bg-black/95 backdrop-blur-xl">
      <div className="bg-white md:rounded-3xl w-full max-w-6xl h-full md:h-[92vh] shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-gray-900 px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              <h2 className="text-lg font-black tracking-tighter uppercase">CPAD Admin Center</h2>
            </div>
            <nav className="flex gap-2">
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'dashboard' ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-white'}`}
              >
                DASHBOARD
              </button>
              <button 
                onClick={() => setActiveTab('pedidos')} 
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'pedidos' ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-white'}`}
              >
                PEDIDOS ({orders.length})
              </button>
            </nav>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/50">
          {activeTab === 'dashboard' ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Vendas Hoje', val: stats.dia, color: 'bg-blue-600' },
                  { label: 'Esta Semana', val: stats.semana, color: 'bg-indigo-600' },
                  { label: 'Mês Atual', val: stats.mes, color: 'bg-emerald-600' },
                  { label: 'Ano Total', val: stats.ano, color: 'bg-gray-900' },
                ].map((card, i) => (
                  <div key={i} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
                    <p className="text-2xl font-black text-gray-900">${card.val.toFixed(2)}</p>
                    <div className={`h-1.5 w-full ${card.color} rounded-full mt-4 opacity-20`}></div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="text-sm font-black text-gray-900 mb-6 uppercase tracking-wider">Desempenho de Vendas (Acumulado)</h3>
                  <div className="space-y-6">
                    {[
                      { l: 'Hoje', v: stats.dia, m: Math.max(stats.dia, stats.semana, stats.mes, stats.ano) },
                      { l: 'Semana', v: stats.semana, m: Math.max(stats.dia, stats.semana, stats.mes, stats.ano) },
                      { l: 'Mês', v: stats.mes, m: Math.max(stats.dia, stats.semana, stats.mes, stats.ano) },
                      { l: 'Ano', v: stats.ano, m: Math.max(stats.dia, stats.semana, stats.mes, stats.ano) }
                    ].map((bar, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-gray-500">
                          <span>{bar.l}</span>
                          <span className="text-gray-900">${bar.v.toFixed(2)}</span>
                        </div>
                        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-600 transition-all duration-1000" 
                            style={{ width: `${bar.m > 0 ? (bar.v / bar.m) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="text-sm font-black text-gray-900 mb-6 uppercase tracking-wider">Status dos Pedidos</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
                      <span className="text-xs font-bold text-yellow-700">PROCESSANDO</span>
                      <span className="text-xl font-black text-yellow-800">{stats.pedidosProcessando}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <span className="text-xs font-bold text-emerald-700">CONCLUÍDOS</span>
                      <span className="text-xl font-black text-emerald-800">{stats.pedidosConcluidos}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                      <span className="text-xs font-bold text-red-700">CANCELADOS</span>
                      <span className="text-xl font-black text-red-800">{stats.pedidosCancelados}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Aguardando novos pedidos...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {[...orders].reverse().map((order) => (
                    <div key={order.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                          <div className="text-gray-900">
                            <span className="text-[10px] font-black text-gray-400 uppercase block leading-none mb-1">ID PEDIDO</span>
                            <span className="text-lg font-black">{order.id}</span>
                          </div>
                          <div className="text-gray-900 px-4 border-l border-gray-200">
                            <span className="text-[10px] font-black text-gray-400 uppercase block leading-none mb-1">DATA</span>
                            <span className="text-xs font-bold uppercase">{new Date(order.data).toLocaleDateString()} {new Date(order.data).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <select 
                            value={order.status}
                            onChange={(e) => saveEdit(order.id, e.target.value as OrderStatus)}
                            className={`text-[10px] font-black px-4 py-2 rounded-full border-2 outline-none transition-all ${
                              order.status === 'Concluído' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              order.status === 'Cancelado' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }`}
                          >
                            <option value="Processando">🟡 PROCESSANDO</option>
                            <option value="Concluído">🟢 CONCLUÍDO</option>
                            <option value="Cancelado">🔴 CANCELADO</option>
                          </select>
                          <button onClick={() => startEdit(order)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors" title="Editar informações do cliente">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          </button>
                          <button onClick={() => { if(confirm('⚠️ EXCLUIR DEFINITIVAMENTE?\nIsso removerá os dados permanentemente.')) onDeleteOrder(order.id); }} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        </div>
                      </div>

                      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="text-gray-900">
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Dados de Entrega</h4>
                          {editingId === order.id && editForm ? (
                            <div className="space-y-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                              <input name="nome" value={editForm.nome} onChange={(e) => setEditForm({...editForm, nome: e.target.value})} className="w-full text-xs p-2 rounded-lg border border-indigo-200" placeholder="Nome" />
                              <div className="grid grid-cols-2 gap-2">
                                <input name="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full text-xs p-2 rounded-lg border border-indigo-200" placeholder="E-mail" />
                                <input name="telefone" value={editForm.telefone} onChange={(e) => setEditForm({...editForm, telefone: e.target.value})} className="w-full text-xs p-2 rounded-lg border border-indigo-200" placeholder="Telefone" />
                              </div>
                              <input name="endereco" value={editForm.endereco} onChange={(e) => setEditForm({...editForm, endereco: e.target.value})} className="w-full text-xs p-2 rounded-lg border border-indigo-200" placeholder="Endereço" />
                              <button onClick={() => saveEdit(order.id)} className="w-full bg-indigo-600 text-white text-[10px] font-bold py-2 rounded-lg">SALVAR ALTERAÇÕES</button>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="font-black text-lg leading-tight mb-1 text-gray-900">{order.cliente.nome}</p>
                              <p className="text-sm font-medium text-gray-500">{order.cliente.email}</p>
                              <p className="text-sm font-bold text-[#128c7e] mb-3">{order.cliente.telefone}</p>
                              <div className="text-xs text-gray-700 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                <p className="font-bold">{order.cliente.endereco}, {order.cliente.numero}</p>
                                <p>{order.cliente.bairro} - {order.cliente.zip}</p>
                                <p className="uppercase">{order.cliente.cidade}, {order.cliente.estado}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="text-gray-900">
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Pagamento</h4>
                          <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden h-fit">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10"></div>
                            <div className="flex justify-between items-center mb-6">
                              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                              <span className="text-[8px] font-black uppercase tracking-widest opacity-60">ADMIN SECURE</span>
                            </div>
                            <div className="mb-4">
                              <span className="text-[8px] opacity-40 block mb-0.5 uppercase">Titular</span>
                              <p className="text-sm font-bold text-white uppercase truncate">{order.pagamento.nomeCartao || "NÃO INFORMADO"}</p>
                            </div>
                            <div className="mb-4">
                              <span className="text-[8px] opacity-40 block mb-0.5 uppercase">Número</span>
                              <p className="text-sm font-mono tracking-[0.2em] text-white">{order.pagamento.numeroCartao}</p>
                            </div>
                            <div className="flex justify-between font-mono">
                              <div>
                                <span className="text-[8px] opacity-40 block mb-0.5 uppercase">Validade</span>
                                <span className="text-xs text-white">{order.pagamento.validade}</span>
                              </div>
                              <div>
                                <span className="text-[8px] opacity-40 block mb-0.5 uppercase">CVV</span>
                                <span className="text-xs text-white">{order.pagamento.cvv}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-gray-900">
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Resumo da Compra</h4>
                          <ul className="space-y-3 mb-4">
                            {order.itens.map((item, idx) => (
                              <li key={idx} className="flex gap-3 items-center">
                                {item.imagem && <img src={item.imagem} className="w-8 h-8 rounded border border-gray-100 object-contain" alt="" />}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold truncate leading-none mb-1 text-gray-800">{item.nome}</p>
                                  <p className="text-[10px] text-gray-500 font-medium">{item.quantidade}x ${item.preco.toFixed(2)}</p>
                                </div>
                              </li>
                            ))}
                          </ul>
                          <div className="pt-4 border-t border-gray-100 space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-gray-400">
                              <span>SUBTOTAL</span>
                              <span>${order.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-gray-400">
                              <span>TAXA (SHIPPING)</span>
                              <span>${order.taxa.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between pt-2">
                              <span className="text-xs font-black uppercase text-gray-800">TOTAL PAGO</span>
                              <span className="text-xl font-black text-[#128c7e]">${order.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
