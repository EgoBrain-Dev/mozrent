import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize the @google/genai SDK with the standard process.env.GEMINI_API_KEY
// We set User-Agent header to 'aistudio-build' for telemetry as required.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// AI Rental Assistant endpoint
app.post("/api/chat", async (req: express.Request, res: express.Response) => {
  try {
    const { messages, propertyContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Parâmetros inválidos. É necessária uma lista de mensagens." });
      return;
    }

    const latestMessage = messages[messages.length - 1]?.content || "Olá";
    const chatHistory = messages.slice(0, -1).map((m: any) => {
      return {
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      };
    });

    const systemInstruction = `
Você é o "Assistente Inteligente MozRent", um especialista em alugueres e estilos de vida em Moçambique.
Você fala em português de Moçambique, de forma calorosa, acolhedora, respeitosa (usando "tu" ou "você" de forma amigável) e muito prestativa.

Instruções fundamentais:
1. Responda sobre bairros específicos em Moçambique (ex: Sommerschield, Triunfo, Coop, Polana, Zimpeto, Costa do Sol, Matola Rio, Malhampsene, Beira, Nampula, Tete, Pemba), preços locais aproximados (em Meticais - MZN / MT), segurança, transportes (chapas, MyLove, táxis), e infraestruturas do mercado de aluguer.
2. Seja realista sobre energia (EDM - Credelec), abastecimento de água (FIPAG) e acesso a internet, ajudando o utilizador de forma sincera.
3. Se o utilizador estiver a visualizar um anúncio específico, este contexto será fornecido para que possa dar detalhes ou responder perguntas sobre as comodidades: "${JSON.stringify(propertyContext || {}) || 'Nenhum imóvel destacado.'}".
4. Use expressões simpáticas locais moçambicanas de forma natural (ex: "Kanimambo" para obrigado, "Estamos juntos", "Tudo nice!", "Tudo bacana?", "Txuna" para ajustar).
5. Responda em Markdown limpo com parágrafos bem espaçados. Mantenha as respostas curtas, práticas e focadas na realidade em Moçambique.
`;

    // Query Gemini 3.5 Flash Model as per the guidelines for basic text tasks
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction,
        temperature: 0.7,
      },
      history: chatHistory.length > 0 ? chatHistory : undefined
    });

    const response = await chat.sendMessage({ message: latestMessage });
    
    // Access response.text as a property as outlined in the SDK guidelines
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Erro no chat do Gemini:", error);
    res.status(500).json({ error: "Erro ao processar o seu pedido com a Inteligência Artificial do MozRent." });
  }
});

// Landlord Negotiation Chat assistant integration
app.post("/api/negotiate", async (req: express.Request, res: express.Response) => {
  try {
    const { messages, listing, tenantName } = req.body;
    if (!messages || !Array.isArray(messages) || !listing) {
      res.status(400).json({ error: "Parâmetros inválidos. Necessita do histórico de mensagens e dados do anúncio." });
      return;
    }

    const latestMessage = messages[messages.length - 1]?.content || "Olá";
    const chatHistory = messages.slice(0, -1).map((m: any) => {
      return {
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      };
    });

    const systemInstruction = `
Você é o senhorio/anunciante de nome "${listing.landlordName}" no MozRent Moçambique, respondendo a uma mensagem do inquilino/proponente "${tenantName || 'Inquilino'}".
As informações do seu anúncio são:
- Título: "${listing.title}"
- Categoria: "${listing.category}" (imóvel/veículo/equipamento)
- Tipo: "${listing.type}"
- Preço base: ${listing.price} MT por ${listing.period}
- Localização: "${listing.location}", em "${listing.province}"
- Disponível de momento: ${listing.availableNow ? 'Sim' : 'Não'}

Seu papel:
1. Responda como o próprio senhorio. Seja hospitaleiro, prestativo, educado e simpático, mas faça uma negociação realista e profissional de acordo com o mercado de Moçambique. Use expressões simpáticas locais moçambicanas de forma natural (ex: "estamos juntos", "kanimambo", "maningue", "nice", "txuna", "boda", "chapa", "curtir").
2. Negociação de preços: O cliente deseja propor um acordo, desconto ou fazer perguntas sobre as regras da casa/carro/gerador. Se o cliente for educado e insistir, você pode concordar em dar um desconto amigável de até 10% ou 15% sobre o preço original, especialmente se alugar por um período longo, mas peça sempre para prosseguirem de forma segura e fazerem a reserva pelo botão do MozRent para garantir a segurança para ambos.
3. Seja honesto e prático sobre as condições (EDM - Credelec, depósitos de água FIPAG, combustível, ou se o aluguer inclui motorista/assistente técnico).
4. Responda de forma direta e concisa. Evite parágrafos longos. Retorne o texto limpo, sem marcas excessivas de markdown, sem símbolos de hashtag (#) ou asteriscos desnecessários (*).
5. Escreva em português de Moçambique de modo que pareça uma conversa genuína de WhatsApp com um senhorio local.
`;

    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction,
        temperature: 0.8,
      },
      history: chatHistory.length > 0 ? chatHistory : undefined
    });

    const response = await chat.sendMessage({ message: latestMessage });
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Erro no chat de negociação do senhorio:", error);
    res.status(500).json({ error: "Erro ao processar as mensagens de negociação com o senhorio." });
  }
});

// Setup Vite Dev Server / Static Hosting
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MozRent Backend] Servidor de pé em http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Falha ao iniciar o servidor express:", err);
});
