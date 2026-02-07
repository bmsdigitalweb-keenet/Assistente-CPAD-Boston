
export type Role = 'user' | 'model';
export type OrderStatus = 'Processando' | 'Concluído' | 'Cancelado';

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
}

export interface QuickOption {
  id: string;
  label: string;
  action: string;
}

export interface CartItem {
  id: string;
  nome: string;
  preco: number;
  imagem: string | null;
  quantidade: number;
}

export interface PaymentInfo {
  nomeCartao: string;
  numeroCartao: string;
  validade: string;
  cvv: string;
}

export interface CustomerInfo {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  zip: string;
}

export interface Order {
  id: string; // Numérico
  data: Date;
  cliente: CustomerInfo;
  pagamento: PaymentInfo;
  itens: CartItem[];
  subtotal: number;
  taxa: number;
  total: number;
  status: OrderStatus;
}
