package Cuidado.Feminino.API.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "ciclo_menstrual")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CicloMenstrual {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio;

    @Column(name = "data_fim")
    private LocalDate dataFim;

    @Column(name = "duracao_dias")
    private Integer duracaoDias;

    @Enumerated(EnumType.STRING)
    @Column(name = "fluxo", columnDefinition = "ENUM('LEVE','MODERADO','INTENSO','MUITO_INTENSO')")
    private Fluxo fluxo;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    public enum Fluxo {
        LEVE, MODERADO, INTENSO, MUITO_INTENSO
    }

    public boolean estaAberto() {
        return dataFim == null;
    }

    @PrePersist
    protected void onCreate() {
        criadoEm = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        atualizadoEm = LocalDateTime.now();
        if (dataFim != null && dataInicio != null) {
            duracaoDias = (int) ChronoUnit.DAYS.between(dataInicio, dataFim) + 1;
        }
    }
}
