package Cuidado.Feminino.API.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoriaConteudoRequest(

        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
        String nome,

        String descricao,

        @Size(max = 50, message = "Ícone deve ter no máximo 50 caracteres")
        String icone,

        Integer ordem,

        Boolean ativo
) {}
