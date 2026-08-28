package Cuidado.Feminino.API.infrastructure.controller;

import Cuidado.Feminino.API.application.dto.ConteudoEducativoRequest;
import Cuidado.Feminino.API.application.dto.ConteudoEducativoResponse;
import Cuidado.Feminino.API.application.exception.ConteudoEducativoNaoEncontradoException;
import Cuidado.Feminino.API.application.exception.GlobalExceptionHandler;
import Cuidado.Feminino.API.domain.enums.PerfilAlvo;
import Cuidado.Feminino.API.domain.service.ConteudoEducativoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AdminConteudoControllerTest {

    private static final String REQUEST_VALIDO = """
            {
              "categoriaId": 3,
              "titulo": "Novo artigo",
              "subtitulo": "Subtítulo",
              "corpo": "<p>Corpo</p>",
              "palavrasChave": "saúde",
              "tempoLeituraMin": 5,
              "fonteReferencia": "https://example.org/referencia",
              "imagemCapaUrl": "https://example.org/capa.jpg",
              "ativo": true,
              "destaque": false,
              "perfilAlvo": "TODAS"
            }
            """;

    @Mock
    private ConteudoEducativoService service;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(new AdminConteudoController(service))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void deveListarConteudosAdministrativos() throws Exception {
        when(service.listarTodos()).thenReturn(List.of(response(1L, false)));

        mockMvc.perform(get("/api/admin/conteudos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].ativo").value(false));
    }

    @Test
    void deveCriarConteudoERetornar201() throws Exception {
        when(service.criar(org.mockito.ArgumentMatchers.any(ConteudoEducativoRequest.class)))
                .thenReturn(response(1L, true));

        mockMvc.perform(post("/api/admin/conteudos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(REQUEST_VALIDO))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void deveAtualizarConteudoERetornar200() throws Exception {
        when(service.atualizar(org.mockito.ArgumentMatchers.eq(1L),
                org.mockito.ArgumentMatchers.any(ConteudoEducativoRequest.class)))
                .thenReturn(response(1L, true));

        mockMvc.perform(put("/api/admin/conteudos/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(REQUEST_VALIDO))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void deveDespublicarComOBooleanoRecebido() throws Exception {
        when(service.alterarPublicacao(1L, false)).thenReturn(response(1L, false));

        mockMvc.perform(patch("/api/admin/conteudos/1/publicacao")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ativo\":false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ativo").value(false));

        verify(service).alterarPublicacao(1L, false);
    }

    @Test
    void deveExcluirLogicamenteERetornar204() throws Exception {
        mockMvc.perform(delete("/api/admin/conteudos/1"))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""));

        verify(service).excluirLogicamente(1L);
    }

    @Test
    void deveRetornar400QuandoTituloNaoFoiInformado() throws Exception {
        String requestSemTitulo = REQUEST_VALIDO.replace("\"Novo artigo\"", "\"\"");

        mockMvc.perform(post("/api/admin/conteudos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestSemTitulo))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.mensagem").value(org.hamcrest.Matchers.containsString(
                        "Título é obrigatório")));

        verify(service, never()).criar(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void deveRetornar404QuandoConteudoAdministrativoNaoExiste() throws Exception {
        when(service.buscarPorId(99L)).thenThrow(new ConteudoEducativoNaoEncontradoException(99L));

        mockMvc.perform(get("/api/admin/conteudos/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void deveRetornar400QuandoPublicacaoTemJsonMalformado() throws Exception {
        mockMvc.perform(patch("/api/admin/conteudos/1/publicacao")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ativo\":"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void deveRetornar400QuandoEstadoDePublicacaoENulo() throws Exception {
        mockMvc.perform(patch("/api/admin/conteudos/1/publicacao")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ativo\":null}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value(org.hamcrest.Matchers.containsString(
                        "Estado de publicação é obrigatório")));
    }

    private ConteudoEducativoResponse response(Long id, boolean ativo) {
        return new ConteudoEducativoResponse(
                id,
                3L,
                "Saúde",
                "Artigo",
                "Subtítulo",
                "<p>Corpo</p>",
                "saúde",
                5,
                "https://example.org/referencia",
                "https://example.org/capa.jpg",
                ativo,
                false,
                PerfilAlvo.TODAS,
                null,
                null);
    }
}
