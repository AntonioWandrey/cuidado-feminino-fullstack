import { useState } from "react";
import {
  X,
  AlertTriangle,
  ThermometerSun,
  Droplets,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/services/api";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SymptomFormProps {
  open: boolean;
  onClose: () => void;
}

const moodOptions = [
  { label: "😊 Bem", value: "bem" },
  { label: "😐 Normal", value: "normal" },
  { label: "😔 Cansada", value: "cansada" },
  { label: "😣 Desconfortável", value: "desconfortavel" },
];

const symptomOptions = [
  { label: "Dor de cabeça", value: "dor_cabeca" },
  { label: "Cólicas", value: "colicas" },
  { label: "Dor pélvica", value: "dor_pelvica", alert: true },
  { label: "Inchaço", value: "inchaco" },
  { label: "Náusea", value: "nausea" },
  { label: "Fadiga", value: "fadiga" },
  { label: "Ardência ao urinar", value: "ardencia_urinar", alert: true },
];

const dischargeOptions = [
  { label: "Transparente / claro", value: "transparente" },
  { label: "Branco sem odor", value: "branco" },
  { label: "Amarelado / esverdeado", value: "amarelado_esverdeado", alert: true },
  { label: "Acinzentado", value: "acinzentado", alert: true },
  { label: "Grumoso com coceira", value: "grumoso_coceira", alert: true },
];

const otherAlertOptions = [
  { label: "Odor forte / fétido", value: "odor_forte", alert: true },
  { label: "Coceira intensa", value: "coceira_intensa", alert: true },
  { label: "Sangramento fora do período", value: "sangramento", alert: true },
];

const SymptomForm = ({ open, onClose }: SymptomFormProps) => {
  const [mood, setMood] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [discharge, setDischarge] = useState("");
  const [otherAlerts, setOtherAlerts] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState("");

  const toggle = (list: string[], val: string, setter: React.Dispatch<React.SetStateAction<string[]>>) =>
    setter(list.includes(val) ? list.filter((s) => s !== val) : [...list, val]);

  const hasAlertSymptom =
    symptoms.some((s) => symptomOptions.find((o) => o.value === s)?.alert) ||
    dischargeOptions.find((o) => o.value === discharge)?.alert ||
    otherAlerts.some((s) => otherAlertOptions.find((o) => o.value === s)?.alert);

  const handleSubmit = async () => {
    if (!mood) {
      setValidationError("Por favor, selecione como você está se sentindo antes de enviar.");
      return;
    }

    try {
      const dadosParaOBanco = {
        faseVida: mood,
        corMuco: discharge || "Não informado",
        possuiOdor: otherAlerts.includes("odor_forte"),
        dorPelvica: symptoms.includes("dor_pelvica"),
      };

      await api.post("/registrar", dadosParaOBanco);
      setSubmitted(true);
    } catch (error) {
      console.error("Erro ao salvar no MySQL:", error);
    }
  };

  const handleReset = () => {
    setMood("");
    setSymptoms([]);
    setDischarge("");
    setOtherAlerts([]);
    setSubmitted(false);
    setValidationError("");
    onClose();
  };

  const openMaps = () => {
    window.open("https://www.google.com/maps/search/UBS+proxima", "_blank");
  };

  if (!open) return null;

  const chipClass = (active: boolean) =>
    cn(
      "px-3 py-2 rounded-2xl border text-xs font-medium transition-all",
      active
        ? "border-primary bg-accent text-accent-foreground"
        : "border-border bg-card text-foreground hover:border-primary/50"
    );

  return (
<div className="fixed inset-0 z-[80] bg-black/60 flex items-end justify-center backdrop-blur-sm">
<div className="bg-background w-full max-w-lg rounded-t-3xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        
        {/* Header Fixo */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-lg text-foreground">Check-up de Sinais</h2>
          <button onClick={handleReset} className="p-1 rounded-full hover:bg-muted">
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Área de Scroll - Conteúdo do Form */}
        <ScrollArea className="flex-1 overflow-y-auto pr-4">
          <div className="p-5 space-y-8 pb-10">
            {!submitted ? (
              <>
                {/* Humor */}
                <div>
                  <h3 className="font-semibold text-sm text-foreground mb-3">Como você está se sentindo?</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {moodOptions.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => { setMood(m.value); setValidationError(""); }}
                        className={cn(
                          "p-3 rounded-2xl border text-sm font-medium transition-all",
                          mood === m.value ? "border-primary bg-accent text-accent-foreground" : "border-border bg-card text-foreground"
                        )}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                  {validationError && <p className="text-xs text-destructive mt-2">{validationError}</p>}
                </div>

                {/* Sintomas */}
                <div>
                  <h3 className="font-semibold text-sm text-foreground mb-3">Sintomas físicos</h3>
                  <div className="flex flex-wrap gap-2">
                    {symptomOptions.map((s) => (
                      <button key={s.value} onClick={() => toggle(symptoms, s.value, setSymptoms)} className={chipClass(symptoms.includes(s.value))}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Corrimento */}
                <div>
                  <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-1.5">
                    <Droplets size={14} /> Corrimento — Coloração e aspecto
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {dischargeOptions.map((d) => (
                      <button key={d.value} onClick={() => setDischarge(d.value)} className={chipClass(discharge === d.value)}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Outros Sinais */}
                <div>
                  <h3 className="font-semibold text-sm text-foreground mb-3">Outros sinais</h3>
                  <div className="flex flex-wrap gap-2">
                    {otherAlertOptions.map((o) => (
                      <button key={o.value} onClick={() => toggle(otherAlerts, o.value, setOtherAlerts)} className={chipClass(otherAlerts.includes(o.value))}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card de Alerta (Só aparece se houver sintomas críticos) */}
                {hasAlertSymptom && (
                  <div className="rounded-2xl border border-warning bg-warning-bg p-4 space-y-3">
                    <div className="flex gap-3 items-start">
                      <AlertTriangle size={22} className="text-warning shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-sm text-warning-foreground text-left">AVISO</p>
                        <p className="text-xs text-warning-foreground/80 mt-1 leading-relaxed text-left">
                          Seus sintomas sugerem a necessidade de avaliação profissional. Procure a UBS mais próxima.
                        </p>
                      </div>
                    </div>
                    <Button onClick={openMaps} variant="outline" size="sm" className="w-full rounded-2xl gap-2 border-warning text-warning-foreground">
                      <MapPin size={14} /> Localizar UBS via Maps
                    </Button>
                  </div>
                )}

                {/* BOTÃO DE REGISTRO - SEMPRE VISÍVEL NO FINAL DO CONTEÚDO */}
                <Button onClick={handleSubmit} className="w-full rounded-2xl py-6 text-md font-bold shadow-lg mt-4" size="lg">
                  Registrar Check-up
                </Button>
              </>
            ) : (
              /* Tela de Sucesso */
              <div className="text-center py-10 space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                  <ThermometerSun size={32} className="text-primary" />
                </div>
                <h3 className="font-bold text-xl text-foreground">Registrado com sucesso!</h3>
                <p className="text-sm text-muted-foreground">Seus sintomas foram salvos.</p>
                <Button onClick={handleReset} variant="outline" className="mt-6 rounded-2xl px-10">Fechar</Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default SymptomForm;