package com.empresa.portfolio.controller;

import com.empresa.portfolio.model.Membro;
import com.empresa.portfolio.model.Pessoa;
import com.empresa.portfolio.model.Projeto;
import com.empresa.portfolio.service.MembroService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MembroControllerTest {
    @Mock
    private MembroService membroService;

    @InjectMocks
    private MembroController membroController;

    private Membro membro;
    private Pessoa pessoa;
    private Projeto projeto;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        pessoa = new Pessoa();
        pessoa.setId(1L);
        pessoa.setNome("João Funcionário");
        pessoa.setFuncionario(true);
        
        projeto = new Projeto();
        projeto.setId(1L);
        projeto.setNome("Projeto Teste");
        
        membro = new Membro();
        membro.setId(1L);
        membro.setCargo("Desenvolvedor");
        membro.setPessoa(pessoa);
        membro.setProjeto(projeto);
    }

    @Test
    void deveCadastrarMembroComSucesso() {
        when(membroService.associarMembro(any(Membro.class))).thenReturn(membro);
        
        ResponseEntity<?> response = membroController.cadastrarMembro(membro);
        
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(membro, response.getBody());
        verify(membroService, times(1)).associarMembro(membro);
    }

    @Test
    void deveRetornarErroQuandoPessoaNaoEFuncionario() {
        pessoa.setFuncionario(false);
        when(membroService.associarMembro(any(Membro.class)))
                .thenThrow(new RuntimeException("Só é possível associar membros com atribuição de funcionário."));
        
        ResponseEntity<?> response = membroController.cadastrarMembro(membro);
        
        assertEquals(400, response.getStatusCodeValue());
        assertEquals("Só é possível associar membros com atribuição de funcionário.", response.getBody());
        verify(membroService, times(1)).associarMembro(membro);
    }

    @Test
    void deveRetornarErroQuandoPessoaENull() {
        membro.setPessoa(null);
        when(membroService.associarMembro(any(Membro.class)))
                .thenThrow(new RuntimeException("Só é possível associar membros com atribuição de funcionário."));
        
        ResponseEntity<?> response = membroController.cadastrarMembro(membro);
        
        assertEquals(400, response.getStatusCodeValue());
        assertEquals("Só é possível associar membros com atribuição de funcionário.", response.getBody());
        verify(membroService, times(1)).associarMembro(membro);
    }

    @Test
    void deveRetornarErroGenerico() {
        when(membroService.associarMembro(any(Membro.class)))
                .thenThrow(new RuntimeException("Erro inesperado"));
        
        ResponseEntity<?> response = membroController.cadastrarMembro(membro);
        
        assertEquals(400, response.getStatusCodeValue());
        assertEquals("Erro inesperado", response.getBody());
        verify(membroService, times(1)).associarMembro(membro);
    }
} 