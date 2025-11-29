# 🚀 APIs REST - Testes no Postman

## 📋 **Endpoints de Pessoa (`/api/pessoas`)**

### **1. Listar Todas as Pessoas**
```
GET http://localhost:8080/api/pessoas
```

### **2. Buscar Pessoa por ID**
```
GET http://localhost:8080/api/pessoas/1
```

### **3. Listar Apenas Gerentes**
```
GET http://localhost:8080/api/pessoas/gerentes
```

### **4. Listar Apenas Funcionários**
```
GET http://localhost:8080/api/pessoas/funcionarios
```

### **5. Criar Nova Pessoa**
```
POST http://localhost:8080/api/pessoas
Content-Type: application/json

{
  "nome": "João Silva",
  "cpf": "123.456.789-00",
  "datanascimento": "1990-05-15",
  "funcionario": true,
  "gerente": true
}
```

### **6. Criar Pessoa Funcionária (não gerente)**
```
POST http://localhost:8080/api/pessoas
Content-Type: application/json

{
  "nome": "Maria Santos",
  "cpf": "987.654.321-00",
  "datanascimento": "1985-08-20",
  "funcionario": true,
  "gerente": false
}
```

### **7. Editar Pessoa**
```
PUT http://localhost:8080/api/pessoas/1
Content-Type: application/json

{
  "nome": "João Silva Atualizado",
  "cpf": "123.456.789-00",
  "datanascimento": "1990-05-15",
  "funcionario": true,
  "gerente": true
}
```

### **8. Excluir Pessoa**
```
DELETE http://localhost:8080/api/pessoas/1
```

---

## 📊 **Endpoints de Projeto (`/api/projetos`)**

### **1. Listar Todos os Projetos**
```
GET http://localhost:8080/api/projetos
```

### **2. Buscar Projeto por ID**
```
GET http://localhost:8080/api/projetos/1
```

### **3. Buscar Projetos por Status**
```
GET http://localhost:8080/api/projetos/status/em andamento
```

### **4. Buscar Projetos por Risco**
```
GET http://localhost:8080/api/projetos/risco/médio risco
```

### **5. Criar Novo Projeto**
```
POST http://localhost:8080/api/projetos
Content-Type: application/json

{
  "nome": "Sistema de Gestão",
  "dataInicio": "2024-01-15",
  "dataPrevisaoFim": "2024-06-30",
  "dataFim": null,
  "orcamento": 50000.00,
  "descricao": "Sistema completo de gestão empresarial",
  "status": "em andamento",
  "risco": "médio risco",
  "gerente": {
    "id": 1
  }
}
```

### **6. Criar Projeto Mobile**
```
POST http://localhost:8080/api/projetos
Content-Type: application/json

{
  "nome": "App Mobile",
  "dataInicio": "2024-03-01",
  "dataPrevisaoFim": "2024-08-15",
  "dataFim": null,
  "orcamento": 75000.00,
  "descricao": "Aplicativo mobile para iOS e Android",
  "status": "planejado",
  "risco": "baixo risco",
  "gerente": {
    "id": 1
  }
}
```

### **7. Criar Projeto de Alto Risco**
```
POST http://localhost:8080/api/projetos
Content-Type: application/json

{
  "nome": "Sistema de IA",
  "dataInicio": "2024-02-01",
  "dataPrevisaoFim": "2024-12-31",
  "dataFim": null,
  "orcamento": 150000.00,
  "descricao": "Sistema de inteligência artificial avançado",
  "status": "em análise",
  "risco": "alto risco",
  "gerente": {
    "id": 1
  }
}
```

### **8. Editar Projeto**
```
PUT http://localhost:8080/api/projetos/1
Content-Type: application/json

{
  "nome": "Sistema de Gestão Atualizado",
  "dataInicio": "2024-01-15",
  "dataPrevisaoFim": "2024-07-30",
  "dataFim": null,
  "orcamento": 60000.00,
  "descricao": "Sistema completo de gestão empresarial - Versão 2.0",
  "status": "em andamento",
  "risco": "médio risco",
  "gerente": {
    "id": 1
  }
}
```

### **9. Atualizar Apenas Status do Projeto**
```
PATCH http://localhost:8080/api/projetos/1/status
Content-Type: application/json

"encerrado"
```

### **10. Atualizar Apenas Orçamento do Projeto**
```
PATCH http://localhost:8080/api/projetos/1/orcamento
Content-Type: application/json

75000.00
```

### **11. Excluir Projeto**
```
DELETE http://localhost:8080/api/projetos/1
```

---

## 🧪 **Testes de Validação**

### **CPF Inválido**
```
POST http://localhost:8080/api/pessoas
Content-Type: application/json

{
  "nome": "Teste CPF Inválido",
  "cpf": "123.456.789-01",
  "datanascimento": "1990-05-15",
  "funcionario": true,
  "gerente": false
}
```

### **Data de Nascimento Futura**
```
POST http://localhost:8080/api/pessoas
Content-Type: application/json

{
  "nome": "Teste Data Futura",
  "cpf": "123.456.789-00",
  "datanascimento": "2030-05-15",
  "funcionario": true,
  "gerente": false
}
```

### **Datas de Projeto Inválidas**
```
POST http://localhost:8080/api/projetos
Content-Type: application/json

{
  "nome": "Projeto Datas Inválidas",
  "dataInicio": "2024-06-30",
  "dataPrevisaoFim": "2024-01-15",
  "orcamento": 50000.00,
  "descricao": "Teste de validação de datas",
  "status": "planejado",
  "risco": "baixo risco",
  "gerente": {
    "id": 1
  }
}
```

---

## 📝 **Sequência de Testes Recomendada**

### **1. Criar Pessoas Primeiro:**
1. Criar gerente (pessoa com `gerente: true`)
2. Criar funcionário (pessoa com `funcionario: true`, `gerente: false`)

### **2. Criar Projetos:**
1. Usar o ID do gerente criado no campo `gerente.id`
2. Testar diferentes status e riscos

### **3. Testar Consultas:**
1. Listar todas as pessoas
2. Listar apenas gerentes
3. Listar apenas funcionários
4. Buscar projetos por status
5. Buscar projetos por risco

### **4. Testar Atualizações:**
1. Editar pessoa
2. Editar projeto completo
3. Atualizar apenas status do projeto
4. Atualizar apenas orçamento do projeto

### **5. Testar Exclusões:**
1. Excluir projeto
2. Excluir pessoa

---

## ⚠️ **Observações Importantes**

- **CORS**: Habilitado para todas as origens (`*`)
- **Validações**: CPF, datas, regras de negócio implementadas
- **Status Codes**: 
  - `200` - Sucesso
  - `201` - Criado com sucesso
  - `400` - Erro de validação
  - `404` - Não encontrado
- **Content-Type**: Sempre `application/json`
- **Gerente**: Projetos precisam de um gerente válido (pessoa com `gerente: true`) 