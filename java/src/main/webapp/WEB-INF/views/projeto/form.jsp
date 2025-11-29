<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html>
<head>
    <title>Projeto</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
</head>
<body>
<div class="container mt-4">
    <h1>${projeto.id == null ? 'Novo Projeto' : 'Editar Projeto'}</h1>
    <form method="post" action="${projeto.id == null ? '/projetos' : '/projetos/atualizar/' += projeto.id}">
        <div class="mb-3">
            <label for="nome" class="form-label">Nome</label>
            <input type="text" class="form-control" id="nome" name="nome" value="${projeto.nome}" required>
        </div>
        <div class="mb-3">
            <label for="dataInicio" class="form-label">Data de Início</label>
            <input type="date" class="form-control" id="dataInicio" name="dataInicio" value="${projeto.dataInicio}">
        </div>
        <div class="mb-3">
            <label for="dataPrevisaoFim" class="form-label">Previsão de Término</label>
            <input type="date" class="form-control" id="dataPrevisaoFim" name="dataPrevisaoFim" value="${projeto.dataPrevisaoFim}">
        </div>
        <div class="mb-3">
            <label for="dataFim" class="form-label">Data Real de Término</label>
            <input type="date" class="form-control" id="dataFim" name="dataFim" value="${projeto.dataFim}">
        </div>
        <div class="mb-3">
            <label for="orcamento" class="form-label">Orçamento Total</label>
            <input type="number" step="0.01" class="form-control" id="orcamento" name="orcamento" value="${projeto.orcamento}">
        </div>
        <div class="mb-3">
            <label for="descricao" class="form-label">Descrição</label>
            <textarea class="form-control" id="descricao" name="descricao" rows="3">${projeto.descricao}</textarea>
        </div>
        <div class="mb-3">
            <label for="status" class="form-label">Status</label>
            <select class="form-select" id="status" name="status" required>
                <option value="">Selecione</option>
                <option value="em análise" ${projeto.status == 'em análise' ? 'selected' : ''}>Em análise</option>
                <option value="análise realizada" ${projeto.status == 'análise realizada' ? 'selected' : ''}>Análise realizada</option>
                <option value="análise aprovada" ${projeto.status == 'análise aprovada' ? 'selected' : ''}>Análise aprovada</option>
                <option value="iniciado" ${projeto.status == 'iniciado' ? 'selected' : ''}>Iniciado</option>
                <option value="planejado" ${projeto.status == 'planejado' ? 'selected' : ''}>Planejado</option>
                <option value="em andamento" ${projeto.status == 'em andamento' ? 'selected' : ''}>Em andamento</option>
                <option value="encerrado" ${projeto.status == 'encerrado' ? 'selected' : ''}>Encerrado</option>
                <option value="cancelado" ${projeto.status == 'cancelado' ? 'selected' : ''}>Cancelado</option>
            </select>
        </div>
        <div class="mb-3">
            <label for="risco" class="form-label">Risco</label>
            <select class="form-select" id="risco" name="risco" required>
                <option value="">Selecione</option>
                <option value="baixo risco" ${projeto.risco == 'baixo risco' ? 'selected' : ''}>Baixo risco</option>
                <option value="médio risco" ${projeto.risco == 'médio risco' ? 'selected' : ''}>Médio risco</option>
                <option value="alto risco" ${projeto.risco == 'alto risco' ? 'selected' : ''}>Alto risco</option>
            </select>
        </div>
        <div class="mb-3">
            <label for="gerente" class="form-label">Gerente Responsável (ID)</label>
            <input type="number" class="form-control" id="gerente" name="gerente.id" value="${projeto.gerente != null ? projeto.gerente.id : ''}" required>
        </div>
        <button type="submit" class="btn btn-success">Salvar</button>
        <a href="/projetos" class="btn btn-secondary">Cancelar</a>
    </form>
</div>
</body>
</html> 