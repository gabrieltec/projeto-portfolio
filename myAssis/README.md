# 🧠 AI Meeting Companion (Perssua v3)

**Real-time AI Copilot for Meetings, Sales & Presentations**

Um aplicativo desktop que atua como um **copiloto de reuniões com IA**, escutando conversas em tempo real, transcrevendo, entendendo contexto e sugerindo **respostas automáticas e acionáveis**, sem necessidade de interação manual.

Inspirado em ferramentas como **Perssua**, **AI Meeting Copilots** e **Sales Assistants**, com foco em baixa latência, privacidade e extensibilidade.

---

## 🚀 Principais Funcionalidades

### Core Features
* 🎤 Captura contínua de áudio (microfone e/ou áudio do sistema)
* 🗣️ Speech-to-Text em tempo real (streaming)
* 🤖 IA em modo contínuo (não request/response)
* 🧠 Memória de contexto da reunião
* ❓ Detecção automática de perguntas
* ⚡ Sugestão automática de respostas
* 🖥️ Overlay discreto (não aparece em screen share)
* ⌨️ Atalhos configuráveis
* ⚙️ Setup inicial guiado (wizard)
* 🎛️ Painel completo de configurações
* 🔒 Foco em privacidade

### 🆕 v3 - Features Avançadas
* 📸 **Screenshot + IA Visual** - Captura tela e analisa com GPT-4 Vision no contexto da reunião
* 🧠 **Intent Detection** - Classifica automaticamente cada fala (pergunta, objeção, dúvida, decisão, pressão)
* 💬 **Chat Paralelo** - Converse com a IA por texto sem interromper a reunião
* 🎭 **Personas de Resposta** - Respostas sob perspectiva de Engenheiro, Vendedor, PM, Executivo ou Coach
* 🎤 **"What should I say now?"** - Sugestão ativa para situações específicas (silêncio, objeção, fechamento)
* 🔄 **Reescrita Instantânea** - Botões para reescrever sugestões (mais curto, técnico, simples, firme)
* 💻 **Developer Mode** - Blocos de código isolados e copiáveis
* 📄 **Export Meeting** - Exporta reunião em Markdown ou PDF/HTML
* 🧠 **Memória por Cliente** - Contexto persistente por cliente/projeto
* 🔒 **Modo Confidencial** - IA ajuda mas nada é gravado

---

## 🧩 Visão Geral da Arquitetura

```
🎤 Áudio da reunião
   ↓
🗣️ Speech-to-Text (Streaming)
   ↓
🧠 Buffer de contexto (memória)
   ↓
🤖 LLM (Streaming / Auto-Answer)
   ↓
🖥️ Sugestões em tempo real (Overlay)
```

O sistema permanece ativo durante toda a reunião, reagindo automaticamente conforme novas falas são detectadas.

---

## 🧠 Modo AI Meeting Companion (Contínuo)

A IA atua como um **agente persistente**, não como um chatbot tradicional.

### Comportamento:

* Escuta continuamente
* Mantém contexto da conversa
* Não encerra sessão automaticamente
* Só intervém quando há valor real
* Atualiza sugestões conforme o contexto evolui

A sessão só é encerrada quando o usuário executa o comando explícito **"Encerrar Sessão"**.

---

## 📸 Screenshot + IA Visual (v3)

Captura a tela e analisa imagens no contexto da reunião usando **GPT-4 Vision**.

### Como usar:
1. Clique no botão **📸 Screenshot** na toolbar
2. Clique em **Capturar** para tirar o screenshot
3. Digite uma pergunta sobre a imagem (opcional)
4. Clique em **Analisar com IA**

### Casos de uso:
- "Esse erro aqui é por quê?"
- "Esse diagrama escala?"
- "O que esse gráfico mostra?"
- "Esse código tem problema?"

> 💡 A IA considera todo o contexto da reunião ao analisar a imagem.

---

## 🧠 Intent Detection Engine (v3)

Classifica automaticamente **a intenção** por trás de cada fala, não apenas o que foi dito.

### Tipos de Intenção Detectados:

| Badge | Intenção | Exemplos |
|-------|----------|----------|
| ❓ Pergunta | Questões diretas | "Como funciona?", "Qual o prazo?" |
| 🚨 Objeção | Resistência | "Muito caro", "Não preciso" |
| 🤔 Dúvida | Incerteza | "Não sei se...", "Será que..." |
| ✅ Decisão | Definições | "Vamos fazer", "Fechado" |
| ⚡ Pressão | Urgência | "Urgente", "Preciso hoje" |
| 👍 Confirmação | Concordância | "Ok", "Entendi", "Perfeito" |
| ⚠️ Risco | Alertas | "Cuidado", "Problema", "Risco" |
| 💬 Afirmação | Neutro | Declarações gerais |

Cada transcrição recebe automaticamente um badge colorido indicando a intenção.

---

## 💬 Chat Paralelo com IA (v3)

Converse com a IA **por texto** sem interromper a sessão de áudio.

### Como usar:
1. Clique no botão **💬 Chat** na toolbar
2. Digite sua mensagem
3. A IA responde considerando o contexto da reunião

### Casos de uso:
- Pedir uma sugestão diferente
- Fazer perguntas sem falar em voz alta
- Pedir versão mais curta/longa de algo
- Tirar dúvidas sobre a conversa

> 💡 O chat **não pausa** o modo contínuo de áudio.

---

## 🎭 Personas de Resposta (v3)

Muda a **perspectiva** de quem responde, não só o texto.

### Personas Disponíveis:

| Persona | Foco |
|---------|------|
| 🔧 **Engenheiro** | Viabilidade técnica, arquitetura, trade-offs |
| 💼 **Vendedor** | Valor, ROI, urgência, benefícios |
| 📊 **Product Manager** | Impacto, priorização, métricas |
| 👔 **Executivo** | Estratégia, visão macro, decisões |
| 🎯 **Coach** | Perguntas poderosas, reflexão |

### Como usar:
- Selecione a persona no dropdown abaixo da toolbar
- Todas as sugestões seguirão essa perspectiva
- Deixe em "Auto" para comportamento padrão

---

## 🎤 "What should I say now?" (v3)

Sugestão **proativa** baseada na situação atual da conversa.

### Como usar:
1. Clique no botão **🎤 O que dizer?** na toolbar
2. Selecione a situação:
   - 😶 **Silêncio** - A conversa parou
   - ❓ **Fui questionado** - Preciso responder
   - 🔄 **Reunião travou** - Como destravar
   - 🚨 **Objeção** - Como contornar
   - ✅ **Fechamento** - Como encerrar bem

### Formato da resposta:
```
🎤 O que dizer: [frase exata para usar]
💡 Por que: [estratégia por trás]
⚡ Alternativa: [outra opção]
```

---

## 🔄 Reescrita Instantânea (v3)

Reescreva qualquer sugestão **com um clique**, sem recalcular tudo.

### Botões disponíveis em cada sugestão:

| Botão | Efeito |
|-------|--------|
| ✂️ **Mais curto** | Resume em 1-2 linhas |
| 🔧 **Mais técnico** | Linguagem técnica e precisa |
| 💡 **Mais simples** | Explicação fácil de entender |
| 💪 **Mais firme** | Tom assertivo e direto |

---

## 💻 Developer Mode (v3)

Quando a IA gera **código**, ele aparece em blocos isolados e copiáveis.

### Características:
- Código **separado** do texto explicativo
- Botão **Copiar** em cada bloco
- Sintaxe **destacada** por linguagem
- **Sem markdown** misturado

### Exemplo visual:
```
┌─────────────────────────────────┐
│ javascript          [Copiar]   │
├─────────────────────────────────┤
│ const result = items.filter(   │
│   item => item.active          │
│ );                             │
└─────────────────────────────────┘
```

---

## 📄 Exportação de Reunião (v3)

Transforma a reunião em **documento acionável**.

### Formatos:

| Formato | Uso | Conteúdo |
|---------|-----|----------|
| 📝 **Markdown** | Técnico / Dev / Wiki | Formatado para Git, Notion |
| 📄 **PDF/HTML** | Executivo / Cliente | Pronto para impressão |

### Conteúdo exportado:
- ✅ Transcrição completa
- ✅ Sugestões da IA
- ✅ Data e hora
- ✅ Formatação profissional

> 💡 Não é só transcrição bruta - é conteúdo **organizado e útil**.

---

## 🧠 Memória por Cliente/Projeto (v3)

Contexto **persistente** opcional por cliente ou projeto.

### Como usar:
1. Clique no botão **👤 Cliente** na toolbar
2. Digite o nome do cliente/projeto
3. Clique em **Carregar** (se existir) ou **+ Novo**
4. Adicione notas sobre esse cliente

### Exemplos de notas:
- "Sempre reclama de preço - focar em ROI"
- "Decisor real é o CTO, não o gerente"
- "Gosta de dados e números"
- "Projeto em fase de orçamento Q2"

> 💡 A IA usa essas notas para **antecipar** objeções e personalizar respostas.

---

## 🔒 Modo Confidencial (v3)

IA ajuda, mas **nada é gravado**.

### Como ativar:
1. Clique no cadeado 🔒 na toolbar
2. O botão fica vermelho quando ativo
3. Aparece indicador "🔒 CONFIDENCIAL" pulsante

### Comportamento:
- ✅ IA continua funcionando normalmente
- ❌ Transcrições **não são salvas** no histórico
- ❌ Reunião **não aparece** no histórico
- ❌ Nenhum dado **persiste** após encerrar

### Casos de uso:
- Discussões de salário
- Planejamento estratégico
- Assuntos de RH
- Questões jurídicas

---

## ❓ Detecção Automática de Perguntas (Auto-Answer Mode)

O sistema identifica **perguntas explícitas e implícitas** e gera **respostas automaticamente**, em tempo real.

### Tipos de perguntas detectadas:

* Perguntas diretas (com `?`)
* Pedidos de explicação
* Dúvidas implícitas
* Objeções técnicas ou comerciais

### Exemplo:

**Fala detectada:**

> "Como isso se integra com nossos sistemas atuais"

**Sugestão automática:**

```
Resposta sugerida:
A integração ocorre via APIs REST e eventos, sem impacto nos sistemas legados.

Complemento:
Pode ser adotada gradualmente, rodando em paralelo.

Follow-up:
Quer que eu explique um fluxo técnico rápido?
```

---

## ⚙️ Setup Inicial (Configuration Wizard)

Ao abrir o app pela primeira vez, o usuário passa por um **assistente de configuração guiado**.

⏱️ Tempo médio: **2–5 minutos**

### Etapas:

#### 1️⃣ Permissões

* Microfone
* Captura de áudio do sistema
* Overlay flutuante

#### 2️⃣ Configuração de Áudio

* 🎙️ Entrada de áudio:

  * Microfone padrão
  * Microfone externo
  * Áudio do sistema (loopback)

* 🔊 Saída de áudio:

  * Headset
  * Caixa de som
  * Dispositivo virtual

#### 3️⃣ Configuração da IA

* Provedor (OpenAI, Azure, Local)
* API Key
* Idioma principal

#### 4️⃣ Perfil de Uso

* Reuniões técnicas
* Vendas
* Entrevistas
* Apresentações
* Customizado

#### 5️⃣ Atalhos (Shortcuts)

* Ativar / Pausar IA
* Mutar sugestões
* Fixar overlay
* Limpar contexto
* Encerrar sessão

---

## 🔗 Drag and Drop (Mesclar Transcrições)

Você pode mesclar transcrições manualmente arrastando uma sobre a outra:

1. **Passe o mouse** sobre uma transcrição para ver o ícone de arraste (⋮⋮)
2. **Clique e arraste** a transcrição desejada
3. **Solte sobre** outra transcrição para mesclá-las
4. Os textos serão combinados automaticamente na ordem cronológica
5. A transcrição de origem é removida após a mesclagem

> 💡 **Dica:** Use isso quando a IA não detectou automaticamente que duas falas fazem parte do mesmo contexto.

---

## 🚨 Detecção de Objeções (v1.5)

O sistema detecta automaticamente objeções comuns durante a conversa:

| Tipo | Exemplos |
|------|----------|
| 💰 Preço | "muito caro", "fora do orçamento", "não temos budget" |
| ⏰ Tempo | "não tenho tempo", "estamos ocupados", "depois vemos" |
| 🎯 Necessidade | "não preciso", "já temos", "estamos bem assim" |
| 🏆 Concorrência | "fulano oferece mais barato", "já usamos X" |
| 👔 Autoridade | "preciso falar com meu chefe", "não sou eu quem decide" |
| 🤝 Confiança | "não conheço", "nunca ouvi falar", "é muito novo" |

Quando uma objeção é detectada, a IA fornece:
- Identificação do tipo de objeção
- Sugestão de como contorná-la
- Argumentos e dados de apoio

---

## ⭐ Score de Confiança (v1.5)

Cada sugestão inclui um score de confiança:

| Score | Significado |
|-------|-------------|
| ⭐⭐⭐⭐⭐ | Muito confiante - contexto claro |
| ⭐⭐⭐⭐ | Confiante - boa análise |
| ⭐⭐⭐ | Moderado - pode haver ambiguidade |
| ⭐⭐ | Pouca confiança - contexto limitado |
| ⭐ | Especulativo - pouco contexto |

---

## 📋 Resumo da Reunião (v1.5)

Gere um resumo executivo da reunião a qualquer momento:

1. Clique no ícone 📄 na seção de Sugestões
2. O resumo inclui:
   - **Visão Geral** - Propósito e resultado
   - **Principais Pontos** - O que foi discutido
   - **Objeções** - Identificadas e como foram tratadas
   - **Decisões** - O que foi definido
   - **Próximos Passos** - Ações com responsáveis
   - **Insights** - Observações relevantes
3. Copie o resumo com um clique

---

## 👤 Perfis de Reunião (v2.0)

O app vem com 6 perfis otimizados para diferentes tipos de reunião:

| Perfil | Descrição | Foco |
|--------|-----------|------|
| 🎯 Geral | Reuniões gerais | Clareza, objetividade |
| 💼 Vendas | Comercial e negociações | Objeções, fechamento, valor |
| 🔧 Técnico | Discussões técnicas | Precisão, arquitetura |
| 👔 Entrevista | Entrevistas de emprego | Método STAR, competências |
| 📊 Apresentação | Pitches e apresentações | Storytelling, engajamento |
| 🤝 Negociação | Acordos e contratos | BATNA, valor mútuo |

### Criar Perfil Personalizado
1. Vá em Configurações → Perfis
2. Clique em "Criar Perfil Personalizado"
3. Defina nome, emoji, descrição e instruções para a IA

---

## 📚 Histórico de Reuniões (v2.0)

Todas as suas reuniões são salvas automaticamente:

- **Armazenamento local** - Dados ficam no seu computador
- **Até 50 reuniões** - Histórico com auto-limpeza
- **Busca por data** - Encontre reuniões anteriores
- **Resumo salvo** - Acesse resumos gerados
- **Exclusão fácil** - Remova reuniões indesejadas

---

## 👍 Sistema de Feedback (v2.0)

Ajude o app a melhorar suas sugestões:

- Cada sugestão tem botões **👍 Útil** e **👎 Não ajudou**
- Seu feedback é salvo localmente
- Estatísticas mostram a taxa de utilidade
- O sistema aprende com seus feedbacks

---

## 🔍 Detecção de Apps (v2.0)

O app detecta automaticamente se você está usando:

- 📹 **Zoom**
- 👥 **Microsoft Teams**
- 🎥 **Google Meet** (via browser)
- 💬 **Slack**
- 🎮 **Discord**
- 📞 **Webex**

> Aparece na aba Perfis quando algum app é detectado.

---

## ⌨️ Atalhos Padrão

| Ação               | Atalho           |
| ------------------ | ---------------- |
| Ativar / Pausar IA | Ctrl + Shift + 1 |
| Mutar sugestões    | Ctrl + Shift + 2 |
| Fixar overlay      | Ctrl + Shift + 3 |
| Limpar contexto    | Ctrl + Shift + 4 |
| Encerrar sessão    | Ctrl + Shift + 5 |

Todos os atalhos são **totalmente configuráveis**.

---

## 🎛️ Configurações Avançadas

### 🎧 Áudio

* Sensibilidade de captura
* Ignorar silêncio/ruído
* Tamanho do chunk (1–3s)
* Prioridade de dispositivo

### 🧠 IA

* Auto-Answer: Ligado / Desligado
* Sensibilidade de detecção de perguntas
* Janela de memória (últimos X minutos)
* Estilo de resposta:

  * Objetiva
  * Técnica
  * Persuasiva
* Delay mínimo entre sugestões

### 🖥️ Interface 

* Opacidade do overlay
* Posição da tela
* Modo compacto / expandido
* Sempre no topo

### 🖥️ Interface de configuracao

## aba geral

* Posso inserir chave OpenAI
* Escolher idioma de entrada
* Escolher idioma de saida
* Modelo do gpt (padrao gpt-4o)
* Sugestao automatica on/off
* Modo de assistencia

## aba atalhos

* Atalhos do teclado

### 🔒 Privacidade

* Não salvar áudio
* Não salvar transcrição
* Limpeza automática ao encerrar sessão

---

## 🧠 Prompt Base do Sistema

```
Você é um AI Meeting Companion em tempo real.

Objetivo:
Detectar perguntas explícitas ou implícitas na conversa e sugerir respostas automáticas.

Regras:
- Você recebe transcrições contínuas.
- Mantenha o contexto da reunião.
- Gere respostas curtas, claras e acionáveis.
- Não aguarde solicitação do usuário.
- Ignore ruídos e conversas irrelevantes.
- Não encerre a sessão automaticamente.

Formato:
Resposta sugerida:
<texto>

Complemento (opcional):
<detalhe técnico>

Follow-up (opcional):
<pergunta>

Sessão ativa até comando explícito de encerramento.
```

---

## 🛠️ Stack Tecnológica

### Frontend

* Electron
* HTML/CSS/JavaScript
* Glassmorphism UI

### Backend

* Node.js
* IPC (Inter-Process Communication)

### IA

* OpenAI GPT-4o / GPT-4o-mini
* Whisper API (Speech-to-Text)
* GPT-4 Vision (Análise de imagens)

### Armazenamento

* localStorage (configurações)
* JSON (histórico, memórias)
* Nenhum áudio salvo por padrão

---

## 🧪 Versões

### v1.0 ✅ (MVP)

* ✅ Captura contínua de áudio
* ✅ Transcrição em tempo real
* ✅ IA em modo contínuo
* ✅ Texto completo nas transcrições (sem "...")
* ✅ Detecção automática de perguntas
* ✅ Sugestão automática de respostas
* ✅ Acoplamento inteligente de transcrições do mesmo contexto
* ✅ Deleção automática de transcrições acopladas
* ✅ Sugestão sob demanda (clique para gerar)
* ✅ Drag and Drop para mesclar transcrições manualmente
* ✅ Overlay simples
* ✅ Setup wizard
* ✅ Atalhos globais configuráveis

### v1.5 ✅

* ✅ Detecção de objeções (preço, tempo, necessidade, concorrência, autoridade, confiança)
* ✅ Score de confiança (⭐ a ⭐⭐⭐⭐⭐) em cada sugestão
* ✅ Resumo automático da reunião
* ✅ Botão de gerar resumo sob demanda
* ✅ Copiar/exportar resumo
* ✅ Acoplamento inteligente de transcrições do mesmo contexto
* ✅ Deleção automática de transcrições acopladas

### v2.0 ✅

* ✅ Perfis por tipo de reunião (6 perfis padrão + customizados)
* ✅ Histórico de reuniões salvo localmente
* ✅ Sistema de feedback (👍 útil / 👎 não ajudou)
* ✅ Estatísticas de utilidade das sugestões
* ✅ Detecção automática de apps (Zoom, Teams, Meet, Slack, Discord)
* ✅ Criar/editar/excluir perfis personalizados
* ✅ Seleção rápida de perfil na interface

### v3.0 ✅

* ✅ Screenshot + IA Visual (GPT-4 Vision)
* ✅ Intent Detection Engine (7 tipos de intenção)
* ✅ Chat paralelo com IA (texto)
* ✅ Personas de Resposta (5 personas)
* ✅ "What should I say now?" (sugestão proativa)
* ✅ Reescrita instantânea (4 estilos)
* ✅ Developer Mode (código copiável)
* ✅ Exportação Markdown/PDF
* ✅ Memória por cliente/projeto
* ✅ Modo confidencial (sem gravação)

### v4.0 ✅ (Atual) - Personal Communication Intelligence Platform

* ✅ **Meeting Goal Engine** - Define objetivo, monitora progresso, alerta desvios, score final
* ✅ **Coaching Mode Pós-Reunião** - Análise de comunicação, clareza, assertividade, escuta ativa
* ✅ **Simulação de Reunião** - Treino com IA (entrevista, venda, negociação) com níveis de dificuldade
* ✅ **English Assist Mode** - Tradução literal/profissional/estratégica + "Speak For Me"
* ✅ **Context Injection** - Injeta CV, Job Description, dados da empresa e entrevistador
* ✅ **Speaking Analytics** - Estatísticas de fala (% tempo, palavras de incerteza, perguntas)
* ✅ **Adaptive Personality** - IA aprende seu estilo de comunicação preferido

---

## 🎯 Meeting Goal Engine (v4)

Defina o objetivo da reunião antes de começar:

1. **Objetivo Principal** - O que você quer alcançar
2. **Resultado Desejado** - O que seria sucesso
3. **O que evitar** - O que NÃO pode acontecer
4. **Tipo de interlocutor** - Técnico, Gestor, RH, C-Level, Cliente

Durante a reunião:
- Monitoramento automático do progresso
- Alertas quando a conversa desvia
- Score de proximidade do objetivo

Após a reunião:
- **Score final** de atingimento do objetivo
- Lista de pontos fortes e oportunidades perdidas
- Recomendações para próxima vez

---

## 🎭 Simulação de Reunião (v4)

Treine antes da reunião real:

### Tipos de Simulação
| Tipo | Descrição |
|------|-----------|
| 💻 Entrevista Técnica | Perguntas de código, arquitetura, problem-solving |
| 🧠 Entrevista Comportamental | Método STAR, competências, fit cultural |
| 💼 Venda | Prospect cético, objeções, fechamento |
| 🤝 Negociação | Concessões, BATNA, valor mútuo |
| 📊 Pitch | Audiência questionadora |

### Níveis de Dificuldade
| Nível | Comportamento |
|-------|---------------|
| 🟢 Junior | Amigável, perguntas básicas |
| 🟡 Sênior | Técnico, questiona decisões |
| 🔴 Hostil | Cético, interrompe, pressiona |
| ⚡ Pressionador | Urgência, outras opções, descontos |

### Feedback em Tempo Real
- Score por resposta
- Sugestões de melhoria
- Relatório final com áreas para praticar

---

## 🎓 Coaching Mode (v4)

Análise detalhada após a reunião:

### Categorias Avaliadas
- **💬 Comunicação** - Clareza na expressão
- **✨ Clareza** - Organização das ideias
- **💪 Assertividade** - Confiança nas respostas
- **👂 Escuta Ativa** - Perguntas e interação

### O que inclui
- Score geral (0-100)
- Pontos fortes observados
- Áreas de melhoria específicas
- **Exercício prático** para próxima reunião
- **Frase modelo** para usar

---

## 🌍 English Assist (v4)

Suporte para reuniões em inglês:

### Modo Tradução
| Estilo | Uso |
|--------|-----|
| 📖 Literal | Tradução fiel ao original |
| 💼 Profissional | Como um nativo falaria no trabalho |
| 🎯 Estratégico | Otimizado para entrevistas/vendas |

Inclui:
- Alternativas de tradução
- Dicas de pronúncia
- Notas culturais

### Modo "Speak For Me"
Digite o que quer expressar em português e receba:
- Frase principal pronta
- Versão formal
- Versão casual
- **Dica de como falar** (tom, pausas, ênfase)

---

## 📄 Context Injection (v4)

Injete informações para a IA usar como **fonte de verdade**:

| Contexto | Benefício |
|----------|-----------|
| 📄 **Currículo** | IA usa suas experiências reais, não inventa |
| 📋 **Job Description** | Adapta linguagem ao nível da vaga |
| 🏢 **Empresa** | Personaliza para cultura da empresa |
| 👤 **Entrevistador** | Considera perfil/background do entrevistador |

### Anti-Hallucination
A IA só menciona experiências e tecnologias que estão no seu CV.

---

## 📊 Speaking Analytics (v4)

Dashboard de estatísticas:

| Métrica | Ideal |
|---------|-------|
| % Tempo falando | 45-55% em entrevistas |
| Tamanho médio de respostas | 50-100 palavras |
| Palavras de incerteza | Menos é melhor |
| Perguntas feitas | Pelo menos 3-5 |

---

## 🚀 Como Executar

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm start

# Executar com DevTools
npm run dev
```

---

## ⚠️ Aviso Legal

O usuário é responsável por:

* Consentimento dos participantes
* Cumprimento das leis locais de gravação
* Uso ético da ferramenta

---

## 📌 Status do Projeto

🚧 Em desenvolvimento ativo  
✅ **v4.0 funcional** - Personal Communication Intelligence Platform  
🤝 Contribuições são bem-vindas

---

## 🏆 Posicionamento

Com a v4, o Perssua não é mais apenas um "AI Meeting Assistant".

Agora é uma **Personal Communication Intelligence Platform**:

| Antes | Depois |
|-------|--------|
| Copiloto reativo | Preparador + Executor + Avaliador |
| Apenas durante reunião | Antes + Durante + Depois |
| Sugestões genéricas | Contexto personalizado (CV, empresa) |
| Feedback pontual | Coaching contínuo |

Isso muda:
- 💰 **Pricing** - Valor enterprise
- 👥 **Público** - Profissionais que querem evoluir
- 🎯 **Proposta** - Melhoria contínua de comunicação
