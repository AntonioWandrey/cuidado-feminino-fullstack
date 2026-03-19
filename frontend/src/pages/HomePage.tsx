import { useState } from "react";
import { Sparkles, Stethoscope, Calendar, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import WellnessTipsCarousel from "@/components/WellnessTipsCarousel";
import SymptomForm from "@/components/SymptomForm";

interface HomePageProps {
  onNavigate: (tab: string) => void;
}

const HomePage = ({ onNavigate }: HomePageProps) => {
  const [symptomOpen, setSymptomOpen] = useState(false);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm text-muted-foreground">{greeting()} 💕</p>
        <h1 className="text-2xl font-bold text-foreground mt-0.5">Minha Saúde Feminina</h1>
      </div>

      {/* How am I today */}
      <button
        onClick={() => setSymptomOpen(true)}
        className="w-full bg-primary text-primary-foreground rounded-2xl p-4 flex items-center gap-3 shadow-sm active:scale-[0.98] transition-transform"
      >
        <div className="p-2 rounded-xl bg-primary-foreground/20">
          <Sparkles size={24} strokeWidth={1.8} />
        </div>
        <div className="text-left">
          <p className="font-bold text-sm">Como estou hoje?</p>
          <p className="text-xs opacity-80">Registre seus sintomas e humor</p>
        </div>
      </button>

      {/* Tips */}
      <div>
        <h2 className="font-bold text-sm text-foreground mb-3">💡 Dicas de Bem-estar</h2>
        <WellnessTipsCarousel />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-bold text-sm text-foreground mb-3">Acesso rápido</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: BookOpen, label: "Trilhas", tab: "trilhas" },
            { icon: Calendar, label: "Calendário", tab: "calendario" },
            { icon: Stethoscope, label: "Sintomas", action: () => setSymptomOpen(true) },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                onClick={() => item.action ? item.action() : item.tab && onNavigate(item.tab)}
                className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-shadow active:scale-95"
              >
                <div className="p-2 rounded-xl bg-accent">
                  <Icon size={20} className="text-primary" strokeWidth={1.8} />
                </div>
                <span className="text-xs font-semibold text-foreground">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <SymptomForm open={symptomOpen} onClose={() => setSymptomOpen(false)} />
    </div>
  );
};

export default HomePage;
