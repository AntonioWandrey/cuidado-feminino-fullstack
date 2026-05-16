package Cuidado.Feminino.API.domain.repository;

import Cuidado.Feminino.API.domain.entity.RegistroQueixa;
import Cuidado.Feminino.API.domain.enums.TipoQueixa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface RegistroQueixaRepository extends JpaRepository<RegistroQueixa, Long> {

    List<RegistroQueixa> findByUsuarioIdOrderByDataRegistroDesc(Long usuarioId);

    List<RegistroQueixa> findByUsuarioIdAndDataRegistroBetweenOrderByDataRegistroDesc(
            Long usuarioId, LocalDate inicio, LocalDate fim);

    List<RegistroQueixa> findByUsuarioIdAndTipoQueixaOrderByDataRegistroDesc(
            Long usuarioId, TipoQueixa tipoQueixa);

    @Query("""
            SELECT q.tipoQueixa, COUNT(q) FROM RegistroQueixa q
            WHERE q.usuarioId = :usuarioId
            GROUP BY q.tipoQueixa
            """)
    List<Object[]> countByTipoQueixaForUsuario(@Param("usuarioId") Long usuarioId);
}
