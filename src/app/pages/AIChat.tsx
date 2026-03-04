import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Send, Bot, Sparkles, Heart, AlertCircle, Key } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { openaiService } from "../utils/openai";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Olá! Sou sua assistente de apoio emocional com IA real. Estou aqui para ouvir você, sem julgamentos. Como você está se sentindo hoje?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(!openaiService.hasApiKey());
  const [apiKey, setApiKey] = useState("");
  const [quickReplies, setQuickReplies] = useState<string[]>([
    "Estou me sentindo ansioso",
    "Preciso de ajuda agora",
    "Estou tendo um dia difícil",
    "Quero fazer um exercício de respiração",
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!openaiService.hasApiKey()) {
      setShowApiKeyDialog(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Preparar contexto para a IA
      const conversationHistory = messages.map(msg => ({
        role: msg.role === "assistant" ? "assistant" as const : "user" as const,
        content: msg.content
      }));

      conversationHistory.push({
        role: "user",
        content: input
      });

      const aiResponse = await openaiService.sendMessage(conversationHistory);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Atualizar respostas rápidas baseado no contexto
      if (aiResponse.toLowerCase().includes("respiração") || aiResponse.toLowerCase().includes("exercício")) {
        setQuickReplies([
          "Me guie em um exercício de respiração",
          "Estou me sentindo melhor",
          "Preciso de mais ajuda",
        ]);
      } else if (aiResponse.toLowerCase().includes("profissional") || aiResponse.toLowerCase().includes("terapeuta")) {
        navigate("/panic");
      }
    } catch (error) {
      console.error("Erro ao comunicar com IA:", error);
      toast.error("Erro ao processar mensagem", {
        description: "Verifique sua chave de API e tente novamente."
      });
      
      // Fallback para resposta padrão
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Peço desculpas, estou com dificuldades técnicas no momento. Por favor, configure sua chave de API OpenAI nas configurações ou tente novamente em alguns instantes. Se você estiver em crise, procure ajuda profissional imediatamente.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    setInput(reply);
  };

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      openaiService.setApiKey(apiKey.trim());
      setShowApiKeyDialog(false);
      toast.success("Chave de API configurada com sucesso!");
    } else {
      toast.error("Por favor, insira uma chave de API válida");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      <div className="mb-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-full">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Chat de Apoio IA</h1>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Online 24/7</span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-gray-600">Um espaço seguro para conversar sobre seus sentimentos</p>
      </div>

      {/* Alert */}
      <Card className="p-4 mb-4 bg-blue-50 border-blue-200 flex-shrink-0">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900">
            <strong>Importante:</strong> Esta IA é uma ferramenta de apoio, não substitui
            acompanhamento profissional. Em caso de emergência, entre em contato com um
            profissional de saúde mental.
          </p>
        </div>
      </Card>

      {/* Messages */}
      <Card className="flex-1 p-6 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex items-start space-x-3 max-w-[80%] ${
                  message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <Avatar className="flex-shrink-0">
                  <AvatarFallback
                    className={
                      message.role === "assistant"
                        ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                        : "bg-blue-500 text-white"
                    }
                  >
                    {message.role === "assistant" ? <Bot className="h-5 w-5" /> : "V"}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`p-4 rounded-2xl ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="leading-relaxed">{message.content}</p>
                  <span
                    className={`text-xs mt-2 block ${
                      message.role === "user" ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start space-x-3"
            >
              <Avatar>
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="p-4 rounded-2xl bg-gray-100">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        <div className="flex flex-wrap gap-2 mb-4 pb-4 border-t pt-4">
          <div className="w-full mb-2">
            <p className="text-xs text-gray-500 flex items-center">
              <Sparkles className="h-3 w-3 mr-1" />
              Respostas sugeridas:
            </p>
          </div>
          {quickReplies.map((reply, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickReply(reply)}
              className="text-xs hover:bg-purple-50 hover:border-purple-300"
            >
              {reply}
            </Button>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-end space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Digite sua mensagem..."
            className="resize-none"
            rows={2}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-purple-600 hover:bg-purple-700 h-full"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </Card>

      {/* API Key Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-purple-600" />
              <span>Configurar Chave de API OpenAI</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Para usar a IA real, você precisa configurar sua chave de API OpenAI. 
              Obtenha uma chave gratuita em <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">platform.openai.com/api-keys</a>
            </p>
            <div>
              <Label htmlFor="apiKey">Chave de API</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleSaveApiKey}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <Key className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button
                onClick={() => setShowApiKeyDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}