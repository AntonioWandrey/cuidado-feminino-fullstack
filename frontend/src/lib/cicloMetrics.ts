export const classificarRegularidade = (
  ciclosRegistrados: number,
  desvioPadrao: number | null
) => {
  if (ciclosRegistrados === 0) return "Sem dados";
  if (ciclosRegistrados < 4 || desvioPadrao === null) return "Poucos dados";
  return desvioPadrao <= 3 ? "Regular" : "Variável";
};
