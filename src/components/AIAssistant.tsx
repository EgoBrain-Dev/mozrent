import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Sparkles, X, ChevronDown, RefreshCw, AlertCircle } from "lucide-react";
import { ChatMessage, Listing } from "../types";

interface AIAssistantProps {
  currentPropertyContext?: Listing | null;
  onSelectPropertyId?: (id: string) => void;
}

export default function AIAssistant({ currentPropertyContext, onSelectPropertyId }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      content: "👋 **Olá! Tudo nice?** Eu sou o **Assistente Inteligente MozRent**! \n\nEstou aqui para te ajudar a encontrar os melhores de imóveis, viaturas ou equipamentos em Moçambique. \n\nPodes perguntar-me sobre os bairros de Maputo e Matola, preços de aluguer, como funciona o Credelec e FIPAG ou pedir sugestões de locais seguros. Como te posso ajudar hoje?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  // Insert contextual alert if user selects a property
  useEffect(() => {
    if (currentPropertyContext && isOpen) {
      const contextId = `msg-ctx-${currentPropertyContext.id}`;
      // Prevent duplicates
      if (!messages.some(m => m.id === contextId)) {
        setMessages(prev => [
          ...prev,
          {
            id: contextId,
            role: "assistant",
            content: `🔍 **Estás a ver este anúncio:** *"${currentPropertyContext.title}"* de **${currentPropertyContext.price.toLocaleString()} MT/${currentPropertyContext.period}** em *${currentPropertyContext.location}*.\n\nQueres que eu analise se o preço é justo para esta zona ou te dê mais detalhes sobre as vossas comodidades?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    }
  }, [currentPropertyContext, isOpen]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setErrorText(null);
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({
            role: m.role,
            content: m.content
          })),
          propertyContext: currentPropertyContext || undefined
        })
      });

      if (!response.ok) {
        throw new Error("Resposta do servidor não está ok.");
      }

      const data = await response.json();
      
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          content: data.text || "Desculpe, tive uma quebra de conexão temporária. Podes repetir a pergunta?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error(err);
      setErrorText("Não consegui conectar ao servidor local do MozRent. Verifique a sua conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "msg-welcome-new",
        role: "assistant",
        content: "🔄 **Conversa reiniciada.** Pergunte-me sobre bairros, transporte local, M-Pesa, Credelec ou qualquer anúncio do MozRent!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const quickPrompts = [
    { label: "💡 O que é o Credelec?", text: "Explica-me o que é o Credelec e como costuma funcionar nos alugueres em Moçambique." },
    { label: "🏡 Bairros seguros em Maputo", text: "Quais são as zonas mais seguras e nobres para morar em Maputo e qual a média de preços?" },
    { label: "🧴 Como evitar fraudes de arrendamento?", text: "Dá-me 4 dicas cruciais para alugar casa em Moçambique em segurança e evitar fraudes com falsos senhorios ou corretores." },
    { label: "💧 FIPAG e depósitos de água", text: "Por que as casas em Moçambique precisam de tanque subterrâneo ou depósito de água elevado com electrobomba?" }
  ];

  return (
    <>
      {/* Absolute floating toggle button in gold and green representing warmth/flag */}
      <button
        id="ai-helper-toggle-button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#00843D] via-brand-yellow to-brand-red font-medium text-white shadow-xl transition-all hover:scale-105 active:scale-95 duration-300 cursor-pointer"
        title="Assistente de Inteligência Artificial MozRent"
      >
        <Sparkles className="h-6 w-6 animate-pulse text-white" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4 rounded-full bg-brand-red">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
        </span>
      </button>

      {/* Slide in drawer panel */}
      {isOpen && (
        <div 
          id="ai-panel-wrapper"
          className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white shadow-2xl transition-all sm:max-w-md md:max-w-lg border-l border-natural-border"
        >
          {/* Header styled around vibrant flags: Rose & Emerald colors */}
          <div className="flex items-center justify-between bg-brand-green px-4 py-4 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-yellow text-brand-black shadow font-bold animate-none">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold leading-none flex items-center gap-1.5 text-white">
                  Chat MozRent AI
                </h3>
                <span className="text-xs text-emerald-100 font-bold mt-1 block">
                  Guia Inteligente de Aluguer local
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={clearChat}
                className="rounded-full p-2 hover:bg-emerald-800 text-emerald-100 transition-colors cursor-pointer"
                title="Limpar Conversa"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 hover:bg-emerald-800 text-emerald-100 transition-colors cursor-pointer"
                title="Fechar Chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Context box if viewing a listing */}
          {currentPropertyContext && (
            <div className="border-b border-natural-border bg-[#FDF8F1] p-3 flex items-center justify-between text-xs">
              <span className="font-bold text-brand-black flex items-center gap-1.5 truncate">
                <Sparkles className="h-3.5 w-3.5 text-brand-yellow flex-shrink-0" />
                Contexto activo: <strong className="font-extrabold text-[#00843D]">{currentPropertyContext.title}</strong>
              </span>
              <span className="text-brand-black bg-[#FAF5EE] border border-natural-border px-2 py-0.5 rounded font-bold whitespace-nowrap">
                {currentPropertyContext.price.toLocaleString()} MT
              </span>
            </div>
          )}

          {/* Chat Messages flow area */}
          <div className="flex-1 overflow-y-auto bg-natural-aside px-4 py-6">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`text-[10px] text-[#6B665F] font-bold mb-1 px-1.5`}>
                    {msg.role === 'user' ? 'Tu' : 'MozRent AI • Capulana Inteligente'} — {msg.timestamp}
                  </div>
                  <div 
                    className={`max-w-[85%] rounded-[20px] px-4 py-3 text-sm shadow-xs leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-brand-yellow/20 text-brand-black border border-brand-yellow/30 rounded-tr-none' 
                        : 'bg-white text-brand-black rounded-tl-none border border-natural-border'
                    }`}
                  >
                    <div className="prose prose-sm dark:prose-invert break-words">
                      {msg.content.split('\n\n').map((para, i) => (
                        <p key={i} className="mb-2 last:mb-0">
                          {para.split('**').map((item, index) => {
                            // Dumb markdown bold parsing helper
                            if (index % 2 === 1) {
                              return <strong key={index} className="font-extrabold text-[#00843D]">{item}</strong>;
                            }
                            return item;
                          })}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex flex-col items-start">
                  <span className="text-[10px] text-[#6B665F] font-bold mb-1 px-1.5 animate-pulse">
                    A pensar com sabedoria moçambicana...
                  </span>
                  <div className="flex items-center gap-2 rounded-2xl bg-white border border-natural-border px-4 py-3 shadow-xs">
                    <div className="flex space-x-1">
                      <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-brand-green [animation-delay:-0.3s]"></div>
                      <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-brand-yellow [animation-delay:-0.15s]"></div>
                      <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-brand-red"></div>
                    </div>
                    <span className="text-xs text-[#6B665F] font-bold">Consultando o mapa de Moçambique</span>
                  </div>
                </div>
              )}

              {errorText && (
                <div className="rounded-xl bg-rose-50 border border-brand-red/25 p-3 text-brand-red text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-brand-red flex-shrink-0" />
                  <span>{errorText}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick suggestions menu */}
            {messages.length <= 2 && (
              <div className="mt-8">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B665F] mb-3 flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5 text-brand-green" />
                  Sugestões Rápidas:
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {quickPrompts.map((qp, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(qp.text)}
                      className="text-left w-full text-xs font-bold bg-[#FAF5EE] hover:bg-[#FDF8F1] text-brand-black border border-natural-border px-3.5 py-3 rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      {qp.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User inputs footer */}
          <div className="border-t border-natural-border bg-white p-4">
            <div className="flex items-center gap-2">
              <input
                id="ai-user-prompt-input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend(inputValue);
                }}
                placeholder="Pergunte sobre Sommerschield, e-Mola, Credelec..."
                className="flex-1 rounded-xl border border-natural-border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green/35 focus:outline-none bg-[#FAF5EE]/30 focus:bg-white"
                disabled={isLoading}
              />
              <button
                id="ai-prompt-send-button"
                onClick={() => handleSend(inputValue)}
                disabled={!inputValue.trim() || isLoading}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-green hover:bg-emerald-800 text-white transition-colors disabled:bg-[#E8E2D9] disabled:text-neutral-400 cursor-pointer animate-none"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 text-center text-[10.5px] text-[#6B665F] font-bold flex items-center justify-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-brand-yellow" /> 
              <span>Alimentado pela Inteligência Artificial MozRent em Português de Moçambique</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
