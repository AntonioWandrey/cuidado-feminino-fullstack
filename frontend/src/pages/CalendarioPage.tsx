import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Plus, X, Stethoscope, Syringe, FlaskConical, CalendarCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { appointmentSchema } from "@/lib/validations";

interface Appointment {
  date: Date;
  title: string;
  type: "consulta" | "vacina" | "exame";
}

const typeConfig = {
  consulta: { icon: Stethoscope, emoji: "🩺", label: "Consulta" },
  vacina: { icon: Syringe, emoji: "💉", label: "Vacina" },
  exame: { icon: FlaskConical, emoji: "🔬", label: "Exame" },
};

const suggestedReminders = [
  { title: "Consulta ginecológica anual", type: "consulta" as const },
  { title: "Preventivo (Papanicolau)", type: "exame" as const },
  { title: "Vacina HPV", type: "vacina" as const },
];

const CalendarioPage = () => {
  const [selected, setSelected] = useState<Date | undefined>();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"consulta" | "vacina" | "exame">("consulta");
  const [titleError, setTitleError] = useState("");

  const handleAdd = () => {
    if (!selected) return;

    const result = appointmentSchema.safeParse({
      title: newTitle.trim(),
      type: newType,
      date: selected.toISOString(),
    });

    if (!result.success) {
      const titleErr = result.error.errors.find((e) => e.path[0] === "title");
      setTitleError(titleErr?.message || "Dados inválidos");
      return;
    }

    setTitleError("");
    setAppointments((prev) => [...prev, { date: selected, title: result.data.title, type: newType }]);
    setNewTitle("");
    setShowForm(false);
  };

  const addSuggested = (s: typeof suggestedReminders[0]) => {
    if (!selected) return;
    setAppointments((prev) => [...prev, { date: selected, title: s.title, type: s.type }]);
  };

  const remove = (index: number) => setAppointments((prev) => prev.filter((_, i) => i !== index));

  const selectedApts = appointments.filter(
    (a) => selected && a.date.toDateString() === selected.toDateString()
  );

  const totalCount = appointments.length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Calendário</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {totalCount > 0
            ? `${totalCount} compromisso${totalCount > 1 ? "s" : ""} agendado${totalCount > 1 ? "s" : ""}`
            : "Acompanhe consultas, exames e vacinas"}
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-3 shadow-sm">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={setSelected}
          locale={pt}
          className="pointer-events-auto"
          modifiers={{ booked: appointments.map((a) => a.date) }}
          modifiersClassNames={{ booked: "bg-primary/20 text-primary font-bold rounded-full" }}
        />
      </div>

      {selected && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-foreground">
              {format(selected, "dd 'de' MMMM", { locale: pt })}
            </h2>
            <Button size="sm" onClick={() => { setShowForm(!showForm); setTitleError(""); }} className="rounded-2xl gap-1.5 text-xs">
              <Plus size={14} /> Agendar
            </Button>
          </div>

          {showForm && (
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3 shadow-sm">
              <div>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => { setNewTitle(e.target.value.slice(0, 100)); setTitleError(""); }}
                  placeholder="Ex: Consulta ginecológica"
                  maxLength={100}
                  className={cn(
                    "w-full bg-background border rounded-2xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2",
                    titleError ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"
                  )}
                />
                {titleError && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {titleError}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {(Object.keys(typeConfig) as Array<keyof typeof typeConfig>).map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewType(t)}
                    className={cn(
                      "flex-1 py-2 rounded-2xl border text-xs font-medium transition-all",
                      newType === t
                        ? "border-primary bg-accent text-accent-foreground"
                        : "border-border bg-card text-foreground"
                    )}
                  >
                    {typeConfig[t].emoji} {typeConfig[t].label}
                  </button>
                ))}
              </div>
              <Button onClick={handleAdd} className="w-full rounded-2xl" size="sm">
                Confirmar
              </Button>

              {/* Suggestions */}
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Sugestões rápidas:</p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedReminders.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => addSuggested(s)}
                      className="px-2.5 py-1.5 rounded-2xl border border-border bg-accent text-xs text-accent-foreground hover:bg-primary/10 transition-colors"
                    >
                      {typeConfig[s.type].emoji} {s.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedApts.length > 0 ? (
            <div className="space-y-2">
              {selectedApts.map((apt, i) => {
                const config = typeConfig[apt.type];
                const Icon = config.icon;
                return (
                  <div key={i} className="bg-card border border-border rounded-2xl p-3 flex items-center gap-3 shadow-sm">
                    <div className="p-2 rounded-xl bg-accent">
                      <Icon size={18} className="text-primary" strokeWidth={1.8} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-foreground">{apt.title}</p>
                      <p className="text-xs text-muted-foreground">{config.label}</p>
                    </div>
                    <button onClick={() => remove(appointments.indexOf(apt))} className="p-1 rounded-full hover:bg-muted">
                      <X size={16} className="text-muted-foreground" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 space-y-2">
              <CalendarCheck size={28} className="text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Nenhum compromisso nesta data</p>
              <p className="text-xs text-muted-foreground">Toque em "Agendar" para adicionar</p>
            </div>
          )}
        </div>
      )}

      {!selected && (
        <div className="bg-accent/50 rounded-2xl p-5 text-center space-y-2">
          <CalendarCheck size={28} className="text-primary mx-auto" />
          <p className="text-sm font-medium text-foreground">Selecione uma data</p>
          <p className="text-xs text-muted-foreground">
            Toque em um dia no calendário para ver ou agendar compromissos
          </p>
        </div>
      )}
    </div>
  );
};

export default CalendarioPage;
