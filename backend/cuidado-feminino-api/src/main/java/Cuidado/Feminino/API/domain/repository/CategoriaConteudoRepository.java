package Cuidado.Feminino.API.domain.repository;

import Cuidado.Feminino.API.domain.entity.CategoriaConteudo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoriaConteudoRepository extends JpaRepository<CategoriaConteudo, Long> {

    List<CategoriaConteudo> findByAtivoTrueOrderByOrdemAscNomeAsc();
}
