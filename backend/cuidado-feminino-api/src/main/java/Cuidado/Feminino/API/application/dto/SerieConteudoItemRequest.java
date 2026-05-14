package Cuidado.Feminino.API.application.dto;

import jakarta.validation.constraints.NotNull;

public record SerieConteudoItemRequest(

        @NotNull(message = "Série é obrigatória")
        Long serieId,

        @NotNull(message = "Conteúdo é obrigatório")
        Long conteudoId,

        Integer ordem
) {}
