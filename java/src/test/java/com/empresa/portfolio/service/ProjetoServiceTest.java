package com.empresa.portfolio.service;

import com.empresa.portfolio.model.Pessoa;
import com.empresa.portfolio.model.Projeto;
import com.empresa.portfolio.repository.ProjetoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProjetoServiceTest {
    @Mock
    private ProjetoRepository projetoRepository;

    @InjectMocks
    private ProjetoService projetoService;

    private Projeto projeto;
    private Pessoa gerente;

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
        projeto.setDataFim(LocalDate.of(2025, 6, 15));
        projeto.setDescricao("Descrição do projeto teste");
        projeto.setStatus("em análise");
        projeto.setOrcamento(100000.0);
        projeto.setRisco("baixo risco");
        projeto.setGerente(gerente);
    }

    // Teste 1: CRUD de projetos
    @Test
    void devePermitirCadastroDeProjeto() {
        when(projetoRepository.save(any(Projeto.class))).thenReturn(projeto);
        
        Projeto salvo = projetoService.salvar(projeto);
        
        assertNotNull(salvo);
        assertEquals("Projeto Teste", salvo.getNome());
        assertEquals("em análise", salvo.getStatus());
        assertEquals("baixo risco", salvo.getRisco());
        verify(projetoRepository, times(1)).save(projeto);
    }

    @Test
    void devePermitirConsultaDeProjetos() {
        List<Projeto> projetos = Arrays.asList(projeto);
        when(projetoRepository.findAll()).thenReturn(projetos);
        
        List<Projeto> resultado = projetoService.listarTodos();
        
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals("Projeto Teste", resultado.get(0).getNome());
        verify(projetoRepository, times(1)).findAll();
    }

    @Test
    void devePermitirBuscaPorId() {
        when(projetoRepository.findById(1L)).thenReturn(Optional.of(projeto));
        
        Optional<Projeto> resultado = projetoService.buscarPorId(1L);
        
        assertTrue(resultado.isPresent());
        assertEquals("Projeto Teste", resultado.get().getNome());
        verify(projetoRepository, times(1)).findById(1L);
    }

    @Test
    void devePermitirAtualizacaoDeProjeto() {
        Projeto projetoAtualizado = new Projeto();
        projetoAtualizado.setNome("Projeto Atualizado");
        projetoAtualizado.setStatus("iniciado");
        projetoAtualizado.setRisco("médio risco");
        projetoAtualizado.setGerente(gerente);
        
        when(projetoRepository.findById(1L)).thenReturn(Optional.of(projeto));
        when(projetoRepository.save(any(Projeto.class))).thenReturn(projetoAtualizado);
        
        Projeto resultado = projetoService.atualizar(1L, projetoAtualizado);
        
        assertNotNull(resultado);
        assertEquals("Projeto Atualizado", resultado.getNome());
        assertEquals("iniciado", resultado.getStatus());
        verify(projetoRepository, times(1)).save(any(Projeto.class));
    }

    // Teste 2: Classificação de risco
    @Test
    void deveAceitarClassificacaoDeRiscoBaixo() {
        projeto.setRisco("baixo risco");
        when(projetoRepository.save(any(Projeto.class))).thenReturn(projeto);
        
        Projeto salvo = projetoService.salvar(projeto);
        
        assertEquals("baixo risco", salvo.getRisco());
    }

    @Test
    void deveAceitarClassificacaoDeRiscoMedio() {
        projeto.setRisco("médio risco");
        when(projetoRepository.save(any(Projeto.class))).thenReturn(projeto);
        
        Projeto salvo = projetoService.salvar(projeto);
        
        assertEquals("médio risco", salvo.getRisco());
    }

    @Test
    void deveAceitarClassificacaoDeRiscoAlto() {
        projeto.setRisco("alto risco");
        when(projetoRepository.save(any(Projeto.class))).thenReturn(projeto);
        
        Projeto salvo = projetoService.salvar(projeto);
        
        assertEquals("alto risco", salvo.getRisco());
    }

    // Teste 3: Status específicos e únicos
    @Test
    void deveAceitarStatusEmAnalise() {
        projeto.setStatus("em análise");
        when(projetoRepository.save(any(Projeto.class))).thenReturn(projeto);
        
        Projeto salvo = projetoService.salvar(projeto);
        
        assertEquals("em análise", salvo.getStatus());
    }

    @Test
    void deveAceitarStatusAnaliseRealizada() {
        projeto.setStatus("análise realizada");
        when(projetoRepository.save(any(Projeto.class))).thenReturn(projeto);
        
        Projeto salvo = projetoService.salvar(projeto);
        
        assertEquals("análise realizada", salvo.getStatus());
    }

    @Test
    void deveAceitarStatusAnaliseAprovada() {
        projeto.setStatus("análise aprovada");
        when(projetoRepository.save(any(Projeto.class))).thenReturn(projeto);
        
        Projeto salvo = projetoService.salvar(projeto);
        
        assertEquals("análise aprovada", salvo.getStatus());
    }

    @Test
    void deveAceitarStatusIniciado() {
        projeto.setStatus("iniciado");
        when(projetoRepository.save(any(Projeto.class))).thenReturn(projeto);
        
        Projeto salvo = projetoService.salvar(projeto);
        
        assertEquals("iniciado", salvo.getStatus());
    }

    @Test
    void deveAceitarStatusPlanejado() {
        projeto.setStatus("planejado");
        when(projetoRepository.save(any(Projeto.class))).thenReturn(projeto);
        
        Projeto salvo = projetoService.salvar(projeto);
        
        assertEquals("planejado", salvo.getStatus());
    }

    @Test
    void deveAceitarStatusEmAndamento() {
        projeto.setStatus("em andamento");
        when(projetoRepository.save(any(Projeto.class))).thenReturn(projeto);
        
        Projeto salvo = projetoService.salvar(projeto);
        
        assertEquals("em andamento", salvo.getStatus());
    }

    @Test
    void deveAceitarStatusEncerrado() {
        projeto.setStatus("encerrado");
        when(projetoRepository.save(any(Projeto.class))).thenReturn(projeto);
        
        Projeto salvo = projetoService.salvar(projeto);
        
        assertEquals("encerrado", salvo.getStatus());
    }

    @Test
    void deveAceitarStatusCancelado() {
        projeto.setStatus("cancelado");
        when(projetoRepository.save(any(Projeto.class))).thenReturn(projeto);
        
        Projeto salvo = projetoService.salvar(projeto);
        
        assertEquals("cancelado", salvo.getStatus());
    }

    // Teste 4: Restrições de exclusão
    @Test
    void naoPermiteExcluirProjetoComStatusIniciado() {
        projeto.setStatus("iniciado");
        when(projetoRepository.findById(1L)).thenReturn(Optional.of(projeto));
        
        RuntimeException ex = assertThrows(RuntimeException.class, () -> projetoService.excluir(1L));
        assertTrue(ex.getMessage().contains("Não é possível excluir projetos com status iniciado, em andamento ou encerrado."));
        verify(projetoRepository, never()).deleteById(1L);
    }

    @Test
    void naoPermiteExcluirProjetoComStatusEmAndamento() {
        projeto.setStatus("em andamento");
        when(projetoRepository.findById(1L)).thenReturn(Optional.of(projeto));
        
        RuntimeException ex = assertThrows(RuntimeException.class, () -> projetoService.excluir(1L));
        assertTrue(ex.getMessage().contains("Não é possível excluir projetos com status iniciado, em andamento ou encerrado."));
        verify(projetoRepository, never()).deleteById(1L);
    }

    @Test
    void naoPermiteExcluirProjetoComStatusEncerrado() {
        projeto.setStatus("encerrado");
        when(projetoRepository.findById(1L)).thenReturn(Optional.of(projeto));
        
        RuntimeException ex = assertThrows(RuntimeException.class, () -> projetoService.excluir(1L));
        assertTrue(ex.getMessage().contains("Não é possível excluir projetos com status iniciado, em andamento ou encerrado."));
        verify(projetoRepository, never()).deleteById(1L);
    }

    @Test
    void permiteExcluirProjetoComStatusEmAnalise() {
        projeto.setStatus("em análise");
        when(projetoRepository.findById(1L)).thenReturn(Optional.of(projeto));
        
        assertDoesNotThrow(() -> projetoService.excluir(1L));
        verify(projetoRepository, times(1)).deleteById(1L);
    }

    @Test
    void permiteExcluirProjetoComStatusAnaliseRealizada() {
        projeto.setStatus("análise realizada");
        when(projetoRepository.findById(1L)).thenReturn(Optional.of(projeto));
        
        assertDoesNotThrow(() -> projetoService.excluir(1L));
        verify(projetoRepository, times(1)).deleteById(1L);
    }

    @Test
    void permiteExcluirProjetoComStatusAnaliseAprovada() {
        projeto.setStatus("análise aprovada");
        when(projetoRepository.findById(1L)).thenReturn(Optional.of(projeto));
        
        assertDoesNotThrow(() -> projetoService.excluir(1L));
        verify(projetoRepository, times(1)).deleteById(1L);
    }

    @Test
    void permiteExcluirProjetoComStatusPlanejado() {
        projeto.setStatus("planejado");
        when(projetoRepository.findById(1L)).thenReturn(Optional.of(projeto));
        
        assertDoesNotThrow(() -> projetoService.excluir(1L));
        verify(projetoRepository, times(1)).deleteById(1L);
    }

    @Test
    void permiteExcluirProjetoComStatusCancelado() {
        projeto.setStatus("cancelado");
        when(projetoRepository.findById(1L)).thenReturn(Optional.of(projeto));
        
        assertDoesNotThrow(() -> projetoService.excluir(1L));
        verify(projetoRepository, times(1)).deleteById(1L);
    }
} 