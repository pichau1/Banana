import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "/utils/supabase/info";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  avatar?: string;
}

export interface UserData {
  moodEntries: any[];
  panicEvents: any[];
  settings: any;
}

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabase = createClient(supabaseUrl, publicAnonKey);

class AuthService {

  private currentUser: User | null = null;
  private accessToken: string | null = null;

  private userData: UserData = {
    moodEntries: [],
    panicEvents: [],
    settings: {},
  };

  constructor() {
    this.loadCurrentUser();
  }

  private async loadCurrentUser() {
    try {

      const { data } = await supabase.auth.getSession();

      if (data.session) {

        const user = data.session.user;

        this.accessToken = data.session.access_token;

        this.currentUser = {
          id: user.id,
          name: user.user_metadata?.name || "Usuário",
          email: user.email || "",
          createdAt: user.created_at,
          avatar: user.user_metadata?.avatar,
        };

      }

    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  }

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> {

    try {

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        this.currentUser = {
          id: data.user.id,
          name: name,
          email: data.user.email || "",
          createdAt: data.user.created_at,
        };
      }

      return { success: true };

    } catch (error: any) {
      console.error("Register error:", error);
      return { success: false, error: "Erro ao cadastrar" };
    }

  }

  async login(
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> {

    try {

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const user = data.user;

      this.accessToken = data.session.access_token;

      this.currentUser = {
        id: user.id,
        name: user.user_metadata?.name || "Usuário",
        email: user.email || "",
        createdAt: user.created_at,
        avatar: user.user_metadata?.avatar,
      };

      return { success: true };

    } catch (error: any) {
      console.error("Login error:", error);
      return { success: false, error: "Erro ao fazer login" };
    }

  }

  async logout() {

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Erro ao sair:", error);
    }

    this.currentUser = null;
    this.accessToken = null;

  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getUserData(): UserData {
    return this.userData;
  }

  async updateUserData(data: Partial<UserData>) {

    this.userData = {
      ...this.userData,
      ...data,
    };

  }

  async updateAvatar(avatarBase64: string) {

    try {

      await supabase.auth.updateUser({
        data: { avatar: avatarBase64 },
      });

      if (this.currentUser) {
        this.currentUser.avatar = avatarBase64;
      }

    } catch (error) {
      console.error("Erro ao atualizar avatar:", error);
    }

  }

  async removeAvatar() {

    try {

      await supabase.auth.updateUser({
        data: { avatar: null },
      });

      if (this.currentUser) {
        delete this.currentUser.avatar;
      }

    } catch (error) {
      console.error("Erro ao remover avatar:", error);
    }

  }

}

export const authService = new AuthService();