package Cuidado.Feminino.API.domain.repository;

import Cuidado.Feminino.API.domain.entity.SerieConteudoItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SerieConteudoItemRepository extends JpaRepository<SerieConteudoItem, Long> {

    List<SerieConteudoItem> findBySerieIdOrderByOrdemAsc(Long serieId);

    List<SerieConteudoItem> findBySerieIdAndConteudoAtivoTrueOrderByOrdemAsc(Long serieId);

    boolean existsBySerieIdAndConteudoId(Long serieId, Long conteudoId);
}
