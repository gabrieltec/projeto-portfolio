package com.empresa.portfolio.repository;

import com.empresa.portfolio.model.Projeto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjetoRepository extends JpaRepository<Projeto, Long> {
    
    @Query("SELECT p FROM Projeto p LEFT JOIN FETCH p.gerente")
    List<Projeto> findAllWithGerente();
    
    @Query("SELECT p FROM Projeto p LEFT JOIN FETCH p.gerente WHERE p.id = :id")
    Optional<Projeto> findByIdWithGerente(@Param("id") Long id);
} 