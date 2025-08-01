package com.empresa.portfolio.controller;

import com.empresa.portfolio.model.Pessoa;
import com.empresa.portfolio.repository.PessoaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pessoas")
@CrossOrigin(origins = "*")
public class PessoaRestController {

    @Autowired
    private PessoaRepository pessoaRepository;

    @GetMapping
    public ResponseEntity<List<Pessoa>> listarTodas() {
        List<Pessoa> pessoas = pessoaRepository.findAll();
        return ResponseEntity.ok(pessoas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pessoa> buscarPorId(@PathVariable Long id) {
        Optional<Pessoa> pessoa = pessoaRepository.findById(id);
        if (pessoa.isPresent()) {
            return ResponseEntity.ok(pessoa.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/gerentes")
    public ResponseEntity<List<Pessoa>> listarGerentes() {
        List<Pessoa> gerentes = pessoaRepository.findByGerenteTrue();
        return ResponseEntity.ok(gerentes);
    }

    @GetMapping("/funcionarios")
    public ResponseEntity<List<Pessoa>> listarFuncionarios() {
        List<Pessoa> funcionarios = pessoaRepository.findByFuncionarioTrue();
        return ResponseEntity.ok(funcionarios);
    }

    @PostMapping
    public ResponseEntity<?> criar(@Valid @RequestBody Pessoa pessoa) {
        try {
            // Validar CPF se fornecido
            if (pessoa.getCpf() != null && !pessoa.getCpf().isEmpty()) {
                String cpfLimpo = pessoa.getCpf().replaceAll("[^0-9]", "");
                if (!validarCPF(cpfLimpo)) {
                    return ResponseEntity.badRequest()
                            .body("{\"erro\": \"CPF inválido\"}");
                }
            }

            // Validar data de nascimento
            if (pessoa.getDatanascimento() != null) {
                java.time.LocalDate hoje = java.time.LocalDate.now();
                if (pessoa.getDatanascimento().isAfter(hoje)) {
                    return ResponseEntity.badRequest()
                            .body("{\"erro\": \"Data de nascimento não pode ser uma data futura\"}");
                }
            }

            Pessoa pessoaSalva = pessoaRepository.save(pessoa);
            return ResponseEntity.status(HttpStatus.CREATED).body(pessoaSalva);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("{\"erro\": \"" + e.getMessage() + "\"}");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @Valid @RequestBody Pessoa pessoaAtualizada) {
        try {
            Optional<Pessoa> pessoaExistente = pessoaRepository.findById(id);
            if (!pessoaExistente.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Pessoa pessoa = pessoaExistente.get();
            
            if (pessoaAtualizada.getCpf() != null && !pessoaAtualizada.getCpf().isEmpty()) {
                String cpfLimpo = pessoaAtualizada.getCpf().replaceAll("[^0-9]", "");
                if (!validarCPF(cpfLimpo)) {
                    return ResponseEntity.badRequest()
                            .body("{\"erro\": \"CPF inválido\"}");
                }
            }

            if (pessoaAtualizada.getDatanascimento() != null) {
                java.time.LocalDate hoje = java.time.LocalDate.now();
                if (pessoaAtualizada.getDatanascimento().isAfter(hoje)) {
                    return ResponseEntity.badRequest()
                            .body("{\"erro\": \"Data de nascimento não pode ser uma data futura\"}");
                }
            }

            pessoa.setNome(pessoaAtualizada.getNome());
            pessoa.setCpf(pessoaAtualizada.getCpf());
            pessoa.setDatanascimento(pessoaAtualizada.getDatanascimento());
            pessoa.setFuncionario(pessoaAtualizada.getFuncionario());
            pessoa.setGerente(pessoaAtualizada.getGerente());

            Pessoa pessoaSalva = pessoaRepository.save(pessoa);
            return ResponseEntity.ok(pessoaSalva);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("{\"erro\": \"" + e.getMessage() + "\"}");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable Long id) {
        try {
            Optional<Pessoa> pessoa = pessoaRepository.findById(id);
            if (!pessoa.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            pessoaRepository.deleteById(id);
            return ResponseEntity.ok().body("{\"mensagem\": \"Pessoa excluída com sucesso\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("{\"erro\": \"" + e.getMessage() + "\"}");
        }
    }

    private boolean validarCPF(String cpf) {
        if (cpf.length() != 11) return false;
        
        if (cpf.matches("(\\d)\\1{10}")) return false;
        
        int soma = 0;
        for (int i = 0; i < 9; i++) {
            soma += Integer.parseInt(cpf.charAt(i) + "") * (10 - i);
        }
        int resto = 11 - (soma % 11);
        int dv1 = (resto == 10 || resto == 11) ? 0 : resto;
        
        soma = 0;
        for (int i = 0; i < 10; i++) {
            soma += Integer.parseInt(cpf.charAt(i) + "") * (11 - i);
        }
        resto = 11 - (soma % 11);
        int dv2 = (resto == 10 || resto == 11) ? 0 : resto;
        
        return Integer.parseInt(cpf.charAt(9) + "") == dv1 && 
               Integer.parseInt(cpf.charAt(10) + "") == dv2;
    }
} 