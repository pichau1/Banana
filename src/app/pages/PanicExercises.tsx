import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Heart, Wind, Eye, Phone, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

export function PanicExercises() {
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [breathCount, setBreathCount] = useState(0);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [timer, setTimer] = useState(4);

  // Breathing exercise timer
  useEffect(() => {
    if (activeExercise === "breathing" && timer > 0) {
      const interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (activeExercise === "breathing" && timer === 0) {
      // Cycle through phases
      if (phase === "inhale") {
        setPhase("hold");
        setTimer(4);
      } else if (phase === "hold") {
        setPhase("exhale");
        setTimer(4);
      } else {
        setPhase("inhale");
        setTimer(4);
        setBreathCount((c) => c + 1);
      }
    }
  }, [activeExercise, timer, phase]);

  const groundingItems = [
    "5 coisas que você pode VER",
    "4 coisas que você pode TOCAR",
    "3 coisas que você pode OUVIR",
    "2 coisas que você pode CHEIRAR",
    "1 coisa que você pode SABOREAR",
  ];

  const [groundingStep, setGroundingStep] = useState(0);
  const [groundingInputs, setGroundingInputs] = useState<string[]>(Array(5).fill(""));

  const handleSOSCall = () => {
    const emergencyContact = localStorage.getItem("emergencyContact");
    if (emergencyContact) {
      alert(`Chamando contato de emergência: ${emergencyContact}\n\nEm um app real, isso enviaria um SMS com sua localização GPS.`);
    } else {
      alert("Configure um contato de emergência nas Configurações primeiro.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Exercícios para Crises de Pânico
        </h1>
        <p className="text-gray-600">
          Técnicas rápidas para ajudar você a se acalmar
        </p>
      </div>

      {/* Emergency SOS */}
      <Alert className="mb-6 bg-red-50 border-red-200">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-red-900">Está em crise aguda?</span>
          <Button
            onClick={handleSOSCall}
            variant="destructive"
            size="sm"
            className="bg-red-600 hover:bg-red-700"
          >
            <Phone className="h-4 w-4 mr-2" />
            SOS Emergência
          </Button>
        </AlertDescription>
      </Alert>

      {/* Exercise Cards */}
      {!activeExercise && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Breathing Exercise */}
          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300" onClick={() => setActiveExercise("breathing")}>
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Wind className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Respiração 4-4-4</h2>
            <p className="text-gray-600 mb-4">
              Técnica de respiração guiada para regular o sistema nervoso
            </p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Iniciar Exercício
            </Button>
          </Card>

          {/* Grounding Exercise */}
          <Card className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-green-300" onClick={() => setActiveExercise("grounding")}>
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Eye className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Aterramento 5-4-3-2-1</h2>
            <p className="text-gray-600 mb-4">
              Reconecte-se com o presente usando seus sentidos
            </p>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Iniciar Exercício
            </Button>
          </Card>
        </div>
      )}

      {/* Breathing Exercise Active */}
      {activeExercise === "breathing" && (
        <Card className="p-8">
          <div className="text-center space-y-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">Respiração 4-4-4</h2>
              <Button variant="outline" onClick={() => {
                setActiveExercise(null);
                setBreathCount(0);
                setPhase("inhale");
                setTimer(4);
              }}>
                Sair
              </Button>
            </div>

            <div className="flex justify-center my-8">
              <motion.div
                className="bg-blue-500 rounded-full flex items-center justify-center"
                animate={{
                  width: phase === "inhale" ? 200 : phase === "hold" ? 200 : 120,
                  height: phase === "inhale" ? 200 : phase === "hold" ? 200 : 120,
                }}
                transition={{ duration: 1, ease: "easeInOut" }}
              >
                <Heart className="h-16 w-16 text-white" />
              </motion.div>
            </div>

            <div className="space-y-4">
              <div className="text-3xl font-bold text-gray-900 capitalize">{phase === "inhale" ? "Inspire" : phase === "hold" ? "Segure" : "Expire"}</div>
              <div className="text-6xl font-bold text-blue-600">{timer}</div>
              <Progress value={(4 - timer) * 25} className="w-64 mx-auto" />
            </div>

            <div className="pt-6 border-t">
              <p className="text-gray-600">Ciclos completados: <span className="font-semibold text-purple-600">{breathCount}</span></p>
              <p className="text-sm text-gray-500 mt-2">Recomendamos 5-10 ciclos</p>
            </div>
          </div>
        </Card>
      )}

      {/* Grounding Exercise Active */}
      {activeExercise === "grounding" && (
        <Card className="p-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">Aterramento 5-4-3-2-1</h2>
              <Button variant="outline" onClick={() => {
                setActiveExercise(null);
                setGroundingStep(0);
                setGroundingInputs(Array(5).fill(""));
              }}>
                Sair
              </Button>
            </div>

            <div className="mb-6">
              <Progress value={(groundingStep / 5) * 100} className="h-2" />
            </div>

            {groundingStep < 5 ? (
              <div className="space-y-6">
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Passo {groundingStep + 1}: {groundingItems[groundingStep]}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Olhe ao seu redor e identifique:
                  </p>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Digite aqui..."
                    value={groundingInputs[groundingStep]}
                    onChange={(e) => {
                      const newInputs = [...groundingInputs];
                      newInputs[groundingStep] = e.target.value;
                      setGroundingInputs(newInputs);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && groundingInputs[groundingStep].trim()) {
                        setGroundingStep(groundingStep + 1);
                      }
                    }}
                  />
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setGroundingStep(Math.max(0, groundingStep - 1))}
                    disabled={groundingStep === 0}
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={() => setGroundingStep(groundingStep + 1)}
                    disabled={!groundingInputs[groundingStep].trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Exercício Completo! 🎉</h3>
                <p className="text-gray-600">
                  Você conseguiu! Como está se sentindo agora?
                </p>
                <div className="space-y-3">
                  {groundingInputs.map((input, index) => input && (
                    <div key={index} className="text-left p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">{groundingItems[index]}:</span>
                      <p className="text-gray-600 mt-1">{input}</p>
                    </div>
                  ))}
                </div>
                <Button onClick={() => {
                  setActiveExercise(null);
                  setGroundingStep(0);
                  setGroundingInputs(Array(5).fill(""));
                }} className="bg-green-600 hover:bg-green-700">
                  Concluir
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
