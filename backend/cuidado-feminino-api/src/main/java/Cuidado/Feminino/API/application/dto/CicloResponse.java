package Cuidado.Feminino.API.application.dto;

import Cuidado.Feminino.API.domain.entity.CicloMenstrual;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record CicloResponse(
        Long id,
        LocalDate dataInicio,
        LocalDate dataFim,
        Integer duracaoDias,
        CicloMenstrual.Fluxo fluxo,
        String observacoes,
        boolean aberto,
        LocalDateTime criadoEm
) {
    public static CicloResponse de(CicloMenstrual ciclo) {
        return new CicloResponse(
                ciclo.getId(),
                ciclo.getDataInicio(),
                ciclo.getDataFim(),
                ciclo.getDuracaoDias(),
                ciclo.getFluxo(),
                ciclo.getObservacoes(),
                ciclo.estaAberto(),
                ciclo.getCriadoEm()
        );
    }
}
