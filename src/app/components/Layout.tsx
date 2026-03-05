import { Outlet, NavLink, useNavigate } from "react-router";
import { Heart, Home, MessageCircle, FileText, Settings as SettingsIcon, Activity, Bot, Users, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { authService } from "../utils/auth";
import { Button } from "./ui/button";

export function Layout() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
  };

  const navItems = [
    { to: "/", icon: Home, label: "Início" },
    { to: "/mood", icon: Activity, label: "Humor" },
    { to: "/panic", icon: Heart, label: "Pânico" },
    { to: "/ai-chat", icon: Bot, label: "Chat IA" },
    { to: "/anonymous-chat", icon: Users, label: "Chat Anônimo" },
    { to: "/community", icon: MessageCircle, label: "Comunidade" },
    { to: "/reports", icon: FileText, label: "Relatórios" },
    { to: "/settings", icon: SettingsIcon, label: "Configurações" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow bg-white/80 backdrop-blur-sm border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-6 mb-8">
            <Heart className="h-8 w-8 text-purple-600" />
            <span className="ml-3 text-xl font-semibold text-gray-900">MindCare</span>
          </div>
          
          {user && (
            <div className="px-6 mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Avatar>
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : (
                    <AvatarFallback className="bg-purple-600 text-white">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          <nav className="mt-5 flex-1 px-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-purple-100 text-purple-900"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="px-3 mt-4">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1 pb-20 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 z-50">
        <div className="grid grid-cols-5 gap-1">
          {navItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center px-2 py-2 text-xs transition-colors ${
                  isActive ? "text-purple-600" : "text-gray-600"
                }`
              }
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-[10px] truncate max-w-full">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

function getInitials(name: string): string {
  const names = name.split(" ");
  return names.map((n) => n[0]).join("");
}