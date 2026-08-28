import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  encerrarCiclo,
  getCiclos,
  getPrevisao,
  registrarCiclo,
} from "./cicloService";

describe("cicloService local", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-27T12:00:00"));
  });

  afterEach(() => vi.useRealTimers());

  it("registra o início e mantém o ciclo após uma nova leitura", async () => {
    const criado = await registrarCiclo({ dataInicio: "2026-08-23" });

    expect(criado).toMatchObject({
      dataInicio: "2026-08-23",
      dataFim: null,
      duracaoDias: null,
      aberto: true,
    });
    await expect(getCiclos()).resolves.toEqual([criado]);
  });

  it("encerra o ciclo aberto e calcula a duração incluindo início e fim", async () => {
    const criado = await registrarCiclo({ dataInicio: "2026-08-23" });

    const encerrado = await encerrarCiclo(criado.id, "2026-08-27");

    expect(encerrado).toMatchObject({
      dataInicio: "2026-08-23",
      dataFim: "2026-08-27",
      duracaoDias: 5,
      aberto: false,
    });
    await expect(getCiclos()).resolves.toEqual([encerrado]);
  });

  it("impede iniciar outro ciclo enquanto existe um ciclo aberto", async () => {
    await registrarCiclo({ dataInicio: "2026-08-23" });

    await expect(
      registrarCiclo({ dataInicio: "2026-08-26" })
    ).rejects.toThrow("Já existe um ciclo em andamento");
  });

  it("impede encerrar antes da data de início", async () => {
    const criado = await registrarCiclo({ dataInicio: "2026-08-23" });

    await expect(encerrarCiclo(criado.id, "2026-08-22")).rejects.toThrow(
      "não pode ser anterior"
    );
  });

  it("calcula o próximo ciclo pela média dos intervalos registrados", async () => {
    const primeiro = await registrarCiclo({ dataInicio: "2026-06-29" });
    await encerrarCiclo(primeiro.id, "2026-07-03");
    const segundo = await registrarCiclo({ dataInicio: "2026-07-27" });
    await encerrarCiclo(segundo.id, "2026-07-31");
    const terceiro = await registrarCiclo({ dataInicio: "2026-08-24" });
    await encerrarCiclo(terceiro.id, "2026-08-27");

    const previsao = await getPrevisao();

    expect(previsao).toMatchObject({
      ciclosAnalisados: 3,
      mediaDuracaoCiclo: 28,
      proximaMenstruacao: "2026-09-21",
      dataOvulacao: "2026-09-07",
      inicioPeriodoFertil: "2026-09-02",
      fimPeriodoFertil: "2026-09-08",
      confianca: "BAIXA",
    });
  });

  it("avança a estimativa até a próxima data futura quando o histórico está antigo", async () => {
    const antigo = await registrarCiclo({ dataInicio: "2026-06-01" });
    await encerrarCiclo(antigo.id, "2026-06-05");

    const previsao = await getPrevisao();

    expect(previsao.proximaMenstruacao).toBe("2026-09-21");
  });

  it("impede encerrar um período sobrepondo outro já registrado", async () => {
    const existente = await registrarCiclo({ dataInicio: "2026-08-10" });
    await encerrarCiclo(existente.id, "2026-08-14");
    const sobreposto = await registrarCiclo({ dataInicio: "2026-08-09" });

    await expect(encerrarCiclo(sobreposto.id, "2026-08-12")).rejects.toThrow(
      "sobrepõe outro período"
    );
  });
});
