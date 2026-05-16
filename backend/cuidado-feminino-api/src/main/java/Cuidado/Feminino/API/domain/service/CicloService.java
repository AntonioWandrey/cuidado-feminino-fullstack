package Cuidado.Feminino.API.domain.service;

import Cuidado.Feminino.API.application.dto.*;
import Cuidado.Feminino.API.application.exception.CicloEmAbertoException;
import Cuidado.Feminino.API.application.exception.CicloNaoEncontradoException;
import Cuidado.Feminino.API.domain.entity.CicloMenstrual;
import Cuidado.Feminino.API.domain.entity.PrevisaoCiclo;
import Cuidado.Feminino.API.domain.repository.CicloMenstrualRepository;
import Cuidado.Feminino.API.domain.repository.PrevisaoCicloRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CicloService {

    // usuarioId fixo até Sprint 04 (JWT)
    private static final Long USUARIO_ID_PADRAO = 1L;
    private static final int DURACAO_MEDIA_CICLO_DIAS = 5;

    private final CicloMenstrualRepository cicloRepository;
    private final PrevisaoCicloRepository previsaoRepository;
    private final MotorPreditivoCiclo motorPreditivo;

    @Transactional
    public CicloResponse registrarInicio(CicloRequest request) {
        cicloRepository.findFirstByUsuarioIdAndDataFimIsNullOrderByDataInicioDesc(USUARIO_ID_PADRAO)
                .ifPresent(cicloAberto -> {
                    throw new CicloEmAbertoException(
                            "Existe um ciclo em aberto iniciado em " + cicloAberto.getDataInicio() +
                            ". Encerre-o antes de registrar um novo."
                    );
                });

        CicloMenstrual novoCiclo = CicloMenstrual.builder()
                .usuarioId(USUARIO_ID_PADRAO)
                .dataInicio(request.dataInicio())
                .fluxo(request.fluxo())
                .observacoes(request.observacoes())
                .build();

        CicloMenstrual salvo = cicloRepository.save(novoCiclo);
        log.info("Ciclo {} registrado com início em {}", salvo.getId(), salvo.getDataInicio());

        return CicloResponse.de(salvo);
    }

    @Transactional
    public CicloResponse encerrarCiclo(Long cicloId, EncerrarCicloRequest request) {
        CicloMenstrual ciclo = cicloRepository.findById(cicloId)
                .orElseThrow(() -> new CicloNaoEncontradoException("Ciclo não encontrado: id=" + cicloId));

        if (!ciclo.estaAberto()) {
            throw new CicloEmAbertoException("Ciclo id=" + cicloId + " já foi encerrado em " + ciclo.getDataFim());
        }

        if (request.dataFim().isBefore(ciclo.getDataInicio())) {
            throw new IllegalArgumentException("Data de fim não pode ser anterior à data de início do ciclo");
        }

        ciclo.setDataFim(request.dataFim());
        if (request.fluxo() != null) ciclo.setFluxo(request.fluxo());
        if (request.observacoes() != null) ciclo.setObservacoes(request.observacoes());

        CicloMenstrual salvo = cicloRepository.save(ciclo);
        log.info("Ciclo {} encerrado em {}. Duração: {} dias", salvo.getId(), salvo.getDataFim(), salvo.getDuracaoDias());

        return CicloResponse.de(salvo);
    }

    @Transactional(readOnly = true)
    public List<CicloResponse> listarCiclos() {
        return cicloRepository.findByUsuarioIdOrderByDataInicioDesc(USUARIO_ID_PADRAO)
                .stream()
                .map(CicloResponse::de)
                .toList();
    }

    @Transactional
    public PrevisaoResponse gerarPrevisao() {
        List<CicloMenstrual> ciclosCompletos = cicloRepository.findUltimos12CiclosCompletos(USUARIO_ID_PADRAO);

        LocalDate ultimaDataInicio = resolverUltimaDataInicio(ciclosCompletos);

        PrevisaoCiclo previsao = motorPreditivo.calcularPrevisao(USUARIO_ID_PADRAO, ultimaDataInicio, ciclosCompletos);
        PrevisaoCiclo salva = previsaoRepository.save(previsao);

        return PrevisaoResponse.de(salva);
    }

    @Transactional(readOnly = true)
    public CalendarioResponse gerarCalendario(int meses) {
        List<CicloMenstrual> ciclosCompletos = cicloRepository.findUltimos12CiclosCompletos(USUARIO_ID_PADRAO);
        LocalDate ultimaDataInicio = resolverUltimaDataInicio(ciclosCompletos);

        PrevisaoCiclo previsao = motorPreditivo.calcularPrevisao(USUARIO_ID_PADRAO, ultimaDataInicio, ciclosCompletos);

        List<CalendarioResponse.ProjecaoCiclo> projecoes = new ArrayList<>();
        LocalDate baseInicio = previsao.getProximaMenstruacao();
        long mediaDias = previsao.getMediaDuracaoCiclo().longValue();

        for (int i = 0; i < meses; i++) {
            LocalDate inicioCiclo = baseInicio.plusDays(i * mediaDias);
            LocalDate fimCiclo = inicioCiclo.plusDays(DURACAO_MEDIA_CICLO_DIAS - 1);
            LocalDate ovulacao = inicioCiclo.plusDays(mediaDias - 14);
            LocalDate inicioFertil = ovulacao.minusDays(5);
            LocalDate fimFertil = ovulacao.plusDays(1);

            projecoes.add(new CalendarioResponse.ProjecaoCiclo(
                    i + 1, inicioCiclo, fimCiclo, ovulacao, inicioFertil, fimFertil
            ));
        }

        return new CalendarioResponse(projecoes);
    }

    private LocalDate resolverUltimaDataInicio(List<CicloMenstrual> ciclosCompletos) {
        return cicloRepository
                .findFirstByUsuarioIdAndDataFimIsNullOrderByDataInicioDesc(USUARIO_ID_PADRAO)
                .map(CicloMenstrual::getDataInicio)
                .orElseGet(() -> {
                    if (!ciclosCompletos.isEmpty()) {
                        return ciclosCompletos.get(0).getDataInicio();
                    }
                    return LocalDate.now().minusDays(14);
                });
    }
}
