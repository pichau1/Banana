import { useState, useRef, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Send, Users, Search, LogOut, Shield, Heart } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { RealtimeChatService } from "../utils/realtimeChat";

interface Message {
  id: string;
  sender: "you" | "peer";
  content: string;
  timestamp: Date;
}

export function AnonymousChat() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [peerTyping, setPeerTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatService = useRef<RealtimeChatService | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (chatService.current) {
        chatService.current.disconnect();
      }
    };
  }, []);

  const handleConnect = async () => {
    setIsSearching(true);
    chatService.current = new RealtimeChatService();

    chatService.current.onMessage((message) => {
      setPeerTyping(false);
      const newMessage: Message = {
        id: message.id,
        sender: "peer",
        content: message.content,
        timestamp: new Date(message.timestamp),
      };
      setMessages((prev) => [...prev, newMessage]);
    });

    chatService.current.onDisconnect(() => {
      toast.info("Seu parceiro desconectou");
      handleDisconnect();
    });

    const matched = await chatService.current.findMatch();
    
    setIsSearching(false);
    if (matched) {
      setIsConnected(true);
      toast.success("Conectado com sucesso!", {
        description: "Você está conversando com outra pessoa que também busca apoio.",
      });
    }
  };

  const handleDisconnect = () => {
    if (chatService.current) {
      chatService.current.disconnect();
      chatService.current = null;
    }
    setIsConnected(false);
    setMessages([]);
    toast.info("Conversa encerrada", {
      description: "Você pode buscar uma nova conexão quando quiser.",
    });
  };

  const handleSend = () => {
    if (!input.trim() || !chatService.current) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "you",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    chatService.current.sendMessage(input);
    setInput("");

    // Simular indicador de digitação do peer
    setPeerTyping(true);
    setTimeout(() => {
      setPeerTyping(false);
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col h-[calc(100vh-140px)] sm:h-[calc(100vh-120px)]">
      <div className="mb-4 sm:mb-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="bg-gradient-to-br from-green-500 to-teal-500 p-2 sm:p-3 rounded-full">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Chat Anônimo</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Converse com alguém que também busca apoio
              </p>
            </div>
          </div>
          {isConnected && (
            <Badge className="bg-green-100 text-green-800 hidden sm:flex">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Conectado
            </Badge>
          )}
        </div>
      </div>

      {/* Safety Notice */}
      <Card className="p-3 sm:p-4 mb-4 bg-purple-50 border-purple-200 flex-shrink-0">
        <div className="flex items-start space-x-3">
          <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-purple-900">
            <strong>Espaço Seguro:</strong> Conversas são anônimas e privadas. Não compartilhe
            informações pessoais. Nossa IA monitora conversas para garantir um ambiente
            respeitoso.
          </div>
        </div>
      </Card>

      {/* Not Connected State */}
      {!isConnected && !isSearching && (
        <Card className="flex-1 flex items-center justify-center p-6 sm:p-8">
          <div className="text-center max-w-md">
            <div className="bg-gradient-to-br from-green-100 to-teal-100 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Users className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
              Conecte-se com alguém
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Você será conectado anonimamente com outra pessoa que também está buscando apoio.
              Conversem, compartilhem e apoiem-se mutuamente.
            </p>
            <Button
              onClick={handleConnect}
              className="bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg w-full sm:w-auto"
            >
              <Search className="h-5 w-5 mr-2" />
              Buscar Conexão
            </Button>
            <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
              Geralmente leva menos de 30 segundos
            </p>
          </div>
        </Card>
      )}

      {/* Searching State */}
      {isSearching && (
        <Card className="flex-1 flex items-center justify-center p-6 sm:p-8">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="bg-gradient-to-br from-green-100 to-teal-100 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
            >
              <Search className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />
            </motion.div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              Procurando uma conexão...
            </h2>
            <p className="text-sm sm:text-base text-gray-600">Aguarde enquanto encontramos alguém para você</p>
            <div className="flex justify-center space-x-2 mt-4 sm:mt-6">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce"></div>
              <div
                className="w-3 h-3 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-3 h-3 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </Card>
      )}

      {/* Connected State */}
      {isConnected && (
        <Card className="flex-1 p-6 overflow-hidden flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4 pb-4 border-b flex-shrink-0">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-teal-500 text-white">
                  ?
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900">Pessoa Anônima</p>
                <p className="text-sm text-gray-500">
                  {peerTyping ? "digitando..." : "online"}
                </p>
              </div>
            </div>
            <Button
              onClick={handleDisconnect}
              variant="outline"
              size="sm"
              className="text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Encerrar
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.sender === "you" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex items-start space-x-3 max-w-[80%] ${
                    message.sender === "you" ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <Avatar className="flex-shrink-0">
                    <AvatarFallback
                      className={
                        message.sender === "peer"
                          ? "bg-gradient-to-br from-green-500 to-teal-500 text-white"
                          : "bg-blue-500 text-white"
                      }
                    >
                      {message.sender === "peer" ? "?" : "V"}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`p-4 rounded-2xl ${
                      message.sender === "you"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="leading-relaxed">{message.content}</p>
                    <span
                      className={`text-xs mt-2 block ${
                        message.sender === "you" ? "text-blue-100" : "text-gray-500"
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
            {peerTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start space-x-3"
              >
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-teal-500 text-white">
                    ?
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
              disabled={!input.trim()}
              className="bg-green-600 hover:bg-green-700 h-full"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}