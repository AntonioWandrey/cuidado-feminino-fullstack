import { useState } from "react";
import { X, AlertTriangle, ThermometerSun, Droplets, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { symptomLogSchema } from "@/lib/validations";

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

  const handleSubmit = () => {
    const result = symptomLogSchema.safeParse({
      mood,
      symptoms,
      discharge: discharge || undefined,
      otherSigns: otherAlerts,
    });

    if (!result.success) {
      setValidationError("Selecione como você está se sentindo.");
      return;
    }

    setValidationError("");
    setSubmitted(true);
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
    window.open("https://www.google.com/maps/search/UBS+Unidade+Básica+de+Saúde", "_blank", "noopener,noreferrer");
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
    <div className="fixed inset-0 z-50 bg-foreground/30 flex items-end justify-center">
      <div className="bg-background w-full max-w-lg rounded-t-3xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        <div className="sticky top-0 bg-background z-10 flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-bold text-lg text-foreground">Check-up de Sinais</h2>
          <button onClick={handleReset} className="p-1 rounded-full hover:bg-muted">
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {!submitted ? (
            <>
              {/* Mood */}
              <div>
                <h3 className="font-semibold text-sm text-foreground mb-2">Como você está se sentindo?</h3>
                <div className="grid grid-cols-2 gap-2">
                  {moodOptions.map((m) => (
                    <button key={m.value} onClick={() => { setMood(m.value); setValidationError(""); }} className={cn("p-3 rounded-2xl border text-sm font-medium transition-all", mood === m.value ? "border-primary bg-accent text-accent-foreground" : "border-border bg-card text-foreground hover:border-primary/50")}>
                      {m.label}
                    </button>
                  ))}
                </div>
                {validationError && (
                  <p className="text-xs text-destructive mt-2">{validationError}</p>
                )}
              </div>

              {/* Symptoms */}
              <div>
                <h3 className="font-semibold text-sm text-foreground mb-2">Sintomas físicos</h3>
                <div className="flex flex-wrap gap-2">
                  {symptomOptions.map((s) => (
                    <button key={s.value} onClick={() => toggle(symptoms, s.value, setSymptoms)} className={chipClass(symptoms.includes(s.value))}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discharge */}
              <div>
                <h3 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-1.5">
                  <Droplets size={14} strokeWidth={1.8} /> Corrimento — Coloração e aspecto
                </h3>
                <div className="flex flex-wrap gap-2">
                  {dischargeOptions.map((d) => (
                    <button key={d.value} onClick={() => setDischarge(d.value)} className={chipClass(discharge === d.value)}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Other alerts */}
              <div>
                <h3 className="font-semibold text-sm text-foreground mb-2">Outros sinais</h3>
                <div className="flex flex-wrap gap-2">
                  {otherAlertOptions.map((o) => (
                    <button key={o.value} onClick={() => toggle(otherAlerts, o.value, setOtherAlerts)} className={chipClass(otherAlerts.includes(o.value))}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alert card */}
              {hasAlertSymptom && (
                <div className="rounded-2xl border border-warning bg-warning-bg p-4 space-y-3">
                  <div className="flex gap-3 items-start">
                    <AlertTriangle size={22} className="text-warning shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm text-warning-foreground">AVISO</p>
                      <p className="text-xs text-warning-foreground/80 mt-1 leading-relaxed">
                        Seus sintomas sugerem a necessidade de avaliação profissional. Procure a Unidade Básica de Saúde (Postinho) mais próxima para exame físico e orientação.
                      </p>
                    </div>
                  </div>
                  <Button onClick={openMaps} variant="outline" size="sm" className="w-full rounded-2xl gap-2 border-warning text-warning-foreground hover:bg-warning/10">
                    <MapPin size={14} /> Localizar UBS via Maps
                  </Button>
                </div>
              )}

              <Button onClick={handleSubmit} className="w-full rounded-2xl" size="lg">
                Registrar sintomas
              </Button>
            </>
          ) : (
            <div className="text-center py-8 space-y-3">
              <div className="mx-auto w-14 h-14 rounded-full bg-accent flex items-center justify-center">
                <ThermometerSun size={28} className="text-primary" />
              </div>
              <h3 className="font-bold text-foreground">Registrado com sucesso!</h3>
              <p className="text-sm text-muted-foreground">
                Seus sintomas foram salvos. Continue monitorando seu bem-estar.
              </p>
              {hasAlertSymptom && (
                <div className="rounded-2xl border border-warning bg-warning-bg p-4 space-y-3 text-left mt-4">
                  <p className="text-xs text-warning-foreground font-medium">
                    ⚠️ Lembre-se: procure uma UBS para avaliação dos sintomas relatados.
                  </p>
                  <Button onClick={openMaps} variant="outline" size="sm" className="w-full rounded-2xl gap-2 border-warning text-warning-foreground hover:bg-warning/10">
                    <MapPin size={14} /> Localizar UBS via Maps
                  </Button>
                </div>
              )}
              <Button onClick={handleReset} variant="outline" className="mt-4 rounded-2xl">
                Fechar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SymptomForm;
