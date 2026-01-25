# 🎯 Perssua - AI Meeting Copilot

Assistente de reuniões em tempo real com arquitetura de **streaming contínuo**.

![Version](https://img.shields.io/badge/version-2.0.0-cyan) 
![Electron](https://img.shields.io/badge/Electron-28-blue) 
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-purple)

## 🏗️ Arquitetura

```
🎤 Microfone (contínuo)
   ↓
🗣️ Speech-to-Text (chunks 3s)
   ↓
🧠 Buffer de Memória (janela deslizante)
   ↓
🤖 LLM Streaming (respostas incrementais)
   ↓
🖥️ UI em tempo real
```

## ✨ Funcionalidades

| Recurso | Descrição |
|---------|-----------|
| 🎤 **Captura Contínua** | Escuta sem interrupção durante toda a sessão |
| 🗣️ **Transcrição Streaming** | Whisper processa chunks de 3 segundos |
| 🧠 **Memória Contextual** | Janela deslizante com últimas 20 interações |
| 🤖 **IA Streaming** | Respostas aparecem caractere por caractere |
| 🖥️ **UI Overlay** | Interface discreta, sempre no topo |
| 🔒 **Modo Contínuo** | Sessão ativa até você pausar |

## 🚀 Como Usar

### 1. Instalar
```bash
npm install
```

### 2. Executar
```bash
npm start
```

### 3. Configurar API Key
1. Obtenha em [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Cole no campo inicial
3. Clique "Conectar"

### 4. Durante a Reunião
1. **Clique no microfone** para iniciar a sessão contínua
2. Fale normalmente
3. Sugestões aparecem em **tempo real**
4. A IA mantém contexto de toda a conversa
5. **Clique novamente** para pausar

## 🧠 Como a IA Funciona

A IA opera em **modo contínuo** com este prompt:

```
Atue como um AI Meeting Copilot invisível.

Comportamento:
- Escute continuamente
- NÃO encerre a conversa
- Gere sugestões apenas quando relevante
- Atualize respostas conforme o contexto muda

Quando responder:
- Perguntas (explícitas ou implícitas)
- Objeções detectadas
- Oportunidades de intervenção

Formato:
💡 Sugestão: [1-2 linhas diretas]
📊 Argumento: [dado ou fato relevante]
❓ Follow-up: [pergunta opcional]
```

## 📁 Estrutura

```
myAssis/
├── src/
│   ├── main.js              # Electron + OpenAI streaming
│   ├── preload.js           # IPC bridge seguro
│   └── renderer/
│       ├── index.html       # Interface
│       ├── styles.css       # Dark glassmorphism
│       └── app.js           # Lógica de streaming
├── package.json
└── README_MVP.md
```

## ⚙️ Configurações Técnicas

| Parâmetro | Valor | Descrição |
|-----------|-------|-----------|
| `CHUNK_INTERVAL` | 3000ms | Intervalo de processamento de áudio |
| `MAX_HISTORY_ITEMS` | 20 | Máximo de interações na memória |
| `MAX_TOKENS_ESTIMATE` | 4000 | Tokens máximos de contexto |
| `MIN_AUDIO_SIZE` | 2000 bytes | Tamanho mínimo para processar |

## 🔒 Privacidade

- ✅ API Key armazenada **apenas localmente**
- ✅ Áudio processado em tempo real, **não armazenado**
- ✅ Memória existe apenas na sessão atual
- ✅ Nenhum dado enviado para servidores externos (além da OpenAI)

## 💰 Custos Estimados

| Serviço | Custo |
|---------|-------|
| Whisper | ~$0.006/min |
| GPT-4o-mini | ~$0.0015/1K tokens |

**Exemplo:** Reunião de 30 min ≈ $0.25-0.40

## 🛠️ Próximas Melhorias

- [ ] Captura de áudio do sistema (loopback)
- [ ] Detecção automática de objeções
- [ ] Resumo automático pós-reunião
- [ ] Exportar transcrição completa
- [ ] Hotkeys globais
- [ ] Integração Zoom/Meet/Teams

## 📝 Comandos

```bash
npm start      # Inicia o app
npm run dev    # Inicia com logs
```

---

**Arquitetura:** Streaming Audio + STT + Memory Window + Streaming LLM

Desenvolvido para tornar reuniões mais produtivas 🚀
