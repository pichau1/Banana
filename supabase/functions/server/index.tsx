import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Health check endpoint
app.get("/make-server-1b27e889/health", (c) => {
  return c.json({ status: "ok" });
});

// Auth: Sign up
app.post("/make-server-1b27e889/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true // Auto-confirm since email server isn't configured
    });
    
    if (error) {
      console.error("Signup error:", error);
      return c.json({ success: false, error: error.message }, 400);
    }
    
    // Create initial user data
    const userId = data.user.id;
    await kv.set(`user_data:${userId}`, {
      moodEntries: [],
      panicEvents: [],
      settings: {
        name,
        emergencyContact: "",
        emergencyName: "",
        notifications: true,
        dailyReminders: true,
        crisisAlerts: true,
        autoSOS: false,
      }
    });
    
    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.error("Signup exception:", error);
    return c.json({ success: false, error: "Erro ao cadastrar" }, 500);
  }
});

// Auth: Sign in
app.post("/make-server-1b27e889/auth/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Signin error:", error);
      return c.json({ success: false, error: error.message }, 400);
    }
    
    return c.json({ 
      success: true, 
      session: data.session,
      user: data.user 
    });
  } catch (error) {
    console.error("Signin exception:", error);
    return c.json({ success: false, error: "Erro ao fazer login" }, 500);
  }
});

// Get user data
app.get("/make-server-1b27e889/user/data", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const userData = await kv.get(`user_data:${user.id}`);
    return c.json({ success: true, data: userData || {} });
  } catch (error) {
    console.error("Get user data error:", error);
    return c.json({ error: "Erro ao buscar dados" }, 500);
  }
});

// Update user data
app.post("/make-server-1b27e889/user/data", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const updates = await c.req.json();
    const currentData = await kv.get(`user_data:${user.id}`) || {};
    const updatedData = { ...currentData, ...updates };
    
    await kv.set(`user_data:${user.id}`, updatedData);
    return c.json({ success: true, data: updatedData });
  } catch (error) {
    console.error("Update user data error:", error);
    return c.json({ error: "Erro ao atualizar dados" }, 500);
  }
});

// Community: Get posts
app.get("/make-server-1b27e889/community/posts", async (c) => {
  try {
    const posts = await kv.get("community_posts") || [];
    return c.json({ success: true, posts });
  } catch (error) {
    console.error("Get posts error:", error);
    return c.json({ error: "Erro ao buscar posts" }, 500);
  }
});

// Community: Create post
app.post("/make-server-1b27e889/community/posts", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { content, category } = await c.req.json();
    
    const post = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.user_metadata?.name || "Usuário",
      content,
      timestamp: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      comments: 0,
      category: category || "Compartilhamento",
    };
    
    const posts = await kv.get("community_posts") || [];
    posts.unshift(post);
    await kv.set("community_posts", posts);
    
    return c.json({ success: true, post });
  } catch (error) {
    console.error("Create post error:", error);
    return c.json({ error: "Erro ao criar post" }, 500);
  }
});

// Community: Like post
app.post("/make-server-1b27e889/community/posts/:postId/like", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const postId = c.req.param('postId');
    const posts = await kv.get("community_posts") || [];
    const postIndex = posts.findIndex((p: any) => p.id === postId);
    
    if (postIndex !== -1) {
      const post = posts[postIndex];
      const hasLiked = post.likedBy.includes(user.id);
      
      if (hasLiked) {
        post.likedBy = post.likedBy.filter((id: string) => id !== user.id);
        post.likes--;
      } else {
        post.likedBy.push(user.id);
        post.likes++;
      }
      
      posts[postIndex] = post;
      await kv.set("community_posts", posts);
      
      return c.json({ success: true, post });
    }
    
    return c.json({ error: "Post não encontrado" }, 404);
  } catch (error) {
    console.error("Like post error:", error);
    return c.json({ error: "Erro ao curtir post" }, 500);
  }
});

// AI Chat with Gemini (free API)
app.post("/make-server-1b27e889/ai/chat", async (c) => {
  try {
    const { messages } = await c.req.json();
    
    // Use Gemini API (free alternative to OpenAI)
    const apiKey = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyDemoKeyForTesting';
    
    const lastMessage = messages[messages.length - 1];
    
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Você é uma assistente de apoio emocional empática e acolhedora. Responda de forma calorosa e compreensiva. Usuário diz: ${lastMessage.content}`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800,
            }
          })
        }
      );
      
      if (!response.ok) {
        throw new Error('Gemini API error');
      }
      
      const data = await response.json();
      const aiMessage = data.candidates[0]?.content?.parts[0]?.text || "Desculpe, estou com dificuldades técnicas. Como posso ajudar?";
      
      return c.json({ success: true, message: aiMessage });
    } catch (apiError) {
      console.error("Gemini API error:", apiError);
      
      // Fallback responses
      const fallbackResponses = [
        "Entendo como você está se sentindo. Às vezes é importante apenas ter alguém para conversar. Gostaria de me contar mais sobre o que está acontecendo?",
        "Obrigada por compartilhar isso comigo. Seus sentimentos são válidos. Como posso ajudar você agora?",
        "Percebo que você está passando por um momento difícil. Estou aqui para te ouvir. O que mais está em sua mente?",
      ];
      
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      return c.json({ success: true, message: randomResponse });
    }
  } catch (error) {
    console.error("AI chat error:", error);
    return c.json({ error: "Erro no chat com IA" }, 500);
  }
});

Deno.serve(app.fetch);
