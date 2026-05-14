package Cuidado.Feminino.API.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "serie_conteudo_item",
       uniqueConstraints = @UniqueConstraint(columnNames = {"serie_id", "conteudo_id"}))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SerieConteudoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serie_id", nullable = false)
    private SerieConteudo serie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conteudo_id", nullable = false)
    private ConteudoEducativo conteudo;

    @Column(name = "ordem", nullable = false)
    private Integer ordem;

    @PrePersist
    protected void onCreate() {
        if (ordem == null) ordem = 0;
    }
}
