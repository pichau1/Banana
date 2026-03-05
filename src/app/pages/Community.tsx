import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Heart, MessageCircle, Send, Shield, Bot, Users } from "lucide-react";
import { toast } from "sonner";
import { authService } from "../utils/auth";
import { projectId } from "/utils/supabase/info";

interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  likes: number;
  likedBy: string[];
  comments: number;
  category: string;
}

export function Community() {
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentUser = authService.getCurrentUser();
  const accessToken = authService.getAccessToken();

  useEffect(() => {
    loadPosts();
    
    // Poll for new posts every 5 seconds
    const interval = setInterval(loadPosts, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadPosts = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1b27e889/community/posts`);
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error("Error loading posts:", error);
    }
  };

  const handlePost = async () => {
    if (!newPost.trim() || !currentUser || !accessToken) return;

    setIsLoading(true);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1b27e889/community/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          content: newPost,
          category: "Compartilhamento"
        })
      });

      const data = await response.json();

      if (data.success) {
        setPosts([data.post, ...posts]);
        setNewPost("");
        toast.success("Post compartilhado com sucesso!");
      } else {
        toast.error("Erro ao criar post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Erro ao criar post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUser || !accessToken) return;

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1b27e889/community/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setPosts(posts.map(p => p.id === postId ? data.post : p));
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date().getTime();
    const postTime = new Date(timestamp).getTime();
    const diff = now - postTime;

    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "agora";
    if (minutes < 60) return `${minutes}min atrás`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;

    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          Comunidade de Apoio
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Um espaço seguro para compartilhar e se conectar
        </p>
      </div>

      {/* Safety Notice */}
      <Card className="p-3 sm:p-4 mb-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-blue-900">
            <strong>Espaço Moderado:</strong> Esta comunidade é monitorada por IA e moderadores
            humanos para garantir um ambiente seguro e acolhedor. Conteúdos ofensivos ou
            prejudiciais são automaticamente removidos.
          </div>
        </div>
      </Card>

      {/* Chat Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Link to="/ai-chat">
          <Card className="p-4 sm:p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-purple-300">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="bg-purple-100 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Chat com IA</h3>
                <p className="text-xs sm:text-sm text-gray-600">Apoio emocional 24/7</p>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm px-3 sm:px-4">Abrir</Button>
            </div>
          </Card>
        </Link>

        <Link to="/anonymous-chat">
          <Card className="p-4 sm:p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-green-300">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="bg-green-100 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Chat Anônimo</h3>
                <p className="text-xs sm:text-sm text-gray-600">Converse com outras pessoas</p>
              </div>
              <Button className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm px-3 sm:px-4">Conectar</Button>
            </div>
          </Card>
        </Link>
      </div>

      {/* New Post */}
      <Card className="p-4 sm:p-6 mb-6">
        <div className="flex items-start space-x-3 sm:space-x-4">
          <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
            {currentUser?.avatar ? (
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            ) : (
              <AvatarFallback className="bg-purple-600 text-white text-xs sm:text-sm">
                {currentUser ? getInitials(currentUser.name) : "U"}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 space-y-4">
            <Textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Compartilhe como você está se sentindo ou uma vitória do dia..."
              className="min-h-20 sm:min-h-24 resize-none text-sm sm:text-base"
            />
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <p className="text-xs sm:text-sm text-gray-500">
                Seja gentil, seja empático
              </p>
              <Button
                onClick={handlePost}
                disabled={!newPost.trim() || isLoading}
                className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto text-sm sm:text-base"
              >
                <Send className="h-4 w-4 mr-2" />
                Publicar
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card className="p-6 sm:p-8 text-center">
            <p className="text-sm sm:text-base text-gray-600">Nenhum post ainda. Seja o primeiro a compartilhar!</p>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs sm:text-sm">
                    {getInitials(post.userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">{post.userName}</span>
                      <span className="text-xs sm:text-sm text-gray-500">{getTimeAgo(post.timestamp)}</span>
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">{post.category}</Badge>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap break-words">{post.content}</p>
                  <div className="flex items-center space-x-4 sm:space-x-6 pt-2">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-2 transition-colors ${
                        currentUser && post.likedBy.includes(currentUser.id)
                          ? "text-red-600"
                          : "text-gray-600 hover:text-red-600"
                      }`}
                    >
                      <Heart
                        className={`h-4 w-4 sm:h-5 sm:w-5 ${
                          currentUser && post.likedBy.includes(currentUser.id) ? "fill-current" : ""
                        }`}
                      />
                      <span className="text-xs sm:text-sm font-medium">{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                      <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-xs sm:text-sm font-medium">{post.comments}</span>
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
