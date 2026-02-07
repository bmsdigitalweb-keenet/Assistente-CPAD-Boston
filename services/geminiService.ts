
import { GoogleGenAI, GenerateContentResponse, Type, FunctionDeclaration } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

const CK = "ck_a36cda1825f1154ad1ba9fecf7ffd24938a00417";
const CS = "cs_b8f858831a0c26c55bb2f83d58a61fd920090966";
const API_BASE = "https://cpadboston.com/wp-json/wc/v3";

const buscarProdutosNoCatalogoDeclaration: FunctionDeclaration = {
  name: 'buscarProdutosNoCatalogo',
  parameters: {
    type: Type.OBJECT,
    description: 'Busca produtos, Bíblias e livros diretamente no banco de dados da CPAD Boston.',
    properties: {
      query: {
        type: Type.STRING,
        description: 'O nome do produto ou termo de busca (ex: "Bíblia Pentecostal").',
      },
    },
    required: ['query'],
  },
};

export class GeminiChatService {
  private history: any[] = [];

  private async callWooCommerceAPI(query: string) {
    try {
      const url = `${API_BASE}/products?search=${encodeURIComponent(query)}&consumer_key=${CK}&consumer_secret=${CS}&per_page=8`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (!Array.isArray(data)) return { error: "Erro ao acessar catálogo ou nenhum produto encontrado." };
      
      return data.map((p: any) => ({
        nome: p.name,
        preco: p.price,
        link: p.permalink,
        imagem: p.images && p.images.length > 0 ? p.images[0].src : null,
        estoque: p.stock_status === 'instock' ? 'Disponível' : 'Indisponível'
      }));
    } catch (error) {
      console.error("WooCommerce API Error:", error);
      return { error: "Não foi possível consultar o catálogo agora." };
    }
  }

  async sendMessage(message: string): Promise<string> {
    try {
      // Sempre criar uma nova instância para pegar a chave atual do seletor
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const contents = [
        ...this.history,
        { role: 'user', parts: [{ text: message }] }
      ];

      let response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.1,
          tools: [
            { functionDeclarations: [buscarProdutosNoCatalogoDeclaration] }
          ],
        },
      });

      if (response.functionCalls && response.functionCalls.length > 0) {
        const functionResponseParts = [];
        
        for (const fc of response.functionCalls) {
          if (fc.name === 'buscarProdutosNoCatalogo') {
            const result = await this.callWooCommerceAPI((fc.args as any).query);
            functionResponseParts.push({
              functionResponse: {
                id: fc.id,
                name: fc.name,
                response: { result },
              }
            });
          }
        }

        response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: [
            ...contents,
            { role: 'model', parts: response.candidates[0].content.parts },
            { role: 'user', parts: functionResponseParts }
          ],
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.1,
          }
        });
      }

      const text = response.text || "";
      
      if (text) {
        this.history.push({ role: 'user', parts: [{ text: message }] });
        this.history.push({ role: 'model', parts: [{ text: text }] });
        if (this.history.length > 20) this.history = this.history.slice(-20);
      }

      return text || "Paz do Senhor! Não consegui processar sua busca agora. Por favor, tente novamente.";
    } catch (error: any) {
      console.error("Gemini Error:", error);
      
      const errorMsg = error.message || "";
      
      if (errorMsg.includes("quota") || errorMsg.includes("429")) {
        return "⚠️ **Limite de Uso Atingido**\n\nPaz do Senhor! A minha cota gratuita de mensagens foi excedida temporariamente.\n\nVocê pode:\n1. Aguardar alguns minutos e tentar novamente.\n2. Clicar no ícone de **Chave (🔑)** no topo da tela e selecionar uma chave de um projeto pago (Paid) para uso ilimitado.";
      }

      if (errorMsg.includes("Requested entity was not found")) {
        return "⚠️ **Chave de API Inválida**\n\nPor favor, clique no ícone de chave no topo da tela para selecionar uma chave válida e continuar nosso atendimento.";
      }
      
      return "Paz do Senhor, irmão! Tive um problema ao consultar o catálogo. Por favor, tente novamente ou fale conosco pelo WhatsApp.";
    }
  }
}

export const chatService = new GeminiChatService();
