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
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = () => {
    const allPosts: CommunityPost[] = JSON.parse(localStorage.getItem("communityPosts") || "[]");
    // Ordenar por mais recentes
    const sortedPosts = allPosts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    setPosts(sortedPosts);
  };

  const handlePost = () => {
    if (!newPost.trim() || !currentUser) return;

    const post: CommunityPost = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      content: newPost,
      timestamp: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      comments: 0,
      category: "Compartilhamento",
    };

    const allPosts: CommunityPost[] = JSON.parse(localStorage.getItem("communityPosts") || "[]");
    allPosts.push(post);
    localStorage.setItem("communityPosts", JSON.stringify(allPosts));

    // Salvar no histórico do usuário
    const userData = authService.getUserData();
    if (userData) {
      userData.communityPosts.push({
        id: post.id,
        content: post.content,
        timestamp: post.timestamp,
        likes: 0,
        comments: 0,
      });
      authService.updateUserData({ communityPosts: userData.communityPosts });
    }

    setPosts([post, ...posts]);
    setNewPost("");
    toast.success("Post compartilhado com sucesso!");
  };

  const handleLike = (postId: string) => {
    if (!currentUser) return;

    const allPosts: CommunityPost[] = JSON.parse(localStorage.getItem("communityPosts") || "[]");
    const postIndex = allPosts.findIndex(p => p.id === postId);
    
    if (postIndex !== -1) {
      const post = allPosts[postIndex];
      const hasLiked = post.likedBy.includes(currentUser.id);
      
      if (hasLiked) {
        post.likedBy = post.likedBy.filter(id => id !== currentUser.id);
        post.likes--;
      } else {
        post.likedBy.push(currentUser.id);
        post.likes++;
      }
      
      allPosts[postIndex] = post;
      localStorage.setItem("communityPosts", JSON.stringify(allPosts));
      loadPosts();
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

  const getUserAvatar = (userId: string) => {
    const allUsers: any[] = JSON.parse(localStorage.getItem("users") || "[]");
    const user = allUsers.find(u => u.id === userId);
    return user?.avatar;
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date().getTime();
    const postTime = new Date(timestamp).getTime();
    const diff = now - postTime;

    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}min atrás`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;

    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  const categoryColors: Record<string, string> = {
    "Vitória": "bg-green-100 text-green-800",
    "Pergunta": "bg-blue-100 text-blue-800",
    "Progresso": "bg-purple-100 text-purple-800",
    "Compartilhamento": "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Comunidade de Apoio
        </h1>
        <p className="text-gray-600">
          Um espaço seguro para compartilhar e se conectar
        </p>
      </div>

      {/* Safety Notice */}
      <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <strong>Espaço Moderado:</strong> Esta comunidade é monitorada por IA e moderadores
            humanos para garantir um ambiente seguro e acolhedor. Conteúdos ofensivos ou
            prejudiciais são automaticamente removidos.
          </div>
        </div>
      </Card>

      {/* Chat Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Link to="/ai-chat">
          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-purple-300">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Chat com IA</h3>
                <p className="text-sm text-gray-600">Apoio emocional 24/7</p>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700">Abrir</Button>
            </div>
          </Card>
        </Link>

        <Link to="/anonymous-chat">
          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-green-300">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Chat Anônimo</h3>
                <p className="text-sm text-gray-600">Converse com outras pessoas</p>
              </div>
              <Button className="bg-green-600 hover:bg-green-700">Conectar</Button>
            </div>
          </Card>
        </Link>
      </div>

      {/* New Post */}
      <Card className="p-6 mb-6">
        <div className="flex items-start space-x-4">
          <Avatar>
            {currentUser?.avatar ? (
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            ) : (
              <AvatarFallback className="bg-purple-600 text-white">
                {currentUser ? getInitials(currentUser.name) : "U"}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 space-y-4">
            <Textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Compartilhe como você está se sentindo ou uma vitória do dia..."
              className="min-h-24 resize-none"
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Seja gentil, seja empático
              </p>
              <Button
                onClick={handlePost}
                disabled={!newPost.trim()}
                className="bg-purple-600 hover:bg-purple-700"
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
          <Card className="p-8 text-center">
            <p className="text-gray-600">Nenhum post ainda. Seja o primeiro a compartilhar!</p>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <Avatar>
                  {getUserAvatar(post.userId) ? (
                    <AvatarImage src={getUserAvatar(post.userId)} alt={post.userName} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {getInitials(post.userName)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-gray-900">{post.userName}</span>
                      <span className="text-sm text-gray-500">{getTimeAgo(post.timestamp)}</span>
                      <Badge className="bg-yellow-100 text-yellow-800">{post.category}</Badge>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  <div className="flex items-center space-x-6 pt-2">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-2 transition-colors ${
                        currentUser && post.likedBy.includes(currentUser.id)
                          ? "text-red-600"
                          : "text-gray-600 hover:text-red-600"
                      }`}
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          currentUser && post.likedBy.includes(currentUser.id) ? "fill-current" : ""
                        }`}
                      />
                      <span className="text-sm font-medium">{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                      <MessageCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">{post.comments}</span>
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