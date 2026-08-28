package Cuidado.Feminino.API.domain.service;

import Cuidado.Feminino.API.application.dto.ConteudoEducativoResponse;
import Cuidado.Feminino.API.application.dto.SerieConteudoResponse;
import Cuidado.Feminino.API.application.exception.SerieConteudoNaoEncontradaException;
import Cuidado.Feminino.API.domain.entity.SerieConteudo;
import Cuidado.Feminino.API.domain.repository.SerieConteudoItemRepository;
import Cuidado.Feminino.API.domain.repository.SerieConteudoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SerieConteudoService {

    private final SerieConteudoRepository serieRepository;
    private final SerieConteudoItemRepository itemRepository;

    @Transactional(readOnly = true)
    public List<SerieConteudoResponse> listarAtivas() {
        return serieRepository.findByAtivoTrueOrderByOrdemAscNomeAsc()
                .stream()
                .map(SerieConteudoResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ConteudoEducativoResponse> listarConteudosDaSerie(Long serieId) {
        SerieConteudo serie = serieRepository.findById(serieId)
                .orElseThrow(() -> new SerieConteudoNaoEncontradaException(serieId));

        log.debug("Buscando conteúdos da série id={}", serie.getId());

        return itemRepository.findBySerieIdAndConteudoAtivoTrueOrderByOrdemAsc(serieId)
                .stream()
                .map(item -> ConteudoEducativoResponse.de(item.getConteudo()))
                .toList();
    }
}
