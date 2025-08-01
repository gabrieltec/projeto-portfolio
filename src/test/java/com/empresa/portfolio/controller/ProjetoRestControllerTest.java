package com.empresa.portfolio.controller;

import com.empresa.portfolio.model.Pessoa;
import com.empresa.portfolio.model.Projeto;
import com.empresa.portfolio.service.ProjetoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProjetoRestController.class)
public class ProjetoRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProjetoService projetoService;

    @Autowired
    private ObjectMapper objectMapper;

    private Projeto projeto;
    private Pessoa gerente;

    @BeforeEach
    void setUp() {
        gerente = new Pessoa();
        gerente.setId(1L);
        gerente.setNome("João Silva");
        gerente.setGerente(true);

        projeto = new Projeto();
        projeto.setId(1L);
        projeto.setNome("Sistema de Gestão");
        projeto.setDataInicio(LocalDate.of(2024, 1, 15));
        projeto.setDataPrevisaoFim(LocalDate.of(2024, 6, 30));
        projeto.setOrcamento(50000.00);
        projeto.setDescricao("Sistema completo de gestão empresarial");
        projeto.setStatus("em andamento");
        projeto.setRisco("médio risco");
        projeto.setGerente(gerente);
    }

    @Test
    void testListarTodos() throws Exception {
        when(projetoService.listarTodos()).thenReturn(Arrays.asList(projeto));

        mockMvc.perform(get("/api/projetos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].nome").value("Sistema de Gestão"))
                .andExpect(jsonPath("$[0].status").value("em andamento"));
    }

    @Test
    void testBuscarPorId() throws Exception {
        when(projetoService.buscarPorId(1L)).thenReturn(Optional.of(projeto));

        mockMvc.perform(get("/api/projetos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nome").value("Sistema de Gestão"));
    }

    @Test
    void testBuscarPorIdNaoEncontrado() throws Exception {
        when(projetoService.buscarPorId(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/projetos/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testBuscarPorStatus() throws Exception {
        when(projetoService.listarTodos()).thenReturn(Arrays.asList(projeto));

        mockMvc.perform(get("/api/projetos/status/em andamento"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("em andamento"));
    }

    @Test
    void testBuscarPorRisco() throws Exception {
        when(projetoService.listarTodos()).thenReturn(Arrays.asList(projeto));

        mockMvc.perform(get("/api/projetos/risco/médio risco"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].risco").value("médio risco"));
    }

    @Test
    void testCriarProjeto() throws Exception {
        Projeto novoProjeto = new Projeto();
        novoProjeto.setNome("App Mobile");
        novoProjeto.setDataInicio(LocalDate.of(2024, 3, 1));
        novoProjeto.setDataPrevisaoFim(LocalDate.of(2024, 8, 15));
        novoProjeto.setOrcamento(75000.00);
        novoProjeto.setDescricao("Aplicativo mobile para iOS e Android");
        novoProjeto.setStatus("planejado");
        novoProjeto.setRisco("baixo risco");
        novoProjeto.setGerente(gerente);

        when(projetoService.salvar(any(Projeto.class))).thenReturn(novoProjeto);

        mockMvc.perform(post("/api/projetos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(novoProjeto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("App Mobile"));
    }

    @Test
    void testCriarProjetoComDataInvalida() throws Exception {
        Projeto projetoInvalido = new Projeto();
        projetoInvalido.setNome("Teste");
        projetoInvalido.setDataInicio(LocalDate.of(2024, 6, 30));
        projetoInvalido.setDataPrevisaoFim(LocalDate.of(2024, 1, 15)); // Data início > Data previsão

        mockMvc.perform(post("/api/projetos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(projetoInvalido)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("{\"erro\": \"Data de início não pode ser maior que a data de previsão de término\"}"));
    }

    @Test
    void testAtualizarProjeto() throws Exception {
        Projeto projetoAtualizado = new Projeto();
        projetoAtualizado.setNome("Sistema de Gestão Atualizado");
        projetoAtualizado.setOrcamento(60000.00);

        when(projetoService.buscarPorId(1L)).thenReturn(Optional.of(projeto));
        when(projetoService.atualizar(eq(1L), any(Projeto.class))).thenReturn(projetoAtualizado);

        mockMvc.perform(put("/api/projetos/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(projetoAtualizado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Sistema de Gestão Atualizado"));
    }

    @Test
    void testAtualizarProjetoNaoEncontrado() throws Exception {
        when(projetoService.buscarPorId(999L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/projetos/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(projeto)))
                .andExpect(status().isNotFound());
    }

    @Test
    void testExcluirProjeto() throws Exception {
        when(projetoService.buscarPorId(1L)).thenReturn(Optional.of(projeto));
        doNothing().when(projetoService).excluir(1L);

        mockMvc.perform(delete("/api/projetos/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("{\"mensagem\": \"Projeto excluído com sucesso\"}"));
    }

    @Test
    void testExcluirProjetoNaoEncontrado() throws Exception {
        when(projetoService.buscarPorId(999L)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/projetos/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testAtualizarStatus() throws Exception {
        Projeto projetoAtualizado = new Projeto();
        projetoAtualizado.setId(1L);
        projetoAtualizado.setStatus("encerrado");

        when(projetoService.buscarPorId(1L)).thenReturn(Optional.of(projeto));
        when(projetoService.salvar(any(Projeto.class))).thenReturn(projetoAtualizado);

        mockMvc.perform(patch("/api/projetos/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content("\"encerrado\""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("encerrado"));
    }

    @Test
    void testAtualizarOrcamento() throws Exception {
        Projeto projetoAtualizado = new Projeto();
        projetoAtualizado.setId(1L);
        projetoAtualizado.setOrcamento(75000.00);

        when(projetoService.buscarPorId(1L)).thenReturn(Optional.of(projeto));
        when(projetoService.salvar(any(Projeto.class))).thenReturn(projetoAtualizado);

        mockMvc.perform(patch("/api/projetos/1/orcamento")
                .contentType(MediaType.APPLICATION_JSON)
                .content("75000.00"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orcamento").value(75000.00));
    }
} 