package Cuidado.Feminino.API.infrastructure.controller;

import Cuidado.Feminino.API.application.exception.ConteudoEducativoNaoEncontradoException;
import Cuidado.Feminino.API.application.exception.GlobalExceptionHandler;
import Cuidado.Feminino.API.domain.service.ConteudoEducativoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ConteudoEducativoControllerTest {

    @Mock
    private ConteudoEducativoService service;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(new ConteudoEducativoController(service))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void deveRetornar404ParaDetalhePublicoInativoOuInexistente() throws Exception {
        when(service.buscarPublicoPorId(9L))
                .thenThrow(new ConteudoEducativoNaoEncontradoException(9L));

        mockMvc.perform(get("/api/conteudos/9"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));

        verify(service).buscarPublicoPorId(9L);
        verify(service, never()).buscarPorId(9L);
    }

    @Test
    void deveRetornar400ParaEnumDePerfilInvalido() throws Exception {
        mockMvc.perform(get("/api/conteudos").param("perfilAlvo", "INVALIDO"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }
}
