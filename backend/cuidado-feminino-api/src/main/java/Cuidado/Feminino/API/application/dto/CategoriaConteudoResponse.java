package Cuidado.Feminino.API.application.dto;

import Cuidado.Feminino.API.domain.entity.CategoriaConteudo;

import java.time.LocalDateTime;

public record CategoriaConteudoResponse(
        Long id,
        String nome,
        String descricao,
        String icone,
        Integer ordem,
        Boolean ativo,
        LocalDateTime criadoEm
) {
    public static CategoriaConteudoResponse de(CategoriaConteudo categoria) {
        return new CategoriaConteudoResponse(
                categoria.getId(),
                categoria.getNome(),
                categoria.getDescricao(),
                categoria.getIcone(),
                categoria.getOrdem(),
                categoria.getAtivo(),
                categoria.getCriadoEm()
        );
    }
}
