import { useState } from "react";
import { useLocation } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import HomePage from "@/pages/HomePage";
import CalendarioPage from "@/pages/CalendarioPage";
import ConteudosPage from "@/pages/ConteudosPage";
import PerfilPage from "@/pages/PerfilPage";

const Index = () => {
  const location = useLocation();
  const returnTab = (location.state as { returnTab?: string } | null)?.returnTab;
  const [activeTab, setActiveTab] = useState(returnTab || "home");

  const renderPage = () => {
    switch (activeTab) {
      case "home":
        return <HomePage onNavigate={setActiveTab} />;
      case "calendario":
        return <CalendarioPage />;
      case "conteudos":
        return <ConteudosPage />;
      case "perfil":
        return <PerfilPage />;
      default:
        return <HomePage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF4EB]">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
        {renderPage()}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
