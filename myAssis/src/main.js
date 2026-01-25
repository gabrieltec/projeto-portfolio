const { app, BrowserWindow, ipcMain, desktopCapturer, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');
const OpenAI = require('openai');

let mainWindow;
let openai = null;

// Configurações padrão
let settings = {
  apiKey: '',
  inputLanguage: 'pt',
  outputLanguage: 'pt',
  model: 'gpt-4o-mini',
  autoSuggestion: true,
  assistanceMode: 'general',
  activeProfileId: 'general',
  shortcuts: {
    toggleSession: 'CommandOrControl+Shift+1',
    muteSuggestions: 'CommandOrControl+Shift+2',
    togglePin: 'CommandOrControl+Shift+3',
    clearContext: 'CommandOrControl+Shift+4',
    endSession: 'CommandOrControl+Shift+5'
  }
};

// ============================================
// PERFIS DE REUNIÃO (v2.0)
// ============================================

const defaultProfiles = {
  general: {
    id: 'general',
    name: '🎯 Geral',
    description: 'Para reuniões gerais e conversas',
    icon: '🎯',
    color: '#00d4aa',
    isDefault: true,
    prompt: 'Ajude em reuniões gerais com sugestões equilibradas e práticas.',
    focusAreas: ['clareza', 'objetividade', 'próximos passos'],
    suggestionStyle: 'balanced'
  },
  sales: {
    id: 'sales',
    name: '💼 Vendas',
    description: 'Reuniões comerciais e negociações',
    icon: '💼',
    color: '#f59e0b',
    isDefault: true,
    prompt: 'Foque em vendas: identificar objeções, criar urgência, destacar valor, técnicas de fechamento. Use gatilhos mentais como escassez, autoridade e prova social.',
    focusAreas: ['objeções', 'fechamento', 'valor', 'urgência'],
    suggestionStyle: 'persuasive'
  },
  technical: {
    id: 'technical',
    name: '🔧 Técnico',
    description: 'Discussões técnicas e arquitetura',
    icon: '🔧',
    color: '#3b82f6',
    isDefault: true,
    prompt: 'Foque em aspectos técnicos: precisão de dados, arquitetura, viabilidade, trade-offs, melhores práticas. Seja objetivo e use terminologia técnica apropriada.',
    focusAreas: ['precisão', 'viabilidade', 'arquitetura', 'performance'],
    suggestionStyle: 'analytical'
  },
  interview: {
    id: 'interview',
    name: '👔 Entrevista',
    description: 'Entrevistas de emprego',
    icon: '👔',
    color: '#a855f7',
    isDefault: true,
    prompt: 'Ajude em entrevistas: destacar experiências relevantes, usar método STAR (Situação, Tarefa, Ação, Resultado), demonstrar competências, fazer perguntas inteligentes.',
    focusAreas: ['experiência', 'competências', 'método STAR', 'perguntas'],
    suggestionStyle: 'professional'
  },
  presentation: {
    id: 'presentation',
    name: '📊 Apresentação',
    description: 'Apresentações e pitches',
    icon: '📊',
    color: '#ef4444',
    isDefault: true,
    prompt: 'Ajude em apresentações: estrutura clara, storytelling, dados impactantes, call-to-action. Antecipe perguntas da audiência e prepare respostas.',
    focusAreas: ['storytelling', 'dados', 'engajamento', 'CTA'],
    suggestionStyle: 'impactful'
  },
  negotiation: {
    id: 'negotiation',
    name: '🤝 Negociação',
    description: 'Negociações e acordos',
    icon: '🤝',
    color: '#10b981',
    isDefault: true,
    prompt: 'Ajude em negociações: identificar interesses, criar valor mútuo, BATNA, concessões estratégicas, técnicas de ancoragem. Busque acordos win-win.',
    focusAreas: ['interesses', 'BATNA', 'concessões', 'valor mútuo'],
    suggestionStyle: 'strategic'
  }
};

let customProfiles = {};

// ============================================
// HISTÓRICO DE REUNIÕES (v2.0)
// ============================================

let meetingHistory = [];
let currentMeeting = null;

// Configuração da janela principal
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 440,
    height: 800,
    minWidth: 400,
    minHeight: 650,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      // Necessário para capturar áudio do sistema
      backgroundThrottling: false
    }
  });
  
  // Habilita captura de áudio do sistema
  mainWindow.webContents.session.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer.getSources({ types: ['screen', 'window'] }).then((sources) => {
      callback({ video: sources[0], audio: 'loopback' });
    });
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  
  // Posiciona no canto inferior direito
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  mainWindow.setPosition(width - 460, height - 770);

  mainWindow.setMovable(true);
}

app.whenReady().then(() => {
  createWindow();
  loadSettings();
  registerShortcuts();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// ============================================
// CONFIGURAÇÕES
// ============================================

function getSettingsPath() {
  return path.join(app.getPath('userData'), 'settings.json');
}

function loadSettings() {
  try {
    const settingsPath = getSettingsPath();
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      settings = { ...settings, ...JSON.parse(data) };
    }
    // Carrega perfis customizados
    loadCustomProfiles();
    // Carrega histórico
    loadMeetingHistory();
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
  }
}

function saveSettings() {
  try {
    const settingsPath = getSettingsPath();
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
  }
}

// ============================================
// PERFIS - CRUD (v2.0)
// ============================================

function getProfilesPath() {
  return path.join(app.getPath('userData'), 'profiles.json');
}

function loadCustomProfiles() {
  try {
    const profilesPath = getProfilesPath();
    if (fs.existsSync(profilesPath)) {
      const data = fs.readFileSync(profilesPath, 'utf8');
      customProfiles = JSON.parse(data);
    }
  } catch (error) {
    console.error('Erro ao carregar perfis:', error);
  }
}

function saveCustomProfiles() {
  try {
    const profilesPath = getProfilesPath();
    fs.writeFileSync(profilesPath, JSON.stringify(customProfiles, null, 2));
  } catch (error) {
    console.error('Erro ao salvar perfis:', error);
  }
}

function getAllProfiles() {
  return { ...defaultProfiles, ...customProfiles };
}

function getActiveProfile() {
  const profiles = getAllProfiles();
  return profiles[settings.activeProfileId] || profiles.general;
}

// ============================================
// HISTÓRICO DE REUNIÕES (v2.0)
// ============================================

function getHistoryPath() {
  return path.join(app.getPath('userData'), 'meeting-history.json');
}

function loadMeetingHistory() {
  try {
    const historyPath = getHistoryPath();
    if (fs.existsSync(historyPath)) {
      const data = fs.readFileSync(historyPath, 'utf8');
      meetingHistory = JSON.parse(data);
    }
  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
  }
}

function saveMeetingHistory() {
  try {
    const historyPath = getHistoryPath();
    // Mantém apenas últimas 50 reuniões
    if (meetingHistory.length > 50) {
      meetingHistory = meetingHistory.slice(-50);
    }
    fs.writeFileSync(historyPath, JSON.stringify(meetingHistory, null, 2));
  } catch (error) {
    console.error('Erro ao salvar histórico:', error);
  }
}

// ============================================
// DETECÇÃO DE APPS DE REUNIÃO (v2.0)
// ============================================

function detectMeetingApps() {
  return new Promise((resolve) => {
    const apps = [];
    const platform = process.platform;
    
    if (platform === 'win32') {
      // Windows - usa tasklist
      exec('tasklist /FO CSV /NH', (error, stdout) => {
        if (error) {
          resolve(apps);
          return;
        }
        
        const processes = stdout.toLowerCase();
        
        if (processes.includes('zoom.exe')) {
          apps.push({ name: 'Zoom', icon: '📹', running: true });
        }
        if (processes.includes('teams.exe') || processes.includes('ms-teams.exe')) {
          apps.push({ name: 'Microsoft Teams', icon: '👥', running: true });
        }
        if (processes.includes('chrome.exe') || processes.includes('msedge.exe')) {
          // Google Meet roda no browser
          apps.push({ name: 'Google Meet (possível)', icon: '🎥', running: true, uncertain: true });
        }
        if (processes.includes('slack.exe')) {
          apps.push({ name: 'Slack', icon: '💬', running: true });
        }
        if (processes.includes('discord.exe')) {
          apps.push({ name: 'Discord', icon: '🎮', running: true });
        }
        if (processes.includes('webex.exe')) {
          apps.push({ name: 'Webex', icon: '📞', running: true });
        }
        
        resolve(apps);
      });
    } else if (platform === 'darwin') {
      // macOS - usa ps
      exec('ps aux', (error, stdout) => {
        if (error) {
          resolve(apps);
          return;
        }
        
        const processes = stdout.toLowerCase();
        
        if (processes.includes('zoom')) {
          apps.push({ name: 'Zoom', icon: '📹', running: true });
        }
        if (processes.includes('teams')) {
          apps.push({ name: 'Microsoft Teams', icon: '👥', running: true });
        }
        if (processes.includes('google chrome') || processes.includes('safari')) {
          apps.push({ name: 'Google Meet (possível)', icon: '🎥', running: true, uncertain: true });
        }
        if (processes.includes('slack')) {
          apps.push({ name: 'Slack', icon: '💬', running: true });
        }
        if (processes.includes('discord')) {
          apps.push({ name: 'Discord', icon: '🎮', running: true });
        }
        
        resolve(apps);
      });
    } else {
      // Linux
      exec('ps aux', (error, stdout) => {
        if (error) {
          resolve(apps);
          return;
        }
        
        const processes = stdout.toLowerCase();
        
        if (processes.includes('zoom')) {
          apps.push({ name: 'Zoom', icon: '📹', running: true });
        }
        if (processes.includes('teams')) {
          apps.push({ name: 'Microsoft Teams', icon: '👥', running: true });
        }
        if (processes.includes('slack')) {
          apps.push({ name: 'Slack', icon: '💬', running: true });
        }
        if (processes.includes('discord')) {
          apps.push({ name: 'Discord', icon: '🎮', running: true });
        }
        
        resolve(apps);
      });
    }
  });
}

// ============================================
// ATALHOS GLOBAIS
// ============================================

function registerShortcuts() {
  // Desregistra atalhos anteriores
  globalShortcut.unregisterAll();
  
  // Ctrl+Shift+1 - Ativar/Pausar sessão
  globalShortcut.register(settings.shortcuts.toggleSession, () => {
    mainWindow.webContents.send('shortcut-action', 'toggle-session');
    console.log('Atalho: Toggle Session');
  });
  
  // Ctrl+Shift+2 - Mutar sugestões
  globalShortcut.register(settings.shortcuts.muteSuggestions, () => {
    mainWindow.webContents.send('shortcut-action', 'mute-suggestions');
    console.log('Atalho: Mute Suggestions');
  });
  
  // Ctrl+Shift+3 - Fixar overlay
  globalShortcut.register(settings.shortcuts.togglePin, () => {
    mainWindow.webContents.send('shortcut-action', 'toggle-pin');
    console.log('Atalho: Toggle Pin');
  });
  
  // Ctrl+Shift+4 - Limpar contexto
  globalShortcut.register(settings.shortcuts.clearContext, () => {
    mainWindow.webContents.send('shortcut-action', 'clear-context');
    console.log('Atalho: Clear Context');
  });
  
  // Ctrl+Shift+5 - Encerrar sessão
  globalShortcut.register(settings.shortcuts.endSession, () => {
    mainWindow.webContents.send('shortcut-action', 'end-session');
    console.log('Atalho: End Session');
  });
}

// ============================================
// IPC HANDLERS
// ============================================

// Inicializar OpenAI
ipcMain.handle('init-openai', async (event, apiKey) => {
  try {
    openai = new OpenAI({ apiKey });
    // Testa a conexão
    await openai.models.list();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Transcrever áudio usando Whisper
ipcMain.handle('transcribe-audio', async (event, audioBuffer) => {
  if (!openai) {
    return { success: false, error: 'OpenAI não inicializado' };
  }

  // Usa extensão .webm que é suportada pelo Whisper
  const tempPath = path.join(os.tmpdir(), `perssua-audio-${Date.now()}.webm`);
  
  try {
    const buffer = Buffer.from(audioBuffer);
    
    // Verifica tamanho mínimo
    if (buffer.length < 3000) {
      return { success: false, error: 'Áudio muito curto' };
    }
    
    // Log para debug
    console.log('Tamanho do áudio:', buffer.length, 'bytes');
    
    // Salva o arquivo
    fs.writeFileSync(tempPath, buffer);
    
    // Verifica se o arquivo foi salvo corretamente
    const stats = fs.statSync(tempPath);
    console.log('Arquivo salvo:', stats.size, 'bytes');
    
    // Cria o stream de leitura
    const fileStream = fs.createReadStream(tempPath);
    
    const transcription = await openai.audio.transcriptions.create({
      file: fileStream,
      model: 'whisper-1',
      language: settings.inputLanguage || 'pt',
      response_format: 'text'
    });

    console.log('Transcrição:', transcription);
    
    // A resposta pode ser string ou objeto dependendo do response_format
    const text = typeof transcription === 'string' ? transcription : transcription.text;
    
    return { success: true, text: text ? text.trim() : '' };
  } catch (error) {
    console.error('Erro transcrição:', error.message);
    
    // Se for erro de formato, tenta identificar o problema
    if (error.message.includes('Invalid file format')) {
      console.error('Formatos suportados: flac, m4a, mp3, mp4, mpeg, mpga, oga, ogg, wav, webm');
    }
    
    return { success: false, error: error.message };
  } finally {
    // Limpa arquivo temporário
    try {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    } catch (e) {
      console.error('Erro ao limpar arquivo temp:', e.message);
    }
  }
});

// Gerar sugestões com STREAMING
ipcMain.handle('generate-suggestions-stream', async (event, { conversationHistory }) => {
  if (!openai) {
    return { success: false, error: 'OpenAI não inicializado' };
  }

  // Obtém o perfil ativo
  const activeProfile = getActiveProfile();

  // Idiomas
  const languageNames = {
    pt: 'português brasileiro',
    en: 'inglês',
    es: 'espanhol'
  };

  const outputLang = languageNames[settings.outputLanguage] || 'português brasileiro';
  const modeInstruction = activeProfile.prompt;

  const systemPrompt = `Você é o Perssua, um AI Meeting Copilot PROATIVO em tempo real.

🎯 MISSÃO:
Sempre fornecer sugestões úteis para ajudar o usuário na conversa. Seja PROATIVO - não espere perguntas.
${modeInstruction}

⚡ COMPORTAMENTO PROATIVO:
- SEMPRE gere uma sugestão útil para cada fala transcrita
- Antecipe necessidades do usuário
- Ofereça insights mesmo sem ser solicitado
- Identifique oportunidades de melhoria na conversa
- Sugira como o usuário pode responder ou conduzir melhor

🚨 DETECÇÃO DE OBJEÇÕES:
Identifique e marque objeções quando detectar frases como:
- Preço/Custo: "muito caro", "fora do orçamento", "não temos budget"
- Tempo: "não tenho tempo", "estamos ocupados", "depois vemos"  
- Necessidade: "não preciso", "já temos", "estamos bem assim"
- Concorrência: "fulano oferece mais barato", "já usamos X"
- Autoridade: "preciso falar com meu chefe", "não sou eu quem decide"
- Confiança: "não conheço", "nunca ouvi falar", "é muito novo"

📊 SCORE DE CONFIANÇA:
Avalie de 1-5 estrelas sua confiança na sugestão:
- ⭐⭐⭐⭐⭐ (5): Muito confiante, contexto claro
- ⭐⭐⭐⭐ (4): Confiante, boa análise
- ⭐⭐⭐ (3): Moderado, pode haver ambiguidade
- ⭐⭐ (2): Pouca confiança, contexto limitado
- ⭐ (1): Especulativo, pouco contexto

🎨 FORMATO DE RESPOSTA:
[Se detectou objeção]: 🚨 **OBJEÇÃO:** [tipo] - [descrição breve]
💡 **Sugestão:** [O que o usuário pode dizer/fazer agora]
📊 **Argumento:** [Dado, fato ou insight relevante]
❓ **Pergunte:** [Pergunta estratégica para avançar]
🎯 **Confiança:** [⭐ a ⭐⭐⭐⭐⭐]

📌 REGRAS:
- Respostas curtas e diretas (máximo 3-4 linhas por item)
- Responda SEMPRE em ${outputLang}
- Foque no que é ACIONÁVEL agora
- Mantenha contexto da conversa completa
- Seja específico, não genérico
- SEMPRE inclua o score de confiança

Você está em modo CONTÍNUO e PROATIVO. Sempre agregue valor.`;

  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory
    ];

    const stream = await openai.chat.completions.create({
      model: settings.model || 'gpt-4o-mini',
      messages,
      max_tokens: 400,
      temperature: 0.7,
      stream: true
    });

    let fullResponse = '';
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        // Envia chunk para o renderer
        mainWindow.webContents.send('suggestion-chunk', content);
      }
    }
    
    // Sinaliza fim do stream
    mainWindow.webContents.send('suggestion-complete', fullResponse);
    
    return { success: true };
  } catch (error) {
    console.error('Erro sugestões:', error.message);
    return { success: false, error: error.message };
  }
});

// ============================================
// GERAR RESUMO DA REUNIÃO
// ============================================

ipcMain.handle('generate-summary', async (event, { conversationHistory }) => {
  if (!openai) {
    return { success: false, error: 'OpenAI não inicializado' };
  }

  const languageNames = {
    pt: 'português brasileiro',
    en: 'inglês',
    es: 'espanhol'
  };

  const outputLang = languageNames[settings.outputLanguage] || 'português brasileiro';

  const systemPrompt = `Você é um assistente especializado em criar resumos executivos de reuniões.

Analise a conversa e gere um resumo estruturado em ${outputLang}.

📋 FORMATO DO RESUMO:

## 📌 Visão Geral
[2-3 frases resumindo o propósito e resultado da reunião]

## 🎯 Principais Pontos Discutidos
- [Ponto 1]
- [Ponto 2]
- [Ponto 3]

## 🚨 Objeções Identificadas
- [Objeção 1 e como foi tratada]
- [Objeção 2 e como foi tratada]
(Se não houver objeções, escreva "Nenhuma objeção significativa identificada")

## ✅ Decisões Tomadas
- [Decisão 1]
- [Decisão 2]

## 📝 Próximos Passos
- [ ] [Ação 1 - Responsável]
- [ ] [Ação 2 - Responsável]

## 💡 Insights e Observações
- [Observação relevante sobre a dinâmica ou oportunidades]

---
*Resumo gerado automaticamente pelo Perssua*`;

  try {
    // Filtra apenas as mensagens do usuário para o resumo
    const userMessages = conversationHistory
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('\n\n');

    if (!userMessages || userMessages.length < 50) {
      return { success: false, error: 'Pouco conteúdo para gerar resumo' };
    }

    const response = await openai.chat.completions.create({
      model: settings.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Gere um resumo executivo desta reunião:\n\n${userMessages}` }
      ],
      max_tokens: 1000,
      temperature: 0.5
    });

    const summary = response.choices[0]?.message?.content || '';
    
    return { success: true, summary };
  } catch (error) {
    console.error('Erro ao gerar resumo:', error.message);
    return { success: false, error: error.message };
  }
});

// Controles da janela
ipcMain.handle('minimize-window', () => mainWindow.minimize());
ipcMain.handle('close-window', () => mainWindow.close());
ipcMain.handle('toggle-always-on-top', () => {
  const isOnTop = mainWindow.isAlwaysOnTop();
  mainWindow.setAlwaysOnTop(!isOnTop);
  return !isOnTop;
});

// Obter fontes de áudio
ipcMain.handle('get-audio-sources', async () => {
  try {
    const sources = await desktopCapturer.getSources({ 
      types: ['window', 'screen'],
      thumbnailSize: { width: 0, height: 0 }
    });
    return sources.map(s => ({ id: s.id, name: s.name }));
  } catch (error) {
    return [];
  }
});

// ============================================
// CONFIGURAÇÕES IPC
// ============================================

// Obter configurações
ipcMain.handle('get-settings', () => {
  return settings;
});

// Salvar configurações
ipcMain.handle('save-settings', (event, newSettings) => {
  settings = { ...settings, ...newSettings };
  saveSettings();
  
  // Reinicializa OpenAI se a chave mudou
  if (newSettings.apiKey && newSettings.apiKey !== settings.apiKey) {
    openai = new OpenAI({ apiKey: newSettings.apiKey });
  }
  
  // Re-registra atalhos se mudaram
  if (newSettings.shortcuts) {
    registerShortcuts();
  }
  
  return { success: true };
});

// Toggle sugestão automática
ipcMain.handle('toggle-auto-suggestion', () => {
  settings.autoSuggestion = !settings.autoSuggestion;
  saveSettings();
  return settings.autoSuggestion;
});

// Obter estado da sugestão automática
ipcMain.handle('get-auto-suggestion', () => {
  return settings.autoSuggestion;
});

// ============================================
// PERFIS IPC (v2.0)
// ============================================

// Obter todos os perfis
ipcMain.handle('get-profiles', () => {
  return getAllProfiles();
});

// Obter perfil ativo
ipcMain.handle('get-active-profile', () => {
  return getActiveProfile();
});

// Definir perfil ativo
ipcMain.handle('set-active-profile', (event, profileId) => {
  const profiles = getAllProfiles();
  if (profiles[profileId]) {
    settings.activeProfileId = profileId;
    settings.assistanceMode = profileId; // Compatibilidade
    saveSettings();
    return { success: true, profile: profiles[profileId] };
  }
  return { success: false, error: 'Perfil não encontrado' };
});

// Criar perfil customizado
ipcMain.handle('create-profile', (event, profile) => {
  const id = 'custom_' + Date.now();
  customProfiles[id] = {
    ...profile,
    id,
    isDefault: false,
    createdAt: new Date().toISOString()
  };
  saveCustomProfiles();
  return { success: true, profile: customProfiles[id] };
});

// Atualizar perfil customizado
ipcMain.handle('update-profile', (event, { id, updates }) => {
  if (customProfiles[id]) {
    customProfiles[id] = { ...customProfiles[id], ...updates };
    saveCustomProfiles();
    return { success: true, profile: customProfiles[id] };
  }
  return { success: false, error: 'Perfil não encontrado ou é padrão' };
});

// Deletar perfil customizado
ipcMain.handle('delete-profile', (event, id) => {
  if (customProfiles[id]) {
    delete customProfiles[id];
    saveCustomProfiles();
    // Se era o perfil ativo, volta para general
    if (settings.activeProfileId === id) {
      settings.activeProfileId = 'general';
      saveSettings();
    }
    return { success: true };
  }
  return { success: false, error: 'Perfil não encontrado ou é padrão' };
});

// ============================================
// HISTÓRICO IPC (v2.0)
// ============================================

// Iniciar nova reunião
ipcMain.handle('start-meeting', (event, { profileId, title }) => {
  currentMeeting = {
    id: 'meeting_' + Date.now(),
    profileId: profileId || settings.activeProfileId,
    title: title || 'Reunião sem título',
    startedAt: new Date().toISOString(),
    endedAt: null,
    duration: 0,
    transcriptions: [],
    suggestions: [],
    feedbacks: [],
    summary: null
  };
  return { success: true, meeting: currentMeeting };
});

// Finalizar reunião
ipcMain.handle('end-meeting', (event, { summary }) => {
  if (currentMeeting) {
    currentMeeting.endedAt = new Date().toISOString();
    currentMeeting.duration = Math.floor(
      (new Date(currentMeeting.endedAt) - new Date(currentMeeting.startedAt)) / 1000
    );
    if (summary) {
      currentMeeting.summary = summary;
    }
    meetingHistory.push(currentMeeting);
    saveMeetingHistory();
    const meeting = currentMeeting;
    currentMeeting = null;
    return { success: true, meeting };
  }
  return { success: false, error: 'Nenhuma reunião ativa' };
});

// Obter histórico de reuniões
ipcMain.handle('get-meeting-history', (event, { limit = 20 } = {}) => {
  const sorted = [...meetingHistory].sort((a, b) => 
    new Date(b.startedAt) - new Date(a.startedAt)
  );
  return sorted.slice(0, limit);
});

// Obter detalhes de uma reunião
ipcMain.handle('get-meeting', (event, id) => {
  const meeting = meetingHistory.find(m => m.id === id);
  return meeting || null;
});

// Deletar reunião do histórico
ipcMain.handle('delete-meeting', (event, id) => {
  const index = meetingHistory.findIndex(m => m.id === id);
  if (index !== -1) {
    meetingHistory.splice(index, 1);
    saveMeetingHistory();
    return { success: true };
  }
  return { success: false, error: 'Reunião não encontrada' };
});

// ============================================
// FEEDBACK IPC (v2.0)
// ============================================

// Registrar feedback de sugestão
ipcMain.handle('submit-feedback', (event, { suggestionId, helpful, comment }) => {
  if (currentMeeting) {
    currentMeeting.feedbacks.push({
      suggestionId,
      helpful,
      comment,
      timestamp: new Date().toISOString()
    });
  }
  
  // Salva feedback global para aprendizado
  const feedbackPath = path.join(app.getPath('userData'), 'feedbacks.json');
  let allFeedbacks = [];
  try {
    if (fs.existsSync(feedbackPath)) {
      allFeedbacks = JSON.parse(fs.readFileSync(feedbackPath, 'utf8'));
    }
    allFeedbacks.push({
      profileId: settings.activeProfileId,
      helpful,
      comment,
      timestamp: new Date().toISOString()
    });
    // Mantém últimos 500 feedbacks
    if (allFeedbacks.length > 500) {
      allFeedbacks = allFeedbacks.slice(-500);
    }
    fs.writeFileSync(feedbackPath, JSON.stringify(allFeedbacks, null, 2));
  } catch (error) {
    console.error('Erro ao salvar feedback:', error);
  }
  
  return { success: true };
});

// Obter estatísticas de feedback
ipcMain.handle('get-feedback-stats', () => {
  const feedbackPath = path.join(app.getPath('userData'), 'feedbacks.json');
  try {
    if (fs.existsSync(feedbackPath)) {
      const feedbacks = JSON.parse(fs.readFileSync(feedbackPath, 'utf8'));
      const total = feedbacks.length;
      const helpful = feedbacks.filter(f => f.helpful).length;
      const byProfile = {};
      
      feedbacks.forEach(f => {
        if (!byProfile[f.profileId]) {
          byProfile[f.profileId] = { total: 0, helpful: 0 };
        }
        byProfile[f.profileId].total++;
        if (f.helpful) byProfile[f.profileId].helpful++;
      });
      
      return {
        total,
        helpful,
        rate: total > 0 ? Math.round((helpful / total) * 100) : 0,
        byProfile
      };
    }
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
  }
  return { total: 0, helpful: 0, rate: 0, byProfile: {} };
});

// ============================================
// DETECÇÃO DE APPS IPC (v2.0)
// ============================================

ipcMain.handle('detect-meeting-apps', async () => {
  return await detectMeetingApps();
});

// ============================================
// V3 - SCREENSHOT + IA VISUAL
// ============================================

ipcMain.handle('capture-screenshot', async () => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 }
    });
    
    if (sources.length > 0) {
      const screenshot = sources[0].thumbnail.toDataURL();
      return { success: true, image: screenshot };
    }
    return { success: false, error: 'Nenhuma tela encontrada' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('analyze-image', async (event, { imageBase64, question, conversationContext }) => {
  if (!openai) {
    return { success: false, error: 'OpenAI não inicializado' };
  }

  const languageNames = {
    pt: 'português brasileiro',
    en: 'inglês',
    es: 'espanhol'
  };
  const outputLang = languageNames[settings.outputLanguage] || 'português brasileiro';

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',  // Modelo com visão
      messages: [
        {
          role: 'system',
          content: `Você é um assistente visual em uma reunião. Analise a imagem considerando o contexto da conversa.
Responda em ${outputLang}.
Seja direto e acionável.
Contexto da reunião: ${conversationContext || 'Reunião em andamento'}`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: question || 'O que você vê nesta imagem? Explique no contexto da reunião.'
            },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64
              }
            }
          ]
        }
      ],
      max_tokens: 500
    });

    return { 
      success: true, 
      analysis: response.choices[0]?.message?.content || '' 
    };
  } catch (error) {
    console.error('Erro análise visual:', error);
    return { success: false, error: error.message };
  }
});

// ============================================
// V3 - INTENT DETECTION ENGINE
// ============================================

const intentPatterns = {
  question: {
    patterns: [/\?$/, /como/, /por que/, /quando/, /onde/, /qual/, /quem/, /o que/i],
    label: '❓ Pergunta',
    color: '#3b82f6'
  },
  objection: {
    patterns: [/caro/, /preço/, /budget/, /orçamento/, /não precis/, /já tem/, /concorrent/i],
    label: '🚨 Objeção',
    color: '#ef4444'
  },
  doubt: {
    patterns: [/não sei/, /será que/, /talvez/, /acho que/, /não tenho certeza/i],
    label: '🤔 Dúvida',
    color: '#f59e0b'
  },
  decision: {
    patterns: [/vamos fazer/, /decidido/, /fechado/, /combinado/, /ok então/, /pode ser/i],
    label: '✅ Decisão',
    color: '#10b981'
  },
  pressure: {
    patterns: [/urgente/, /prazo/, /amanhã/, /agora/, /rápido/, /preciso hoje/i],
    label: '⚡ Pressão',
    color: '#8b5cf6'
  },
  confirmation: {
    patterns: [/certo/, /entendi/, /ok/, /combinado/, /perfeito/, /isso mesmo/i],
    label: '👍 Confirmação',
    color: '#06b6d4'
  },
  risk: {
    patterns: [/risco/, /problema/, /cuidado/, /atenção/, /perigoso/, /complicado/i],
    label: '⚠️ Risco',
    color: '#dc2626'
  }
};

ipcMain.handle('detect-intent', (event, text) => {
  const detectedIntents = [];
  const lowerText = text.toLowerCase();
  
  for (const [intent, config] of Object.entries(intentPatterns)) {
    for (const pattern of config.patterns) {
      if (pattern.test(lowerText)) {
        detectedIntents.push({
          type: intent,
          label: config.label,
          color: config.color,
          confidence: 0.8
        });
        break;
      }
    }
  }
  
  return detectedIntents.length > 0 ? detectedIntents : [{ 
    type: 'statement', 
    label: '💬 Afirmação', 
    color: '#6b7280',
    confidence: 0.5
  }];
});

// ============================================
// V3 - CHAT PARALELO COM IA
// ============================================

ipcMain.handle('chat-with-ai', async (event, { message, conversationHistory }) => {
  if (!openai) {
    return { success: false, error: 'OpenAI não inicializado' };
  }

  const activeProfile = getActiveProfile();
  const languageNames = {
    pt: 'português brasileiro',
    en: 'inglês',
    es: 'espanhol'
  };
  const outputLang = languageNames[settings.outputLanguage] || 'português brasileiro';

  try {
    const response = await openai.chat.completions.create({
      model: settings.model || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Você é o Perssua, assistente de reuniões.
${activeProfile.prompt}
Responda em ${outputLang}.
O usuário está em uma reunião e digitou uma mensagem paralela (não falada).
Ajude com base no contexto da conversa.`
        },
        ...conversationHistory.slice(-10),
        { role: 'user', content: message }
      ],
      max_tokens: 400
    });

    return { 
      success: true, 
      response: response.choices[0]?.message?.content || '' 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ============================================
// V3 - REESCRITA INSTANTÂNEA
// ============================================

ipcMain.handle('rewrite-suggestion', async (event, { original, style }) => {
  if (!openai) {
    return { success: false, error: 'OpenAI não inicializado' };
  }

  const stylePrompts = {
    shorter: 'Reescreva de forma mais curta e direta (máximo 2 linhas)',
    technical: 'Reescreva com linguagem mais técnica e precisa',
    simpler: 'Reescreva de forma mais simples, como se explicasse para uma criança',
    firmer: 'Reescreva com tom mais firme e assertivo',
    friendly: 'Reescreva com tom mais amigável e empático'
  };

  try {
    const response = await openai.chat.completions.create({
      model: settings.model || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `${stylePrompts[style] || stylePrompts.shorter}. Mantenha o significado original.`
        },
        { role: 'user', content: original }
      ],
      max_tokens: 200
    });

    return { 
      success: true, 
      rewritten: response.choices[0]?.message?.content || '' 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ============================================
// V3 - PERSONAS DE RESPOSTA
// ============================================

const personas = {
  engineer: {
    id: 'engineer',
    name: '🔧 Engenheiro',
    prompt: 'Responda como um engenheiro sênior: foco em viabilidade técnica, arquitetura, performance, trade-offs. Use terminologia técnica apropriada.'
  },
  salesperson: {
    id: 'salesperson',
    name: '💼 Vendedor',
    prompt: 'Responda como um vendedor experiente: foco em valor, ROI, urgência, gatilhos mentais. Destaque benefícios, não features.'
  },
  pm: {
    id: 'pm',
    name: '📊 Product Manager',
    prompt: 'Responda como um PM: foco em impacto, priorização, métricas, stakeholders. Equilibre técnico com negócio.'
  },
  executive: {
    id: 'executive',
    name: '👔 Executivo',
    prompt: 'Responda como um C-level: foco em estratégia, visão macro, riscos de negócio. Seja conciso e orientado a decisões.'
  },
  coach: {
    id: 'coach',
    name: '🎯 Coach',
    prompt: 'Responda como um coach: faça perguntas poderosas, ajude a refletir, não dê respostas prontas. Guie o pensamento.'
  }
};

ipcMain.handle('get-personas', () => personas);

ipcMain.handle('generate-with-persona', async (event, { conversationHistory, personaId }) => {
  if (!openai) {
    return { success: false, error: 'OpenAI não inicializado' };
  }

  const persona = personas[personaId] || personas.engineer;
  const languageNames = {
    pt: 'português brasileiro',
    en: 'inglês',
    es: 'espanhol'
  };
  const outputLang = languageNames[settings.outputLanguage] || 'português brasileiro';

  try {
    const response = await openai.chat.completions.create({
      model: settings.model || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `${persona.prompt}
Responda em ${outputLang}.
Seja direto e acionável.`
        },
        ...conversationHistory.slice(-10)
      ],
      max_tokens: 400
    });

    return { 
      success: true, 
      response: response.choices[0]?.message?.content || '',
      persona: persona.name
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ============================================
// V3 - "WHAT SHOULD I SAY NOW?"
// ============================================

ipcMain.handle('what-should-i-say', async (event, { conversationHistory, situation }) => {
  if (!openai) {
    return { success: false, error: 'OpenAI não inicializado' };
  }

  const activeProfile = getActiveProfile();
  const languageNames = {
    pt: 'português brasileiro',
    en: 'inglês',
    es: 'espanhol'
  };
  const outputLang = languageNames[settings.outputLanguage] || 'português brasileiro';

  const situationPrompts = {
    silence: 'A conversa ficou em silêncio. Sugira algo para quebrar o gelo ou avançar.',
    questioned: 'O usuário foi questionado e precisa responder. Sugira uma resposta.',
    stuck: 'A reunião travou em um ponto. Sugira como destravar.',
    closing: 'É hora de fechar a reunião. Sugira próximos passos.',
    objection: 'Houve uma objeção. Sugira como contornar.'
  };

  try {
    const response = await openai.chat.completions.create({
      model: settings.model || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Você é um coach de reuniões em tempo real.
${activeProfile.prompt}
${situationPrompts[situation] || situationPrompts.silence}
Responda em ${outputLang}.

FORMATO:
🎤 O que dizer: [frase exata para usar]
💡 Por que: [1 linha explicando a estratégia]
⚡ Alternativa: [outra opção]`
        },
        ...conversationHistory.slice(-10)
      ],
      max_tokens: 300
    });

    return { 
      success: true, 
      suggestion: response.choices[0]?.message?.content || ''
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ============================================
// V3 - MEMÓRIA POR CLIENTE/PROJETO
// ============================================

let clientMemories = {};

function getClientMemoriesPath() {
  return path.join(app.getPath('userData'), 'client-memories.json');
}

function loadClientMemories() {
  try {
    const memPath = getClientMemoriesPath();
    if (fs.existsSync(memPath)) {
      clientMemories = JSON.parse(fs.readFileSync(memPath, 'utf8'));
    }
  } catch (error) {
    console.error('Erro ao carregar memórias:', error);
  }
}

function saveClientMemories() {
  try {
    fs.writeFileSync(getClientMemoriesPath(), JSON.stringify(clientMemories, null, 2));
  } catch (error) {
    console.error('Erro ao salvar memórias:', error);
  }
}

// Carrega memórias ao iniciar
loadClientMemories();

ipcMain.handle('get-client-memories', () => clientMemories);

ipcMain.handle('get-client-memory', (event, clientId) => {
  return clientMemories[clientId] || null;
});

ipcMain.handle('save-client-memory', (event, { clientId, data }) => {
  clientMemories[clientId] = {
    ...clientMemories[clientId],
    ...data,
    updatedAt: new Date().toISOString()
  };
  saveClientMemories();
  return { success: true };
});

ipcMain.handle('add-client-note', (event, { clientId, note }) => {
  if (!clientMemories[clientId]) {
    clientMemories[clientId] = { notes: [], createdAt: new Date().toISOString() };
  }
  clientMemories[clientId].notes = clientMemories[clientId].notes || [];
  clientMemories[clientId].notes.push({
    text: note,
    timestamp: new Date().toISOString()
  });
  saveClientMemories();
  return { success: true };
});

ipcMain.handle('delete-client-memory', (event, clientId) => {
  delete clientMemories[clientId];
  saveClientMemories();
  return { success: true };
});

// ============================================
// V3 - EXPORTAÇÃO PDF/MARKDOWN
// ============================================

ipcMain.handle('export-meeting', async (event, { format, content, filename }) => {
  const { dialog } = require('electron');
  
  const filters = format === 'pdf' 
    ? [{ name: 'PDF', extensions: ['pdf'] }]
    : [{ name: 'Markdown', extensions: ['md'] }];
  
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Exportar Reunião',
    defaultPath: filename || `reuniao-${Date.now()}`,
    filters
  });
  
  if (result.canceled) {
    return { success: false, canceled: true };
  }
  
  try {
    if (format === 'markdown') {
      fs.writeFileSync(result.filePath, content);
      return { success: true, path: result.filePath };
    }
    
    // Para PDF, salvamos como HTML e o usuário pode imprimir
    // Uma solução mais completa usaria puppeteer ou similar
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; }
    h1 { color: #00d4aa; }
    h2 { color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px; }
    ul { line-height: 1.8; }
    .meta { color: #666; font-size: 12px; }
  </style>
</head>
<body>
${content.replace(/\n/g, '<br>').replace(/^## /gm, '<h2>').replace(/^# /gm, '<h1>')}
</body>
</html>`;
    
    const htmlPath = result.filePath.replace('.pdf', '.html');
    fs.writeFileSync(htmlPath, htmlContent);
    return { success: true, path: htmlPath, note: 'Salvo como HTML. Abra e imprima como PDF.' };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ============================================
// V3 - MODO CONFIDENCIAL
// ============================================

let confidentialMode = false;

ipcMain.handle('toggle-confidential-mode', () => {
  confidentialMode = !confidentialMode;
  return { enabled: confidentialMode };
});

ipcMain.handle('get-confidential-mode', () => {
  return { enabled: confidentialMode };
});

// ============================================
// V4 - MEETING GOAL ENGINE
// ============================================

let currentMeetingGoal = null;

ipcMain.handle('set-meeting-goal', (event, goal) => {
  currentMeetingGoal = {
    ...goal,
    startTime: new Date().toISOString(),
    progressChecks: []
  };
  return { success: true };
});

ipcMain.handle('get-meeting-goal', () => currentMeetingGoal);

ipcMain.handle('check-goal-progress', async (event, { conversationHistory }) => {
  if (!openai || !currentMeetingGoal) {
    return { success: false, error: 'Sem objetivo definido' };
  }

  try {
    const response = await openai.chat.completions.create({
      model: settings.model || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Você é um avaliador de progresso de reuniões.

OBJETIVO DA REUNIÃO:
- Principal: ${currentMeetingGoal.mainGoal}
- Resultado desejado: ${currentMeetingGoal.desiredOutcome}
- O que NÃO pode acontecer: ${currentMeetingGoal.avoid || 'Não especificado'}
- Tipo de interlocutor: ${currentMeetingGoal.interlocutorType || 'Geral'}

Analise a conversa e responda em JSON:
{
  "progressPercent": 0-100,
  "status": "on_track" | "drifting" | "off_track",
  "alert": "string ou null se tudo ok",
  "strengths": ["ponto forte 1", "ponto forte 2"],
  "opportunities": ["oportunidade 1"],
  "nextAction": "próxima ação sugerida"
}`
        },
        ...conversationHistory.slice(-15),
        { role: 'user', content: 'Avalie o progresso atual da reunião em relação ao objetivo.' }
      ],
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    currentMeetingGoal.progressChecks.push({
      timestamp: new Date().toISOString(),
      ...analysis
    });

    return { success: true, analysis };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-goal-final-score', async (event, { conversationHistory }) => {
  if (!openai || !currentMeetingGoal) {
    return { success: false, error: 'Sem objetivo definido' };
  }

  try {
    const response = await openai.chat.completions.create({
      model: settings.model || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Você é um avaliador de reuniões profissional.

OBJETIVO ORIGINAL:
- Principal: ${currentMeetingGoal.mainGoal}
- Resultado desejado: ${currentMeetingGoal.desiredOutcome}
- O que NÃO podia acontecer: ${currentMeetingGoal.avoid || 'Não especificado'}

Analise TODA a conversa e gere um relatório final em JSON:
{
  "finalScore": 0-100,
  "goalAchieved": true/false,
  "summary": "resumo de 2 linhas",
  "strengths": ["o que foi bem feito"],
  "missedOpportunities": ["oportunidades perdidas"],
  "recommendations": ["recomendações para próxima vez"]
}`
        },
        ...conversationHistory
      ],
      max_tokens: 600,
      response_format: { type: "json_object" }
    });

    return { 
      success: true, 
      report: JSON.parse(response.choices[0]?.message?.content || '{}')
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ============================================
// V4 - COACHING MODE PÓS-REUNIÃO
// ============================================

ipcMain.handle('generate-coaching-report', async (event, { conversationHistory, speakingStats }) => {
  if (!openai) {
    return { success: false, error: 'OpenAI não inicializado' };
  }

  const languageNames = {
    pt: 'português brasileiro',
    en: 'inglês',
    es: 'espanhol'
  };
  const outputLang = languageNames[settings.outputLanguage] || 'português brasileiro';

  try {
    const response = await openai.chat.completions.create({
      model: settings.model || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Você é um coach de comunicação profissional.
Analise a reunião e gere um relatório de coaching detalhado em ${outputLang}.

${speakingStats ? `ESTATÍSTICAS DE FALA:
- Tempo falando: ${speakingStats.speakingPercent}%
- Respostas médias: ${speakingStats.avgResponseLength} palavras
- Interrupções: ${speakingStats.interruptions}
- Perguntas feitas: ${speakingStats.questionsAsked}
- Palavras de incerteza: ${speakingStats.uncertaintyWords}` : ''}

Responda em JSON:
{
  "overallScore": 0-100,
  "communication": {
    "score": 0-100,
    "feedback": "avaliação",
    "tips": ["dica 1", "dica 2"]
  },
  "clarity": {
    "score": 0-100,
    "feedback": "avaliação",
    "tips": ["dica"]
  },
  "assertiveness": {
    "score": 0-100,
    "feedback": "avaliação",
    "tips": ["dica"]
  },
  "activeListening": {
    "score": 0-100,
    "feedback": "avaliação",
    "tips": ["dica"]
  },
  "strengths": ["pontos fortes observados"],
  "improvementAreas": ["áreas para melhorar"],
  "practicalExercise": "exercício prático para próxima reunião",
  "suggestedPhrase": "frase modelo para usar"
}`
        },
        ...conversationHistory.slice(-30)
      ],
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    return { 
      success: true, 
      report: JSON.parse(response.choices[0]?.message?.content || '{}')
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ============================================
// V4 - SIMULAÇÃO DE REUNIÃO
// ============================================

let simulationSession = null;

ipcMain.handle('start-simulation', async (event, { type, difficulty, context }) => {
  if (!openai) {
    return { success: false, error: 'OpenAI não inicializado' };
  }

  const difficultyPrompts = {
    junior: 'Seja amigável, faça perguntas básicas, dê tempo para responder.',
    senior: 'Faça perguntas técnicas detalhadas, questione decisões, peça exemplos específicos.',
    hostile: 'Seja cético, interrompa, questione tudo, pressione por respostas rápidas.',
    pressuring: 'Crie urgência, mencione outras opções, peça descontos, pressione decisões.'
  };

  const typePrompts = {
    technical_interview: 'Você é um entrevistador técnico sênior. Avalie conhecimento técnico, problem-solving e experiência prática.',
    behavioral_interview: 'Você é um entrevistador de RH. Use método STAR, avalie competências comportamentais e fit cultural.',
    sales: 'Você é um prospect/cliente. Tem interesse mas precisa ser convencido. Faça objeções realistas.',
    negotiation: 'Você é a outra parte na negociação. Defenda seus interesses, busque concessões.',
    presentation: 'Você é a audiência. Faça perguntas, peça esclarecimentos, demonstre interesse ou ceticismo.'
  };

  simulationSession = {
    type,
    difficulty,
    context,
    startTime: new Date().toISOString(),
    exchanges: [],
    feedback: []
  };

  const systemPrompt = `${typePrompts[type] || typePrompts.technical_interview}

NÍVEL DE DIFICULDADE: ${difficulty}
${difficultyPrompts[difficulty] || difficultyPrompts.senior}

${context ? `CONTEXTO ADICIONAL:\n${context}` : ''}

REGRAS:
1. Mantenha o personagem durante toda a simulação
2. Seja realista nas perguntas e reações
3. Após cada resposta do usuário, avalie internamente (não mostre)
4. Dê feedback sutil através das suas reações
5. Responda APENAS como o entrevistador/interlocutor

Comece a simulação com uma introdução apropriada ao cenário.`;

  try {
    const response = await openai.chat.completions.create({
      model: settings.model || 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }],
      max_tokens: 300
    });

    const opening = response.choices[0]?.message?.content || '';
    simulationSession.systemPrompt = systemPrompt;
    simulationSession.exchanges.push({ role: 'assistant', content: opening });

    return { success: true, opening, session: simulationSession };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('simulation-respond', async (event, { userResponse }) => {
  if (!openai || !simulationSession) {
    return { success: false, error: 'Nenhuma simulação ativa' };
  }

  simulationSession.exchanges.push({ role: 'user', content: userResponse });

  try {
    // Resposta do entrevistador
    const response = await openai.chat.completions.create({
      model: settings.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: simulationSession.systemPrompt },
        ...simulationSession.exchanges
      ],
      max_tokens: 300
    });

    const reply = response.choices[0]?.message?.content || '';
    simulationSession.exchanges.push({ role: 'assistant', content: reply });

    // Feedback em tempo real (separado)
    const feedbackResponse = await openai.chat.completions.create({
      model: settings.model || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Avalie a última resposta do usuário em uma simulação de ${simulationSession.type}.
Responda em JSON:
{
  "score": 0-100,
  "quickFeedback": "feedback curto (1 linha)",
  "suggestion": "sugestão de melhoria ou null se foi bom"
}`
        },
        { role: 'user', content: `Resposta do usuário: "${userResponse}"` }
      ],
      max_tokens: 150,
      response_format: { type: "json_object" }
    });

    const feedback = JSON.parse(feedbackResponse.choices[0]?.message?.content || '{}');
    simulationSession.feedback.push(feedback);

    return { success: true, reply, feedback };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('end-simulation', async () => {
  if (!openai || !simulationSession) {
    return { success: false, error: 'Nenhuma simulação ativa' };
  }

  try {
    const response = await openai.chat.completions.create({
      model: settings.model || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Gere um relatório final da simulação de ${simulationSession.type}.
Dificuldade: ${simulationSession.difficulty}

Responda em JSON:
{
  "overallScore": 0-100,
  "passed": true/false,
  "summary": "resumo geral",
  "strengths": ["pontos fortes"],
  "weaknesses": ["pontos fracos"],
  "detailedFeedback": {
    "content": { "score": 0-100, "feedback": "avaliação do conteúdo" },
    "structure": { "score": 0-100, "feedback": "avaliação da estrutura" },
    "confidence": { "score": 0-100, "feedback": "avaliação da confiança" }
  },
  "recommendations": ["recomendações para melhoria"],
  "practiceAreas": ["áreas para praticar mais"]
}`
        },
        ...simulationSession.exchanges
      ],
      max_tokens: 600,
      response_format: { type: "json_object" }
    });

    const finalReport = JSON.parse(response.choices[0]?.message?.content || '{}');
    const result = { ...simulationSession, finalReport };
    simulationSession = null;

    return { success: true, report: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ============================================
// V4 - ENGLISH ASSIST MODE
// ============================================

ipcMain.handle('translate-assist', async (event, { text, mode, context }) => {
  if (!openai) {
    return { success: false, error: 'OpenAI não inicializado' };
  }

  const modePrompts = {
    literal: 'Traduza para inglês de forma literal e precisa.',
    professional: 'Traduza para inglês profissional natural, como um nativo falaria em ambiente corporativo.',
    strategic: 'Traduza para inglês otimizado para entrevistas/vendas, com linguagem persuasiva e confiante.'
  };

  try {
    const response = await openai.chat.completions.create({
      model: settings.model || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `${modePrompts[mode] || modePrompts.professional}

${context ? `Contexto: ${context}` : ''}

Responda em JSON:
{
  "translation": "tradução principal",
  "alternatives": ["alternativa 1", "alternativa 2"],
  "pronunciation": "dica de pronúncia se relevante",
  "culturalNote": "nota cultural se relevante ou null"
}`
        },
        { role: 'user', content: text }
      ],
      max_tokens: 300,
      response_format: { type: "json_object" }
    });

    return { 
      success: true, 
      result: JSON.parse(response.choices[0]?.message?.content || '{}')
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('speak-for-me', async (event, { intent, context, style }) => {
  if (!openai) {
    return { success: false, error: 'OpenAI não inicializado' };
  }

  try {
    const response = await openai.chat.completions.create({
      model: settings.model || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Você ajuda não-nativos a falar inglês profissional em entrevistas/reuniões.
Estilo: ${style || 'professional'}
Contexto: ${context || 'reunião de trabalho'}

O usuário quer expressar algo. Gere frases prontas para usar.

Responda em JSON:
{
  "mainPhrase": "frase principal pronta para usar",
  "formal": "versão mais formal",
  "casual": "versão mais casual",
  "howToDeliver": "dica de como falar (tom, pausa, ênfase)"
}`
        },
        { role: 'user', content: `Quero expressar: ${intent}` }
      ],
      max_tokens: 300,
      response_format: { type: "json_object" }
    });

    return { 
      success: true, 
      result: JSON.parse(response.choices[0]?.message?.content || '{}')
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ============================================
// V4 - CONTEXT INJECTION (CV + JD)
// ============================================

let injectedContext = {
  cv: null,
  jobDescription: null,
  company: null,
  interviewer: null
};

ipcMain.handle('inject-context', (event, { type, content }) => {
  injectedContext[type] = content;
  return { success: true, injectedContext };
});

ipcMain.handle('get-injected-context', () => injectedContext);

ipcMain.handle('clear-injected-context', () => {
  injectedContext = { cv: null, jobDescription: null, company: null, interviewer: null };
  return { success: true };
});

ipcMain.handle('generate-with-context', async (event, { question, conversationHistory }) => {
  if (!openai) {
    return { success: false, error: 'OpenAI não inicializado' };
  }

  let contextPrompt = '';
  
  if (injectedContext.cv) {
    contextPrompt += `\n\nCURRÍCULO DO USUÁRIO:\n${injectedContext.cv}`;
  }
  if (injectedContext.jobDescription) {
    contextPrompt += `\n\nDESCRIÇÃO DA VAGA:\n${injectedContext.jobDescription}`;
  }
  if (injectedContext.company) {
    contextPrompt += `\n\nSOBRE A EMPRESA:\n${injectedContext.company}`;
  }
  if (injectedContext.interviewer) {
    contextPrompt += `\n\nSOBRE O ENTREVISTADOR:\n${injectedContext.interviewer}`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: settings.model || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Você é um assistente de entrevistas/reuniões.
${contextPrompt}

REGRAS IMPORTANTES:
1. Use APENAS informações do currículo - não invente experiências
2. Adapte a linguagem ao nível da vaga
3. Destaque experiências relevantes para a vaga
4. Seja específico com tecnologias e projetos reais do CV

Gere uma resposta para a pergunta considerando todo o contexto.`
        },
        ...conversationHistory.slice(-10),
        { role: 'user', content: question }
      ],
      max_tokens: 400
    });

    return { 
      success: true, 
      response: response.choices[0]?.message?.content || ''
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ============================================
// V4 - SPEAKING ANALYTICS
// ============================================

ipcMain.handle('analyze-speaking', async (event, { conversationHistory }) => {
  if (!conversationHistory || conversationHistory.length === 0) {
    return { success: false, error: 'Sem dados para analisar' };
  }

  // Análise local básica
  const userMessages = conversationHistory.filter(m => m.role === 'user');
  const totalMessages = conversationHistory.length;
  const userPercent = Math.round((userMessages.length / totalMessages) * 100);
  
  const allUserText = userMessages.map(m => m.content).join(' ');
  const words = allUserText.split(/\s+/).filter(w => w.length > 0);
  const avgWords = Math.round(words.length / Math.max(userMessages.length, 1));
  
  // Palavras de incerteza
  const uncertaintyPatterns = /\b(acho|talvez|não sei|pode ser|parece|acredito|provavelmente|i think|maybe|perhaps|i guess|probably)\b/gi;
  const uncertaintyMatches = allUserText.match(uncertaintyPatterns) || [];
  
  // Perguntas feitas
  const questions = userMessages.filter(m => m.content.includes('?')).length;

  const stats = {
    totalExchanges: totalMessages,
    userMessages: userMessages.length,
    speakingPercent: userPercent,
    avgResponseLength: avgWords,
    totalWords: words.length,
    questionsAsked: questions,
    uncertaintyWords: uncertaintyMatches.length,
    uncertaintyList: [...new Set(uncertaintyMatches.map(w => w.toLowerCase()))]
  };

  return { success: true, stats };
});

// ============================================
// V4 - ADAPTIVE PERSONALITY
// ============================================

let userPreferences = {
  responseLength: 'medium', // short, medium, detailed
  technicalLevel: 'balanced', // simple, balanced, technical
  tone: 'balanced', // direct, balanced, diplomatic
  learningData: []
};

function getUserPreferencesPath() {
  return path.join(app.getPath('userData'), 'user-preferences.json');
}

function loadUserPreferences() {
  try {
    const prefPath = getUserPreferencesPath();
    if (fs.existsSync(prefPath)) {
      userPreferences = JSON.parse(fs.readFileSync(prefPath, 'utf8'));
    }
  } catch (error) {
    console.error('Erro ao carregar preferências:', error);
  }
}

function saveUserPreferences() {
  try {
    fs.writeFileSync(getUserPreferencesPath(), JSON.stringify(userPreferences, null, 2));
  } catch (error) {
    console.error('Erro ao salvar preferências:', error);
  }
}

loadUserPreferences();

ipcMain.handle('get-user-preferences', () => userPreferences);

ipcMain.handle('update-user-preferences', (event, prefs) => {
  userPreferences = { ...userPreferences, ...prefs };
  saveUserPreferences();
  return { success: true, preferences: userPreferences };
});

ipcMain.handle('record-preference-feedback', (event, { suggestionType, wasUseful, userEdited }) => {
  userPreferences.learningData.push({
    timestamp: new Date().toISOString(),
    suggestionType,
    wasUseful,
    userEdited
  });
  
  // Limita histórico
  if (userPreferences.learningData.length > 100) {
    userPreferences.learningData = userPreferences.learningData.slice(-100);
  }
  
  // Analisa padrões
  const recent = userPreferences.learningData.slice(-20);
  const usefulShort = recent.filter(d => d.wasUseful && d.suggestionType === 'short').length;
  const usefulDetailed = recent.filter(d => d.wasUseful && d.suggestionType === 'detailed').length;
  
  if (usefulShort > usefulDetailed * 1.5) {
    userPreferences.responseLength = 'short';
  } else if (usefulDetailed > usefulShort * 1.5) {
    userPreferences.responseLength = 'detailed';
  }
  
  saveUserPreferences();
  return { success: true };
});
