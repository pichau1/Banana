import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import { Textarea } from "../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { toast } from "sonner";
import { Smile, Meh, Frown, Moon, Utensils, Activity, Heart, Brain, Zap, Bed } from "lucide-react";
import { authService } from "../utils/auth";

export function MoodTracking() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any>({
    mood: 50,
    energy: 50,
    sleep: "",
    appetite: "",
    interest: "",
    concentration: "",
    selfEsteem: "",
    motor: "",
    notes: "",
  });

  const phq9Questions = [
    {
      question: "Nas últimas 2 semanas, com que frequência você teve pouco interesse ou prazer em fazer as coisas?",
      key: "interest",
      icon: Activity,
    },
    {
      question: "Nas últimas 2 semanas, com que frequência você se sentiu para baixo, deprimido ou sem esperança?",
      key: "mood_frequency",
      icon: Heart,
    },
    {
      question: "Nas últimas 2 semanas, com que frequência você teve problemas para dormir (dificuldade para adormecer, acordar no meio da noite ou dormir demais)?",
      key: "sleep",
      icon: Moon,
    },
    {
      question: "Nas últimas 2 semanas, com que frequência você se sentiu cansado ou com pouca energia?",
      key: "energy_frequency",
      icon: Zap,
    },
    {
      question: "Nas últimas 2 semanas, com que frequência você teve falta de apetite ou comeu demais?",
      key: "appetite",
      icon: Utensils,
    },
    {
      question: "Nas últimas 2 semanas, com que frequência você se sentiu mal consigo mesmo, achou que é um fracasso ou que decepcionou sua família?",
      key: "selfEsteem",
      icon: Brain,
    },
    {
      question: "Nas últimas 2 semanas, com que frequência você teve dificuldade para se concentrar nas coisas (como ler jornal ou assistir televisão)?",
      key: "concentration",
      icon: Brain,
    },
  ];

  const frequencyOptions = [
    { value: "0", label: "Nenhuma vez" },
    { value: "1", label: "Vários dias" },
    { value: "2", label: "Mais da metade dos dias" },
    { value: "3", label: "Quase todos os dias" },
  ];

  const handleSubmit = async () => {
    // Calculate PHQ-9 score
    let phq9Score = 0;
    phq9Questions.forEach(q => {
      const value = parseInt(answers[q.key] || "0");
      phq9Score += value;
    });

    // Salvar no banco de dados do usuário
    const entry = {
      date: new Date().toISOString(),
      mood: answers.mood,
      energy: answers.energy,
      sleep: answers.sleep,
      appetite: answers.appetite,
      interest: answers.interest,
      concentration: answers.concentration,
      selfEsteem: answers.selfEsteem,
      phq9Score,
      notes: answers.notes,
    };
    
    const userData = authService.getUserData();
    if (userData) {
      userData.moodEntries.push(entry);
      await authService.updateUserData({ moodEntries: userData.moodEntries });
    }

    // Interpret score
    let severity = "";
    if (phq9Score <= 4) severity = "Mínimo ou nenhum";
    else if (phq9Score <= 9) severity = "Leve";
    else if (phq9Score <= 14) severity = "Moderado";
    else if (phq9Score <= 19) severity = "Moderadamente severo";
    else severity = "Severo";

    toast.success("Registro salvo com sucesso! 🎉", {
      description: `Nível de sintomas: ${severity}. Continue cuidando de si mesmo.`,
    });

    // Reset
    setStep(0);
    setAnswers({
      mood: 50,
      energy: 50,
      sleep: "",
      appetite: "",
      interest: "",
      concentration: "",
      selfEsteem: "",
      motor: "",
      notes: "",
    });
  };

  const renderMoodFace = (value: number) => {
    if (value < 33) return <Frown className="h-8 w-8 text-red-500" />;
    if (value < 66) return <Meh className="h-8 w-8 text-yellow-500" />;
    return <Smile className="h-8 w-8 text-green-500" />;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          Monitoramento de Humor
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Responda algumas perguntas rápidas para acompanhar seu bem-estar
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs sm:text-sm font-medium text-gray-700">Progresso</span>
          <span className="text-xs sm:text-sm font-medium text-purple-600">
            {step + 1} de {phq9Questions.length + 2}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / (phq9Questions.length + 2)) * 100}%` }}
          />
        </div>
      </div>

      <Card className="p-4 sm:p-6 lg:p-8">
        {/* Step 0: Humor e Energia Geral */}
        {step === 0 && (
          <div className="space-y-6">
            <div className="text-center mb-4">
              {renderMoodFace(answers.mood)}
            </div>
            <div>
              <Label className="text-base sm:text-lg mb-4 block">Como você está se sentindo agora?</Label>
              <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
                <span>Muito Mal</span>
                <span className="hidden sm:inline">Neutro</span>
                <span>Muito Bem</span>
              </div>
              <Slider
                value={[answers.mood]}
                onValueChange={(value) => setAnswers({ ...answers, mood: value[0] })}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="text-center mt-2 text-sm font-medium text-purple-600">
                {answers.mood}/100
              </div>
            </div>
            <div>
              <Label className="text-base sm:text-lg mb-4 block">Qual seu nível de energia hoje?</Label>
              <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
                <span>Exausto</span>
                <span className="hidden sm:inline">Normal</span>
                <span>Energizado</span>
              </div>
              <Slider
                value={[answers.energy]}
                onValueChange={(value) => setAnswers({ ...answers, energy: value[0] })}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="text-center mt-2 text-sm font-medium text-purple-600">
                {answers.energy}/100
              </div>
            </div>
          </div>
        )}

        {/* PHQ-9 Questions */}
        {step > 0 && step <= phq9Questions.length && (() => {
          const Icon = phq9Questions[step - 1].icon;
          return (
            <div className="space-y-6">
              <div className="flex items-start space-x-3 mb-6">
                {Icon && <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0 mt-1" />}
                <Label className="text-base sm:text-lg leading-relaxed">{phq9Questions[step - 1].question}</Label>
              </div>
              <RadioGroup
                value={answers[phq9Questions[step - 1].key]}
                onValueChange={(value) =>
                  setAnswers({ ...answers, [phq9Questions[step - 1].key]: value })
                }
              >
                {frequencyOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3 p-3 sm:p-4 rounded-lg hover:bg-gray-50 border border-transparent hover:border-purple-200 transition-colors">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer text-sm sm:text-base">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          );
        })()}

        {/* Final Step: Notes */}
        {step === phq9Questions.length + 1 && (
          <div className="space-y-6">
            <Label className="text-base sm:text-lg">Deseja adicionar alguma observação?</Label>
            <Textarea
              value={answers.notes}
              onChange={(e) => setAnswers({ ...answers, notes: e.target.value })}
              placeholder="Como foi seu dia? O que você está sentindo? (opcional)"
              className="min-h-24 sm:min-h-32 text-sm sm:text-base"
            />
            <p className="text-xs sm:text-sm text-gray-500">
              Suas respostas são privadas e seguras. Este questionário baseia-se no PHQ-9, ferramenta validada para rastreamento de depressão.
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6 sm:mt-8 pt-6 border-t gap-3">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="text-sm sm:text-base"
          >
            Voltar
          </Button>
          {step < phq9Questions.length + 1 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={
                step > 0 &&
                step <= phq9Questions.length &&
                !answers[phq9Questions[step - 1].key]
              }
              className="bg-purple-600 hover:bg-purple-700 text-sm sm:text-base"
            >
              Próximo
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700 text-sm sm:text-base">
              Finalizar
            </Button>
          )}
        </div>
      </Card>

      {/* Info Card */}
      <Card className="mt-6 p-4 sm:p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <Heart className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-blue-900">
            <strong>Importante:</strong> Este questionário não substitui avaliação profissional. 
            Se você está pensando em se machucar ou em suicídio, procure ajuda imediatamente: 
            CVV 188 (24h, gratuito).
          </div>
        </div>
      </Card>
    </div>
  );
}
