package Cuidado.Feminino.API.application.dto;

import Cuidado.Feminino.API.domain.entity.PrevisaoCiclo;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record PrevisaoResponse(
        Long id,
        LocalDateTime geradaEm,
        BigDecimal mediaDuracaoCiclo,
        BigDecimal desvioPadrao,
        Integer ciclosAnalisados,
        LocalDate proximaMenstruacao,
        LocalDate dataOvulacao,
        LocalDate inicioPeriodoFertil,
        LocalDate fimPeriodoFertil,
        PrevisaoCiclo.Confianca confianca
) {
    public static PrevisaoResponse de(PrevisaoCiclo previsao) {
        return new PrevisaoResponse(
                previsao.getId(),
                previsao.getGeradaEm(),
                previsao.getMediaDuracaoCiclo(),
                previsao.getDesvioPadrao(),
                previsao.getCiclosAnalisados(),
                previsao.getProximaMenstruacao(),
                previsao.getDataOvulacao(),
                previsao.getInicioPeriodoFertil(),
                previsao.getFimPeriodoFertil(),
                previsao.getConfianca()
        );
    }
}
