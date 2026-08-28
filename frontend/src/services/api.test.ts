import { describe, expect, it, vi } from "vitest";

const { responseErrors } = vi.hoisted(() => ({
  responseErrors: [] as Array<(error: unknown) => Promise<unknown>>,
}));

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        response: {
          use: vi.fn((_success, error) => responseErrors.push(error)),
        },
      },
    })),
  },
}));

describe("interceptor offline", () => {
  it("não transforma falha de conteúdo público ou administrativo em sucesso", async () => {
    await import("./api");
    const rejectNetworkError = responseErrors[0];
    const publicError = { code: "ERR_NETWORK", config: { url: "/api/conteudos" } };
    const adminError = { code: "ERR_NETWORK", config: { url: "/api/admin/conteudos" } };

    await expect(rejectNetworkError(publicError)).rejects.toBe(publicError);
    await expect(rejectNetworkError(adminError)).rejects.toBe(adminError);
  });
});
