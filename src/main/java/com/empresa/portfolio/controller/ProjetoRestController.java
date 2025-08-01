package com.empresa.portfolio.controller;

import com.empresa.portfolio.model.Projeto;
import com.empresa.portfolio.service.ProjetoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/projetos")
@CrossOrigin(origins = "*")
public class ProjetoRestController {

    @Autowired
    private ProjetoService projetoService;

    @GetMapping
    public ResponseEntity<List<Projeto>> listarTodos() {
        List<Projeto> projetos = projetoService.listarTodos();
        return ResponseEntity.ok(projetos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Projeto> buscarPorId(@PathVariable Long id) {
        Optional<Projeto> projeto = projetoService.buscarPorId(id);
        if (projeto.isPresent()) {
            return ResponseEntity.ok(projeto.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Projeto>> buscarPorStatus(@PathVariable String status) {
        List<Projeto> projetos = projetoService.listarTodos().stream()
                .filter(p -> p.getStatus() != null && p.getStatus().equalsIgnoreCase(status))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(projetos);
    }

    @GetMapping("/risco/{risco}")
    public ResponseEntity<List<Projeto>> buscarPorRisco(@PathVariable String risco) {
        List<Projeto> projetos = projetoService.listarTodos().stream()
                .filter(p -> p.getRisco() != null && p.getRisco().equalsIgnoreCase(risco))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(projetos);
    }

    @PostMapping
    public ResponseEntity<?> criar(@Valid @RequestBody Projeto projeto) {
        try {
            // Validações de negócio
            if (projeto.getDataInicio() != null && projeto.getDataPrevisaoFim() != null) {
                if (projeto.getDataInicio().isAfter(projeto.getDataPrevisaoFim())) {
                    return ResponseEntity.badRequest()
                            .body("{\"erro\": \"Data de início não pode ser maior que a data de previsão de término\"}");
                }
            }

            if (projeto.getDataInicio() != null && projeto.getDataFim() != null) {
                if (projeto.getDataInicio().isAfter(projeto.getDataFim())) {
                    return ResponseEntity.badRequest()
                            .body("{\"erro\": \"Data de início não pode ser maior que a data de término\"}");
                }
            }

            if (projeto.getDataPrevisaoFim() != null && projeto.getDataFim() != null) {
                if (projeto.getDataPrevisaoFim().isAfter(projeto.getDataFim())) {
                    return ResponseEntity.badRequest()
                            .body("{\"erro\": \"Data de previsão não pode ser maior que a data de término\"}");
                }
            }

            Projeto projetoSalvo = projetoService.salvar(projeto);
            return ResponseEntity.status(HttpStatus.CREATED).body(projetoSalvo);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("{\"erro\": \"" + e.getMessage() + "\"}");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @Valid @RequestBody Projeto projetoAtualizado) {
        try {
            // Validações de negócio
            if (projetoAtualizado.getDataInicio() != null && projetoAtualizado.getDataPrevisaoFim() != null) {
                if (projetoAtualizado.getDataInicio().isAfter(projetoAtualizado.getDataPrevisaoFim())) {
                    return ResponseEntity.badRequest()
                            .body("{\"erro\": \"Data de início não pode ser maior que a data de previsão de término\"}");
                }
            }

            if (projetoAtualizado.getDataInicio() != null && projetoAtualizado.getDataFim() != null) {
                if (projetoAtualizado.getDataInicio().isAfter(projetoAtualizado.getDataFim())) {
                    return ResponseEntity.badRequest()
                            .body("{\"erro\": \"Data de início não pode ser maior que a data de término\"}");
                }
            }

            if (projetoAtualizado.getDataPrevisaoFim() != null && projetoAtualizado.getDataFim() != null) {
                if (projetoAtualizado.getDataPrevisaoFim().isAfter(projetoAtualizado.getDataFim())) {
                    return ResponseEntity.badRequest()
                            .body("{\"erro\": \"Data de previsão não pode ser maior que a data de término\"}");
                }
            }

            Projeto projetoAtualizadoSalvo = projetoService.atualizar(id, projetoAtualizado);
            return ResponseEntity.ok(projetoAtualizadoSalvo);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("{\"erro\": \"" + e.getMessage() + "\"}");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable Long id) {
        try {
            projetoService.excluir(id);
            return ResponseEntity.ok().body("{\"mensagem\": \"Projeto excluído com sucesso\"}");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body("{\"erro\": \"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("{\"erro\": \"" + e.getMessage() + "\"}");
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> atualizarStatus(@PathVariable Long id, @RequestBody String status) {
        try {
            Optional<Projeto> projetoOpt = projetoService.buscarPorId(id);
            if (!projetoOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Projeto projeto = projetoOpt.get();
            projeto.setStatus(status);
            Projeto projetoAtualizado = projetoService.salvar(projeto);
            return ResponseEntity.ok(projetoAtualizado);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("{\"erro\": \"" + e.getMessage() + "\"}");
        }
    }

    @PatchMapping("/{id}/orcamento")
    public ResponseEntity<?> atualizarOrcamento(@PathVariable Long id, @RequestBody Double orcamento) {
        try {
            Optional<Projeto> projetoOpt = projetoService.buscarPorId(id);
            if (!projetoOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Projeto projeto = projetoOpt.get();
            projeto.setOrcamento(orcamento);
            Projeto projetoAtualizado = projetoService.salvar(projeto);
            return ResponseEntity.ok(projetoAtualizado);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("{\"erro\": \"" + e.getMessage() + "\"}");
        }
    }
} 