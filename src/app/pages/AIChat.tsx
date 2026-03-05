import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Send, Bot, Sparkles, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";

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
      content: "Olá! Sou sua assistente de apoio emocional. Estou aqui para ouvir você, sem julgamentos. Como você está se sentindo hoje?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
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
      const conversationHistory = messages.map(msg => ({
        role: msg.role === "assistant" ? "assistant" as const : "user" as const,
        content: msg.content
      }));

      conversationHistory.push({
        role: "user",
        content: input
      });

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1b27e889/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ messages: conversationHistory })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Atualizar respostas rápidas baseado no contexto
        if (data.message.toLowerCase().includes("respiração") || data.message.toLowerCase().includes("exercício")) {
          setQuickReplies([
            "Me guie em um exercício de respiração",
            "Estou me sentindo melhor",
            "Preciso de mais ajuda",
          ]);
        } else if (data.message.toLowerCase().includes("profissional") || data.message.toLowerCase().includes("terapeuta")) {
          navigate("/panic");
        }
      } else {
        throw new Error("API error");
      }
    } catch (error) {
      console.error("Erro ao comunicar com IA:", error);
      toast.error("Erro ao processar mensagem");
      
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Entendo como você está se sentindo. Às vezes é importante apenas ter alguém para conversar. Gostaria de me contar mais sobre o que está acontecendo?",
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col h-[calc(100vh-140px)] sm:h-[calc(100vh-120px)]">
      <div className="mb-4 sm:mb-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 sm:p-3 rounded-full">
              <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Chat de Apoio IA</h1>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm text-gray-600">Online 24/7</span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs sm:text-sm lg:text-base text-gray-600">Um espaço seguro para conversar sobre seus sentimentos</p>
      </div>

      {/* Alert */}
      <Card className="p-3 sm:p-4 mb-4 bg-blue-50 border-blue-200 flex-shrink-0">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-blue-900">
            <strong>Importante:</strong> Esta IA é uma ferramenta de apoio, não substitui
            acompanhamento profissional. Em caso de emergência, entre em contato com um
            profissional de saúde mental ou ligue CVV 188.
          </p>
        </div>
      </Card>

      {/* Messages */}
      <Card className="flex-1 p-4 sm:p-6 overflow-hidden flex flex-col min-h-0">
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
                className={`flex items-start space-x-2 sm:space-x-3 max-w-[85%] sm:max-w-[80%] ${
                  message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <Avatar className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10">
                  <AvatarFallback
                    className={
                      message.role === "assistant"
                        ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                        : "bg-blue-500 text-white"
                    }
                  >
                    {message.role === "assistant" ? <Bot className="h-4 w-4 sm:h-5 sm:w-5" /> : "V"}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`p-3 sm:p-4 rounded-2xl ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="leading-relaxed text-sm sm:text-base">{message.content}</p>
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
              className="flex items-start space-x-2 sm:space-x-3"
            >
              <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="p-3 sm:p-4 rounded-2xl bg-gray-100">
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
        <div className="flex flex-wrap gap-2 mb-3 sm:mb-4 pb-3 sm:pb-4 border-t pt-3 sm:pt-4">
          <div className="w-full mb-1">
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
            className="resize-none text-sm sm:text-base"
            rows={2}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-purple-600 hover:bg-purple-700 h-full"
          >
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
