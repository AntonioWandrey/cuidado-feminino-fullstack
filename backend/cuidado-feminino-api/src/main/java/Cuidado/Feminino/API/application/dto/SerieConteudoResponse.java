package Cuidado.Feminino.API.application.dto;

import Cuidado.Feminino.API.domain.entity.SerieConteudo;

import java.time.LocalDateTime;

public record SerieConteudoResponse(
        Long id,
        String nome,
        String descricao,
        String icone,
        Integer ordem,
        Boolean ativo,
        LocalDateTime criadoEm
) {
    public static SerieConteudoResponse de(SerieConteudo serie) {
        return new SerieConteudoResponse(
                serie.getId(),
                serie.getNome(),
                serie.getDescricao(),
                serie.getIcone(),
                serie.getOrdem(),
                serie.getAtivo(),
                serie.getCriadoEm()
        );
    }
}
