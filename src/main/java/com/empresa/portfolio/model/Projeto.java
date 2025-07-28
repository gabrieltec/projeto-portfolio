package com.empresa.portfolio.model;

import lombok.Data;
import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import java.time.LocalDate;

@Entity
@Table(name = "projeto")
@Data
public class Projeto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nome é obrigatório")
    @Column(nullable = false, length = 200)
    private String nome;

    private LocalDate dataInicio;
    private LocalDate dataPrevisaoFim;
    private LocalDate dataFim;

    @Column(length = 5000)
    private String descricao;

    @NotBlank(message = "Status é obrigatório")
    @Pattern(regexp = "^(em análise|análise realizada|análise aprovada|iniciado|planejado|em andamento|encerrado|cancelado)$", 
             message = "Status deve ser: em análise, análise realizada, análise aprovada, iniciado, planejado, em andamento, encerrado ou cancelado")
    @Column(length = 45)
    private String status;

    private Double orcamento;

    @NotBlank(message = "Risco é obrigatório")
    @Pattern(regexp = "^(baixo risco|médio risco|alto risco)$", 
             message = "Risco deve ser: baixo risco, médio risco ou alto risco")
    @Column(length = 45)
    private String risco;

    @NotNull(message = "Gerente é obrigatório")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idgerente", nullable = false)
    private Pessoa gerente;
} 