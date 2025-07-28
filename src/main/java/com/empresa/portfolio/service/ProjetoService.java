package com.empresa.portfolio.service;

import com.empresa.portfolio.model.Projeto;
import com.empresa.portfolio.repository.ProjetoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class ProjetoService {
    @Autowired
    private ProjetoRepository projetoRepository;

    public List<Projeto> listarTodos() {
        return projetoRepository.findAll();
    }

    public Optional<Projeto> buscarPorId(Long id) {
        return projetoRepository.findById(id);
    }

    @Transactional
    public Projeto salvar(Projeto projeto) {
        return projetoRepository.save(projeto);
    }

    @Transactional
    public Projeto atualizar(Long id, Projeto projetoAtualizado) {
        Projeto projeto = projetoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projeto não encontrado"));
        // Atualiza campos permitidos
        projeto.setNome(projetoAtualizado.getNome());
        projeto.setDataInicio(projetoAtualizado.getDataInicio());
        projeto.setDataPrevisaoFim(projetoAtualizado.getDataPrevisaoFim());
        projeto.setDataFim(projetoAtualizado.getDataFim());
        projeto.setDescricao(projetoAtualizado.getDescricao());
        projeto.setStatus(projetoAtualizado.getStatus());
        projeto.setOrcamento(projetoAtualizado.getOrcamento());
        projeto.setRisco(projetoAtualizado.getRisco());
        projeto.setGerente(projetoAtualizado.getGerente());
        return projetoRepository.save(projeto);
    }

    @Transactional
    public void excluir(Long id) {
        Projeto projeto = projetoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projeto não encontrado"));
        if (projeto.getStatus() != null) {
            String status = projeto.getStatus().toLowerCase();
            if (status.equals("iniciado") || status.equals("em andamento") || status.equals("encerrado")) {
                throw new RuntimeException("Não é possível excluir projetos com status iniciado, em andamento ou encerrado.");
            }
        }
        projetoRepository.deleteById(id);
    }
} 