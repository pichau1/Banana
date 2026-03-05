import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Download, TrendingUp, TrendingDown, Calendar, FileText } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { authService } from "../utils/auth";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function Reports() {
  const [moodData, setMoodData] = useState<any[]>([]);
  const [panicEvents, setPanicEvents] = useState<any[]>([]);
  const [weeklyAverage, setWeeklyAverage] = useState(0);
  const [previousWeekAverage, setPreviousWeekAverage] = useState(0);
  const [trend, setTrend] = useState(0);
  const user = authService.getCurrentUser();
  const userData = authService.getUserData();

  useEffect(() => {
    if (userData) {
      // Carregar dados reais do usuário
      const moodEntries = userData.moodEntries.map((entry) => ({
        date: new Date(entry.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        humor: entry.mood,
        energia: entry.energy,
      }));
      
      const finalData = moodEntries.length > 0 ? moodEntries : generateSampleData();
      setMoodData(finalData);
      setPanicEvents(userData.panicEvents || []);

      // Calculate averages
      if (finalData.length > 0) {
        const lastSevenDays = finalData.slice(-7);
        const weekAvg = Math.round(lastSevenDays.reduce((acc, d) => acc + d.humor, 0) / lastSevenDays.length);
        setWeeklyAverage(weekAvg);

        if (finalData.length > 7) {
          const previousSevenDays = finalData.slice(-14, -7);
          const prevAvg = Math.round(previousSevenDays.reduce((acc, d) => acc + d.humor, 0) / previousSevenDays.length);
          setPreviousWeekAverage(prevAvg);
          setTrend(weekAvg - prevAvg);
        }
      }
    } else {
      const sampleData = generateSampleData();
      setMoodData(sampleData);
      
      // Calculate sample averages
      const lastSevenDays = sampleData.slice(-7);
      const weekAvg = Math.round(lastSevenDays.reduce((acc, d) => acc + d.humor, 0) / 7);
      setWeeklyAverage(weekAvg);

      const previousSevenDays = sampleData.slice(-14, -7);
      const prevAvg = Math.round(previousSevenDays.reduce((acc, d) => acc + d.humor, 0) / 7);
      setPreviousWeekAverage(prevAvg);
      setTrend(weekAvg - prevAvg);
    }
  }, [userData]);

  const generateSampleData = () => {
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        humor: Math.floor(Math.random() * 40) + 50,
        energia: Math.floor(Math.random() * 40) + 40,
      };
    });
  };

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(147, 51, 234); // Purple
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("MindCare", 105, 20, { align: "center" });
    doc.setFontSize(14);
    doc.text("Relatório de Progresso", 105, 30, { align: "center" });
    
    // Patient Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Paciente: ${user?.name || "Usuário"}`, 14, 55);
    doc.text(`Data do Relatório: ${new Date().toLocaleDateString("pt-BR")}`, 14, 62);
    doc.text(`Período: Últimos 30 dias`, 14, 69);
    
    // Summary
    doc.setFontSize(16);
    doc.setTextColor(147, 51, 234);
    doc.text("Resumo Executivo", 14, 85);
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`• Humor Médio (7 dias): ${weeklyAverage}/100`, 14, 95);
    doc.text(`• Crises de Pânico (30 dias): ${panicEvents.length} eventos`, 14, 102);
    doc.text(`• Check-ins Realizados: ${moodData.length} registros`, 14, 109);
    
    // Mood Table
    doc.setFontSize(16);
    doc.setTextColor(147, 51, 234);
    doc.text("Histórico de Humor", 14, 125);
    
    const moodTableData = moodData.slice(-10).map(entry => [
      entry.date,
      entry.humor.toString(),
      entry.energia.toString()
    ]);
    
    autoTable(doc, {
      startY: 130,
      head: [['Data', 'Humor', 'Energia']],
      body: moodTableData,
      theme: 'striped',
      headStyles: { fillColor: [147, 51, 234] },
    });
    
    // Panic Events Table
    if (panicEvents.length > 0) {
      const finalY = (doc as any).lastAutoTable.finalY || 130;
      
      doc.setFontSize(16);
      doc.setTextColor(147, 51, 234);
      doc.text("Crises de Pânico", 14, finalY + 15);
      
      const panicTableData = panicEvents.map(event => [
        event.date,
        event.time,
        event.severity,
        event.duration
      ]);
      
      autoTable(doc, {
        startY: finalY + 20,
        head: [['Data', 'Hora', 'Severidade', 'Duração']],
        body: panicTableData,
        theme: 'striped',
        headStyles: { fillColor: [239, 68, 68] },
      });
    }
    
    // Insights
    const finalY = (doc as any).lastAutoTable?.finalY || 180;
    if (finalY < 240) {
      doc.setFontSize(16);
      doc.setTextColor(147, 51, 234);
      doc.text("Recomendações Clínicas", 14, finalY + 15);
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const insights = [
        "• Manter rotina de registro diário para melhor acompanhamento",
        "• Considerar ajuste terapêutico se crises persistirem",
        "• Exercícios de respiração mostram correlação positiva"
      ];
      
      let yPos = finalY + 23;
      insights.forEach(insight => {
        doc.text(insight, 14, yPos);
        yPos += 7;
      });
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text("Este relatório foi gerado automaticamente pelo MindCare", 105, 285, { align: "center" });
    doc.text("Consulte um profissional de saúde mental para interpretação adequada", 105, 290, { align: "center" });
    
    // Save
    doc.save(`MindCare_Relatorio_${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast.success("Relatório gerado com sucesso!", {
      description: "O PDF foi baixado e está pronto para compartilhar com seu médico.",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Relatórios e Insights
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Acompanhe seu progresso ao longo do tempo
          </p>
        </div>
        <Button onClick={handleDownloadReport} className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto">
          <Download className="h-4 w-4 mr-2" />
          Baixar PDF para Médico
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">Humor Médio (7 dias)</h3>
            {trend > 0 ? (
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            )}
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold text-gray-900">{weeklyAverage}</span>
            <span className="text-xs sm:text-sm text-gray-500">/100</span>
          </div>
          <p className={`text-xs sm:text-sm mt-2 ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
            {trend > 0 ? "+" : ""}{trend} pontos vs. semana anterior
          </p>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">Crises de Pânico (30 dias)</h3>
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold text-gray-900">{panicEvents.length}</span>
            <span className="text-xs sm:text-sm text-gray-500">eventos</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            {panicEvents.length === 0 ? "Nenhum evento registrado" : `Média de ${Math.round(panicEvents.length / 4)} eventos por semana`}
          </p>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">Check-ins Realizados</h3>
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-bold text-gray-900">{moodData.length}</span>
            <span className="text-xs sm:text-sm text-gray-500">registros</span>
          </div>
          <p className={`text-xs sm:text-sm mt-2 ${moodData.length >= 20 ? "text-green-600" : "text-yellow-600"}`}>
            {moodData.length >= 20 ? `${Math.round((moodData.length / 30) * 100)}% de adesão - Excelente!` : "Continue registrando diariamente"}
          </p>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="mood" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mood" className="text-xs sm:text-sm">Humor</TabsTrigger>
          <TabsTrigger value="energy" className="text-xs sm:text-sm">Energia</TabsTrigger>
          <TabsTrigger value="panic" className="text-xs sm:text-sm">Pânico</TabsTrigger>
        </TabsList>

        <TabsContent value="mood">
          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Histórico de Humor (30 dias)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" domain={[0, 100]} style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="humor"
                  stroke="#9333ea"
                  strokeWidth={2}
                  dot={{ fill: "#9333ea", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="energy">
          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Níveis de Energia (30 dias)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" domain={[0, 100]} style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="energia" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="panic">
          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Registro de Crises de Pânico</h3>
            <div className="space-y-4">
              {panicEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                  Nenhuma crise de pânico registrada. Continue cuidando de si mesmo! 💚
                </div>
              ) : (
                panicEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                        <span className="font-semibold text-gray-900 text-sm sm:text-base">{event.date}</span>
                        <span className="text-xs sm:text-sm text-gray-600">{event.time}</span>
                        <Badge
                          className={
                            event.severity === "Alto"
                              ? "bg-red-100 text-red-800 text-xs"
                              : event.severity === "Moderado"
                              ? "bg-yellow-100 text-yellow-800 text-xs"
                              : "bg-green-100 text-green-800 text-xs"
                          }
                        >
                          {event.severity}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">Duração: {event.duration}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Insights */}
      <Card className="mt-6 p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Insights Personalizados</h3>
        <ul className="space-y-3">
          <li className="flex items-start space-x-3">
            <span className="text-purple-600 font-bold">•</span>
            <p className="text-sm sm:text-base text-gray-700">
              Seus níveis de humor tendem a ser mais altos entre 8h-12h. Considere agendar
              atividades importantes nesse período.
            </p>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-purple-600 font-bold">•</span>
            <p className="text-sm sm:text-base text-gray-700">
              Continue registrando seu humor diariamente para que possamos identificar padrões e ajudá-lo melhor.
            </p>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-purple-600 font-bold">•</span>
            <p className="text-sm sm:text-base text-gray-700">
              Compartilhe este relatório com seu terapeuta para um acompanhamento mais preciso.
            </p>
          </li>
        </ul>
      </Card>
    </div>
  );
}
