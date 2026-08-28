package Cuidado.Feminino.API.application.dto;

import jakarta.validation.constraints.NotNull;

public record PublicacaoConteudoRequest(
        @NotNull(message = "Estado de publicação é obrigatório")
        Boolean ativo
) {
}
