package com.empresa.portfolio.controller;

import com.empresa.portfolio.model.Pessoa;
import com.empresa.portfolio.model.Projeto;
import com.empresa.portfolio.service.ProjetoService;
import com.empresa.portfolio.repository.PessoaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.ui.Model;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProjetoControllerTest {
    @Mock
    private ProjetoService projetoService;
    
    @Mock
    private PessoaRepository pessoaRepository;
    
    @Mock
    private Model model;

    @InjectMocks
    private ProjetoController projetoController;

    private Projeto projeto;
    private Pessoa gerente;
    private List<Pessoa> gerentes;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        gerente = new Pessoa();
        gerente.setId(1L);
        gerente.setNome("João Gerente");
        gerente.setGerente(true);
        
        projeto = new Projeto();
        projeto.setId(1L);
        projeto.setNome("Projeto Teste");
        projeto.setDataInicio(LocalDate.of(2025, 1, 1));
        projeto.setDataPrevisaoFim(LocalDate.of(2025, 6, 30));
        projeto.setDescricao("Descrição do projeto");
        projeto.setStatus("em análise");
        projeto.setOrcamento(100000.0);
        projeto.setRisco("baixo risco");
        projeto.setGerente(gerente);
        
        gerentes = Arrays.asList(gerente);
    }

    @Test
    void deveListarProjetos() {
        List<Projeto> projetos = Arrays.asList(projeto);
        when(projetoService.listarTodos()).thenReturn(projetos);
        
        String viewName = projetoController.listar(model);
        
        assertEquals("projeto/lista", viewName);
        verify(model, times(1)).addAttribute("projetos", projetos);
    }

    @Test
    void deveMostrarFormularioNovoProjeto() {
        when(pessoaRepository.findByGerenteTrue()).thenReturn(gerentes);
        
        String viewName = projetoController.novo(model);
        
        assertEquals("projeto/form", viewName);
        verify(model, times(1)).addAttribute("projeto", any(Projeto.class));
        verify(model, times(1)).addAttribute("gerentes", gerentes);
    }

    @Test
    void deveSalvarProjetoComSucesso() {
        when(projetoService.salvar(any(Projeto.class))).thenReturn(projeto);
        
        String viewName = projetoController.salvar(projeto, null, model, null);
        
        assertEquals("redirect:/projetos", viewName);
        verify(projetoService, times(1)).salvar(projeto);
    }

    @Test
    void deveMostrarFormularioEdicao() {
        when(projetoService.buscarPorId(1L)).thenReturn(Optional.of(projeto));
        when(pessoaRepository.findByGerenteTrue()).thenReturn(gerentes);
        
        String viewName = projetoController.editar(1L, model);
        
        assertEquals("projeto/form", viewName);
        verify(model, times(1)).addAttribute("projeto", projeto);
        verify(model, times(1)).addAttribute("gerentes", gerentes);
    }

    @Test
    void deveAtualizarProjetoComSucesso() {
        when(projetoService.atualizar(eq(1L), any(Projeto.class))).thenReturn(projeto);
        
        String viewName = projetoController.atualizar(1L, projeto, null, model, null);
        
        assertEquals("redirect:/projetos", viewName);
        verify(projetoService, times(1)).atualizar(1L, projeto);
    }

    @Test
    void deveExcluirProjetoComSucesso() {
        doNothing().when(projetoService).excluir(1L);
        
        String viewName = projetoController.excluir(1L, null);
        
        assertEquals("redirect:/projetos", viewName);
        verify(projetoService, times(1)).excluir(1L);
    }
} 