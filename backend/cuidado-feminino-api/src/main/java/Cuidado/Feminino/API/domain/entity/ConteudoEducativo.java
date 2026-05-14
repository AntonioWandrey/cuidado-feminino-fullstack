package Cuidado.Feminino.API.domain.entity;

import Cuidado.Feminino.API.domain.enums.PerfilAlvo;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "conteudo_educativo")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConteudoEducativo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    private CategoriaConteudo categoria;

    @Column(name = "titulo", nullable = false, length = 200)
    private String titulo;

    @Column(name = "subtitulo", length = 300)
    private String subtitulo;

    @Column(name = "corpo", nullable = false, columnDefinition = "TEXT")
    private String corpo;

    @Column(name = "palavras_chave", length = 500)
    private String palavrasChave;

    @Column(name = "tempo_leitura_min")
    private Integer tempoLeituraMin;

    @Column(name = "fonte_referencia", columnDefinition = "TEXT")
    private String fonteReferencia;

    @Column(name = "imagem_capa_url", length = 500)
    private String imagemCapaUrl;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo;

    @Column(name = "destaque", nullable = false)
    private Boolean destaque;

    @Enumerated(EnumType.STRING)
    @Column(name = "perfil_alvo", nullable = false,
            columnDefinition = "ENUM('TODAS','ADOLESCENTE','TENTANTE','GESTANTE','MENOPAUSA')")
    private PerfilAlvo perfilAlvo;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    @PrePersist
    protected void onCreate() {
        criadoEm = LocalDateTime.now();
        if (ativo == null) ativo = true;
        if (destaque == null) destaque = false;
        if (perfilAlvo == null) perfilAlvo = PerfilAlvo.TODAS;
    }

    @PreUpdate
    protected void onUpdate() {
        atualizadoEm = LocalDateTime.now();
    }
}
