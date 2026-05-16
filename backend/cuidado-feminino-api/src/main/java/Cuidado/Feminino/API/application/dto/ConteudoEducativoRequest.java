package Cuidado.Feminino.API.application.dto;

import Cuidado.Feminino.API.domain.enums.PerfilAlvo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ConteudoEducativoRequest(

        @NotNull(message = "Categoria é obrigatória")
        Long categoriaId,

        @NotBlank(message = "Título é obrigatório")
        @Size(max = 200, message = "Título deve ter no máximo 200 caracteres")
        String titulo,

        @Size(max = 300, message = "Subtítulo deve ter no máximo 300 caracteres")
        String subtitulo,

        @NotBlank(message = "Corpo do conteúdo é obrigatório")
        String corpo,

        @Size(max = 500, message = "Palavras-chave devem ter no máximo 500 caracteres")
        String palavrasChave,

        Integer tempoLeituraMin,

        String fonteReferencia,

        @Size(max = 500, message = "URL da imagem deve ter no máximo 500 caracteres")
        String imagemCapaUrl,

        Boolean ativo,

        Boolean destaque,

        PerfilAlvo perfilAlvo
) {}
