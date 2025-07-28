package com.empresa.portfolio.repository;

import com.empresa.portfolio.model.Membro;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MembroRepository extends JpaRepository<Membro, Long> {
} 