package Cuidado.Feminino.API.domain.repository;

import Cuidado.Feminino.API.domain.entity.ConteudoEducativo;
import Cuidado.Feminino.API.domain.enums.PerfilAlvo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConteudoEducativoRepository extends JpaRepository<ConteudoEducativo, Long> {

    List<ConteudoEducativo> findByAtivoTrueOrderByTituloAsc();

    Optional<ConteudoEducativo> findByIdAndAtivoTrue(Long id);

    List<ConteudoEducativo> findByDestaqueTrueAndAtivoTrueOrderByTituloAsc();

    List<ConteudoEducativo> findByPerfilAlvoAndAtivoTrueOrderByTituloAsc(PerfilAlvo perfilAlvo);

    List<ConteudoEducativo> findByAtivoTrueAndCategoria_IdOrderByTituloAsc(Long categoriaId);

    @Query("""
            SELECT c FROM ConteudoEducativo c
            WHERE c.ativo = true
              AND (LOWER(c.titulo) LIKE LOWER(CONCAT('%', :termo, '%'))
               OR LOWER(c.subtitulo) LIKE LOWER(CONCAT('%', :termo, '%'))
               OR LOWER(c.palavrasChave) LIKE LOWER(CONCAT('%', :termo, '%')))
            ORDER BY c.titulo ASC
            """)
    List<ConteudoEducativo> buscarPorTermo(@Param("termo") String termo);
}
