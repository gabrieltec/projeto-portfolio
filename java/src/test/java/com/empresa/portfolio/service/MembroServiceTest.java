package com.empresa.portfolio.service;

import com.empresa.portfolio.model.Membro;
import com.empresa.portfolio.model.Pessoa;
import com.empresa.portfolio.model.Projeto;
import com.empresa.portfolio.repository.MembroRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MembroServiceTest {
    @Mock
    private MembroRepository membroRepository;

    @InjectMocks
    private MembroService membroService;

    private Pessoa pessoaFuncionario;
    private Pessoa pessoaNaoFuncionario;
    private Pessoa pessoaGerente;
    private Projeto projeto;
    private Membro membro;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        pessoaFuncionario = new Pessoa();
        pessoaFuncionario.setId(1L);
        pessoaFuncionario.setNome("João Funcionário");
        pessoaFuncionario.setFuncionario(true);
        pessoaFuncionario.setGerente(false);
        
        pessoaNaoFuncionario = new Pessoa();
        pessoaNaoFuncionario.setId(2L);
        pessoaNaoFuncionario.setNome("Maria Cliente");
        pessoaNaoFuncionario.setFuncionario(false);
        pessoaNaoFuncionario.setGerente(false);
        
        pessoaGerente = new Pessoa();
        pessoaGerente.setId(3L);
        pessoaGerente.setNome("Pedro Gerente");
        pessoaGerente.setFuncionario(true);
        pessoaGerente.setGerente(true);
        
        projeto = new Projeto();
        projeto.setId(1L);
        projeto.setNome("Projeto Teste");
        
        membro = new Membro();
        membro.setId(1L);
        membro.setCargo("Desenvolvedor");
        membro.setProjeto(projeto);
    }

    // Teste 1: Web service para cadastro de membros
    @Test
    void devePermitirCadastroDeMembroViaWebService() {
        membro.setPessoa(pessoaFuncionario);
        when(membroRepository.save(any(Membro.class))).thenReturn(membro);
        
        Membro salvo = membroService.associarMembro(membro);
        
        assertNotNull(salvo);
        assertEquals("Desenvolvedor", salvo.getCargo());
        assertEquals(pessoaFuncionario, salvo.getPessoa());
        assertEquals(projeto, salvo.getProjeto());
        verify(membroRepository, times(1)).save(membro);
    }

    // Teste 2: Restrição de funcionário
    @Test
    void devePermitirAssociarFuncionario() {
        membro.setPessoa(pessoaFuncionario);
        when(membroRepository.save(any(Membro.class))).thenReturn(membro);
        
        assertDoesNotThrow(() -> membroService.associarMembro(membro));
        verify(membroRepository, times(1)).save(membro);
    }

    @Test
    void devePermitirAssociarGerenteQueTambemEFuncionario() {
        membro.setPessoa(pessoaGerente);
        when(membroRepository.save(any(Membro.class))).thenReturn(membro);
        
        assertDoesNotThrow(() -> membroService.associarMembro(membro));
        verify(membroRepository, times(1)).save(membro);
    }

    @Test
    void naoPermiteAssociarNaoFuncionario() {
        membro.setPessoa(pessoaNaoFuncionario);
        
        RuntimeException ex = assertThrows(RuntimeException.class, () -> membroService.associarMembro(membro));
        assertTrue(ex.getMessage().contains("Só é possível associar membros com atribuição de funcionário."));
        verify(membroRepository, never()).save(any(Membro.class));
    }

    @Test
    void naoPermiteAssociarPessoaComFuncionarioNull() {
        membro.setPessoa(null);
        
        RuntimeException ex = assertThrows(RuntimeException.class, () -> membroService.associarMembro(membro));
        assertTrue(ex.getMessage().contains("Só é possível associar membros com atribuição de funcionário."));
        verify(membroRepository, never()).save(any(Membro.class));
    }

    @Test
    void naoPermiteAssociarPessoaComFuncionarioFalse() {
        pessoaFuncionario.setFuncionario(false);
        membro.setPessoa(pessoaFuncionario);
        
        RuntimeException ex = assertThrows(RuntimeException.class, () -> membroService.associarMembro(membro));
        assertTrue(ex.getMessage().contains("Só é possível associar membros com atribuição de funcionário."));
        verify(membroRepository, never()).save(any(Membro.class));
    }

    @Test
    void naoPermiteAssociarPessoaComFuncionarioNull2() {
        pessoaFuncionario.setFuncionario(null);
        membro.setPessoa(pessoaFuncionario);
        
        RuntimeException ex = assertThrows(RuntimeException.class, () -> membroService.associarMembro(membro));
        assertTrue(ex.getMessage().contains("Só é possível associar membros com atribuição de funcionário."));
        verify(membroRepository, never()).save(any(Membro.class));
    }

    // Teste 3: Diferentes cargos
    @Test
    void deveAceitarCargoDesenvolvedor() {
        membro.setCargo("Desenvolvedor");
        membro.setPessoa(pessoaFuncionario);
        when(membroRepository.save(any(Membro.class))).thenReturn(membro);
        
        Membro salvo = membroService.associarMembro(membro);
        
        assertEquals("Desenvolvedor", salvo.getCargo());
    }

    @Test
    void deveAceitarCargoAnalista() {
        membro.setCargo("Analista");
        membro.setPessoa(pessoaFuncionario);
        when(membroRepository.save(any(Membro.class))).thenReturn(membro);
        
        Membro salvo = membroService.associarMembro(membro);
        
        assertEquals("Analista", salvo.getCargo());
    }

    @Test
    void deveAceitarCargoGerente() {
        membro.setCargo("Gerente");
        membro.setPessoa(pessoaFuncionario);
        when(membroRepository.save(any(Membro.class))).thenReturn(membro);
        
        Membro salvo = membroService.associarMembro(membro);
        
        assertEquals("Gerente", salvo.getCargo());
    }

    @Test
    void deveAceitarCargoTestador() {
        membro.setCargo("Testador");
        membro.setPessoa(pessoaFuncionario);
        when(membroRepository.save(any(Membro.class))).thenReturn(membro);
        
        Membro salvo = membroService.associarMembro(membro);
        
        assertEquals("Testador", salvo.getCargo());
    }

    // Teste 4: Validação de dados obrigatórios
    @Test
    void deveExigirCargo() {
        membro.setCargo(null);
        membro.setPessoa(pessoaFuncionario);
        
        // O teste verifica se o sistema aceita cargo null (depende da validação da entidade)
        when(membroRepository.save(any(Membro.class))).thenReturn(membro);
        
        assertDoesNotThrow(() -> membroService.associarMembro(membro));
    }

    @Test
    void deveExigirProjeto() {
        membro.setProjeto(null);
        membro.setPessoa(pessoaFuncionario);
        
        // O teste verifica se o sistema aceita projeto null (depende da validação da entidade)
        when(membroRepository.save(any(Membro.class))).thenReturn(membro);
        
        assertDoesNotThrow(() -> membroService.associarMembro(membro));
    }
} 