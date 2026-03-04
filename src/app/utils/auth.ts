export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  avatar?: string;
}

export interface UserData {
  moodEntries: Array<{
    date: string;
    mood: number;
    energy: number;
    sleep: string;
    appetite: string;
    interest: string;
    notes: string;
  }>;
  panicEvents: Array<{
    date: string;
    time: string;
    severity: string;
    duration: string;
  }>;
  communityPosts: Array<{
    id: string;
    content: string;
    timestamp: string;
    likes: number;
    comments: number;
  }>;
  settings: {
    name: string;
    emergencyContact: string;
    emergencyName: string;
    notifications: boolean;
    dailyReminders: boolean;
    crisisAlerts: boolean;
    autoSOS: boolean;
  };
}

class AuthService {
  private currentUser: User | null = null;

  constructor() {
    this.loadCurrentUser();
  }

  private loadCurrentUser() {
    const userJson = localStorage.getItem("currentUser");
    if (userJson) {
      this.currentUser = JSON.parse(userJson);
    }
  }

  register(name: string, email: string, password: string): { success: boolean; error?: string } {
    // Verificar se email já existe
    const users = this.getAllUsers();
    if (users.find((u) => u.email === email)) {
      return { success: false, error: "Email já cadastrado" };
    }

    // Criar novo usuário
    const user: User = {
      id: Date.now().toString(),
      name,
      email,
      createdAt: new Date().toISOString(),
    };

    // Salvar senha (em produção seria hash)
    const passwords = JSON.parse(localStorage.getItem("passwords") || "{}");
    passwords[user.id] = password;
    localStorage.setItem("passwords", JSON.stringify(passwords));

    // Salvar usuário
    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));

    // Criar dados iniciais do usuário
    const initialData: UserData = {
      moodEntries: [],
      panicEvents: [],
      communityPosts: [],
      settings: {
        name,
        emergencyContact: "",
        emergencyName: "",
        notifications: true,
        dailyReminders: true,
        crisisAlerts: true,
        autoSOS: false,
      },
    };
    localStorage.setItem(`userData_${user.id}`, JSON.stringify(initialData));

    // Fazer login automático
    this.currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(user));

    return { success: true };
  }

  login(email: string, password: string): { success: boolean; error?: string } {
    const users = this.getAllUsers();
    const user = users.find((u) => u.email === email);

    if (!user) {
      return { success: false, error: "Usuário não encontrado" };
    }

    const passwords = JSON.parse(localStorage.getItem("passwords") || "{}");
    if (passwords[user.id] !== password) {
      return { success: false, error: "Senha incorreta" };
    }

    this.currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(user));

    return { success: true };
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem("currentUser");
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  private getAllUsers(): User[] {
    return JSON.parse(localStorage.getItem("users") || "[]");
  }

  getUserData(): UserData | null {
    if (!this.currentUser) return null;
    const data = localStorage.getItem(`userData_${this.currentUser.id}`);
    return data ? JSON.parse(data) : null;
  }

  updateUserData(data: Partial<UserData>) {
    if (!this.currentUser) return;
    const currentData = this.getUserData() || {
      moodEntries: [],
      panicEvents: [],
      communityPosts: [],
      settings: {} as any,
    };
    const updatedData = { ...currentData, ...data };
    localStorage.setItem(`userData_${this.currentUser.id}`, JSON.stringify(updatedData));
  }

  updateAvatar(avatarBase64: string) {
    if (!this.currentUser) return;
    
    this.currentUser.avatar = avatarBase64;
    localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
    
    // Atualizar no array de usuários
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === this.currentUser!.id);
    if (index !== -1) {
      users[index].avatar = avatarBase64;
      localStorage.setItem("users", JSON.stringify(users));
    }
  }

  removeAvatar() {
    if (!this.currentUser) return;
    
    delete this.currentUser.avatar;
    localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
    
    // Atualizar no array de usuários
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === this.currentUser!.id);
    if (index !== -1) {
      delete users[index].avatar;
      localStorage.setItem("users", JSON.stringify(users));
    }
  }
}

export const authService = new AuthService();