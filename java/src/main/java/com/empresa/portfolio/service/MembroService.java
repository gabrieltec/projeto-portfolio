package com.empresa.portfolio.service;

import com.empresa.portfolio.model.Membro;
import com.empresa.portfolio.model.Pessoa;
import com.empresa.portfolio.repository.MembroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MembroService {
    @Autowired
    private MembroRepository membroRepository;

    @Transactional
    public Membro associarMembro(Membro membro) {
        Pessoa pessoa = membro.getPessoa();
        if (pessoa == null || pessoa.getFuncionario() == null || !pessoa.getFuncionario()) {
            throw new RuntimeException("Só é possível associar membros com atribuição de funcionário.");
        }
        return membroRepository.save(membro);
    }
} 