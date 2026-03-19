import { z } from "zod";

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .max(80, "Nome deve ter no máximo 80 caracteres")
    .regex(/^[^<>"'&]*$/, "Caracteres especiais não permitidos"),
  birthDate: z.string().optional(),
  email: z
    .string()
    .trim()
    .email("E-mail inválido")
    .max(120, "E-mail deve ter no máximo 120 caracteres")
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .max(20, "Telefone deve ter no máximo 20 caracteres")
    .regex(/^[\d()\s\-+]*$/, "Formato de telefone inválido")
    .or(z.literal("")),
  cycleLength: z
    .number()
    .int()
    .min(20, "Mínimo 20 dias")
    .max(45, "Máximo 45 dias"),
  notifications: z.boolean(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const appointmentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Título é obrigatório")
    .max(100, "Título deve ter no máximo 100 caracteres")
    .regex(/^[^<>"'&]*$/, "Caracteres especiais não permitidos"),
  type: z.enum(["consulta", "vacina", "exame"]),
  date: z.string().min(1, "Data é obrigatória"),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;

export const symptomLogSchema = z.object({
  mood: z.enum(["bem", "normal", "cansada", "desconfortavel"]),
  symptoms: z.array(z.string()),
  discharge: z.string().optional(),
  otherSigns: z.array(z.string()),
});

export type SymptomLogFormData = z.infer<typeof symptomLogSchema>;
