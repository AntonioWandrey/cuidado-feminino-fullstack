package Cuidado.Feminino.API.domain.service;

import Cuidado.Feminino.API.application.dto.RegistroQueixaRequest;
import Cuidado.Feminino.API.application.dto.RegistroQueixaResponse;
import Cuidado.Feminino.API.application.dto.ResumoQueixasResponse;
import Cuidado.Feminino.API.application.exception.ConteudoEducativoNaoEncontradoException;
import Cuidado.Feminino.API.application.exception.QueixaNaoEncontradaException;
import Cuidado.Feminino.API.domain.entity.ConteudoEducativo;
import Cuidado.Feminino.API.domain.entity.RegistroQueixa;
import Cuidado.Feminino.API.domain.enums.TipoQueixa;
import Cuidado.Feminino.API.domain.repository.ConteudoEducativoRepository;
import Cuidado.Feminino.API.domain.repository.RegistroQueixaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RegistroQueixaService {

    private static final Long USUARIO_ID_PADRAO = 1L;

    private final RegistroQueixaRepository queixaRepository;
    private final ConteudoEducativoRepository conteudoRepository;

    @Transactional
    public RegistroQueixaResponse registrar(RegistroQueixaRequest request) {
        ConteudoEducativo conteudo = resolverConteudo(request.conteudoRelacionadoId());

        RegistroQueixa queixa = RegistroQueixa.builder()
                .usuarioId(USUARIO_ID_PADRAO)
                .dataRegistro(request.dataRegistro())
                .tipoQueixa(request.tipoQueixa())
                .intensidade(request.intensidade())
                .descricao(request.descricao())
                .duracaoHoras(request.duracaoHoras())
                .corrimentoCor(request.corrimentoCor())
                .corrimentoOdor(request.corrimentoOdor())
                .corrimentoCoceira(request.corrimentoCoceira())
                .sangramentoVolume(request.sangramentoVolume())
                .conteudoRelacionado(conteudo)
                .build();

        RegistroQueixa salva = queixaRepository.save(queixa);
        log.info("Queixa {} registrada: tipo={}, data={}", salva.getId(), salva.getTipoQueixa(), salva.getDataRegistro());
        return RegistroQueixaResponse.de(salva);
    }

    @Transactional(readOnly = true)
    public List<RegistroQueixaResponse> listar(TipoQueixa tipo) {
        List<RegistroQueixa> queixas = tipo != null
                ? queixaRepository.findByUsuarioIdAndTipoQueixaOrderByDataRegistroDesc(USUARIO_ID_PADRAO, tipo)
                : queixaRepository.findByUsuarioIdOrderByDataRegistroDesc(USUARIO_ID_PADRAO);
        return queixas.stream().map(RegistroQueixaResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public List<RegistroQueixaResponse> listarPorPeriodo(LocalDate inicio, LocalDate fim) {
        if (fim.isBefore(inicio)) {
            throw new IllegalArgumentException("Data de fim não pode ser anterior à data de início");
        }
        return queixaRepository.findByUsuarioIdAndDataRegistroBetweenOrderByDataRegistroDesc(
                        USUARIO_ID_PADRAO, inicio, fim)
                .stream()
                .map(RegistroQueixaResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public ResumoQueixasResponse resumo() {
        List<Object[]> contagens = queixaRepository.countByTipoQueixaForUsuario(USUARIO_ID_PADRAO);

        Map<TipoQueixa, Long> contagemPorTipo = contagens.stream()
                .collect(Collectors.toMap(
                        row -> (TipoQueixa) row[0],
                        row -> (Long) row[1],
                        (a, b) -> a,
                        LinkedHashMap::new
                ));

        long total = contagemPorTipo.values().stream().mapToLong(Long::longValue).sum();

        String queixaMaisFrequente = contagemPorTipo.entrySet().stream()
                .max(Comparator.comparingLong(Map.Entry::getValue))
                .map(e -> e.getKey().name())
                .orElse(null);

        return new ResumoQueixasResponse((int) total, contagemPorTipo, queixaMaisFrequente);
    }

    @Transactional
    public RegistroQueixaResponse atualizar(Long id, RegistroQueixaRequest request) {
        RegistroQueixa queixa = queixaRepository.findById(id)
                .orElseThrow(() -> new QueixaNaoEncontradaException("Queixa não encontrada: id=" + id));

        ConteudoEducativo conteudo = resolverConteudo(request.conteudoRelacionadoId());

        queixa.setDataRegistro(request.dataRegistro());
        queixa.setTipoQueixa(request.tipoQueixa());
        queixa.setIntensidade(request.intensidade());
        queixa.setDescricao(request.descricao());
        queixa.setDuracaoHoras(request.duracaoHoras());
        queixa.setCorrimentoCor(request.corrimentoCor());
        queixa.setCorrimentoOdor(request.corrimentoOdor());
        queixa.setCorrimentoCoceira(request.corrimentoCoceira());
        queixa.setSangramentoVolume(request.sangramentoVolume());
        queixa.setConteudoRelacionado(conteudo);

        RegistroQueixa salva = queixaRepository.save(queixa);
        log.info("Queixa {} atualizada", salva.getId());
        return RegistroQueixaResponse.de(salva);
    }

    @Transactional
    public void deletar(Long id) {
        if (!queixaRepository.existsById(id)) {
            throw new QueixaNaoEncontradaException("Queixa não encontrada: id=" + id);
        }
        queixaRepository.deleteById(id);
        log.info("Queixa {} removida", id);
    }

    private ConteudoEducativo resolverConteudo(Long conteudoId) {
        if (conteudoId == null) return null;
        return conteudoRepository.findById(conteudoId)
                .orElseThrow(() -> new ConteudoEducativoNaoEncontradoException(conteudoId));
    }
}
