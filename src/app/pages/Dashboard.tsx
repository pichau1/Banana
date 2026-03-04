import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Heart, Activity, MessageCircle, TrendingUp, AlertCircle, Sparkles, Bot, Users } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function Dashboard() {
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Carregar dados do localStorage
    const storedMood = localStorage.getItem("currentMood");
    if (storedMood) {
      setCurrentMood(parseInt(storedMood));
    }

    // Gerar dados da semana
    const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    const data = days.map((day, index) => ({
      day,
      humor: Math.floor(Math.random() * 40) + 60,
    }));
    setWeeklyData(data);

    // Verificar se precisa mostrar alerta
    const lastCheck = localStorage.getItem("lastMoodCheck");
    const today = new Date().toDateString();
    if (lastCheck !== today) {
      setShowAlert(true);
    }
  }, []);

  const quickActions = [
    { icon: Activity, label: "Registrar Humor", color: "bg-blue-500", link: "/mood" },
    { icon: Heart, label: "SOS Pânico", color: "bg-red-500", link: "/panic" },
    { icon: Bot, label: "Chat IA", color: "bg-purple-500", link: "/ai-chat" },
    { icon: Users, label: "Chat Anônimo", color: "bg-green-500", link: "/anonymous-chat" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Olá! Bem-vindo de volta 👋
        </h1>
        <p className="text-gray-600">
          Como você está se sentindo hoje?
        </p>
      </div>

      {/* Alert para check-in diário */}
      {showAlert && (
        <Alert className="mb-6 bg-purple-50 border-purple-200">
          <AlertCircle className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-900">
            Você ainda não registrou seu humor hoje. Que tal fazer um check-in rápido?
            <Link to="/mood" className="ml-2 underline font-medium">
              Registrar agora
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action, index) => (
          <Link key={index} to={action.link}>
            <Card className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-purple-200">
              <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">{action.label}</h3>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mood Chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Seu Humor Esta Semana</h2>
            <Sparkles className="h-5 w-5 text-purple-600" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="humor"
                stroke="#9333ea"
                strokeWidth={3}
                dot={{ fill: "#9333ea", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Daily Stats */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Progresso Diário</h2>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Check-ins de Humor</span>
                <span className="text-sm font-semibold text-purple-600">3/3</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Exercícios de Respiração</span>
                <span className="text-sm font-semibold text-purple-600">2/5</span>
              </div>
              <Progress value={40} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Atividade na Comunidade</span>
                <span className="text-sm font-semibold text-purple-600">1/2</span>
              </div>
              <Progress value={50} className="h-2" />
            </div>
          </div>
        </Card>
      </div>

      {/* Today's Insights */}
      <Card className="mt-6 p-6 bg-gradient-to-br from-purple-100 to-pink-100 border-purple-200">
        <div className="flex items-start space-x-4">
          <div className="bg-white/80 p-3 rounded-full">
            <Sparkles className="h-6 w-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">Insight do Dia</h3>
            <p className="text-gray-700 mb-4">
              Seus registros mostram que você tem se sentido melhor nas manhãs. Que tal agendar
              atividades importantes para esse período?
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Ver Mais Insights
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}