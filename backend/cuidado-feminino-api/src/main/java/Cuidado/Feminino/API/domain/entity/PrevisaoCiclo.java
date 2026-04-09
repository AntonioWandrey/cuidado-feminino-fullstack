package Cuidado.Feminino.API.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "previsao_ciclo")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrevisaoCiclo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "gerada_em", nullable = false)
    private LocalDateTime geradaEm;

    @Column(name = "media_duracao_ciclo", precision = 5, scale = 2)
    private BigDecimal mediaDuracaoCiclo;

    @Column(name = "desvio_padrao", precision = 5, scale = 2)
    private BigDecimal desvioPadrao;

    @Column(name = "ciclos_analisados")
    private Integer ciclosAnalisados;

    @Column(name = "proxima_menstruacao")
    private LocalDate proximaMenstruacao;

    @Column(name = "data_ovulacao")
    private LocalDate dataOvulacao;

    @Column(name = "inicio_periodo_fertil")
    private LocalDate inicioPeriodoFertil;

    @Column(name = "fim_periodo_fertil")
    private LocalDate fimPeriodoFertil;

    @Enumerated(EnumType.STRING)
    @Column(name = "confianca", columnDefinition = "ENUM('BAIXA','MEDIA','ALTA')")
    private Confianca confianca;

    public enum Confianca {
        BAIXA, MEDIA, ALTA
    }
}
