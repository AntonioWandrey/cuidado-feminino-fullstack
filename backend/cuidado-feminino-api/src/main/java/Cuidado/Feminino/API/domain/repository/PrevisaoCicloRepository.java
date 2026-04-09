package Cuidado.Feminino.API.domain.repository;

import Cuidado.Feminino.API.domain.entity.PrevisaoCiclo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PrevisaoCicloRepository extends JpaRepository<PrevisaoCiclo, Long> {

    Optional<PrevisaoCiclo> findFirstByUsuarioIdOrderByGeradaEmDesc(Long usuarioId);
}
