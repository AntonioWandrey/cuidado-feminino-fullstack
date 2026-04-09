package Cuidado.Feminino.API.domain.repository;

import Cuidado.Feminino.API.domain.entity.CicloMenstrual;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CicloMenstrualRepository extends JpaRepository<CicloMenstrual, Long> {

    List<CicloMenstrual> findByUsuarioIdOrderByDataInicioDesc(Long usuarioId);

    Optional<CicloMenstrual> findFirstByUsuarioIdAndDataFimIsNullOrderByDataInicioDesc(Long usuarioId);

    @Query("""
            SELECT c FROM CicloMenstrual c
            WHERE c.usuarioId = :usuarioId
              AND c.dataFim IS NOT NULL
            ORDER BY c.dataInicio DESC
            LIMIT 12
            """)
    List<CicloMenstrual> findUltimos12CiclosCompletos(@Param("usuarioId") Long usuarioId);
}
