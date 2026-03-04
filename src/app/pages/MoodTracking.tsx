import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import { Textarea } from "../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { toast } from "sonner";
import { Smile, Meh, Frown, Moon, Utensils, Activity } from "lucide-react";
import { authService } from "../utils/auth";

export function MoodTracking() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any>({
    mood: 50,
    energy: 50,
    sleep: "",
    appetite: "",
    interest: "",
    notes: "",
  });

  const phq9Questions = [
    {
      question: "Com que frequência você teve pouco interesse ou prazer em fazer as coisas?",
      key: "interest",
      icon: Activity,
    },
    {
      question: "Como está seu apetite nas últimas semanas?",
      key: "appetite",
      icon: Utensils,
    },
    {
      question: "Como está a qualidade do seu sono?",
      key: "sleep",
      icon: Moon,
    },
  ];

  const frequencyOptions = [
    { value: "0", label: "Nunca" },
    { value: "1", label: "Vários dias" },
    { value: "2", label: "Mais da metade dos dias" },
    { value: "3", label: "Quase todos os dias" },
  ];

  const handleSubmit = () => {
    // Salvar no banco de dados do usuário
    const entry = {
      date: new Date().toISOString(),
      ...answers,
    };
    
    const userData = authService.getUserData();
    if (userData) {
      userData.moodEntries.push(entry);
      authService.updateUserData({ moodEntries: userData.moodEntries });
    }

    toast.success("Registro salvo com sucesso! 🎉", {
      description: "Continue cuidando de si mesmo.",
    });

    // Reset
    setStep(0);
    setAnswers({
      mood: 50,
      energy: 50,
      sleep: "",
      appetite: "",
      interest: "",
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
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Monitoramento de Humor
        </h1>
        <p className="text-gray-600">
          Responda algumas perguntas rápidas para acompanhar seu bem-estar
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progresso</span>
          <span className="text-sm font-medium text-purple-600">
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

      <Card className="p-6 sm:p-8">
        {/* Step 0: Humor Geral */}
        {step === 0 && (
          <div className="space-y-6">
            <div className="text-center mb-4">
              {renderMoodFace(answers.mood)}
            </div>
            <div>
              <Label className="text-lg mb-4 block">Como você está se sentindo agora?</Label>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Muito Mal</span>
                <span>Neutro</span>
                <span>Muito Bem</span>
              </div>
              <Slider
                value={[answers.mood]}
                onValueChange={(value) => setAnswers({ ...answers, mood: value[0] })}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
            <div>
              <Label className="text-lg mb-4 block">Qual seu nível de energia?</Label>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Exausto</span>
                <span>Normal</span>
                <span>Energizado</span>
              </div>
              <Slider
                value={[answers.energy]}
                onValueChange={(value) => setAnswers({ ...answers, energy: value[0] })}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* PHQ-9 Questions */}
        {step > 0 && step <= phq9Questions.length && (() => {
          const Icon = phq9Questions[step - 1].icon;
          return (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                {Icon && <Icon className="h-8 w-8 text-purple-600" />}
                <Label className="text-lg">{phq9Questions[step - 1].question}</Label>
              </div>
              <RadioGroup
                value={answers[phq9Questions[step - 1].key]}
                onValueChange={(value) =>
                  setAnswers({ ...answers, [phq9Questions[step - 1].key]: value })
                }
              >
                {frequencyOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 border border-transparent hover:border-purple-200 transition-colors">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer">
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
            <Label className="text-lg">Deseja adicionar alguma observação?</Label>
            <Textarea
              value={answers.notes}
              onChange={(e) => setAnswers({ ...answers, notes: e.target.value })}
              placeholder="Como foi seu dia? O que você está sentindo? (opcional)"
              className="min-h-32"
            />
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
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
              className="bg-purple-600 hover:bg-purple-700"
            >
              Próximo
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700">
              Finalizar
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}