package com.empresa.portfolio.controller;

import com.empresa.portfolio.model.Pessoa;
import com.empresa.portfolio.repository.PessoaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import javax.validation.Valid;

@Controller
@RequestMapping("/pessoas")
public class PessoaController {
    @Autowired
    private PessoaRepository pessoaRepository;

    @GetMapping
    public String listar(Model model) {
        model.addAttribute("pessoas", pessoaRepository.findAll());
        return "pessoa/lista";
    }

    @GetMapping("/novo")
    public String novo(Model model) {
        model.addAttribute("pessoa", new Pessoa());
        return "pessoa/form";
    }

    @PostMapping
    public String salvar(@Valid @ModelAttribute Pessoa pessoa, BindingResult result, 
                        Model model, RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            // Adiciona mensagens de erro específicas
            StringBuilder erros = new StringBuilder();
            for (FieldError error : result.getFieldErrors()) {
                erros.append(error.getDefaultMessage()).append("; ");
            }
            model.addAttribute("erro", erros.toString());
            return "pessoa/form";
        }
        
        try {
            pessoaRepository.save(pessoa);
            redirectAttributes.addFlashAttribute("sucesso", "Pessoa salva com sucesso!");
            return "redirect:/pessoas";
        } catch (Exception e) {
            model.addAttribute("erro", "Erro ao salvar pessoa: " + e.getMessage());
            return "pessoa/form";
        }
    }

    @GetMapping("/editar/{id}")
    public String editar(@PathVariable Long id, Model model) {
        try {
            Pessoa pessoa = pessoaRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Pessoa não encontrada"));
            model.addAttribute("pessoa", pessoa);
            return "pessoa/form";
        } catch (Exception e) {
            return "redirect:/pessoas?erro=Pessoa não encontrada";
        }
    }

    @PostMapping("/atualizar/{id}")
    public String atualizar(@PathVariable Long id, @Valid @ModelAttribute Pessoa pessoa, 
                           BindingResult result, Model model, RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            // Adiciona mensagens de erro específicas
            StringBuilder erros = new StringBuilder();
            for (FieldError error : result.getFieldErrors()) {
                erros.append(error.getDefaultMessage()).append("; ");
            }
            model.addAttribute("erro", erros.toString());
            return "pessoa/form";
        }
        
        try {
            pessoa.setId(id);
            pessoaRepository.save(pessoa);
            redirectAttributes.addFlashAttribute("sucesso", "Pessoa atualizada com sucesso!");
            return "redirect:/pessoas";
        } catch (Exception e) {
            model.addAttribute("erro", "Erro ao atualizar pessoa: " + e.getMessage());
            return "pessoa/form";
        }
    }

    @GetMapping("/excluir/{id}")
    public String excluir(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            pessoaRepository.deleteById(id);
            redirectAttributes.addFlashAttribute("sucesso", "Pessoa excluída com sucesso!");
        } catch (DataIntegrityViolationException e) {
            redirectAttributes.addFlashAttribute("erro", "Não é possível excluir esta pessoa pois ela está sendo usada em projetos.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("erro", "Erro ao excluir pessoa: " + e.getMessage());
        }
        return "redirect:/pessoas";
    }
} 