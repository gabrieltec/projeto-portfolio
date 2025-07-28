# Sistema de Portfólio de Projetos

## Descrição
Sistema para gerenciar os dados do portfólio de projetos de uma empresa, desenvolvido com Spring Boot, JPA/Hibernate, PostgreSQL e interface web com JSP e Bootstrap.

## Tecnologias Utilizadas
- **Backend:** Spring Boot 2.7.18, Spring Data JPA, Hibernate
- **Frontend:** JSP, Bootstrap 5.3.0
- **Banco de Dados:** PostgreSQL 15
- **Build:** Maven
- **Testes:** JUnit 5
- **Java:** 8

## Pré-requisitos
- Java 8 ou superior
- Docker e Docker Compose
- Maven

## Configuração e Execução

### 1. Configurar o Ambiente Java
```bash
# Definir JAVA_HOME (Windows PowerShell)
$env:JAVA_HOME="C:\Users\Gabriel\java\openlogic-openjdk-8u452-b09"
$env:Path="$env:JAVA_HOME\bin;$env:Path"

# Verificar versão
java -version
```

### 2. Iniciar o Banco de Dados PostgreSQL
```bash
# Subir o container do PostgreSQL
docker-compose up -d

# Verificar se está rodando
docker ps
```

### 3. Configurar o Banco de Dados
O banco será criado automaticamente com as seguintes configurações:
- **Host:** localhost
- **Porta:** 5432
- **Banco:** portfolio
- **Usuário:** postgres
- **Senha:** postgres

### 4. Executar o Projeto
```bash
# Compilar e executar
./mvnw spring-boot:run

# Ou usando Maven
mvn spring-boot:run
```

O sistema estará disponível em: `http://localhost:8080`

## Funcionalidades

### Gestão de Projetos
- **URL:** `http://localhost:8080/projetos`
- **Funcionalidades:**
  - Listar todos os projetos
  - Cadastrar novo projeto
  - Editar projeto existente
  - Excluir projeto (com restrições de status)

### Web Service para Membros
- **URL:** `http://localhost:8080/api/membros`
- **Método:** POST
- **Funcionalidade:** Cadastrar membros via API (apenas funcionários)

## Regras de Negócio

### Projetos
- **Status possíveis:** em análise, análise realizada, análise aprovada, iniciado, planejado, em andamento, encerrado, cancelado
- **Riscos:** baixo risco, médio risco, alto risco
- **Restrição de exclusão:** Projetos com status "iniciado", "em andamento" ou "encerrado" não podem ser excluídos

### Membros
- **Restrição:** Só é possível associar membros com atribuição de funcionário
- **Cadastro:** Apenas via web service (não via interface web)

## Estrutura do Banco de Dados

### Tabela: pessoa
- id (bigserial, PK)
- nome (varchar(100), NOT NULL)
- datanascimento (date)
- cpf (varchar(14))
- funcionario (boolean)
- gerente (boolean)

### Tabela: projeto
- id (bigserial, PK)
- nome (varchar(200), NOT NULL)
- data_inicio (date)
- data_previsao_fim (date)
- data_fim (date)
- descricao (varchar(5000))
- status (varchar(45))
- orcamento (float)
- risco (varchar(45))
- idgerente (bigint, FK para pessoa)

### Tabela: membro
- id (bigserial, PK)
- projeto_id (bigint, FK para projeto)
- pessoa_id (bigint, FK para pessoa)
- cargo (varchar(100), NOT NULL)

## Testes

### Executar Testes Unitários
```bash
# Executar todos os testes
./mvnw test

# Executar testes específicos
./mvnw test -Dtest=ProjetoServiceTest
./mvnw test -Dtest=MembroServiceTest
```

### Testes Implementados
- **ProjetoServiceTest:** Valida regras de exclusão baseadas no status
- **MembroServiceTest:** Valida restrição de associação apenas para funcionários

## Endpoints da API

### Projetos (Interface Web)
- `GET /projetos` - Listar projetos
- `GET /projetos/novo` - Formulário de novo projeto
- `POST /projetos` - Salvar novo projeto
- `GET /projetos/editar/{id}` - Formulário de edição
- `POST /projetos/atualizar/{id}` - Atualizar projeto
- `GET /projetos/excluir/{id}` - Excluir projeto

### Membros (Web Service)
- `POST /api/membros` - Cadastrar membro (JSON)

### Exemplo de JSON para cadastro de membro:
```json
{
  "projeto": {
    "id": 1
  },
  "pessoa": {
    "id": 2
  },
  "cargo": "Desenvolvedor"
}
```

## Desenvolvimento

### Estrutura do Projeto
```
src/
├── main/
│   ├── java/com/empresa/portfolio/
│   │   ├── controller/     # Controladores MVC
│   │   ├── model/         # Entidades JPA
│   │   ├── repository/    # Repositórios Spring Data
│   │   ├── service/       # Serviços e regras de negócio
│   │   └── PortfolioProjetoApplication.java
│   ├── resources/
│   │   └── application.properties
│   └── webapp/WEB-INF/views/
│       └── projeto/       # Views JSP
└── test/
    └── java/com/empresa/portfolio/
        └── service/       # Testes unitários
```

### Comandos Úteis
```bash
# Limpar e compilar
./mvnw clean compile

# Executar testes
./mvnw test

# Criar JAR executável
./mvnw package

# Executar JAR
java -jar target/portfolio-projeto-0.0.1-SNAPSHOT.jar
```

## Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco:**
   - Verificar se o Docker está rodando
   - Verificar se o container PostgreSQL está ativo: `docker ps`

2. **Erro de compilação Java:**
   - Verificar se JAVA_HOME está configurado corretamente
   - Verificar versão do Java: `java -version`

3. **Tabelas não criadas:**
   - Verificar se `spring.jpa.hibernate.ddl-auto=create-drop` está no application.properties
   - Verificar logs do Spring Boot para erros de conexão

4. **Erro de Lombok:**
   - Verificar se a versão do Lombok está especificada no pom.xml
   - Executar: `./mvnw clean install`

## Contato
Para dúvidas ou problemas, consulte a documentação do Spring Boot ou abra uma issue no repositório do projeto.

