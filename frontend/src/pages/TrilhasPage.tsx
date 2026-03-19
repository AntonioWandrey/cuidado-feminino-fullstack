import { useState } from "react";
import { ArrowLeft, Heart, Leaf, Sparkles, ShieldCheck, ChevronRight, BookOpen } from "lucide-react";

const categories = [
  {
    id: "intima",
    title: "Saúde Íntima",
    subtitle: "O que é normal?",
    icon: Heart,
    color: "from-pink-400 to-rose-300",
    content:
      "O muco fisiológico é transparente ou claro, sem odor e não causa coceira. No período fértil, torna-se elástico (semelhante a clara de ovo). Sinta-se segura: isso é sinal de saúde.",
    extra: [
      {
        title: "Sobre Corrimento Acinzentado",
        text: "Se notar cor acinzentada com odor fétido que piora após a relação, procure atendimento. Pode ser um desequilíbrio da flora vaginal que requer tratamento médico.",
      },
    ],
  },
  {
    id: "ciclos",
    title: "Ciclos de Vida",
    subtitle: "Da menarca à senescência",
    icon: Leaf,
    color: "from-emerald-400 to-teal-300",
    content:
      "Da menarca à senescência, seu corpo muda. O app adapta orientações sobre puberdade, planejamento familiar, climatério e saúde na terceira idade.",
    extra: [
      {
        title: "Sobre Menopausa (Climatério)",
        text: "Nesta fase, é comum sentir ondas de calor e ressecamento vaginal. O uso de lubrificantes e o acompanhamento na UBS podem melhorar muito sua qualidade de vida.",
      },
      {
        title: "Sobre Planejamento Familiar",
        text: "A UBS oferece gratuitamente diversos métodos contraceptivos. Escolha o que melhor se adapta à sua rotina com auxílio profissional.",
      },
    ],
  },
  {
    id: "autocuidado",
    title: "Autocuidado Diário",
    subtitle: "Hábitos que transformam",
    icon: Sparkles,
    color: "from-violet-400 to-purple-300",
    content:
      "Mantenha higiene íntima apenas externa, rotina de sono regular e alimentação equilibrada. Pratique exercícios ao menos 3x por semana.",
    extra: [],
  },
  {
    id: "prevencao",
    title: "Prevenção e Exames",
    subtitle: "Diagnóstico precoce salva vidas",
    icon: ShieldCheck,
    color: "from-amber-400 to-orange-300",
    content:
      "Não esqueça o preventivo (Papanicolau) e mantenha sua vacinação (HPV) em dia. O diagnóstico precoce salva vidas.",
    extra: [],
  },
];

const TrilhasPage = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const category = categories.find((c) => c.id === selectedId);

  if (category) {
    const Icon = category.icon;
    return (
      <div className="space-y-5">
        <button
          onClick={() => setSelectedId(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} /> Voltar
        </button>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className={`bg-gradient-to-r ${category.color} p-5 flex items-center gap-3`}>
            <div className="p-2.5 rounded-xl bg-white/25">
              <Icon size={26} className="text-white" strokeWidth={1.8} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">{category.title}</h1>
              <p className="text-xs text-white/80">{category.subtitle}</p>
            </div>
          </div>
          <div className="p-5">
            <p className="text-sm text-foreground leading-relaxed">{category.content}</p>
          </div>
        </div>

        {category.extra.map((item, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-primary" strokeWidth={1.8} />
              <h3 className="font-bold text-sm text-foreground">{item.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Trilhas de Conteúdo</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Informação científica e validada para o seu cuidado
        </p>
      </div>
      <div className="space-y-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedId(cat.id)}
              className="w-full bg-card border border-border rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow active:scale-[0.98] text-left"
            >
              <div className={`p-3 rounded-xl bg-gradient-to-br ${cat.color} shrink-0`}>
                <Icon size={22} className="text-white" strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-foreground">{cat.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{cat.subtitle}</p>
              </div>
              <ChevronRight size={18} className="text-muted-foreground shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TrilhasPage;
