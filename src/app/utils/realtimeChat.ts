// Sistema de chat anônimo em tempo real usando localStorage como backend mock

interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  timestamp: string;
}

interface ChatRoom {
  id: string;
  users: string[];
  active: boolean;
  createdAt: string;
}

export class RealtimeChatService {
  private roomId: string | null = null;
  private userId: string;
  private onMessageCallback: ((message: ChatMessage) => void) | null = null;
  private onDisconnectCallback: (() => void) | null = null;
  private pollInterval: number | null = null;

  constructor() {
    this.userId = this.generateUserId();
  }

  private generateUserId(): string {
    const stored = sessionStorage.getItem("anonymousChatUserId");
    if (stored) return stored;
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("anonymousChatUserId", id);
    return id;
  }

  async findMatch(): Promise<boolean> {
    return new Promise((resolve) => {
      // Procurar sala disponível ou criar nova
      const rooms: ChatRoom[] = JSON.parse(localStorage.getItem("chatRooms") || "[]");
      
      // Limpar salas antigas (>30 min)
      const thirtyMinAgo = Date.now() - 30 * 60 * 1000;
      const activeRooms = rooms.filter((r) => {
        const roomAge = new Date(r.createdAt).getTime();
        return r.active && roomAge > thirtyMinAgo;
      });
      localStorage.setItem("chatRooms", JSON.stringify(activeRooms));

      // Procurar sala esperando
      const waitingRoom = activeRooms.find(
        (r) => r.users.length === 1 && !r.users.includes(this.userId)
      );

      if (waitingRoom) {
        // Entrar em sala existente
        waitingRoom.users.push(this.userId);
        this.roomId = waitingRoom.id;
        localStorage.setItem("chatRooms", JSON.stringify(activeRooms));
        this.startPolling();
        resolve(true);
      } else {
        // Criar nova sala
        const newRoom: ChatRoom = {
          id: `room_${Date.now()}`,
          users: [this.userId],
          active: true,
          createdAt: new Date().toISOString(),
        };
        activeRooms.push(newRoom);
        this.roomId = newRoom.id;
        localStorage.setItem("chatRooms", JSON.stringify(activeRooms));

        // Esperar por outro usuário (simular busca)
        let attempts = 0;
        const checkInterval = setInterval(() => {
          attempts++;
          const rooms: ChatRoom[] = JSON.parse(localStorage.getItem("chatRooms") || "[]");
          const room = rooms.find((r) => r.id === this.roomId);
          
          if (room && room.users.length === 2) {
            clearInterval(checkInterval);
            this.startPolling();
            resolve(true);
          } else if (attempts > 50) {
            // Timeout após 25 segundos - criar peer simulado
            clearInterval(checkInterval);
            this.createSimulatedPeer(newRoom);
            resolve(true);
          }
        }, 500);
      }
    });
  }

  private createSimulatedPeer(room: ChatRoom) {
    // Adicionar um peer simulado para demonstração
    const simulatedPeerId = `simulated_${Date.now()}`;
    room.users.push(simulatedPeerId);
    const rooms: ChatRoom[] = JSON.parse(localStorage.getItem("chatRooms") || "[]");
    const index = rooms.findIndex((r) => r.id === room.id);
    if (index !== -1) {
      rooms[index] = room;
      localStorage.setItem("chatRooms", JSON.stringify(rooms));
    }
    this.startPolling();
    
    // Enviar mensagem de boas-vindas do peer simulado
    setTimeout(() => {
      this.simulatePeerMessage("Olá! Obrigado por se conectar. Como você está?");
    }, 1000);
  }

  private simulatePeerMessage(content: string) {
    if (!this.roomId) return;
    
    const rooms: ChatRoom[] = JSON.parse(localStorage.getItem("chatRooms") || "[]");
    const room = rooms.find((r) => r.id === this.roomId);
    if (!room) return;
    
    const peerId = room.users.find((id) => id !== this.userId);
    if (!peerId) return;

    const messages: ChatMessage[] = JSON.parse(
      localStorage.getItem(`chatMessages_${this.roomId}`) || "[]"
    );

    const responses = [
      "Entendo como você se sente. Às vezes é difícil mesmo...",
      "Obrigado por compartilhar isso. Você não está sozinho.",
      "Eu também já passei por algo parecido. Fica melhor com o tempo.",
      "É corajoso da sua parte falar sobre isso. Como você tem lidado?",
      "Eu te entendo. Esses dias são difíceis, mas vamos superar juntos.",
      "Que bom que você está aqui. Conversar ajuda muito mesmo.",
    ];

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      roomId: this.roomId,
      senderId: peerId,
      content: content || responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date().toISOString(),
    };

    messages.push(message);
    localStorage.setItem(`chatMessages_${this.roomId}`, JSON.stringify(messages));
  }

  sendMessage(content: string) {
    if (!this.roomId) return;

    const messages: ChatMessage[] = JSON.parse(
      localStorage.getItem(`chatMessages_${this.roomId}`) || "[]"
    );

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      roomId: this.roomId,
      senderId: this.userId,
      content,
      timestamp: new Date().toISOString(),
    };

    messages.push(message);
    localStorage.setItem(`chatMessages_${this.roomId}`, JSON.stringify(messages));

    // Simular resposta do peer após 1-3 segundos
    const rooms: ChatRoom[] = JSON.parse(localStorage.getItem("chatRooms") || "[]");
    const room = rooms.find((r) => r.id === this.roomId);
    if (room && room.users.some((id) => id.startsWith("simulated_"))) {
      setTimeout(() => {
        this.simulatePeerMessage("");
      }, 1000 + Math.random() * 2000);
    }
  }

  onMessage(callback: (message: ChatMessage) => void) {
    this.onMessageCallback = callback;
  }

  onDisconnect(callback: () => void) {
    this.onDisconnectCallback = callback;
  }

  private startPolling() {
    let lastMessageId = "";

    this.pollInterval = window.setInterval(() => {
      if (!this.roomId) return;

      const messages: ChatMessage[] = JSON.parse(
        localStorage.getItem(`chatMessages_${this.roomId}`) || "[]"
      );

      const newMessages = messages.filter(
        (m) => m.senderId !== this.userId && m.id !== lastMessageId
      );

      if (newMessages.length > 0 && this.onMessageCallback) {
        const latestMessage = newMessages[newMessages.length - 1];
        lastMessageId = latestMessage.id;
        this.onMessageCallback(latestMessage);
      }

      // Verificar se sala ainda está ativa
      const rooms: ChatRoom[] = JSON.parse(localStorage.getItem("chatRooms") || "[]");
      const room = rooms.find((r) => r.id === this.roomId);
      if (!room || !room.active) {
        this.disconnect();
        if (this.onDisconnectCallback) {
          this.onDisconnectCallback();
        }
      }
    }, 1000);
  }

  disconnect() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    if (this.roomId) {
      const rooms: ChatRoom[] = JSON.parse(localStorage.getItem("chatRooms") || "[]");
      const roomIndex = rooms.findIndex((r) => r.id === this.roomId);
      if (roomIndex !== -1) {
        rooms[roomIndex].active = false;
        localStorage.setItem("chatRooms", JSON.stringify(rooms));
      }
      this.roomId = null;
    }
  }

  getRoomId(): string | null {
    return this.roomId;
  }
}
