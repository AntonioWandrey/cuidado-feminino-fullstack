import { describe, expect, it } from "vitest";
import { classificarRegularidade } from "./cicloMetrics";

describe("classificarRegularidade", () => {
  it("não classifica regularidade sem histórico suficiente", () => {
    expect(classificarRegularidade(0, null)).toBe("Sem dados");
    expect(classificarRegularidade(3, 0)).toBe("Poucos dados");
  });

  it("usa a variação dos intervalos quando existe histórico suficiente", () => {
    expect(classificarRegularidade(4, 1.5)).toBe("Regular");
    expect(classificarRegularidade(4, 4.2)).toBe("Variável");
  });
});
