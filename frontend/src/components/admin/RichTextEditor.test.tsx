import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RichTextEditor } from "./RichTextEditor";

describe("RichTextEditor", () => {
  it("exibe o HTML inicial e sincroniza valor assíncrono sem disparar onChange", async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <RichTextEditor value="<p>Inicial</p>" onChange={onChange} />,
    );

    expect(await screen.findByText("Inicial")).toBeInTheDocument();
    rerender(<RichTextEditor value="<h2>Carregado da API</h2>" onChange={onChange} />);

    expect(await screen.findByRole("heading", { name: "Carregado da API" })).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("oferece ações acessíveis e altera o estado do negrito", async () => {
    render(<RichTextEditor value="<p>Texto</p>" onChange={vi.fn()} />);

    const bold = await screen.findByRole("button", { name: "Negrito" });
    expect(bold).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(bold);

    await waitFor(() => expect(bold).toHaveAttribute("aria-pressed", "true"));
    for (const name of [
      "Título nível 2",
      "Título nível 3",
      "Itálico",
      "Sublinhado",
      "Lista com marcadores",
      "Lista numerada",
      "Inserir link",
      "Inserir imagem",
      "Inserir vídeo do YouTube",
      "Desfazer",
      "Refazer",
    ]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
  });

  it("insere imagem HTTPS e rejeita URL insegura", async () => {
    const onChange = vi.fn();
    render(<RichTextEditor value="<p>Texto</p>" onChange={onChange} />);

    fireEvent.click(await screen.findByRole("button", { name: "Inserir imagem" }));
    fireEvent.change(screen.getByLabelText("URL HTTPS da imagem"), {
      target: { value: "http://exemplo.com/foto.jpg" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar imagem" }));
    expect(await screen.findByText("Informe uma URL HTTPS válida para a imagem.")).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("URL HTTPS da imagem"), {
      target: { value: "https://exemplo.com/vetor.svgz" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar imagem" }));
    expect(await screen.findByText("Informe uma URL HTTPS válida para a imagem.")).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("URL HTTPS da imagem"), {
      target: { value: "https://exemplo.com/foto.jpg" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar imagem" }));

    await waitFor(() =>
      expect(onChange).toHaveBeenLastCalledWith(
        expect.stringContaining('src="https://exemplo.com/foto.jpg"'),
      ),
    );
  });

  it("converte vídeo do YouTube para o domínio sem cookies", async () => {
    const onChange = vi.fn();
    render(<RichTextEditor value="<p>Texto</p>" onChange={onChange} />);

    fireEvent.click(await screen.findByRole("button", { name: "Inserir vídeo do YouTube" }));
    fireEvent.change(screen.getByLabelText("URL do vídeo do YouTube"), {
      target: { value: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar vídeo" }));

    await waitFor(() =>
      expect(onChange).toHaveBeenLastCalledWith(
        expect.stringContaining("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"),
      ),
    );
  });
});
