package Cuidado.Feminino.API.domain.entity;

import Cuidado.Feminino.API.domain.enums.Intensidade;
import Cuidado.Feminino.API.domain.enums.TipoQueixa;
import Cuidado.Feminino.API.domain.enums.VolumeSangramento;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "registro_queixa")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistroQueixa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "data_registro", nullable = false)
    private LocalDate dataRegistro;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_queixa", nullable = false,
            columnDefinition = "ENUM('CORRIMENTO','COLICA','SANGRAMENTO_FORA_PERIODO','DOR_URINAR','DOR_PELVICA','ALTERACAO_HUMOR','FOGACHO','OUTRO')")
    private TipoQueixa tipoQueixa;

    @Enumerated(EnumType.STRING)
    @Column(name = "intensidade", columnDefinition = "ENUM('LEVE','MODERADA','INTENSA')")
    private Intensidade intensidade;

    @Column(name = "descricao", columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "duracao_horas")
    private Integer duracaoHoras;

    @Column(name = "corrimento_cor", length = 50)
    private String corrimentoCor;

    @Column(name = "corrimento_odor")
    private Boolean corrimentoOdor;

    @Column(name = "corrimento_coceira")
    private Boolean corrimentoCoceira;

    @Enumerated(EnumType.STRING)
    @Column(name = "sangramento_volume", columnDefinition = "ENUM('LEVE','MODERADO','INTENSO')")
    private VolumeSangramento sangramentoVolume;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conteudo_relacionado_id")
    private ConteudoEducativo conteudoRelacionado;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    @PrePersist
    protected void onCreate() {
        criadoEm = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        atualizadoEm = LocalDateTime.now();
    }
}
