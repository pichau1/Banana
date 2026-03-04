import { useState, useEffect, useRef } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { toast } from "sonner";
import { Phone, Bell, Shield, User, Save, Camera, Trash2 } from "lucide-react";
import { authService } from "../utils/auth";

export function Settings() {
  const [settings, setSettings] = useState({
    name: "",
    emergencyContact: "",
    emergencyName: "",
    notifications: true,
    dailyReminders: true,
    crisisAlerts: true,
    autoSOS: false,
  });
  const user = authService.getCurrentUser();
  const userData = authService.getUserData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Carregar configurações do usuário
    if (userData) {
      setSettings(userData.settings);
    }
  }, []);

  const handleSave = () => {
    authService.updateUserData({ settings });
    toast.success("Configurações salvas com sucesso!");
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamanho (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB");
      return;
    }

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      authService.updateAvatar(base64);
      toast.success("Foto de perfil atualizada!");
      window.location.reload(); // Atualizar para mostrar novo avatar
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    authService.removeAvatar();
    toast.success("Foto de perfil removida!");
    window.location.reload();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Configurações
        </h1>
        <p className="text-gray-600">
          Personalize sua experiência no MindCare
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <User className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Perfil</h2>
          </div>

          {/* Avatar Section */}
          <div className="flex items-center space-x-6 mb-6 pb-6 border-b">
            <Avatar className="w-24 h-24">
              {user?.avatar ? (
                <AvatarImage src={user.avatar} alt={user.name} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl">
                  {user ? getInitials(user.name) : "U"}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{user?.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{user?.email}</p>
              <div className="flex space-x-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Alterar Foto
                </Button>
                {user?.avatar && (
                  <Button
                    onClick={handleRemoveAvatar}
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                placeholder="Como você gostaria de ser chamado?"
                className="mt-2"
              />
            </div>
          </div>
        </Card>

        {/* Emergency Contact */}
        <Card className="p-6 border-red-200 bg-red-50/30">
          <div className="flex items-center space-x-3 mb-6">
            <Phone className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">Contato de Emergência</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Em caso de crise severa, podemos alertar automaticamente este contato com sua
            localização GPS.
          </p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="emergencyName">Nome do Contato</Label>
              <Input
                id="emergencyName"
                value={settings.emergencyName}
                onChange={(e) => setSettings({ ...settings, emergencyName: e.target.value })}
                placeholder="Ex: Maria (Mãe)"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="emergencyContact">Telefone</Label>
              <Input
                id="emergencyContact"
                type="tel"
                value={settings.emergencyContact}
                onChange={(e) => setSettings({ ...settings, emergencyContact: e.target.value })}
                placeholder="(11) 99999-9999"
                className="mt-2"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div className="flex-1">
                <Label htmlFor="autoSOS" className="cursor-pointer">
                  Ativar SOS Automático
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Enviar alerta automaticamente se detectarmos uma crise severa
                </p>
              </div>
              <Switch
                id="autoSOS"
                checked={settings.autoSOS}
                onCheckedChange={(checked) => setSettings({ ...settings, autoSOS: checked })}
              />
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Notificações</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <Label htmlFor="notifications" className="cursor-pointer">
                  Notificações Push
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Receber notificações gerais do app
                </p>
              </div>
              <Switch
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <Label htmlFor="dailyReminders" className="cursor-pointer">
                  Lembretes Diários
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Lembrar de registrar seu humor 3x ao dia
                </p>
              </div>
              <Switch
                id="dailyReminders"
                checked={settings.dailyReminders}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, dailyReminders: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <Label htmlFor="crisisAlerts" className="cursor-pointer">
                  Alertas de Crise
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Notificações quando detectarmos padrões preocupantes
                </p>
              </div>
              <Switch
                id="crisisAlerts"
                checked={settings.crisisAlerts}
                onCheckedChange={(checked) => setSettings({ ...settings, crisisAlerts: checked })}
              />
            </div>
          </div>
        </Card>

        {/* Privacy */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Privacidade e Dados</h2>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Seus dados são criptografados e armazenados com segurança. Você tem controle total
              sobre suas informações.
            </p>
            <Separator />
            <Button variant="outline" className="w-full">
              Exportar Meus Dados
            </Button>
            <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
              Excluir Minha Conta
            </Button>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  );
}