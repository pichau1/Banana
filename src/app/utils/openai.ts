// OpenAI API Integration for AI Chat

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class OpenAIService {
  private apiKey: string | null = null;

  constructor() {
    this.apiKey = localStorage.getItem("openai_api_key");
  }

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem("openai_api_key", key);
  }

  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error("API Key não configurada");
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `Você é um assistente de apoio emocional especializado em saúde mental. 
              Seja empático, acolhedor e compreensivo. NUNCA substitua atendimento profissional.
              Em casos de crise grave ou pensamentos suicidas, SEMPRE recomende buscar ajuda profissional imediata.
              Use linguagem gentil, validadora e esperançosa. Ofereça técnicas práticas quando apropriado.
              Responda em português do Brasil de forma clara e acessível.`
            },
            ...messages
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Erro ao se comunicar com a API");
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI API Error:", error);
      throw error;
    }
  }
}

export const openaiService = new OpenAIService();
