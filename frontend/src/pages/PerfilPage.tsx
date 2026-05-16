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
  <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-opacity active:opacity-70 bg-white border border-[#FBD9E5]">
    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#FBD9E5]">
      <Icon size={18} style={{ color }} />
    </div>
    <div className="flex-1 text-left">
      <p className="text-sm font-semibold text-[#3d2529]">{label}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
    <ChevronRight size={16} className="text-[#C56682]" />
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
      <h1 className="text-2xl font-bold text-[#3d2529]">Perfil</h1>

      <div className="rounded-2xl p-5 flex items-center gap-4 shadow-sm bg-white border border-[#FBD9E5]">
        <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 bg-[#C43A4A]">
          <span className="text-3xl">🌺</span>
        </div>
        <div>
          <p className="text-lg font-bold text-[#3d2529]">Minha Conta</p>
          <p className="text-sm text-[#C56682]">MS Feminina</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold mb-2 px-1 text-[#C56682]">MEU CICLO</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { valor: String(ciclosRegistrados), label: "Ciclos registrados" },
            { valor: mediaCiclo ? `${mediaCiclo}d` : "—", label: "Duração média" },
            { valor: regularidade, label: "Regularidade" },
          ].map(({ valor, label }) => (
            <div
              key={label}
              className="rounded-2xl p-3 text-center shadow-sm bg-white border border-[#FBD9E5]"
            >
              <p className="text-xl font-bold text-[#C43A4A]">{valor}</p>
              <p className="text-[10px] mt-0.5 leading-tight text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold mb-2 px-1 text-[#C56682]">CONFIGURAÇÕES</p>
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

      <button className="w-full flex items-center justify-center gap-2 rounded-2xl p-3.5 text-sm font-semibold bg-[#FBD9E5] text-[#C43A4A]">
        <LogOut size={16} />
        Sair da conta
      </button>

      <p className="text-center text-xs py-2 text-gray-400">
        MS Feminina v0.1.0 · Sprint 02
        <br />
        ⚠️ As informações deste app não substituem avaliação médica.
      </p>
    </div>
  );
};

export default PerfilPage;
