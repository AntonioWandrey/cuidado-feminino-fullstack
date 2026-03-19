export interface User {
  id: string;
  name: string;
  birthDate: string;
  email: string;
  phone: string;
  lastPeriodDate?: string;
  cycleLength?: number;
  notifications: boolean;
}

export interface SymptomLog {
  id: string;
  userId: string;
  date: string;
  mood: "bem" | "normal" | "cansada" | "desconfortavel";
  symptoms: string[];
  discharge?: string;
  otherSigns: string[];
  alertTriggered: boolean;
  notes?: string;
}

export interface Article {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  readTime: string;
  tags: string[];
}

export interface Appointment {
  id: string;
  userId: string;
  date: Date;
  title: string;
  type: "consulta" | "vacina" | "exame";
  notes?: string;
}
