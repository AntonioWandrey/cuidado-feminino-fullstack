import { useState } from "react";
import { Heart, Droplets, Moon, Apple } from "lucide-react";

const tips = [
  { icon: Heart, title: "Cuide do coração", text: "30 minutos de caminhada diária reduzem riscos cardiovasculares.", color: "text-primary" },
  { icon: Droplets, title: "Hidrate-se", text: "Beba ao menos 2 litros de água por dia para manter o corpo saudável.", color: "text-blue-400" },
  { icon: Moon, title: "Sono reparador", text: "Durma entre 7 a 9 horas por noite para melhorar o bem-estar.", color: "text-indigo-400" },
  { icon: Apple, title: "Alimentação equilibrada", text: "Inclua frutas e vegetais variados em cada refeição.", color: "text-green-500" },
];

const WellnessTipsCarousel = () => {
  const [current, setCurrent] = useState(0);

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {tips.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <div key={i} className="min-w-full px-1">
                <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-accent">
                      <Icon size={24} className={tip.color} strokeWidth={1.8} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm text-foreground">{tip.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tip.text}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex justify-center gap-1.5 mt-3">
        {tips.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-200 ${
              i === current ? "w-6 bg-primary" : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default WellnessTipsCarousel;
