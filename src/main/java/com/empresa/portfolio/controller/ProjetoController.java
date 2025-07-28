package com.empresa.portfolio.controller;

import com.empresa.portfolio.model.Projeto;
import com.empresa.portfolio.model.Pessoa;
import com.empresa.portfolio.service.ProjetoService;
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
import java.util.List;

@Controller
@RequestMapping("/projetos")
public class ProjetoController {
    @Autowired
    private ProjetoService projetoService;
    
    @Autowired
    private PessoaRepository pessoaRepository;

    @GetMapping
    public String listar(Model model) {
        model.addAttribute("projetos", projetoService.listarTodos());
        return "projeto/lista";
    }

    @GetMapping("/novo")
    public String novo(Model model) {
        model.addAttribute("projeto", new Projeto());
        List<Pessoa> gerentes = pessoaRepository.findByGerenteTrue();
        model.addAttribute("gerentes", gerentes);
        return "projeto/form";
    }

    @PostMapping
    public String salvar(@Valid @ModelAttribute Projeto projeto, BindingResult result, 
                        Model model, RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            List<Pessoa> gerentes = pessoaRepository.findByGerenteTrue();
            model.addAttribute("gerentes", gerentes);
            
            // Adiciona mensagens de erro específicas
            StringBuilder erros = new StringBuilder();
            for (FieldError error : result.getFieldErrors()) {
                erros.append(error.getDefaultMessage()).append("; ");
            }
            model.addAttribute("erro", erros.toString());
            return "projeto/form";
        }
        
        try {
            projetoService.salvar(projeto);
            redirectAttributes.addFlashAttribute("sucesso", "Projeto salvo com sucesso!");
            return "redirect:/projetos";
        } catch (DataIntegrityViolationException e) {
            String mensagem = "Erro ao salvar projeto. ";
            if (e.getMessage().contains("fk1dl7ttt60f002k8b6kpt9kq41")) {
                mensagem += "O gerente informado não existe. Por favor, verifique o ID do gerente.";
            } else {
                mensagem += "Verifique se todos os dados estão corretos.";
            }
            List<Pessoa> gerentes = pessoaRepository.findByGerenteTrue();
            model.addAttribute("gerentes", gerentes);
            model.addAttribute("erro", mensagem);
            return "projeto/form";
        } catch (Exception e) {
            List<Pessoa> gerentes = pessoaRepository.findByGerenteTrue();
            model.addAttribute("gerentes", gerentes);
            model.addAttribute("erro", "Erro inesperado: " + e.getMessage());
            return "projeto/form";
        }
    }

    @GetMapping("/editar/{id}")
    public String editar(@PathVariable Long id, Model model) {
        try {
            Projeto projeto = projetoService.buscarPorId(id)
                    .orElseThrow(() -> new RuntimeException("Projeto não encontrado"));
            model.addAttribute("projeto", projeto);
            List<Pessoa> gerentes = pessoaRepository.findByGerenteTrue();
            model.addAttribute("gerentes", gerentes);
            return "projeto/form";
        } catch (Exception e) {
            return "redirect:/projetos?erro=Projeto não encontrado";
        }
    }

    @PostMapping("/atualizar/{id}")
    public String atualizar(@PathVariable Long id, @Valid @ModelAttribute Projeto projeto, 
                           BindingResult result, Model model, RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            List<Pessoa> gerentes = pessoaRepository.findByGerenteTrue();
            model.addAttribute("gerentes", gerentes);
            
            // Adiciona mensagens de erro específicas
            StringBuilder erros = new StringBuilder();
            for (FieldError error : result.getFieldErrors()) {
                erros.append(error.getDefaultMessage()).append("; ");
            }
            model.addAttribute("erro", erros.toString());
            return "projeto/form";
        }
        
        try {
            projetoService.atualizar(id, projeto);
            redirectAttributes.addFlashAttribute("sucesso", "Projeto atualizado com sucesso!");
            return "redirect:/projetos";
        } catch (DataIntegrityViolationException e) {
            String mensagem = "Erro ao atualizar projeto. ";
            if (e.getMessage().contains("fk1dl7ttt60f002k8b6kpt9kq41")) {
                mensagem += "O gerente informado não existe. Por favor, verifique o ID do gerente.";
            } else {
                mensagem += "Verifique se todos os dados estão corretos.";
            }
            List<Pessoa> gerentes = pessoaRepository.findByGerenteTrue();
            model.addAttribute("gerentes", gerentes);
            model.addAttribute("erro", mensagem);
            return "projeto/form";
        } catch (Exception e) {
            List<Pessoa> gerentes = pessoaRepository.findByGerenteTrue();
            model.addAttribute("gerentes", gerentes);
            model.addAttribute("erro", "Erro inesperado: " + e.getMessage());
            return "projeto/form";
        }
    }

    @GetMapping("/excluir/{id}")
    public String excluir(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            projetoService.excluir(id);
            redirectAttributes.addFlashAttribute("sucesso", "Projeto excluído com sucesso!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("erro", "Erro ao excluir projeto: " + e.getMessage());
        }
        return "redirect:/projetos";
    }
} 