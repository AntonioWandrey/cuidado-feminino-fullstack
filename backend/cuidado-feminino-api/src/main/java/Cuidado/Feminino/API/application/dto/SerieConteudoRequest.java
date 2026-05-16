package Cuidado.Feminino.API.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SerieConteudoRequest(

        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 200, message = "Nome deve ter no máximo 200 caracteres")
        String nome,

        String descricao,

        @Size(max = 50, message = "Ícone deve ter no máximo 50 caracteres")
        String icone,

        Integer ordem,

        Boolean ativo
) {}
