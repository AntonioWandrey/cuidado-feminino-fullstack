import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  ChevronRight,
  HelpCircle,
  LogOut,
  Settings,
  Shield,
  User,
} from "lucide-react";
import { getCiclos } from "@/services/cicloService";
import { getPrevisao } from "@/services/cicloService";

const MenuItem = ({
  icon: Icon,
  label,
  sub,
  color = "#6b5a5e",
}: {
  icon: React.ElementType;
  label: string;
  sub?: string;
  color?: string;
}) => (
  <button
    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-opacity active:opacity-70"
    style={{ backgroundColor: "#fff", border: "1px solid #FBD9E5" }}
  >
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: "#FBD9E5" }}
    >
      <Icon size={18} style={{ color }} />
    </div>
    <div className="flex-1 text-left">
      <p className="text-sm font-semibold" style={{ color: "#3d2529" }}>
        {label}
      </p>
      {sub && (
        <p className="text-xs" style={{ color: "#9ca3af" }}>
          {sub}
        </p>
      )}
    </div>
    <ChevronRight size={16} style={{ color: "#C56682" }} />
  </button>
);

const PerfilPage = () => {
  const { data: ciclos } = useQuery({
    queryKey: ["ciclos"],
    queryFn: getCiclos,
    retry: 1,
  });

  const { data: previsao } = useQuery({
    queryKey: ["previsao"],
    queryFn: getPrevisao,
    retry: 1,
  });

  const ciclosRegistrados = ciclos?.length ?? 0;
  const mediaCiclo = previsao ? Math.round(previsao.mediaDuracaoCiclo) : null;
  const confianca = previsao?.confianca;

  const regularidade =
    confianca === "ALTA"
      ? "Regular"
      : confianca === "MEDIA"
      ? "Moderada"
      : ciclosRegistrados === 0
      ? "Sem dados"
      : "Irregular";

  return (
    <div className="space-y-5">
      {/* Header */}
      <h1 className="text-2xl font-bold" style={{ color: "#3d2529" }}>
        Perfil
      </h1>

      {/* Avatar + nome */}
      <div
        className="rounded-2xl p-5 flex items-center gap-4 shadow-sm"
        style={{ backgroundColor: "#fff", border: "1px solid #FBD9E5" }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "#C43A4A" }}
        >
          <span className="text-3xl">🌺</span>
        </div>
        <div>
          <p className="text-lg font-bold" style={{ color: "#3d2529" }}>
            Minha Conta
          </p>
          <p className="text-sm" style={{ color: "#C56682" }}>
            MS Feminina
          </p>
        </div>
      </div>

      {/* Estatísticas do ciclo */}
      <div>
        <p className="text-xs font-bold mb-2 px-1" style={{ color: "#C56682" }}>
          MEU CICLO
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              valor: String(ciclosRegistrados),
              label: "Ciclos registrados",
            },
            {
              valor: mediaCiclo ? `${mediaCiclo}d` : "—",
              label: "Duração média",
            },
            {
              valor: regularidade,
              label: "Regularidade",
            },
          ].map(({ valor, label }) => (
            <div
              key={label}
              className="rounded-2xl p-3 text-center shadow-sm"
              style={{ backgroundColor: "#fff", border: "1px solid #FBD9E5" }}
            >
              <p
                className="text-xl font-bold"
                style={{ color: "#C43A4A" }}
              >
                {valor}
              </p>
              <p
                className="text-[10px] mt-0.5 leading-tight"
                style={{ color: "#9ca3af" }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="space-y-2">
        <p className="text-xs font-bold mb-2 px-1" style={{ color: "#C56682" }}>
          CONFIGURAÇÕES
        </p>
        <MenuItem
          icon={Settings}
          label="Configurações"
          sub="Notificações e preferências"
          color="#C43A4A"
        />
        <MenuItem
          icon={Bell}
          label="Lembretes"
          sub="Anticoncepcional, consultas, exames"
          color="#C43A4A"
        />
        <MenuItem
          icon={Shield}
          label="Privacidade e LGPD"
          sub="Seus dados são seus"
          color="#4A90C4"
        />
        <MenuItem
          icon={HelpCircle}
          label="Ajuda e Suporte"
          sub="Tire suas dúvidas"
          color="#E8B84A"
        />
        <MenuItem
          icon={User}
          label="Editar Perfil"
          sub="Nome, data de nascimento"
          color="#C56682"
        />
      </div>

      {/* Sair */}
      <button
        className="w-full flex items-center justify-center gap-2 rounded-2xl p-3.5 text-sm font-semibold"
        style={{ backgroundColor: "#FBD9E5", color: "#C43A4A" }}
      >
        <LogOut size={16} />
        Sair da conta
      </button>

      {/* Versão */}
      <p className="text-center text-xs py-2" style={{ color: "#9ca3af" }}>
        MS Feminina v0.1.0 · Sprint 02
        <br />
        ⚠️ As informações deste app não substituem avaliação médica.
      </p>
    </div>
  );
};

export default PerfilPage;
