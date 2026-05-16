package Cuidado.Feminino.API.application.dto;

import Cuidado.Feminino.API.domain.entity.RegistroQueixa;
import Cuidado.Feminino.API.domain.enums.Intensidade;
import Cuidado.Feminino.API.domain.enums.TipoQueixa;
import Cuidado.Feminino.API.domain.enums.VolumeSangramento;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record RegistroQueixaResponse(
        Long id,
        LocalDate dataRegistro,
        TipoQueixa tipoQueixa,
        Intensidade intensidade,
        String descricao,
        Integer duracaoHoras,
        String corrimentoCor,
        Boolean corrimentoOdor,
        Boolean corrimentoCoceira,
        VolumeSangramento sangramentoVolume,
        Long conteudoRelacionadoId,
        String conteudoRelacionadoTitulo,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {
    public static RegistroQueixaResponse de(RegistroQueixa q) {
        return new RegistroQueixaResponse(
                q.getId(),
                q.getDataRegistro(),
                q.getTipoQueixa(),
                q.getIntensidade(),
                q.getDescricao(),
                q.getDuracaoHoras(),
                q.getCorrimentoCor(),
                q.getCorrimentoOdor(),
                q.getCorrimentoCoceira(),
                q.getSangramentoVolume(),
                q.getConteudoRelacionado() != null ? q.getConteudoRelacionado().getId() : null,
                q.getConteudoRelacionado() != null ? q.getConteudoRelacionado().getTitulo() : null,
                q.getCriadoEm(),
                q.getAtualizadoEm()
        );
    }
}
