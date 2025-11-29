package com.empresa.portfolio.controller;

import com.empresa.portfolio.model.Pessoa;
import com.empresa.portfolio.repository.PessoaRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PessoaRestController.class)
public class PessoaRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PessoaRepository pessoaRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Pessoa pessoa;

    @BeforeEach
    void setUp() {
        pessoa = new Pessoa();
        pessoa.setId(1L);
        pessoa.setNome("João Silva");
        pessoa.setCpf("123.456.789-00");
        pessoa.setDatanascimento(LocalDate.of(1990, 5, 15));
        pessoa.setFuncionario(true);
        pessoa.setGerente(true);
    }

    @Test
    void testListarTodas() throws Exception {
        when(pessoaRepository.findAll()).thenReturn(Arrays.asList(pessoa));

        mockMvc.perform(get("/api/pessoas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].nome").value("João Silva"))
                .andExpect(jsonPath("$[0].cpf").value("123.456.789-00"));
    }

    @Test
    void testBuscarPorId() throws Exception {
        when(pessoaRepository.findById(1L)).thenReturn(Optional.of(pessoa));

        mockMvc.perform(get("/api/pessoas/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nome").value("João Silva"));
    }

    @Test
    void testBuscarPorIdNaoEncontrado() throws Exception {
        when(pessoaRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/pessoas/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testListarGerentes() throws Exception {
        when(pessoaRepository.findByGerenteTrue()).thenReturn(Arrays.asList(pessoa));

        mockMvc.perform(get("/api/pessoas/gerentes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].gerente").value(true));
    }

    @Test
    void testListarFuncionarios() throws Exception {
        when(pessoaRepository.findByFuncionarioTrue()).thenReturn(Arrays.asList(pessoa));

        mockMvc.perform(get("/api/pessoas/funcionarios"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].funcionario").value(true));
    }

    @Test
    void testCriarPessoa() throws Exception {
        Pessoa novaPessoa = new Pessoa();
        novaPessoa.setNome("Maria Santos");
        novaPessoa.setCpf("987.654.321-00");
        novaPessoa.setDatanascimento(LocalDate.of(1985, 8, 20));
        novaPessoa.setFuncionario(true);
        novaPessoa.setGerente(false);

        when(pessoaRepository.save(any(Pessoa.class))).thenReturn(novaPessoa);

        mockMvc.perform(post("/api/pessoas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(novaPessoa)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("Maria Santos"));
    }

    @Test
    void testCriarPessoaComCPFInvalido() throws Exception {
        Pessoa pessoaInvalida = new Pessoa();
        pessoaInvalida.setNome("Teste");
        pessoaInvalida.setCpf("123.456.789-01"); // CPF inválido

        mockMvc.perform(post("/api/pessoas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(pessoaInvalida)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("{\"erro\": \"CPF inválido\"}"));
    }

    @Test
    void testCriarPessoaComDataFutura() throws Exception {
        Pessoa pessoaDataFutura = new Pessoa();
        pessoaDataFutura.setNome("Teste");
        pessoaDataFutura.setDatanascimento(LocalDate.now().plusDays(1));

        mockMvc.perform(post("/api/pessoas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(pessoaDataFutura)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("{\"erro\": \"Data de nascimento não pode ser uma data futura\"}"));
    }

    @Test
    void testAtualizarPessoa() throws Exception {
        Pessoa pessoaAtualizada = new Pessoa();
        pessoaAtualizada.setNome("João Silva Atualizado");
        pessoaAtualizada.setCpf("123.456.789-00");

        when(pessoaRepository.findById(1L)).thenReturn(Optional.of(pessoa));
        when(pessoaRepository.save(any(Pessoa.class))).thenReturn(pessoaAtualizada);

        mockMvc.perform(put("/api/pessoas/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(pessoaAtualizada)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("João Silva Atualizado"));
    }

    @Test
    void testAtualizarPessoaNaoEncontrada() throws Exception {
        when(pessoaRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/pessoas/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(pessoa)))
                .andExpect(status().isNotFound());
    }

    @Test
    void testExcluirPessoa() throws Exception {
        when(pessoaRepository.findById(1L)).thenReturn(Optional.of(pessoa));
        doNothing().when(pessoaRepository).deleteById(1L);

        mockMvc.perform(delete("/api/pessoas/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("{\"mensagem\": \"Pessoa excluída com sucesso\"}"));
    }

    @Test
    void testExcluirPessoaNaoEncontrada() throws Exception {
        when(pessoaRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/pessoas/999"))
                .andExpect(status().isNotFound());
    }
} 