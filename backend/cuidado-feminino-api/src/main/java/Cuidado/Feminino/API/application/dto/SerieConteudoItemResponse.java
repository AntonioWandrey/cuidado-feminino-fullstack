package Cuidado.Feminino.API.application.dto;

import Cuidado.Feminino.API.domain.entity.SerieConteudoItem;

public record SerieConteudoItemResponse(
        Long id,
        Long serieId,
        String serieNome,
        Long conteudoId,
        String conteudoTitulo,
        Integer ordem
) {
    public static SerieConteudoItemResponse de(SerieConteudoItem item) {
        return new SerieConteudoItemResponse(
                item.getId(),
                item.getSerie().getId(),
                item.getSerie().getNome(),
                item.getConteudo().getId(),
                item.getConteudo().getTitulo(),
                item.getOrdem()
        );
    }
}
