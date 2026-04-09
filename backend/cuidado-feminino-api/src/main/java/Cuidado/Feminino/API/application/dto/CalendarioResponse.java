package Cuidado.Feminino.API.application.dto;

import java.time.LocalDate;
import java.util.List;

public record CalendarioResponse(
        List<ProjecaoCiclo> projecoes
) {
    public record ProjecaoCiclo(
            int numeroCiclo,
            LocalDate inicioPrevisto,
            LocalDate fimPrevisto,
            LocalDate ovulacao,
            LocalDate inicioPeriodoFertil,
            LocalDate fimPeriodoFertil
    ) {}
}
