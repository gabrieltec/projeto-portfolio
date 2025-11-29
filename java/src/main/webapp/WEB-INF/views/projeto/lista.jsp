<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html>
<head>
    <title>Projetos</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
</head>
<body>
<div class="container mt-4">
    <h1>Projetos</h1>
    <a href="/projetos/novo" class="btn btn-primary mb-3">Novo Projeto</a>
    <table class="table table-bordered table-striped">
        <thead>
        <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Status</th>
            <th>Risco</th>
            <th>Gerente</th>
            <th>Ações</th>
        </tr>
        </thead>
        <tbody>
        <c:forEach var="projeto" items="${projetos}">
            <tr>
                <td>${projeto.id}</td>
                <td>${projeto.nome}</td>
                <td>${projeto.status}</td>
                <td>${projeto.risco}</td>
                <td>${projeto.gerente.nome}</td>
                <td>
                    <a href="/projetos/editar/${projeto.id}" class="btn btn-sm btn-warning">Editar</a>
                    <a href="/projetos/excluir/${projeto.id}" class="btn btn-sm btn-danger" onclick="return confirm('Tem certeza que deseja excluir?')">Excluir</a>
                </td>
            </tr>
        </c:forEach>
        </tbody>
    </table>
</div>
</body>
</html> 