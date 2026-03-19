import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import HomePage from "@/pages/HomePage";
import TrilhasPage from "@/pages/TrilhasPage";
import CalendarioPage from "@/pages/CalendarioPage";
import PerfilPage from "@/pages/PerfilPage";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");

  const renderPage = () => {
    switch (activeTab) {
      case "home":
        return <HomePage onNavigate={setActiveTab} />;
      case "trilhas":
        return <TrilhasPage />;
      case "calendario":
        return <CalendarioPage />;
      case "perfil":
        return <PerfilPage />;
      default:
        return <HomePage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
        {renderPage()}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
