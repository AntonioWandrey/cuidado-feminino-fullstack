import { useState } from "react";
import { User, Bell, Shield, HelpCircle, LogOut, Save, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { profileSchema, type ProfileFormData } from "@/lib/validations";

interface ProfileData {
  name: string;
  birthDate: string;
  email: string;
  phone: string;
  cycleLength: string;
  notifications: boolean;
}

const defaultProfile: ProfileData = {
  name: "",
  birthDate: "",
  email: "",
  phone: "",
  cycleLength: "28",
  notifications: true,
};

const PerfilPage = () => {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: keyof ProfileData, value: string | boolean) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSave = () => {
    const parsed = profileSchema.safeParse({
      name: profile.name,
      birthDate: profile.birthDate || undefined,
      email: profile.email,
      phone: profile.phone,
      cycleLength: parseInt(profile.cycleLength) || 28,
      notifications: profile.notifications,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((e) => {
        const field = e.path[0] as string;
        fieldErrors[field] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setEditing(false);
    }, 1500);
  };

  const inputClass =
    "w-full bg-background border border-border rounded-2xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";
  const errorInputClass =
    "w-full bg-background border border-destructive rounded-2xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive";

  const FieldError = ({ field }: { field: string }) =>
    errors[field] ? (
      <p className="text-xs text-destructive mt-1 flex items-center gap-1">
        <AlertCircle size={12} /> {errors[field]}
      </p>
    ) : null;

  if (editing) {
    return (
      <div className="space-y-5">
        <button
          onClick={() => setEditing(false)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        <h1 className="text-xl font-bold text-foreground">Dados Pessoais</h1>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Nome completo</label>
            <input type="text" value={profile.name} onChange={(e) => update("name", e.target.value)} placeholder="Seu nome" maxLength={80} className={errors.name ? errorInputClass : inputClass} />
            <FieldError field="name" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Data de nascimento</label>
            <input type="date" value={profile.birthDate} onChange={(e) => update("birthDate", e.target.value)} className={errors.birthDate ? errorInputClass : inputClass} />
            <FieldError field="birthDate" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">E-mail</label>
            <input type="email" value={profile.email} onChange={(e) => update("email", e.target.value)} placeholder="seu@email.com" maxLength={120} className={errors.email ? errorInputClass : inputClass} />
            <FieldError field="email" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Telefone</label>
            <input type="tel" value={profile.phone} onChange={(e) => update("phone", e.target.value)} placeholder="(00) 00000-0000" maxLength={20} className={errors.phone ? errorInputClass : inputClass} />
            <FieldError field="phone" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Duração média do ciclo (dias)</label>
            <input type="number" value={profile.cycleLength} onChange={(e) => update("cycleLength", e.target.value)} min="20" max="45" className={errors.cycleLength ? errorInputClass : inputClass} />
            <FieldError field="cycleLength" />
          </div>
          <div className="flex items-center justify-between bg-card border border-border rounded-2xl p-4">
            <div>
              <p className="font-semibold text-sm text-foreground">Notificações</p>
              <p className="text-xs text-muted-foreground">Receber lembretes e alertas</p>
            </div>
            <button
              onClick={() => update("notifications", !profile.notifications)}
              className={cn(
                "w-11 h-6 rounded-full transition-colors relative",
                profile.notifications ? "bg-primary" : "bg-muted"
              )}
            >
              <div className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform", profile.notifications ? "left-[22px]" : "left-0.5")} />
            </button>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full rounded-2xl gap-2" size="lg">
          {saved ? "✓ Salvo!" : <><Save size={16} /> Salvar dados</>}
        </Button>
      </div>
    );
  }

  const menuItems = [
    { icon: User, label: "Dados pessoais", desc: "Nome, idade e informações", action: () => setEditing(true) },
    { icon: Bell, label: "Notificações", desc: "Alertas e lembretes" },
    { icon: Shield, label: "Privacidade", desc: "Segurança dos seus dados" },
    { icon: HelpCircle, label: "Ajuda", desc: "Perguntas frequentes" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center">
          <User size={36} className="text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="text-lg font-bold text-foreground mt-3">
          {profile.name || "Usuária"}
        </h1>
        <p className="text-sm text-muted-foreground">Cuidando da minha saúde 💕</p>
      </div>

      <div className="space-y-2">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={i}
              onClick={item.action}
              className="w-full bg-card border border-border rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow text-left"
            >
              <div className="p-2 rounded-xl bg-accent">
                <Icon size={18} className="text-primary" strokeWidth={1.8} />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      <button className="w-full flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground hover:text-destructive transition-colors">
        <LogOut size={16} /> Sair da conta
      </button>
    </div>
  );
};

export default PerfilPage;
