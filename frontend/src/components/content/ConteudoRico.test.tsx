import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ConteudoRico } from "./ConteudoRico";

describe("ConteudoRico", () => {
  it("remove scripts, eventos e URLs inseguras sem perder o texto", () => {
    const { container } = render(
      <ConteudoRico
        html={'<p>Seguro</p><img src="data:image/svg+xml,x" onerror="alert(1)"><a href="javascript:alert(2)">armadilha</a><script>alert(3)</script>'}
      />,
    );

    expect(screen.getByText("Seguro")).toBeInTheDocument();
    expect(container.querySelector("script")).not.toBeInTheDocument();
    expect(container.querySelector("[onerror]")).not.toBeInTheDocument();
    expect(container.querySelector("img")).not.toHaveAttribute("src");
    expect(screen.getByText("armadilha").closest("a")).not.toHaveAttribute("href");
  });

  it("preserva mídia HTTPS, cor aprovada e protege links externos", () => {
    const { container } = render(
      <ConteudoRico
        html={'<p><span style="color: #8F344D">Cor</span></p><img src="https://cdn.exemplo.com/foto.jpg" alt="Exame"><a href="https://saude.gov.br/artigo">Fonte</a>'}
      />,
    );

    expect(container.querySelector("span")).toHaveStyle({ color: "#8F344D" });
    expect(screen.getByRole("img", { name: "Exame" })).toHaveAttribute(
      "src",
      "https://cdn.exemplo.com/foto.jpg",
    );
    expect(screen.getByRole("link", { name: "Fonte" })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
    expect(screen.getByRole("link", { name: "Fonte" })).toHaveAttribute("target", "_blank");
  });

  it("aceita apenas embeds HTTPS do host exato youtube-nocookie", () => {
    const { container } = render(
      <ConteudoRico
        html={'<iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"></iframe><iframe src="https://www.youtube-nocookie.com.evil/embed/dQw4w9WgXcQ"></iframe><iframe src="http://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"></iframe>'}
      />,
    );

    expect(container.querySelectorAll("iframe")).toHaveLength(1);
    expect(container.querySelector("iframe")).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
  });

  it("remove autoplay, query e fragmento de embeds", () => {
    const { container } = render(
      <ConteudoRico
        html={'<iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1" allow="autoplay"></iframe><iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ#inicio"></iframe>'}
      />,
    );

    expect(container.querySelectorAll("iframe")).toHaveLength(0);
    expect(container.querySelector("[allow]")).not.toBeInTheDocument();
  });

  it("remove imagens SVG e SVGZ mesmo quando usam HTTPS", () => {
    const { container } = render(
      <ConteudoRico
        html={'<img src="https://cdn.exemplo.com/vetor.svg"><img src="https://cdn.exemplo.com/vetor.SVGZ">'}
      />,
    );

    expect(container.querySelectorAll("img[src]")).toHaveLength(0);
  });

  it("mantém parágrafos legíveis quando recebe conteúdo legado em texto puro", () => {
    render(<ConteudoRico html={"Primeiro parágrafo\n\nSegundo parágrafo"} />);

    expect(screen.getByText("Primeiro parágrafo")).toBeInTheDocument();
    expect(screen.getByText("Segundo parágrafo")).toBeInTheDocument();
  });
});
