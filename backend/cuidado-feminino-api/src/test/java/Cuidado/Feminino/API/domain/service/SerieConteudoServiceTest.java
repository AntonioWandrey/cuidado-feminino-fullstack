package Cuidado.Feminino.API.domain.service;

import Cuidado.Feminino.API.domain.entity.CategoriaConteudo;
import Cuidado.Feminino.API.domain.entity.ConteudoEducativo;
import Cuidado.Feminino.API.domain.entity.SerieConteudo;
import Cuidado.Feminino.API.domain.entity.SerieConteudoItem;
import Cuidado.Feminino.API.domain.enums.PerfilAlvo;
import Cuidado.Feminino.API.domain.repository.SerieConteudoItemRepository;
import Cuidado.Feminino.API.domain.repository.SerieConteudoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SerieConteudoServiceTest {

    @Mock
    private SerieConteudoRepository serieRepository;

    @Mock
    private SerieConteudoItemRepository itemRepository;

    @InjectMocks
    private SerieConteudoService service;

    @Test
    void deveListarSomenteConteudosAtivosDaSeriePublica() {
        SerieConteudo serie = SerieConteudo.builder().id(4L).nome("Ciclo").ativo(true).build();
        CategoriaConteudo categoria = CategoriaConteudo.builder().id(2L).nome("Saúde").build();
        ConteudoEducativo conteudo = ConteudoEducativo.builder()
                .id(12L)
                .categoria(categoria)
                .titulo("Conteúdo ativo")
                .corpo("<p>Corpo</p>")
                .ativo(true)
                .destaque(false)
                .perfilAlvo(PerfilAlvo.TODAS)
                .build();
        SerieConteudoItem item = SerieConteudoItem.builder()
                .id(20L)
                .serie(serie)
                .conteudo(conteudo)
                .ordem(1)
                .build();
        when(serieRepository.findById(4L)).thenReturn(Optional.of(serie));
        when(itemRepository.findBySerieIdAndConteudoAtivoTrueOrderByOrdemAsc(4L))
                .thenReturn(List.of(item));

        var resultado = service.listarConteudosDaSerie(4L);

        assertThat(resultado).extracting("id").containsExactly(12L);
        verify(itemRepository).findBySerieIdAndConteudoAtivoTrueOrderByOrdemAsc(4L);
    }
}
