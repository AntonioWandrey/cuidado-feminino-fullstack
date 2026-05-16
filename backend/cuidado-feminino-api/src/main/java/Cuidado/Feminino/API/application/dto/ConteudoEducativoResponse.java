package Cuidado.Feminino.API.application.dto;

import Cuidado.Feminino.API.domain.entity.ConteudoEducativo;
import Cuidado.Feminino.API.domain.enums.PerfilAlvo;

import java.time.LocalDateTime;

public record ConteudoEducativoResponse(
        Long id,
        Long categoriaId,
        String categoriaNome,
        String titulo,
        String subtitulo,
        String corpo,
        String palavrasChave,
        Integer tempoLeituraMin,
        String fonteReferencia,
        String imagemCapaUrl,
        Boolean ativo,
        Boolean destaque,
        PerfilAlvo perfilAlvo,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {
    public static ConteudoEducativoResponse de(ConteudoEducativo conteudo) {
        return new ConteudoEducativoResponse(
                conteudo.getId(),
                conteudo.getCategoria().getId(),
                conteudo.getCategoria().getNome(),
                conteudo.getTitulo(),
                conteudo.getSubtitulo(),
                conteudo.getCorpo(),
                conteudo.getPalavrasChave(),
                conteudo.getTempoLeituraMin(),
                conteudo.getFonteReferencia(),
                conteudo.getImagemCapaUrl(),
                conteudo.getAtivo(),
                conteudo.getDestaque(),
                conteudo.getPerfilAlvo(),
                conteudo.getCriadoEm(),
                conteudo.getAtualizadoEm()
        );
    }
}
