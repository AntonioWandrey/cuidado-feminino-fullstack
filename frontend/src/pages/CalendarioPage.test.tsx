import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CalendarioPage from "./CalendarioPage";

vi.mock("@/components/ui/calendar", () => ({
  Calendar: () => <div aria-label="calendário menstrual" />,
}));

vi.mock("@/services/queixaService", () => ({
  getQueixasPorPeriodo: vi.fn().mockResolvedValue([]),
}));

describe("CalendarioPage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-08-27T12:00:00"));
  });

  afterEach(() => vi.useRealTimers());

  it("permite iniciar e encerrar um período mantendo o registro no histórico", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    render(
      <QueryClientProvider client={client}>
        <CalendarioPage />
      </QueryClientProvider>
    );

    expect(await screen.findByText("Dados salvos neste dispositivo")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Registrar início do período" }));

    await waitFor(() => {
      expect(screen.getByText("Em andamento")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Encerrar período" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Encerrar período" }));

    await waitFor(() => {
      expect(screen.getByText("1 dia")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Registrar início do período" })).toBeInTheDocument();
    });
  });
});
