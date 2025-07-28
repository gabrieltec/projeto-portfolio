package com.empresa.portfolio.repository;

import com.empresa.portfolio.model.Projeto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjetoRepository extends JpaRepository<Projeto, Long> {
} 