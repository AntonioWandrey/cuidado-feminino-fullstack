package Cuidado.Feminino.API.domain.repository;

import Cuidado.Feminino.API.domain.entity.SerieConteudo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SerieConteudoRepository extends JpaRepository<SerieConteudo, Long> {

    List<SerieConteudo> findByAtivoTrueOrderByOrdemAscNomeAsc();
}
