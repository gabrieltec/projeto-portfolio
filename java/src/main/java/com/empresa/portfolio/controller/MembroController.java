package com.empresa.portfolio.controller;

import com.empresa.portfolio.model.Membro;
import com.empresa.portfolio.service.MembroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/membros")
public class MembroController {
    @Autowired
    private MembroService membroService;

    @PostMapping
    public ResponseEntity<?> cadastrarMembro(@RequestBody Membro membro) {
        try {
            Membro salvo = membroService.associarMembro(membro);
            return ResponseEntity.ok(salvo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
} 