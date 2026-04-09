package Cuidado.Feminino.API.domain.service;

import Cuidado.Feminino.API.domain.entity.CicloMenstrual;
import Cuidado.Feminino.API.domain.entity.PrevisaoCiclo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@Slf4j
public class MotorPreditivoCiclo {

    private static final int DURACAO_PADRAO_DIAS = 28;
    private static final int DIAS_FASE_LUTEA = 14;
    private static final int DIAS_JANELA_FERTIL_ANTES = 5;
    private static final int DIAS_JANELA_FERTIL_DEPOIS = 1;

    public PrevisaoCiclo calcularPrevisao(Long usuarioId, LocalDate ultimaDataInicio, List<CicloMenstrual> ciclosCompletos) {
        int totalCiclos = ciclosCompletos.size();
        log.info("Calculando previsão para usuário {} com {} ciclos completos", usuarioId, totalCiclos);

        double mediaPonderada = calcularMediaPonderada(ciclosCompletos, totalCiclos);
        BigDecimal desvioPadrao = calcularDesvioPadrao(ciclosCompletos, mediaPonderada, totalCiclos);
        PrevisaoCiclo.Confianca confianca = definirConfianca(totalCiclos);

        LocalDate proximaMenstruacao = ultimaDataInicio.plusDays(Math.round(mediaPonderada));
        LocalDate ovulacao = proximaMenstruacao.minusDays(DIAS_FASE_LUTEA);
        LocalDate inicioPeriodoFertil = ovulacao.minusDays(DIAS_JANELA_FERTIL_ANTES);
        LocalDate fimPeriodoFertil = ovulacao.plusDays(DIAS_JANELA_FERTIL_DEPOIS);

        log.info("Previsão calculada: próxima menstruação={}, confiança={}", proximaMenstruacao, confianca);

        return PrevisaoCiclo.builder()
                .usuarioId(usuarioId)
                .geradaEm(LocalDateTime.now())
                .mediaDuracaoCiclo(BigDecimal.valueOf(mediaPonderada).setScale(2, RoundingMode.HALF_UP))
                .desvioPadrao(desvioPadrao)
                .ciclosAnalisados(totalCiclos)
                .proximaMenstruacao(proximaMenstruacao)
                .dataOvulacao(ovulacao)
                .inicioPeriodoFertil(inicioPeriodoFertil)
                .fimPeriodoFertil(fimPeriodoFertil)
                .confianca(confianca)
                .build();
    }

    private double calcularMediaPonderada(List<CicloMenstrual> ciclos, int totalCiclos) {
        if (totalCiclos == 0) {
            return DURACAO_PADRAO_DIAS;
        }

        // Ciclos mais recentes (índice 0) têm peso maior
        double somaPesos = 0;
        double somaValores = 0;

        for (int i = 0; i < totalCiclos; i++) {
            int peso = totalCiclos - i;
            int duracao = ciclos.get(i).getDuracaoDias() != null
                    ? ciclos.get(i).getDuracaoDias()
                    : DURACAO_PADRAO_DIAS;

            somaValores += (double) duracao * peso;
            somaPesos += peso;
        }

        return somaValores / somaPesos;
    }

    private BigDecimal calcularDesvioPadrao(List<CicloMenstrual> ciclos, double media, int totalCiclos) {
        if (totalCiclos < 2) {
            return null;
        }

        double somaDiferencasQuadradas = ciclos.stream()
                .mapToDouble(c -> {
                    double duracao = c.getDuracaoDias() != null ? c.getDuracaoDias() : DURACAO_PADRAO_DIAS;
                    double diferenca = duracao - media;
                    return diferenca * diferenca;
                })
                .sum();

        double variancia = somaDiferencasQuadradas / totalCiclos;
        double desvio = Math.sqrt(variancia);

        return BigDecimal.valueOf(desvio).round(new MathContext(5, RoundingMode.HALF_UP)).setScale(2, RoundingMode.HALF_UP);
    }

    private PrevisaoCiclo.Confianca definirConfianca(int totalCiclos) {
        if (totalCiclos < 3) return PrevisaoCiclo.Confianca.BAIXA;
        if (totalCiclos < 6) return PrevisaoCiclo.Confianca.MEDIA;
        return PrevisaoCiclo.Confianca.ALTA;
    }
}
