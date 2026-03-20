package Cuidado.Feminino.API.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data // Gera Getters, Setters e ToString automaticamente pelo Lombok
@Table(name = "registros_saude")
public class RegistroSaude {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Campos da Triagem
    @Column(nullable = false)
    private String faseVida;      // Ex: Puberdade, Idade Fértil, Menopausa

    private String corMuco;       // Ex: Transparente, Esbranquiçado, Amarelado
    
    private boolean possuiOdor;
    
    private boolean dorPelvica;

    // Lógica de Negócio: Campo calculado para o Dashboard
    private boolean alertaUbs;

    private LocalDateTime dataRegistro;

    // Executa antes de salvar no banco
    @PrePersist
    protected void onCreate() {
        this.dataRegistro = LocalDateTime.now();
        // Lógica simples: Se houver dor, odor ou muco alterado, gera alerta
        this.alertaUbs = !"Transparente".equalsIgnoreCase(corMuco) || possuiOdor || dorPelvica;
    }
}