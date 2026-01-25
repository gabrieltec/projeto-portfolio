// ============================================
// PERSSUA - AI Meeting Copilot
// Arquitetura: Streaming Audio + STT + Memory + LLM
// ============================================

class PerssuaApp {
  constructor() {
    // ============================================
    // ESTADO
    // ============================================
    this.isActive = false;
    this.isProcessing = false;
    this.isAlwaysOnTop = true;
    
    // Áudio
    this.audioSource = 'microphone'; // 'microphone', 'system', 'both'
    this.mediaRecorder = null;
    this.microphoneStream = null;
    this.systemStream = null;
    this.combinedStream = null;
    this.audioChunks = [];
    
    // Timer
    this.recordingStartTime = null;
    this.timerInterval = null;
    this.processingLoop = null;
    
    // ============================================
    // MEMÓRIA CONTÍNUA (JANELA DESLIZANTE)
    // ============================================
    this.conversationHistory = [];
    this.MAX_HISTORY_ITEMS = 20;
    this.MAX_TOKENS_ESTIMATE = 4000;
    
    // ============================================
    // BUFFER INTELIGENTE DE TRANSCRIÇÃO
    // ============================================
    this.transcriptBuffer = '';           // Acumula transcrições
    this.lastTranscriptTime = null;       // Tempo da última transcrição
    this.pendingSuggestion = false;       // Se há sugestão pendente
    this.SILENCE_THRESHOLD = 2500;        // 2.5s de silêncio = fim de fala
    this.MIN_WORDS_FOR_SUGGESTION = 4;    // Mínimo de palavras para sugerir
    this.currentTranscriptElement = null; // Elemento atual de transcrição na UI
    
    // ============================================
    // ACOPLAMENTO INTELIGENTE
    // ============================================
    this.lastFinalizedTranscript = '';    // Última transcrição finalizada
    this.lastTranscriptElement = null;    // Elemento da última transcrição
    this.lastSuggestionElement = null;    // Elemento da última sugestão
    this.CONTEXT_WINDOW = 8000;           // 8 segundos para considerar mesmo contexto
    this.lastFinalizedTime = null;        // Tempo da última finalização
    
    // ============================================
    // CONFIGURAÇÕES
    // ============================================
    this.CHUNK_INTERVAL = 3000; // 3 segundos (mais responsivo)
    this.MIN_AUDIO_SIZE = 4000; // Mínimo de bytes
    
    // ============================================
    // DOM
    // ============================================
    this.elements = {
      setupPanel: document.getElementById('setupPanel'),
      mainPanel: document.getElementById('mainPanel'),
      apiKeyInput: document.getElementById('apiKeyInput'),
      saveApiKeyBtn: document.getElementById('saveApiKey'),
      recordBtn: document.getElementById('recordBtn'),
      recordHint: document.getElementById('recordHint'),
      statusIndicator: document.getElementById('statusIndicator'),
      statusText: document.querySelector('.status-text'),
      recordingTime: document.getElementById('recordingTime'),
      recordingTimeInline: document.getElementById('recordingTimeInline'),
      transcriptBox: document.getElementById('transcriptBox'),
      suggestionsBox: document.getElementById('suggestionsBox'),
      loadingOverlay: document.getElementById('loadingOverlay'),
      clearTranscript: document.getElementById('clearTranscript'),
      copyAllTranscript: document.getElementById('copyAllTranscript'),
      minimizeBtn: document.getElementById('minimizeBtn'),
      closeBtn: document.getElementById('closeBtn'),
      pinBtn: document.getElementById('pinBtn'),
      openaiLink: document.getElementById('openaiLink'),
      // Resumo
      generateSummary: document.getElementById('generateSummary'),
      summaryModal: document.getElementById('summaryModal'),
      summaryBody: document.getElementById('summaryBody'),
      closeSummary: document.getElementById('closeSummary'),
      copySummary: document.getElementById('copySummary'),
      // Perfis (v2.0)
      profileQuickSelect: document.getElementById('profileQuickSelect'),
      activeProfileIcon: document.getElementById('activeProfileIcon'),
      activeProfileName: document.getElementById('activeProfileName'),
      profilesGrid: document.getElementById('profilesGrid'),
      createProfileBtn: document.getElementById('createProfileBtn'),
      detectedApps: document.getElementById('detectedApps'),
      appsList: document.getElementById('appsList'),
      // Histórico (v2.0)
      historyList: document.getElementById('historyList'),
      feedbackRate: document.getElementById('feedbackRate'),
      // V3 - Toolbar
      screenshotBtn: document.getElementById('screenshotBtn'),
      chatBtn: document.getElementById('chatBtn'),
      whatToSayBtn: document.getElementById('whatToSayBtn'),
      exportBtn: document.getElementById('exportBtn'),
      confidentialBtn: document.getElementById('confidentialBtn'),
      personaSelect: document.getElementById('personaSelect'),
      // V4 - Toolbar
      goalBtn: document.getElementById('goalBtn'),
      simulationBtn: document.getElementById('simulationBtn'),
      contextBtn: document.getElementById('contextBtn'),
      englishBtn: document.getElementById('englishBtn'),
      coachingBtn: document.getElementById('coachingBtn'),
      // V4 - Modais
      goalModal: document.getElementById('goalModal'),
      simulationModal: document.getElementById('simulationModal'),
      contextModal: document.getElementById('contextModal'),
      englishModal: document.getElementById('englishModal'),
      coachingModal: document.getElementById('coachingModal'),
      // V3 - Modais
      screenshotModal: document.getElementById('screenshotModal'),
      screenshotPreview: document.getElementById('screenshotPreview'),
      screenshotQuestion: document.getElementById('screenshotQuestion'),
      captureBtn: document.getElementById('captureBtn'),
      analyzeBtn: document.getElementById('analyzeBtn'),
      screenshotResult: document.getElementById('screenshotResult'),
      analysisText: document.getElementById('analysisText'),
      chatModal: document.getElementById('chatModal'),
      chatMessages: document.getElementById('chatMessages'),
      chatInput: document.getElementById('chatInput'),
      sendChatBtn: document.getElementById('sendChatBtn'),
      whatToSayModal: document.getElementById('whatToSayModal'),
      whatToSayResult: document.getElementById('whatToSayResult'),
      whatToSayText: document.getElementById('whatToSayText'),
      exportModal: document.getElementById('exportModal'),
      exportContent: document.getElementById('exportContent'),
      clientMemoryModal: document.getElementById('clientMemoryModal'),
      // Audio source buttons
      optionMic: document.getElementById('optionMic'),
      optionSystem: document.getElementById('optionSystem'),
      optionBoth: document.getElementById('optionBoth'),
      // Settings
      settingsBtn: document.getElementById('settingsBtn'),
      settingsPanel: document.getElementById('settingsPanel'),
      closeSettings: document.getElementById('closeSettings'),
      cancelSettings: document.getElementById('cancelSettings'),
      saveSettingsBtn: document.getElementById('saveSettingsBtn'),
      settingsApiKey: document.getElementById('settingsApiKey'),
      settingsInputLang: document.getElementById('settingsInputLang'),
      settingsOutputLang: document.getElementById('settingsOutputLang'),
      settingsModel: document.getElementById('settingsModel'),
      settingsMode: document.getElementById('settingsMode'),
      toggleAutoSuggestion: document.getElementById('toggleAutoSuggestion')
    };

    // Estado das configurações
    this.settings = {};
    this.autoSuggestionEnabled = true;
    this.suggestionsMuted = false;

    // V3 - Estado
    this.confidentialMode = false;
    this.currentScreenshot = null;
    this.selectedPersona = '';
    this.chatHistory = [];

    // V4 - Estado
    this.meetingGoal = null;
    this.simulationActive = false;
    this.simulationDifficulty = 'senior';
    this.currentContextType = 'cv';
    this.injectedContexts = { cv: null, jobDescription: null, company: null, interviewer: null };
    this.englishMode = 'translate';
    this.translateMode = 'professional';

    this.init();
  }

  // ============================================
  // INICIALIZAÇÃO
  // ============================================
  
  async init() {
    this.bindEvents();
    this.setupStreamingListeners();
    this.setupShortcutListeners();
    await this.loadSettings();
    await this.loadProfiles();
    this.checkSavedApiKey();
  }

  bindEvents() {
    // Setup
    this.elements.saveApiKeyBtn.addEventListener('click', () => this.saveApiKey());
    this.elements.apiKeyInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.saveApiKey();
    });

    // Controle principal
    this.elements.recordBtn.addEventListener('click', () => this.toggleSession());

    // Seleção de fonte de áudio
    this.elements.optionMic.addEventListener('click', () => this.setAudioSource('microphone'));
    this.elements.optionSystem.addEventListener('click', () => this.setAudioSource('system'));
    this.elements.optionBoth.addEventListener('click', () => this.setAudioSource('both'));

    // Transcript actions
    this.elements.clearTranscript.addEventListener('click', () => this.clearSession());
    this.elements.copyAllTranscript.addEventListener('click', () => this.copyAllTranscripts());

    // Window controls
    this.elements.minimizeBtn.addEventListener('click', () => window.electronAPI.minimizeWindow());
    this.elements.closeBtn.addEventListener('click', () => window.electronAPI.closeWindow());
    this.elements.pinBtn.addEventListener('click', () => this.togglePin());

    // Settings
    this.elements.settingsBtn.addEventListener('click', () => this.openSettings());
    this.elements.closeSettings.addEventListener('click', () => this.closeSettingsPanel());
    this.elements.cancelSettings.addEventListener('click', () => this.closeSettingsPanel());
    this.elements.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
    this.elements.toggleAutoSuggestion.addEventListener('click', () => this.toggleAutoSuggestion());

    // Settings tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });

    // Resumo
    this.elements.generateSummary.addEventListener('click', () => this.generateMeetingSummary());
    this.elements.closeSummary.addEventListener('click', () => this.closeSummaryModal());
    this.elements.copySummary.addEventListener('click', () => this.copySummary());
    
    // Fechar modal ao clicar fora
    this.elements.summaryModal.addEventListener('click', (e) => {
      if (e.target === this.elements.summaryModal) {
        this.closeSummaryModal();
      }
    });

    // Perfis (v2.0)
    this.elements.profileQuickSelect.addEventListener('click', () => {
      this.openSettings();
      this.switchTab('profiles');
    });
    
    if (this.elements.createProfileBtn) {
      this.elements.createProfileBtn.addEventListener('click', () => this.createCustomProfile());
    }

    // ============================================
    // V3 - EVENT LISTENERS
    // ============================================
    
    // Toolbar buttons
    this.elements.screenshotBtn?.addEventListener('click', () => this.openScreenshotModal());
    this.elements.chatBtn?.addEventListener('click', () => this.openChatModal());
    this.elements.whatToSayBtn?.addEventListener('click', () => this.openWhatToSayModal());
    this.elements.exportBtn?.addEventListener('click', () => this.openExportModal());
    this.elements.confidentialBtn?.addEventListener('click', () => this.toggleConfidentialMode());
    
    // Persona selector
    this.elements.personaSelect?.addEventListener('change', (e) => {
      this.selectedPersona = e.target.value;
    });
    
    // Screenshot modal
    document.getElementById('closeScreenshotModal')?.addEventListener('click', () => this.closeModal('screenshotModal'));
    this.elements.captureBtn?.addEventListener('click', () => this.captureScreenshot());
    this.elements.analyzeBtn?.addEventListener('click', () => this.analyzeScreenshot());
    
    // Chat modal
    document.getElementById('closeChatModal')?.addEventListener('click', () => this.closeModal('chatModal'));
    this.elements.sendChatBtn?.addEventListener('click', () => this.sendChatMessage());
    this.elements.chatInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendChatMessage();
    });
    
    // What to say modal
    document.getElementById('closeWhatToSayModal')?.addEventListener('click', () => this.closeModal('whatToSayModal'));
    document.querySelectorAll('.situation-btn').forEach(btn => {
      btn.addEventListener('click', () => this.getWhatToSay(btn.dataset.situation));
    });
    
    // Export modal
    document.getElementById('closeExportModal')?.addEventListener('click', () => this.closeModal('exportModal'));
    document.querySelectorAll('.export-option').forEach(btn => {
      btn.addEventListener('click', () => this.prepareExport(btn.dataset.format));
    });
    document.getElementById('downloadExport')?.addEventListener('click', () => this.downloadExport());
    
    // Client Memory modal
    document.getElementById('clientMemoryBtn')?.addEventListener('click', () => this.openClientMemoryModal());
    document.getElementById('closeClientMemoryModal')?.addEventListener('click', () => this.closeModal('clientMemoryModal'));
    document.getElementById('loadClientMemory')?.addEventListener('click', () => this.loadClientMemory());
    document.getElementById('newClientMemory')?.addEventListener('click', () => this.createClientMemory());
    document.getElementById('addNoteBtn')?.addEventListener('click', () => this.addClientNote());
    
    // Close modals on overlay click
    document.querySelectorAll('.v3-modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
    });

    // ============================================
    // V4 - EVENT LISTENERS
    // ============================================
    
    // V4 Toolbar buttons
    this.elements.goalBtn?.addEventListener('click', () => this.openGoalModal());
    this.elements.simulationBtn?.addEventListener('click', () => this.openSimulationModal());
    this.elements.contextBtn?.addEventListener('click', () => this.openContextModal());
    this.elements.englishBtn?.addEventListener('click', () => this.openEnglishModal());
    this.elements.coachingBtn?.addEventListener('click', () => this.openCoachingModal());
    
    // Goal Modal
    document.getElementById('closeGoalModal')?.addEventListener('click', () => this.closeModal('goalModal'));
    document.getElementById('saveGoalBtn')?.addEventListener('click', () => this.saveMeetingGoal());
    
    // Simulation Modal
    document.getElementById('closeSimulationModal')?.addEventListener('click', () => this.closeModal('simulationModal'));
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.simulationDifficulty = btn.dataset.diff;
      });
    });
    document.getElementById('startSimBtn')?.addEventListener('click', () => this.startSimulation());
    document.getElementById('sendSimBtn')?.addEventListener('click', () => this.sendSimulationResponse());
    document.getElementById('simInput')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendSimulationResponse();
    });
    document.getElementById('endSimBtn')?.addEventListener('click', () => this.endSimulation());
    
    // Context Modal
    document.getElementById('closeContextModal')?.addEventListener('click', () => this.closeModal('contextModal'));
    document.querySelectorAll('.context-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.context-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentContextType = tab.dataset.ctx;
        this.loadContextForType(tab.dataset.ctx);
      });
    });
    document.getElementById('saveContextBtn')?.addEventListener('click', () => this.saveContext());
    document.getElementById('clearContextBtn')?.addEventListener('click', () => this.clearAllContext());
    
    // English Modal
    document.getElementById('closeEnglishModal')?.addEventListener('click', () => this.closeModal('englishModal'));
    document.querySelectorAll('.english-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.english-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.englishMode = tab.dataset.mode;
        document.getElementById('translateContent').style.display = this.englishMode === 'translate' ? 'block' : 'none';
        document.getElementById('speakContent').style.display = this.englishMode === 'speak' ? 'block' : 'none';
      });
    });
    document.querySelectorAll('.trans-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.trans-mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.translateMode = btn.dataset.mode;
      });
    });
    document.getElementById('translateBtn')?.addEventListener('click', () => this.translateText());
    document.getElementById('speakBtn')?.addEventListener('click', () => this.generateSpeakPhrase());
    
    // Coaching Modal
    document.getElementById('closeCoachingModal')?.addEventListener('click', () => this.closeModal('coachingModal'));
  }

  // ============================================
  // ATALHOS GLOBAIS
  // ============================================

  setupShortcutListeners() {
    window.electronAPI.onShortcutAction((action) => {
      console.log('Atalho recebido:', action);
      
      switch(action) {
        case 'toggle-session':
          this.toggleSession();
          this.showNotification('⌨️ Sessão alternada', 'info');
          break;
        case 'mute-suggestions':
          this.toggleMuteSuggestions();
          break;
        case 'toggle-pin':
          this.togglePin();
          this.showNotification('📌 Pin alternado', 'info');
          break;
        case 'clear-context':
          this.clearSession();
          break;
        case 'end-session':
          if (this.isActive) {
            this.stopSession();
          }
          this.showNotification('⏹️ Sessão encerrada', 'info');
          break;
      }
    });
  }

  toggleMuteSuggestions() {
    this.suggestionsMuted = !this.suggestionsMuted;
    if (this.suggestionsMuted) {
      this.showNotification('🔇 Sugestões mutadas', 'info');
    } else {
      this.showNotification('🔊 Sugestões ativadas', 'info');
    }
  }

  // ============================================
  // CONFIGURAÇÕES
  // ============================================

  async loadSettings() {
    try {
      this.settings = await window.electronAPI.getSettings();
      this.autoSuggestionEnabled = this.settings.autoSuggestion !== false;
      this.updateAutoSuggestionUI();
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  }

  openSettings() {
    // Preenche os campos com valores atuais
    this.elements.settingsApiKey.value = this.settings.apiKey || '';
    this.elements.settingsInputLang.value = this.settings.inputLanguage || 'pt';
    this.elements.settingsOutputLang.value = this.settings.outputLanguage || 'pt';
    this.elements.settingsModel.value = this.settings.model || 'gpt-4o-mini';
    this.elements.settingsMode.value = this.settings.assistanceMode || 'general';
    this.updateAutoSuggestionUI();
    
    // Mostra o painel
    this.elements.settingsPanel.style.display = 'flex';
  }

  closeSettingsPanel() {
    this.elements.settingsPanel.style.display = 'none';
  }

  async saveSettings() {
    const newSettings = {
      apiKey: this.elements.settingsApiKey.value.trim(),
      inputLanguage: this.elements.settingsInputLang.value,
      outputLanguage: this.elements.settingsOutputLang.value,
      model: this.elements.settingsModel.value,
      assistanceMode: this.elements.settingsMode.value,
      autoSuggestion: this.autoSuggestionEnabled
    };

    try {
      await window.electronAPI.saveSettings(newSettings);
      this.settings = { ...this.settings, ...newSettings };
      
      // Se mudou a API key, reinicializa
      if (newSettings.apiKey && newSettings.apiKey !== localStorage.getItem('openai_api_key')) {
        localStorage.setItem('openai_api_key', newSettings.apiKey);
        await window.electronAPI.initOpenAI(newSettings.apiKey);
      }
      
      this.showNotification('✅ Configurações salvas!', 'success');
      this.closeSettingsPanel();
    } catch (error) {
      this.showNotification('Erro ao salvar: ' + error.message, 'error');
    }
  }

  toggleAutoSuggestion() {
    this.autoSuggestionEnabled = !this.autoSuggestionEnabled;
    this.updateAutoSuggestionUI();
  }

  updateAutoSuggestionUI() {
    const btn = this.elements.toggleAutoSuggestion;
    if (this.autoSuggestionEnabled) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  }

  switchTab(tabId) {
    // Remove active de todas as tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Ativa a tab selecionada
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`tab-${tabId}`).classList.add('active');
    
    // Carrega dados específicos da tab
    if (tabId === 'profiles') {
      this.loadProfiles();
      this.detectMeetingApps();
    } else if (tabId === 'history') {
      this.loadMeetingHistory();
    }
  }

  // ============================================
  // SELEÇÃO DE FONTE DE ÁUDIO
  // ============================================

  setAudioSource(source) {
    // Não permite mudar durante gravação
    if (this.isActive) {
      this.showNotification('Pause a sessão para mudar a fonte', 'error');
      return;
    }

    this.audioSource = source;
    
    // Atualiza UI
    document.querySelectorAll('.audio-option').forEach(btn => btn.classList.remove('active'));
    
    switch(source) {
      case 'microphone':
        this.elements.optionMic.classList.add('active');
        break;
      case 'system':
        this.elements.optionSystem.classList.add('active');
        break;
      case 'both':
        this.elements.optionBoth.classList.add('active');
        break;
    }

    const labels = {
      microphone: '🎤 Microfone selecionado',
      system: '🔊 Áudio do sistema selecionado',
      both: '🎧 Microfone + Sistema selecionado'
    };
    
    this.showNotification(labels[source], 'info');
  }

  // ============================================
  // STREAMING LISTENERS (IA)
  // ============================================
  
  setupStreamingListeners() {
    window.electronAPI.onSuggestionChunk((chunk) => {
      this.appendSuggestionChunk(chunk);
    });

    window.electronAPI.onSuggestionComplete((fullText) => {
      this.finalizeSuggestion(fullText);
    });
  }

  // ============================================
  // API KEY
  // ============================================

  checkSavedApiKey() {
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      this.initializeOpenAI(savedKey);
    }
  }

  async saveApiKey() {
    const apiKey = this.elements.apiKeyInput.value.trim();
    
    if (!apiKey || !apiKey.startsWith('sk-')) {
      this.showNotification('Chave de API inválida', 'error');
      return;
    }

    this.showLoading(true);
    
    try {
      const result = await window.electronAPI.initOpenAI(apiKey);
      
      if (result.success) {
        localStorage.setItem('openai_api_key', apiKey);
        this.showMainPanel();
        this.showNotification('✅ Conectado!', 'success');
      } else {
        this.showNotification('Erro: ' + result.error, 'error');
      }
    } catch (error) {
      this.showNotification('Erro: ' + error.message, 'error');
    }
    
    this.showLoading(false);
  }

  async initializeOpenAI(apiKey) {
    this.showLoading(true);
    
    try {
      const result = await window.electronAPI.initOpenAI(apiKey);
      if (result.success) {
        this.showMainPanel();
      }
    } catch (error) {
      console.error('Erro ao inicializar:', error);
    }
    
    this.showLoading(false);
  }

  showMainPanel() {
    this.elements.setupPanel.style.display = 'none';
    this.elements.mainPanel.style.display = 'flex';
    this.elements.mainPanel.classList.add('fade-in');
  }

  // ============================================
  // SESSÃO CONTÍNUA
  // ============================================

  async toggleSession() {
    if (this.isActive) {
      this.stopSession();
    } else {
      await this.startSession();
    }
  }

  async startSession() {
    try {
      let stream = null;

      switch(this.audioSource) {
        case 'microphone':
          stream = await this.getMicrophoneStream();
          break;
        case 'system':
          stream = await this.getSystemAudioStream();
          break;
        case 'both':
          stream = await this.getCombinedStream();
          break;
      }

      if (!stream) {
        this.showNotification('Não foi possível acessar a fonte de áudio', 'error');
        return;
      }

      // Salva o stream para reutilizar
      this.currentStream = stream;
      this.mimeType = this.getSupportedMimeType();

      this.isActive = true;
      this.recordingStartTime = Date.now();
      this.updateUI(true);
      this.startTimer();
      
      const sourceLabels = {
        microphone: '🎤 Microfone',
        system: '🔊 Sistema',
        both: '🎧 Mic + Sistema'
      };
      
      this.updateStatus(`🟢 ${sourceLabels[this.audioSource]} - Escutando...`);
      this.addSystemMessage(`Sessão iniciada (${sourceLabels[this.audioSource]})`);

      // Registra início da reunião no histórico (v2.0)
      try {
        await window.electronAPI.startMeeting({
          profileId: this.activeProfile?.id,
          title: `Reunião - ${new Date().toLocaleString('pt-BR')}`
        });
      } catch (error) {
        console.error('Erro ao registrar reunião:', error);
      }

      // Inicia o ciclo de gravação
      this.startRecordingCycle();

    } catch (error) {
      console.error('Erro ao iniciar:', error);
      this.showNotification('Erro: ' + error.message, 'error');
    }
  }

  // Ciclo de gravação: para/processa/reinicia para garantir header válido
  startRecordingCycle() {
    if (!this.isActive || !this.currentStream) return;

    this.audioChunks = [];
    
    this.mediaRecorder = new MediaRecorder(this.currentStream, {
      mimeType: this.mimeType,
      audioBitsPerSecond: 128000
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = async () => {
      // Processa o áudio capturado
      await this.processAudioChunk();
      
      // Reinicia o ciclo se ainda estiver ativo
      if (this.isActive) {
        this.startRecordingCycle();
      }
    };

    // Inicia gravação
    this.mediaRecorder.start();

    // Para após o intervalo definido
    this.recordingTimeout = setTimeout(() => {
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop();
      }
    }, this.CHUNK_INTERVAL);
  }

  // ============================================
  // STREAMS DE ÁUDIO
  // ============================================

  async getMicrophoneStream() {
    try {
      this.microphoneStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        }
      });
      return this.microphoneStream;
    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      throw new Error('Não foi possível acessar o microfone. Verifique as permissões.');
    }
  }

  async getSystemAudioStream() {
    try {
      // No Electron, precisamos usar desktopCapturer para áudio do sistema
      const sources = await window.electronAPI.getAudioSources();
      
      if (sources.length === 0) {
        throw new Error('Nenhuma fonte de áudio do sistema encontrada');
      }

      // Pega a primeira tela/janela para capturar áudio
      const screenSource = sources.find(s => s.name.includes('Screen') || s.name.includes('Entire')) || sources[0];
      
      this.systemStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: screenSource.id
          }
        },
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: screenSource.id,
            maxWidth: 1,
            maxHeight: 1
          }
        }
      });

      // Remove a track de vídeo (não precisamos)
      this.systemStream.getVideoTracks().forEach(track => track.stop());
      
      // Retorna apenas o áudio
      return new MediaStream(this.systemStream.getAudioTracks());
      
    } catch (error) {
      console.error('Erro ao acessar áudio do sistema:', error);
      // Fallback: tenta capturar como se fosse microfone (pode funcionar em alguns sistemas)
      try {
        return await this.getMicrophoneStream();
      } catch (e) {
        throw new Error('Não foi possível capturar áudio do sistema. Tente usar apenas o Microfone.');
      }
    }
  }

  async getCombinedStream() {
    try {
      // Tenta obter ambos os streams
      const micStream = await this.getMicrophoneStream();
      
      let sysStream = null;
      try {
        sysStream = await this.getSystemAudioStream();
      } catch (e) {
        console.warn('Não foi possível capturar áudio do sistema, usando apenas microfone');
        this.showNotification('⚠️ Usando apenas microfone', 'info');
        return micStream;
      }

      // Combina os streams usando AudioContext
      const audioContext = new AudioContext();
      const destination = audioContext.createMediaStreamDestination();

      // Adiciona microfone
      const micSource = audioContext.createMediaStreamSource(micStream);
      micSource.connect(destination);

      // Adiciona sistema
      if (sysStream && sysStream.getAudioTracks().length > 0) {
        const sysSource = audioContext.createMediaStreamSource(sysStream);
        sysSource.connect(destination);
      }

      this.combinedStream = destination.stream;
      return this.combinedStream;

    } catch (error) {
      console.error('Erro ao combinar streams:', error);
      // Fallback para apenas microfone
      return await this.getMicrophoneStream();
    }
  }

  getSupportedMimeType() {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/mpeg'
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log('Usando formato:', type);
        return type;
      }
    }
    
    return 'audio/webm';
  }

  async stopSession() {
    // Marca como inativo primeiro para parar o ciclo
    this.isActive = false;
    
    // Finaliza qualquer fala pendente
    if (this.transcriptBuffer) {
      this.finalizeCurrentSpeech();
    }
    
    // Para o timeout de gravação
    if (this.recordingTimeout) {
      clearTimeout(this.recordingTimeout);
      this.recordingTimeout = null;
    }
    
    // Para timeout de silêncio
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }
    
    // Para gravação atual
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    
    // Para todos os streams
    [this.microphoneStream, this.systemStream, this.combinedStream, this.currentStream].forEach(stream => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    });
    
    this.microphoneStream = null;
    this.systemStream = null;
    this.combinedStream = null;
    this.currentStream = null;
    this.currentTranscriptElement = null;

    this.updateUI(false);
    this.stopTimer();
    
    this.updateStatus('⏸️ Sessão pausada');
    this.addSystemMessage('Sessão encerrada.');
    
    // Finaliza a reunião no histórico (v2.0)
    try {
      await window.electronAPI.endMeeting({
        summary: this.currentSummary || null
      });
    } catch (error) {
      console.error('Erro ao finalizar reunião:', error);
    }
  }

  // ============================================
  // PROCESSAMENTO DE ÁUDIO CONTÍNUO
  // ============================================

  async processAudioChunk() {
    if (this.audioChunks.length === 0) return;
    
    // Cria blob com todos os chunks (incluindo header)
    const audioBlob = new Blob(this.audioChunks, { type: this.mimeType });
    
    // Verifica tamanho mínimo
    if (audioBlob.size < this.MIN_AUDIO_SIZE) {
      console.log('Chunk muito pequeno:', audioBlob.size);
      return;
    }

    const sourceLabels = {
      microphone: '🎤 Microfone',
      system: '🔊 Sistema',
      both: '🎧 Mic + Sistema'
    };

    this.updateStatus('🎯 Transcrevendo...');

    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      
      console.log('Enviando áudio:', audioBlob.size, 'bytes');
      
      const result = await window.electronAPI.transcribeAudio(
        Array.from(new Uint8Array(arrayBuffer))
      );
      
      if (result.success && result.text && result.text.trim().length > 2) {
        // Limpa a transcrição (remove ... e outros artefatos)
        const transcript = this.cleanTranscript(result.text);
        
        // Ignora ruídos
        if (transcript && !this.isNoise(transcript)) {
          // Adiciona ao buffer inteligente
          this.addToTranscriptBuffer(transcript);
        }
      } else if (result.error) {
        console.error('Erro transcrição:', result.error);
      }
      
      if (this.isActive) {
        this.updateStatus(`🟢 ${sourceLabels[this.audioSource]} - Escutando...`);
      }

    } catch (error) {
      console.error('Erro processamento:', error);
    }
  }

  // ============================================
  // BUFFER INTELIGENTE DE TRANSCRIÇÃO
  // ============================================

  addToTranscriptBuffer(text) {
    const now = Date.now();
    const timeSinceLastTranscript = this.lastTranscriptTime 
      ? now - this.lastTranscriptTime 
      : 0;
    
    // Se passou muito tempo (silêncio), finaliza a fala anterior
    if (timeSinceLastTranscript > this.SILENCE_THRESHOLD && this.transcriptBuffer) {
      this.finalizeCurrentSpeech();
    }
    
    // Adiciona ao buffer
    if (this.transcriptBuffer) {
      // Verifica se precisa de espaço
      const lastChar = this.transcriptBuffer.slice(-1);
      const needsSpace = ![' ', '.', '!', '?', ',', ';', ':'].includes(lastChar);
      this.transcriptBuffer += (needsSpace ? ' ' : '') + text;
    } else {
      this.transcriptBuffer = text;
    }
    
    this.lastTranscriptTime = now;
    
    // Atualiza a UI em tempo real (agrupa no mesmo elemento)
    this.updateTranscriptUI();
    
    // Verifica se a fala parece completa
    if (this.isSpeechComplete()) {
      this.finalizeCurrentSpeech();
    } else {
      // Agenda verificação de silêncio
      this.scheduleSilenceCheck();
    }
  }

  updateTranscriptUI() {
    const box = this.elements.transcriptBox;
    
    // Remove placeholder se existir
    const placeholder = box.querySelector('.placeholder-text');
    if (placeholder) placeholder.remove();

    // Se já existe elemento atual, atualiza o texto diretamente
    if (this.currentTranscriptElement) {
      const textEl = this.currentTranscriptElement.querySelector('.transcript-text');
      if (textEl) {
        textEl.textContent = this.transcriptBuffer;
      }
    } else {
      // Cria novo elemento - texto aparece direto, sem indicador
      const messageDiv = document.createElement('div');
      messageDiv.className = 'transcript-message current fade-in';
      messageDiv.setAttribute('draggable', 'true');
      messageDiv.innerHTML = `
        <div class="transcript-header">
          <span class="drag-handle" title="Arraste para mesclar">⋮⋮</span>
          <span class="transcript-time">${this.getTimeString()}</span>
          <span class="live-badge">● AO VIVO</span>
        </div>
        <div class="transcript-text">${this.transcriptBuffer}</div>
      `;
      box.appendChild(messageDiv);
      this.currentTranscriptElement = messageDiv;
    }
    
    box.scrollTop = box.scrollHeight;
  }

  isSpeechComplete() {
    if (!this.transcriptBuffer) return false;
    
    const trimmed = this.transcriptBuffer.trim();
    
    // Verifica pontuação final forte
    const endsWithPunctuation = /[.!?]$/.test(trimmed);
    
    // Verifica se tem palavras suficientes
    const wordCount = trimmed.split(/\s+/).length;
    
    // Fala completa se: termina com pontuação E tem palavras suficientes
    // OU se tem muitas palavras (provavelmente frase longa)
    return (endsWithPunctuation && wordCount >= 3) || wordCount >= 15;
  }

  scheduleSilenceCheck() {
    // Cancela verificação anterior
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
    }
    
    // Agenda nova verificação
    this.silenceTimeout = setTimeout(() => {
      if (this.transcriptBuffer && this.isActive) {
        this.finalizeCurrentSpeech();
      }
    }, this.SILENCE_THRESHOLD);
  }

  finalizeCurrentSpeech() {
    if (!this.transcriptBuffer) return;
    
    const finalText = this.transcriptBuffer.trim();
    const now = Date.now();
    
    // ============================================
    // ACOPLAMENTO INTELIGENTE
    // ============================================
    const shouldMerge = this.shouldMergeWithPrevious(finalText, now);
    
    if (shouldMerge && this.lastTranscriptElement) {
      // ACOPLA com a transcrição anterior
      this.mergeWithPreviousTranscript(finalText);
    } else {
      // Cria nova transcrição (comportamento normal)
      this.finalizeAsNewTranscript(finalText);
    }
    
    // Atualiza referências
    this.lastFinalizedTranscript = shouldMerge 
      ? this.lastFinalizedTranscript + ' ' + finalText 
      : finalText;
    this.lastFinalizedTime = now;
    
    // Limpa buffer
    this.transcriptBuffer = '';
    this.currentTranscriptElement = null;
    this.lastTranscriptTime = null;
    
    // Cancela verificação de silêncio
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }
  }

  // Verifica se deve acoplar com a transcrição anterior
  shouldMergeWithPrevious(newText, now) {
    // Não tem transcrição anterior
    if (!this.lastFinalizedTranscript || !this.lastFinalizedTime) {
      return false;
    }
    
    // Verifica janela de tempo (mesmo contexto)
    const timeSinceLast = now - this.lastFinalizedTime;
    if (timeSinceLast > this.CONTEXT_WINDOW) {
      return false;
    }
    
    // Verifica se parece ser continuação
    const lastEndsWithPunctuation = /[.!?]$/.test(this.lastFinalizedTranscript.trim());
    const newStartsLowercase = /^[a-záàâãéêíóôõúç]/.test(newText.trim());
    const newStartsWithConnector = /^(e |mas |porém |então |porque |pois |ou |que |como |quando |se |para |com )/i.test(newText.trim());
    
    // Acopla se:
    // 1. A anterior não terminou com pontuação forte, OU
    // 2. A nova começa com minúscula ou conector
    return !lastEndsWithPunctuation || newStartsLowercase || newStartsWithConnector;
  }

  // Acopla com a transcrição anterior
  mergeWithPreviousTranscript(newText) {
    console.log('🔗 Acoplando transcrição');
    
    // Atualiza o texto do elemento anterior
    if (this.lastTranscriptElement) {
      const textEl = this.lastTranscriptElement.querySelector('.transcript-text');
      if (textEl) {
        // Junta os textos de forma inteligente
        const currentText = textEl.textContent;
        const mergedText = this.smartMergeTexts(currentText, newText);
        textEl.textContent = mergedText;
        
        // Efeito visual de merge
        this.lastTranscriptElement.classList.add('merged');
        setTimeout(() => {
          this.lastTranscriptElement?.classList.remove('merged');
        }, 500);
        
        // Atualiza os botões
        const askBtn = this.lastTranscriptElement.querySelector('.ask-btn');
        if (askBtn) {
          askBtn.onclick = () => this.askSuggestionFor(mergedText);
        }
        
        const copyBtn = this.lastTranscriptElement.querySelector('.copy-btn');
        if (copyBtn) {
          copyBtn.onclick = () => this.copyText(mergedText);
        }
      }
    }
    
    // Remove o elemento atual (que seria duplicado)
    if (this.currentTranscriptElement && this.currentTranscriptElement !== this.lastTranscriptElement) {
      this.currentTranscriptElement.remove();
    }
    
    // Atualiza memória (substitui a última entrada)
    if (this.conversationHistory.length > 0) {
      const lastEntry = this.conversationHistory[this.conversationHistory.length - 1];
      if (lastEntry.role === 'user') {
        lastEntry.content = this.smartMergeTexts(lastEntry.content, newText);
      }
    }
    
    // Deleta a sugestão anterior e gera uma nova consolidada
    this.removePreviousSuggestion();
    
    // Gera nova sugestão com contexto completo
    const wordCount = this.lastFinalizedTranscript.split(/\s+/).length;
    if (wordCount >= this.MIN_WORDS_FOR_SUGGESTION) {
      this.generateSuggestions();
    }
  }

  // Finaliza como nova transcrição
  finalizeAsNewTranscript(finalText) {
    // Finaliza elemento visual atual
    if (this.currentTranscriptElement) {
      this.currentTranscriptElement.classList.remove('current');
      
      // Gera ID único para drag and drop
      const transcriptId = 'transcript-' + Date.now();
      this.currentTranscriptElement.dataset.transcriptId = transcriptId;
      this.currentTranscriptElement.dataset.text = finalText;
      
      // Remove badge "AO VIVO"
      const liveBadge = this.currentTranscriptElement.querySelector('.live-badge');
      if (liveBadge) liveBadge.remove();
      
      // Adiciona botões de ação
      const header = this.currentTranscriptElement.querySelector('.transcript-header');
      if (header && !header.querySelector('.copy-btn')) {
        // Botão de pedir sugestão
        const askBtn = document.createElement('button');
        askBtn.className = 'ask-btn';
        askBtn.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        `;
        askBtn.title = 'Pedir sugestão';
        askBtn.onclick = () => this.askSuggestionFor(this.currentTranscriptElement.dataset.text);
        header.appendChild(askBtn);
        
        // Botão de copiar
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
        `;
        copyBtn.title = 'Copiar';
        copyBtn.onclick = () => this.copyText(this.currentTranscriptElement.dataset.text);
        header.appendChild(copyBtn);
      }
      
      // Configura drag and drop
      this.setupDragAndDrop(this.currentTranscriptElement);
      
      // Detecta intent (v3)
      this.detectAndShowIntent(finalText, this.currentTranscriptElement);
      
      // Salva referência para possível acoplamento futuro
      this.lastTranscriptElement = this.currentTranscriptElement;
    }
    
    // Adiciona à memória
    this.addToMemory('user', finalText);
    
    // Gera sugestão automática se habilitado e tiver conteúdo suficiente
    const wordCount = finalText.split(/\s+/).length;
    if (wordCount >= this.MIN_WORDS_FOR_SUGGESTION) {
      this.generateSuggestions();
    }
  }

  // ============================================
  // DRAG AND DROP PARA MESCLAR TRANSCRIÇÕES
  // ============================================

  setupDragAndDrop(element) {
    // Garante que o elemento é arrastável
    element.setAttribute('draggable', 'true');
    
    // Remove listeners anteriores para evitar duplicação
    element.removeEventListener('dragstart', element._dragStartHandler);
    element.removeEventListener('dragend', element._dragEndHandler);
    element.removeEventListener('dragover', element._dragOverHandler);
    element.removeEventListener('dragleave', element._dragLeaveHandler);
    element.removeEventListener('drop', element._dropHandler);
    
    // Drag start
    element._dragStartHandler = (e) => {
      console.log('Drag started:', element.dataset.transcriptId);
      e.dataTransfer.setData('text/plain', element.dataset.transcriptId);
      e.dataTransfer.effectAllowed = 'move';
      element.classList.add('dragging');
      
      // Pequeno delay para o visual funcionar melhor
      setTimeout(() => {
        // Destaca elementos que podem receber
        document.querySelectorAll('.transcript-message:not(.current)').forEach(el => {
          if (el !== element && el.dataset.transcriptId) {
            el.classList.add('drop-target');
          }
        });
      }, 10);
    };
    element.addEventListener('dragstart', element._dragStartHandler);

    // Drag end
    element._dragEndHandler = () => {
      console.log('Drag ended');
      element.classList.remove('dragging');
      document.querySelectorAll('.transcript-message').forEach(el => {
        el.classList.remove('drop-target', 'drag-over');
      });
    };
    element.addEventListener('dragend', element._dragEndHandler);

    // Drag over
    element._dragOverHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';
      if (!element.classList.contains('dragging')) {
        element.classList.add('drag-over');
      }
    };
    element.addEventListener('dragover', element._dragOverHandler);

    // Drag leave
    element._dragLeaveHandler = (e) => {
      // Só remove se realmente saiu do elemento
      if (!element.contains(e.relatedTarget)) {
        element.classList.remove('drag-over');
      }
    };
    element.addEventListener('dragleave', element._dragLeaveHandler);

    // Drop
    element._dropHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      element.classList.remove('drag-over');
      
      const sourceId = e.dataTransfer.getData('text/plain');
      console.log('Drop received from:', sourceId, 'to:', element.dataset.transcriptId);
      
      const sourceElement = document.querySelector(`[data-transcript-id="${sourceId}"]`);
      
      if (sourceElement && sourceElement !== element && element.dataset.transcriptId) {
        this.mergeTranscriptsByDrop(sourceElement, element);
      }
    };
    element.addEventListener('drop', element._dropHandler);
  }

  mergeTranscriptsByDrop(sourceEl, targetEl) {
    const sourceText = sourceEl.dataset.text;
    const targetText = targetEl.dataset.text;
    
    // Determina a ordem baseada na posição no DOM
    const sourceIndex = Array.from(this.elements.transcriptBox.children).indexOf(sourceEl);
    const targetIndex = Array.from(this.elements.transcriptBox.children).indexOf(targetEl);
    
    let mergedText;
    if (sourceIndex < targetIndex) {
      // Source vem antes, então: source + target
      mergedText = this.smartMergeTexts(sourceText, targetText);
    } else {
      // Target vem antes, então: target + source
      mergedText = this.smartMergeTexts(targetText, sourceText);
    }
    
    // Atualiza o elemento target
    const textEl = targetEl.querySelector('.transcript-text');
    if (textEl) {
      textEl.textContent = mergedText;
    }
    targetEl.dataset.text = mergedText;
    
    // Atualiza os botões
    const askBtn = targetEl.querySelector('.ask-btn');
    if (askBtn) {
      askBtn.onclick = () => this.askSuggestionFor(mergedText);
    }
    const copyBtn = targetEl.querySelector('.copy-btn');
    if (copyBtn) {
      copyBtn.onclick = () => this.copyText(mergedText);
    }
    
    // Efeito visual de merge
    targetEl.classList.add('merged');
    setTimeout(() => targetEl.classList.remove('merged'), 500);
    
    // Remove o elemento source
    sourceEl.remove();
    
    // Atualiza referências
    if (this.lastTranscriptElement === sourceEl) {
      this.lastTranscriptElement = targetEl;
    }
    
    this.showNotification('🔗 Transcrições mescladas!', 'success');
  }

  // Pedir sugestão para uma transcrição específica
  async askSuggestionFor(text) {
    // Mostra loading no botão
    this.showNotification('🤖 Gerando sugestão...', 'info');
    
    // Força geração de sugestão mesmo com auto-sugestão desligado
    const originalAutoSuggestion = this.autoSuggestionEnabled;
    const originalMuted = this.suggestionsMuted;
    
    this.autoSuggestionEnabled = true;
    this.suggestionsMuted = false;
    
    // Adiciona contexto temporário se necessário
    const tempContext = {
      role: 'user',
      content: `[SOLICITAÇÃO MANUAL] Analise e sugira para: "${text}"`
    };
    
    this.conversationHistory.push(tempContext);
    
    // Gera a sugestão
    this.prepareSuggestionArea();
    
    try {
      await window.electronAPI.generateSuggestionsStream({
        conversationHistory: this.getMemoryForLLM()
      });
    } catch (error) {
      console.error('Erro ao gerar sugestão:', error);
      this.showNotification('Erro ao gerar sugestão', 'error');
    }
    
    // Restaura estados originais
    this.autoSuggestionEnabled = originalAutoSuggestion;
    this.suggestionsMuted = originalMuted;
    
    // Remove o contexto temporário
    this.conversationHistory.pop();
  }

  // Junta dois textos de forma inteligente
  smartMergeTexts(text1, text2) {
    // Limpa os textos (remove ... e artefatos)
    let t1 = this.cleanTranscript(text1);
    let t2 = this.cleanTranscript(text2);
    
    // Se o primeiro termina com pontuação, adiciona espaço
    if (/[.!?,;:]$/.test(t1)) {
      return t1 + ' ' + t2;
    }
    
    // Se não, pode ser continuação direta
    return t1 + ' ' + t2;
  }

  // Remove a sugestão anterior (quando acoplar)
  removePreviousSuggestion() {
    if (this.lastSuggestionElement) {
      console.log('🗑️ Removendo sugestão anterior (acoplada)');
      this.lastSuggestionElement.remove();
      this.lastSuggestionElement = null;
      
      // Remove também da memória
      const lastAssistantIndex = this.conversationHistory
        .map((m, i) => ({ ...m, index: i }))
        .filter(m => m.role === 'assistant')
        .pop();
      
      if (lastAssistantIndex) {
        this.conversationHistory.splice(lastAssistantIndex.index, 1);
      }
    }
  }

  // Copiar texto
  copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
      this.showNotification('✅ Copiado!', 'success');
    }).catch(err => {
      console.error('Erro ao copiar:', err);
    });
  }

  // Copiar toda a transcrição
  copyAllTranscripts() {
    const allTexts = this.conversationHistory
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('\n\n');
    
    if (allTexts) {
      navigator.clipboard.writeText(allTexts).then(() => {
        this.showNotification('✅ Transcrição copiada!', 'success');
      });
    } else {
      this.showNotification('Nenhuma transcrição para copiar', 'info');
    }
  }

  // ============================================
  // RESUMO DA REUNIÃO
  // ============================================

  async generateMeetingSummary() {
    if (this.conversationHistory.length < 3) {
      this.showNotification('Pouco conteúdo para gerar resumo. Continue a reunião!', 'info');
      return;
    }

    // Mostra o modal com loading
    this.elements.summaryModal.style.display = 'flex';
    this.elements.summaryBody.innerHTML = `
      <div class="summary-loading">
        <div class="loader"></div>
        <p>Analisando a conversa e gerando resumo...</p>
      </div>
    `;

    try {
      const result = await window.electronAPI.generateSummary({
        conversationHistory: this.getMemoryForLLM()
      });

      if (result.success) {
        this.currentSummary = result.summary;
        this.elements.summaryBody.innerHTML = this.formatSummary(result.summary);
        this.showNotification('📋 Resumo gerado!', 'success');
      } else {
        this.elements.summaryBody.innerHTML = `
          <div class="summary-error">
            <p>❌ Erro ao gerar resumo: ${result.error}</p>
            <button class="btn-primary" onclick="app.closeSummaryModal()">Fechar</button>
          </div>
        `;
      }
    } catch (error) {
      console.error('Erro ao gerar resumo:', error);
      this.elements.summaryBody.innerHTML = `
        <div class="summary-error">
          <p>❌ Erro: ${error.message}</p>
        </div>
      `;
    }
  }

  formatSummary(markdown) {
    // Converte markdown básico para HTML
    let html = markdown
      // Headers
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Lists com checkbox
      .replace(/^- \[ \] (.*$)/gim, '<li class="todo-item">☐ $1</li>')
      .replace(/^- \[x\] (.*$)/gim, '<li class="todo-item done">☑ $1</li>')
      // Lists normais
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      // Horizontal rule
      .replace(/^---$/gim, '<hr>');
    
    // Wrap lists
    html = html.replace(/(<li.*<\/li>)/gis, '<ul>$1</ul>');
    
    // Clean up multiple ul tags
    html = html.replace(/<\/ul>\s*<ul>/g, '');
    
    return `<div class="summary-text">${html}</div>`;
  }

  closeSummaryModal() {
    this.elements.summaryModal.style.display = 'none';
  }

  copySummary() {
    if (this.currentSummary) {
      navigator.clipboard.writeText(this.currentSummary).then(() => {
        this.showNotification('✅ Resumo copiado!', 'success');
      });
    }
  }

  // ============================================
  // PERFIS (v2.0)
  // ============================================

  async loadProfiles() {
    try {
      this.profiles = await window.electronAPI.getProfiles();
      this.activeProfile = await window.electronAPI.getActiveProfile();
      this.updateProfileUI();
      this.renderProfilesGrid();
    } catch (error) {
      console.error('Erro ao carregar perfis:', error);
    }
  }

  updateProfileUI() {
    if (this.activeProfile) {
      this.elements.activeProfileIcon.textContent = this.activeProfile.icon || '🎯';
      this.elements.activeProfileName.textContent = this.activeProfile.name?.replace(/^[^\s]+\s/, '') || 'Geral';
    }
  }

  renderProfilesGrid() {
    if (!this.elements.profilesGrid || !this.profiles) return;
    
    this.elements.profilesGrid.innerHTML = '';
    
    Object.values(this.profiles).forEach(profile => {
      const card = document.createElement('div');
      card.className = `profile-card ${profile.id === this.activeProfile?.id ? 'active' : ''}`;
      card.innerHTML = `
        <div class="profile-card-icon">${profile.icon}</div>
        <div class="profile-card-name">${profile.name?.replace(/^[^\s]+\s/, '') || profile.id}</div>
        <div class="profile-card-desc">${profile.description || ''}</div>
        ${!profile.isDefault ? '<button class="delete-profile" title="Excluir">×</button>' : ''}
      `;
      
      card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('delete-profile')) {
          this.setActiveProfile(profile.id);
        }
      });
      
      const deleteBtn = card.querySelector('.delete-profile');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.deleteProfile(profile.id);
        });
      }
      
      this.elements.profilesGrid.appendChild(card);
    });
  }

  async setActiveProfile(profileId) {
    try {
      const result = await window.electronAPI.setActiveProfile(profileId);
      if (result.success) {
        this.activeProfile = result.profile;
        this.updateProfileUI();
        this.renderProfilesGrid();
        this.showNotification(`${result.profile.icon} Perfil: ${result.profile.name}`, 'success');
      }
    } catch (error) {
      console.error('Erro ao mudar perfil:', error);
    }
  }

  async createCustomProfile() {
    const name = prompt('Nome do perfil:');
    if (!name) return;
    
    const description = prompt('Descrição breve:');
    const icon = prompt('Emoji para o perfil (ex: 🎯):') || '⭐';
    const prompt_text = prompt('Instruções para a IA (como ela deve ajudar):');
    
    if (!prompt_text) {
      this.showNotification('Instruções são obrigatórias', 'error');
      return;
    }
    
    try {
      const result = await window.electronAPI.createProfile({
        name: `${icon} ${name}`,
        description,
        icon,
        prompt: prompt_text,
        focusAreas: [],
        suggestionStyle: 'balanced'
      });
      
      if (result.success) {
        await this.loadProfiles();
        this.showNotification('✅ Perfil criado!', 'success');
      }
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
    }
  }

  async deleteProfile(profileId) {
    if (!confirm('Excluir este perfil?')) return;
    
    try {
      const result = await window.electronAPI.deleteProfile(profileId);
      if (result.success) {
        await this.loadProfiles();
        this.showNotification('🗑️ Perfil excluído', 'info');
      }
    } catch (error) {
      console.error('Erro ao excluir perfil:', error);
    }
  }

  async detectMeetingApps() {
    try {
      const apps = await window.electronAPI.detectMeetingApps();
      if (apps && apps.length > 0) {
        this.elements.detectedApps.style.display = 'block';
        this.elements.appsList.innerHTML = apps.map(app => 
          `<span class="app-badge">${app.icon} ${app.name}</span>`
        ).join('');
      } else {
        this.elements.detectedApps.style.display = 'none';
      }
    } catch (error) {
      console.error('Erro ao detectar apps:', error);
    }
  }

  // ============================================
  // HISTÓRICO (v2.0)
  // ============================================

  async loadMeetingHistory() {
    try {
      const history = await window.electronAPI.getMeetingHistory({ limit: 20 });
      this.renderHistoryList(history);
      
      const stats = await window.electronAPI.getFeedbackStats();
      if (this.elements.feedbackRate) {
        this.elements.feedbackRate.textContent = `${stats.rate}%`;
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  }

  renderHistoryList(history) {
    if (!this.elements.historyList) return;
    
    if (!history || history.length === 0) {
      this.elements.historyList.innerHTML = '<p class="empty-history">Nenhuma reunião gravada ainda</p>';
      return;
    }
    
    this.elements.historyList.innerHTML = history.map(meeting => {
      const date = new Date(meeting.startedAt).toLocaleDateString('pt-BR');
      const duration = this.formatDuration(meeting.duration);
      const profile = this.profiles?.[meeting.profileId];
      
      return `
        <div class="history-item" data-id="${meeting.id}">
          <span class="history-icon">${profile?.icon || '📋'}</span>
          <div class="history-info">
            <div class="history-title">${meeting.title || 'Reunião sem título'}</div>
            <div class="history-meta">${date} • ${duration}</div>
          </div>
          <button class="history-delete" title="Excluir">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
          </button>
        </div>
      `;
    }).join('');
    
    // Event listeners
    this.elements.historyList.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.closest('.history-delete')) {
          this.viewMeeting(item.dataset.id);
        }
      });
      
      item.querySelector('.history-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteMeeting(item.dataset.id);
      });
    });
  }

  formatDuration(seconds) {
    if (!seconds) return '0min';
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hours}h ${remainMins}min`;
  }

  async viewMeeting(meetingId) {
    try {
      const meeting = await window.electronAPI.getMeeting(meetingId);
      if (meeting && meeting.summary) {
        this.currentSummary = meeting.summary;
        this.elements.summaryModal.style.display = 'flex';
        this.elements.summaryBody.innerHTML = this.formatSummary(meeting.summary);
      } else {
        this.showNotification('Sem resumo disponível', 'info');
      }
    } catch (error) {
      console.error('Erro ao carregar reunião:', error);
    }
  }

  async deleteMeeting(meetingId) {
    if (!confirm('Excluir esta reunião?')) return;
    
    try {
      await window.electronAPI.deleteMeeting(meetingId);
      await this.loadMeetingHistory();
      this.showNotification('🗑️ Reunião excluída', 'info');
    } catch (error) {
      console.error('Erro ao excluir reunião:', error);
    }
  }

  // ============================================
  // FEEDBACK (v2.0)
  // ============================================

  addFeedbackButtons(suggestionElement, suggestionId) {
    const feedback = document.createElement('div');
    feedback.className = 'suggestion-feedback';
    feedback.innerHTML = `
      <button class="feedback-btn helpful" data-suggestion="${suggestionId}" data-helpful="true">
        👍 Útil
      </button>
      <button class="feedback-btn not-helpful" data-suggestion="${suggestionId}" data-helpful="false">
        👎 Não ajudou
      </button>
    `;
    
    feedback.querySelectorAll('.feedback-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const helpful = btn.dataset.helpful === 'true';
        await this.submitFeedback(suggestionId, helpful);
        
        // Visual feedback
        feedback.querySelectorAll('.feedback-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
    
    suggestionElement.appendChild(feedback);
  }

  async submitFeedback(suggestionId, helpful) {
    try {
      await window.electronAPI.submitFeedback({
        suggestionId,
        helpful,
        timestamp: Date.now()
      });
      this.showNotification(helpful ? '👍 Obrigado!' : '📝 Anotado!', 'info');
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
    }
  }

  // Limpa a transcrição removendo artefatos do Whisper
  cleanTranscript(text) {
    if (!text) return '';
    
    let cleaned = text.trim();
    
    // Remove ... no final
    cleaned = cleaned.replace(/\.{2,}$/g, '');
    
    // Remove ... no início
    cleaned = cleaned.replace(/^\.{2,}/g, '');
    
    // Remove múltiplos espaços
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    // Remove caracteres especiais isolados
    cleaned = cleaned.replace(/^\W+$/g, '');
    
    return cleaned.trim();
  }

  isNoise(text) {
    const trimmed = text.trim().toLowerCase();
    
    // Só filtra ruídos muito óbvios
    const noisePatterns = [
      /^(hm+|ah+|eh+|uh+|oh+|mm+)$/i,  // Sons sem significado
      /^\.+$/,                           // Apenas pontos
      /^\s*$/                            // Vazio
    ];
    
    // Permite textos curtos se tiverem palavras reais
    if (text.length < 2) return true;
    
    return noisePatterns.some(pattern => pattern.test(trimmed));
  }

  // ============================================
  // MEMÓRIA (JANELA DESLIZANTE)
  // ============================================

  addToMemory(role, content) {
    this.conversationHistory.push({
      role,
      content,
      timestamp: Date.now()
    });
    
    this.pruneMemory();
  }

  pruneMemory() {
    while (this.conversationHistory.length > this.MAX_HISTORY_ITEMS) {
      this.conversationHistory.shift();
    }
    
    const estimatedTokens = this.conversationHistory
      .reduce((sum, msg) => sum + Math.ceil(msg.content.length / 4), 0);
    
    while (estimatedTokens > this.MAX_TOKENS_ESTIMATE && this.conversationHistory.length > 5) {
      this.conversationHistory.shift();
    }
  }

  getMemoryForLLM() {
    return this.conversationHistory.map(({ role, content }) => ({ role, content }));
  }

  // ============================================
  // GERAÇÃO DE SUGESTÕES (STREAMING)
  // ============================================

  async generateSuggestions() {
    // Verifica se sugestões estão habilitadas
    if (!this.autoSuggestionEnabled || this.suggestionsMuted) {
      console.log('Sugestões desabilitadas ou mutadas');
      return;
    }
    
    this.prepareSuggestionArea();
    
    try {
      await window.electronAPI.generateSuggestionsStream({
        conversationHistory: this.getMemoryForLLM()
      });
    } catch (error) {
      console.error('Erro ao gerar sugestões:', error);
    }
  }

  prepareSuggestionArea() {
    const box = this.elements.suggestionsBox;
    
    const placeholder = box.querySelector('.suggestion-placeholder');
    if (placeholder) placeholder.remove();
    
    const suggestionDiv = document.createElement('div');
    suggestionDiv.className = 'suggestion-item streaming fade-in';
    suggestionDiv.id = 'current-suggestion';
    suggestionDiv.innerHTML = `
      <div class="suggestion-header">
        <span class="streaming-indicator">●</span>
        <span class="suggestion-time">${this.getTimeString()}</span>
      </div>
      <div class="suggestion-content"></div>
    `;
    
    box.insertBefore(suggestionDiv, box.firstChild);
  }

  appendSuggestionChunk(chunk) {
    const currentSuggestion = document.getElementById('current-suggestion');
    if (currentSuggestion) {
      const content = currentSuggestion.querySelector('.suggestion-content');
      content.innerHTML += this.formatText(chunk);
      this.elements.suggestionsBox.scrollTop = 0;
    }
  }

  finalizeSuggestion(fullText) {
    const currentSuggestion = document.getElementById('current-suggestion');
    if (currentSuggestion) {
      currentSuggestion.classList.remove('streaming');
      const suggestionId = 'sugg_' + Date.now();
      currentSuggestion.id = suggestionId;
      
      const indicator = currentSuggestion.querySelector('.streaming-indicator');
      if (indicator) indicator.remove();
      
      if (fullText && !fullText.includes('[Escutando...]')) {
        // Formata blocos de código (v3)
        const content = currentSuggestion.querySelector('.suggestion-content');
        if (content) {
          content.innerHTML = this.formatCodeBlocks(content.innerHTML);
        }
        
        this.addToMemory('assistant', fullText);
        // Salva referência para possível remoção no acoplamento
        this.lastSuggestionElement = currentSuggestion;
        
        // Adiciona botões de feedback (v2.0)
        this.addFeedbackButtons(currentSuggestion, suggestionId);
        
        // Adiciona botões de reescrita (v3)
        this.addRewriteButtons(currentSuggestion, fullText);
      }
    }
  }

  // ============================================
  // UI - TRANSCRIÇÃO
  // ============================================

  addSystemMessage(text) {
    const box = this.elements.transcriptBox;
    
    const placeholder = box.querySelector('.placeholder-text');
    if (placeholder) placeholder.remove();

    const messageDiv = document.createElement('div');
    messageDiv.className = 'system-message fade-in';
    messageDiv.innerHTML = `<span class="system-icon">⚙️</span> ${text}`;

    box.appendChild(messageDiv);
    box.scrollTop = box.scrollHeight;
  }

  clearSession() {
    this.elements.transcriptBox.innerHTML = '<p class="placeholder-text">A transcrição aparecerá aqui...</p>';
    
    this.elements.suggestionsBox.innerHTML = `
      <div class="suggestion-placeholder">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
        </svg>
        <p>Inicie a sessão para receber sugestões em tempo real</p>
      </div>
    `;
    
    // Limpa memória e buffers
    this.conversationHistory = [];
    this.transcriptBuffer = '';
    this.currentTranscriptElement = null;
    this.lastTranscriptTime = null;
    
    // Limpa referências de acoplamento
    this.lastFinalizedTranscript = '';
    this.lastTranscriptElement = null;
    this.lastSuggestionElement = null;
    this.lastFinalizedTime = null;
    
    this.showNotification('Sessão limpa', 'info');
  }

  // ============================================
  // UI - CONTROLES
  // ============================================

  updateUI(isActive) {
    const { recordBtn, statusIndicator, recordHint, recordingTime, recordingTimeInline } = this.elements;

    // Desabilita seleção de fonte durante gravação
    document.querySelectorAll('.audio-option').forEach(btn => {
      btn.style.pointerEvents = isActive ? 'none' : 'auto';
      btn.style.opacity = isActive ? '0.5' : '1';
    });

    if (isActive) {
      recordBtn.classList.add('recording');
      statusIndicator.classList.add('recording');
      recordHint.textContent = '● Gravando...';
      if (recordingTime) recordingTime.style.display = 'block';
      if (recordingTimeInline) recordingTimeInline.style.display = 'inline';
    } else {
      recordBtn.classList.remove('recording');
      statusIndicator.classList.remove('recording');
      recordHint.textContent = 'Clique para iniciar';
      if (recordingTime) recordingTime.style.display = 'none';
      if (recordingTimeInline) recordingTimeInline.style.display = 'none';
    }
  }

  updateStatus(text) {
    this.elements.statusText.textContent = text;
  }

  startTimer() {
    const updateTimer = () => {
      if (!this.recordingStartTime) return;
      
      const elapsed = Date.now() - this.recordingStartTime;
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      
      const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      if (this.elements.recordingTime) this.elements.recordingTime.textContent = timeStr;
      if (this.elements.recordingTimeInline) this.elements.recordingTimeInline.textContent = timeStr;
    };

    this.timerInterval = setInterval(updateTimer, 1000);
    updateTimer();
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.recordingStartTime = null;
  }

  async togglePin() {
    this.isAlwaysOnTop = await window.electronAPI.toggleAlwaysOnTop();
    this.elements.pinBtn.classList.toggle('active', this.isAlwaysOnTop);
  }

  // ============================================
  // UTILITÁRIOS
  // ============================================

  getTimeString() {
    return new Date().toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  }

  formatText(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/💡/g, '<span class="emoji">💡</span>')
      .replace(/📊/g, '<span class="emoji">📊</span>')
      .replace(/❓/g, '<span class="emoji">❓</span>')
      .replace(/\n/g, '<br>');
  }

  showLoading(show) {
    this.elements.loadingOverlay.style.display = show ? 'flex' : 'none';
  }

  showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} fade-in`;
    
    const colors = {
      error: 'var(--accent-red)',
      success: 'var(--accent-cyan)',
      info: 'var(--bg-tertiary)'
    };
    
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 20px;
      background: ${colors[type]};
      color: ${type === 'info' ? 'var(--text-primary)' : '#000'};
      border-radius: 8px;
      font-size: 13px;
      z-index: 200;
      box-shadow: var(--shadow-soft);
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // ============================================
  // V3 - SCREENSHOT + IA VISUAL
  // ============================================

  openScreenshotModal() {
    this.elements.screenshotModal.style.display = 'flex';
    this.elements.screenshotResult.style.display = 'none';
    this.elements.analyzeBtn.disabled = true;
  }

  async captureScreenshot() {
    this.showNotification('📸 Capturando tela...', 'info');
    
    try {
      const result = await window.electronAPI.captureScreenshot();
      
      if (result.success) {
        this.currentScreenshot = result.image;
        this.elements.screenshotPreview.innerHTML = `<img src="${result.image}" alt="Screenshot">`;
        this.elements.analyzeBtn.disabled = false;
        this.showNotification('✅ Screenshot capturado!', 'success');
      } else {
        this.showNotification('Erro: ' + result.error, 'error');
      }
    } catch (error) {
      this.showNotification('Erro ao capturar: ' + error.message, 'error');
    }
  }

  async analyzeScreenshot() {
    if (!this.currentScreenshot) return;
    
    const question = this.elements.screenshotQuestion.value || 'O que você vê? Explique no contexto da reunião.';
    
    this.elements.analyzeBtn.disabled = true;
    this.elements.analyzeBtn.textContent = '⏳ Analisando...';
    
    try {
      const result = await window.electronAPI.analyzeImage({
        imageBase64: this.currentScreenshot,
        question,
        conversationContext: this.conversationHistory.slice(-5).map(m => m.content).join(' ')
      });
      
      if (result.success) {
        this.elements.screenshotResult.style.display = 'block';
        this.elements.analysisText.innerHTML = this.formatText(result.analysis);
        
        // Adiciona ao contexto da conversa
        this.addToMemory('assistant', `[Análise Visual] ${result.analysis}`);
      } else {
        this.showNotification('Erro: ' + result.error, 'error');
      }
    } catch (error) {
      this.showNotification('Erro: ' + error.message, 'error');
    }
    
    this.elements.analyzeBtn.disabled = false;
    this.elements.analyzeBtn.textContent = '🔍 Analisar com IA';
  }

  // ============================================
  // V3 - CHAT PARALELO
  // ============================================

  openChatModal() {
    this.elements.chatModal.style.display = 'flex';
    this.elements.chatInput.focus();
  }

  async sendChatMessage() {
    const message = this.elements.chatInput.value.trim();
    if (!message) return;
    
    // Adiciona mensagem do usuário
    this.addChatMessage(message, 'user');
    this.elements.chatInput.value = '';
    
    try {
      const result = await window.electronAPI.chatWithAI({
        message,
        conversationHistory: this.conversationHistory.slice(-10)
      });
      
      if (result.success) {
        this.addChatMessage(result.response, 'assistant');
      } else {
        this.addChatMessage('Erro: ' + result.error, 'assistant');
      }
    } catch (error) {
      this.addChatMessage('Erro: ' + error.message, 'assistant');
    }
  }

  addChatMessage(text, role) {
    const hint = this.elements.chatMessages.querySelector('.chat-hint');
    if (hint) hint.remove();
    
    const msg = document.createElement('div');
    msg.className = `chat-message ${role}`;
    msg.innerHTML = this.formatText(text);
    this.elements.chatMessages.appendChild(msg);
    this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
  }

  // ============================================
  // V3 - WHAT SHOULD I SAY NOW
  // ============================================

  openWhatToSayModal() {
    this.elements.whatToSayModal.style.display = 'flex';
    this.elements.whatToSayResult.style.display = 'none';
  }

  async getWhatToSay(situation) {
    this.elements.whatToSayResult.style.display = 'block';
    this.elements.whatToSayText.innerHTML = '<div class="loader" style="width:24px;height:24px;margin:10px auto;"></div>';
    
    try {
      const result = await window.electronAPI.whatShouldISay({
        conversationHistory: this.conversationHistory.slice(-10),
        situation
      });
      
      if (result.success) {
        this.elements.whatToSayText.innerHTML = this.formatText(result.suggestion);
      } else {
        this.elements.whatToSayText.textContent = 'Erro: ' + result.error;
      }
    } catch (error) {
      this.elements.whatToSayText.textContent = 'Erro: ' + error.message;
    }
  }

  // ============================================
  // V3 - EXPORTAÇÃO
  // ============================================

  openExportModal() {
    this.elements.exportModal.style.display = 'flex';
    document.getElementById('exportPreview').style.display = 'none';
  }

  async prepareExport(format) {
    const preview = document.getElementById('exportPreview');
    preview.style.display = 'block';
    
    // Gera conteúdo do export
    const transcripts = this.conversationHistory
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('\n\n');
    
    const suggestions = this.conversationHistory
      .filter(m => m.role === 'assistant')
      .map(m => m.content)
      .join('\n\n---\n\n');
    
    const date = new Date().toLocaleString('pt-BR');
    
    let content;
    if (format === 'markdown') {
      content = `# Reunião - ${date}

## 📝 Transcrição

${transcripts}

## 💡 Sugestões da IA

${suggestions}

---
*Gerado por Perssua*`;
    } else {
      content = `REUNIÃO - ${date}

TRANSCRIÇÃO:
${transcripts}

SUGESTÕES:
${suggestions}

---
Gerado por Perssua`;
    }
    
    this.elements.exportContent.value = content;
    this.currentExportFormat = format;
  }

  async downloadExport() {
    const content = this.elements.exportContent.value;
    const format = this.currentExportFormat || 'markdown';
    
    try {
      const result = await window.electronAPI.exportMeeting({
        format,
        content,
        filename: `reuniao-${Date.now()}`
      });
      
      if (result.success) {
        this.showNotification('✅ Exportado: ' + result.path, 'success');
        this.closeModal('exportModal');
      } else if (!result.canceled) {
        this.showNotification('Erro: ' + result.error, 'error');
      }
    } catch (error) {
      this.showNotification('Erro: ' + error.message, 'error');
    }
  }

  // ============================================
  // V3 - MODO CONFIDENCIAL
  // ============================================

  async toggleConfidentialMode() {
    const result = await window.electronAPI.toggleConfidentialMode();
    this.confidentialMode = result.enabled;
    
    this.elements.confidentialBtn.classList.toggle('active', this.confidentialMode);
    
    // Adiciona/remove indicador visual
    let indicator = document.querySelector('.confidential-indicator');
    if (this.confidentialMode) {
      if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'confidential-indicator';
        indicator.textContent = '🔒 CONFIDENCIAL';
        document.body.appendChild(indicator);
      }
      this.showNotification('🔒 Modo Confidencial ATIVADO - Nada será salvo', 'info');
    } else {
      if (indicator) indicator.remove();
      this.showNotification('🔓 Modo Confidencial desativado', 'info');
    }
  }

  // ============================================
  // V3 - REESCRITA INSTANTÂNEA
  // ============================================

  addRewriteButtons(suggestionElement, originalText) {
    const rewrite = document.createElement('div');
    rewrite.className = 'rewrite-buttons';
    rewrite.innerHTML = `
      <button class="rewrite-btn" data-style="shorter">✂️ Mais curto</button>
      <button class="rewrite-btn" data-style="technical">🔧 Mais técnico</button>
      <button class="rewrite-btn" data-style="simpler">💡 Mais simples</button>
      <button class="rewrite-btn" data-style="firmer">💪 Mais firme</button>
    `;
    
    rewrite.querySelectorAll('.rewrite-btn').forEach(btn => {
      btn.addEventListener('click', () => this.rewriteSuggestion(suggestionElement, originalText, btn.dataset.style));
    });
    
    suggestionElement.appendChild(rewrite);
  }

  async rewriteSuggestion(element, original, style) {
    const content = element.querySelector('.suggestion-content');
    if (!content) return;
    
    content.innerHTML = '<div class="loader" style="width:20px;height:20px;"></div>';
    
    try {
      const result = await window.electronAPI.rewriteSuggestion({ original, style });
      
      if (result.success) {
        content.innerHTML = this.formatText(result.rewritten);
      } else {
        content.innerHTML = this.formatText(original);
        this.showNotification('Erro ao reescrever', 'error');
      }
    } catch (error) {
      content.innerHTML = this.formatText(original);
    }
  }

  // ============================================
  // V3 - INTENT DETECTION
  // ============================================

  async detectAndShowIntent(text, element) {
    try {
      const intents = await window.electronAPI.detectIntent(text);
      
      if (intents && intents.length > 0) {
        const header = element.querySelector('.transcript-header');
        if (header) {
          const intent = intents[0];
          const badge = document.createElement('span');
          badge.className = 'intent-badge';
          badge.style.background = intent.color + '20';
          badge.style.color = intent.color;
          badge.textContent = intent.label;
          header.appendChild(badge);
        }
      }
    } catch (error) {
      console.error('Erro detectando intent:', error);
    }
  }

  // ============================================
  // V3 - DEVELOPER MODE (CODE BLOCKS)
  // ============================================

  formatCodeBlocks(text) {
    // Detecta blocos de código
    return text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'code';
      return `
        <div class="code-block">
          <div class="code-block-header">
            <span class="code-block-lang">${language}</span>
            <button class="code-copy-btn" onclick="navigator.clipboard.writeText(\`${code.replace(/`/g, '\\`')}\`).then(() => this.textContent = '✓ Copiado!')">Copiar</button>
          </div>
          <pre><code>${code}</code></pre>
        </div>
      `;
    });
  }

  // ============================================
  // V3 - MEMÓRIA POR CLIENTE/PROJETO
  // ============================================

  openClientMemoryModal() {
    this.elements.clientMemoryModal.style.display = 'flex';
    document.getElementById('clientNotes').style.display = 'none';
  }

  async loadClientMemory() {
    const clientName = document.getElementById('clientName').value.trim();
    if (!clientName) {
      this.showNotification('Digite o nome do cliente', 'error');
      return;
    }
    
    const clientId = clientName.toLowerCase().replace(/\s+/g, '_');
    const memory = await window.electronAPI.getClientMemory(clientId);
    
    if (memory) {
      this.currentClientId = clientId;
      this.displayClientNotes(memory);
      this.showNotification(`📚 Memória de "${clientName}" carregada`, 'success');
    } else {
      this.showNotification('Cliente não encontrado. Clique em "+ Novo" para criar.', 'info');
    }
  }

  async createClientMemory() {
    const clientName = document.getElementById('clientName').value.trim();
    if (!clientName) {
      this.showNotification('Digite o nome do cliente', 'error');
      return;
    }
    
    const clientId = clientName.toLowerCase().replace(/\s+/g, '_');
    
    await window.electronAPI.saveClientMemory({
      clientId,
      data: { 
        name: clientName, 
        notes: [],
        createdAt: new Date().toISOString()
      }
    });
    
    this.currentClientId = clientId;
    this.displayClientNotes({ name: clientName, notes: [] });
    this.showNotification(`✅ Memória de "${clientName}" criada`, 'success');
  }

  displayClientNotes(memory) {
    const notesContainer = document.getElementById('clientNotes');
    const notesList = document.getElementById('notesList');
    
    notesContainer.style.display = 'block';
    notesList.innerHTML = '';
    
    if (memory.notes && memory.notes.length > 0) {
      memory.notes.forEach(note => {
        const noteEl = document.createElement('div');
        noteEl.className = 'note-item';
        noteEl.innerHTML = `
          <span class="note-text">${note.text}</span>
          <span class="note-time">${new Date(note.timestamp).toLocaleDateString('pt-BR')}</span>
        `;
        notesList.appendChild(noteEl);
      });
    } else {
      notesList.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-size:12px;">Nenhuma nota ainda</p>';
    }
  }

  async addClientNote() {
    if (!this.currentClientId) {
      this.showNotification('Carregue ou crie um cliente primeiro', 'error');
      return;
    }
    
    const noteInput = document.getElementById('newNote');
    const note = noteInput.value.trim();
    if (!note) return;
    
    await window.electronAPI.addClientNote({
      clientId: this.currentClientId,
      note
    });
    
    noteInput.value = '';
    
    // Recarrega notas
    const memory = await window.electronAPI.getClientMemory(this.currentClientId);
    this.displayClientNotes(memory);
    
    this.showNotification('📝 Nota adicionada', 'success');
  }

  // Inclui memória do cliente no contexto da IA (se houver)
  async getClientContextForAI() {
    if (!this.currentClientId) return '';
    
    const memory = await window.electronAPI.getClientMemory(this.currentClientId);
    if (!memory || !memory.notes || memory.notes.length === 0) return '';
    
    const notesText = memory.notes.map(n => n.text).join('\n- ');
    return `\n\n[CONTEXTO DO CLIENTE "${memory.name}"]:\n- ${notesText}`;
  }

  // ============================================
  // V4 - MEETING GOAL ENGINE
  // ============================================

  openGoalModal() {
    this.elements.goalModal.style.display = 'flex';
    
    // Se já tem objetivo, mostra status
    if (this.meetingGoal) {
      document.getElementById('goalStatus').style.display = 'block';
    }
  }

  async saveMeetingGoal() {
    const goal = {
      mainGoal: document.getElementById('goalMain').value.trim(),
      desiredOutcome: document.getElementById('goalOutcome').value.trim(),
      avoid: document.getElementById('goalAvoid').value.trim(),
      interlocutorType: document.getElementById('goalInterlocutor').value
    };

    if (!goal.mainGoal) {
      this.showNotification('Preencha o objetivo principal', 'error');
      return;
    }

    const result = await window.electronAPI.setMeetingGoal(goal);
    
    if (result.success) {
      this.meetingGoal = goal;
      this.elements.goalBtn.classList.add('has-goal');
      document.getElementById('goalStatus').style.display = 'block';
      
      // Habilita coaching
      this.elements.coachingBtn.disabled = false;
      
      this.showNotification('🎯 Objetivo definido! Monitorando progresso...', 'success');
      
      // Inicia monitoramento periódico
      this.startGoalMonitoring();
    }
  }

  startGoalMonitoring() {
    // Verifica progresso a cada 2 minutos
    this.goalCheckInterval = setInterval(() => {
      if (this.isRecording && this.meetingGoal) {
        this.checkGoalProgress();
      }
    }, 120000);
  }

  async checkGoalProgress() {
    const result = await window.electronAPI.checkGoalProgress({
      conversationHistory: this.conversationHistory
    });

    if (result.success && result.analysis) {
      const { progressPercent, status, alert } = result.analysis;
      
      // Atualiza barra de progresso
      document.getElementById('goalProgressBar').style.width = `${progressPercent}%`;
      document.getElementById('goalPercent').textContent = `${progressPercent}%`;
      
      // Mostra alerta se necessário
      const alertEl = document.getElementById('goalAlert');
      if (alert && status !== 'on_track') {
        alertEl.style.display = 'block';
        alertEl.textContent = `⚠️ ${alert}`;
        this.showNotification(`⚠️ ${alert}`, 'info');
      } else {
        alertEl.style.display = 'none';
      }
    }
  }

  // ============================================
  // V4 - SIMULAÇÃO DE REUNIÃO
  // ============================================

  openSimulationModal() {
    this.elements.simulationModal.style.display = 'flex';
    document.getElementById('simulationSetup').style.display = 'block';
    document.getElementById('simulationChat').style.display = 'none';
  }

  async startSimulation() {
    const type = document.getElementById('simType').value;
    const context = document.getElementById('simContext').value;

    document.getElementById('simulationSetup').style.display = 'none';
    document.getElementById('simulationChat').style.display = 'block';
    document.getElementById('simMessages').innerHTML = '<div class="loader" style="margin:20px auto;"></div>';

    const result = await window.electronAPI.startSimulation({
      type,
      difficulty: this.simulationDifficulty,
      context
    });

    if (result.success) {
      this.simulationActive = true;
      document.getElementById('simMessages').innerHTML = '';
      this.addSimMessage(result.opening, 'interviewer');
    } else {
      this.showNotification('Erro ao iniciar simulação: ' + result.error, 'error');
    }
  }

  addSimMessage(text, role) {
    const msg = document.createElement('div');
    msg.className = `sim-message ${role}`;
    msg.textContent = text;
    document.getElementById('simMessages').appendChild(msg);
    document.getElementById('simMessages').scrollTop = document.getElementById('simMessages').scrollHeight;
  }

  async sendSimulationResponse() {
    const input = document.getElementById('simInput');
    const userResponse = input.value.trim();
    if (!userResponse || !this.simulationActive) return;

    this.addSimMessage(userResponse, 'user');
    input.value = '';

    const result = await window.electronAPI.simulationRespond({ userResponse });

    if (result.success) {
      // Mostra feedback
      const feedbackEl = document.getElementById('simFeedback');
      feedbackEl.style.display = 'flex';
      
      const scoreEl = document.getElementById('feedbackScore');
      scoreEl.textContent = `${result.feedback.score}%`;
      scoreEl.className = 'feedback-score ' + (result.feedback.score >= 70 ? 'good' : result.feedback.score >= 40 ? 'medium' : 'bad');
      
      document.getElementById('feedbackText').textContent = result.feedback.quickFeedback;

      // Resposta do entrevistador
      setTimeout(() => {
        this.addSimMessage(result.reply, 'interviewer');
        feedbackEl.style.display = 'none';
      }, 2000);
    }
  }

  async endSimulation() {
    if (!this.simulationActive) return;

    document.getElementById('simMessages').innerHTML = '<div class="loader" style="margin:40px auto;"></div><p style="text-align:center;color:var(--text-muted);">Gerando relatório...</p>';

    const result = await window.electronAPI.endSimulation();
    this.simulationActive = false;

    if (result.success) {
      const report = result.report.finalReport;
      
      document.getElementById('simMessages').innerHTML = `
        <div class="sim-final-report">
          <div class="sim-final-score ${report.passed ? 'passed' : 'failed'}">
            <span class="score">${report.overallScore}</span>
            <span class="status">${report.passed ? '✅ Aprovado' : '❌ Precisa melhorar'}</span>
          </div>
          <p class="summary">${report.summary}</p>
          <div class="report-section">
            <h5>💪 Pontos Fortes</h5>
            ${report.strengths.map(s => `<p>✓ ${s}</p>`).join('')}
          </div>
          <div class="report-section">
            <h5>🎯 Áreas de Melhoria</h5>
            ${report.weaknesses.map(w => `<p>• ${w}</p>`).join('')}
          </div>
          <div class="report-section">
            <h5>📚 Recomendações</h5>
            ${report.recommendations.map(r => `<p>→ ${r}</p>`).join('')}
          </div>
        </div>
      `;
    }
  }

  // ============================================
  // V4 - CONTEXT INJECTION
  // ============================================

  openContextModal() {
    this.elements.contextModal.style.display = 'flex';
    this.loadContextForType('cv');
    this.updateContextBadges();
  }

  loadContextForType(type) {
    const typeMap = { cv: 'cv', jd: 'jobDescription', company: 'company', interviewer: 'interviewer' };
    document.getElementById('contextText').value = this.injectedContexts[typeMap[type]] || '';
  }

  async saveContext() {
    const typeMap = { cv: 'cv', jd: 'jobDescription', company: 'company', interviewer: 'interviewer' };
    const content = document.getElementById('contextText').value.trim();
    const type = typeMap[this.currentContextType];

    if (content) {
      await window.electronAPI.injectContext({ type, content });
      this.injectedContexts[type] = content;
      this.showNotification('✅ Contexto salvo!', 'success');
    }
    
    this.updateContextBadges();
  }

  async clearAllContext() {
    await window.electronAPI.clearInjectedContext();
    this.injectedContexts = { cv: null, jobDescription: null, company: null, interviewer: null };
    document.getElementById('contextText').value = '';
    this.updateContextBadges();
    this.showNotification('🗑️ Contextos limpos', 'info');
  }

  updateContextBadges() {
    document.getElementById('cvBadge').style.display = this.injectedContexts.cv ? 'inline' : 'none';
    document.getElementById('jdBadge').style.display = this.injectedContexts.jobDescription ? 'inline' : 'none';
    document.getElementById('companyBadge').style.display = this.injectedContexts.company ? 'inline' : 'none';
    document.getElementById('interviewerBadge').style.display = this.injectedContexts.interviewer ? 'inline' : 'none';
  }

  // ============================================
  // V4 - ENGLISH ASSIST
  // ============================================

  openEnglishModal() {
    this.elements.englishModal.style.display = 'flex';
  }

  async translateText() {
    const text = document.getElementById('translateInput').value.trim();
    if (!text) return;

    document.getElementById('translateResult').style.display = 'none';
    document.getElementById('translateBtn').disabled = true;
    document.getElementById('translateBtn').textContent = '⏳ Traduzindo...';

    const result = await window.electronAPI.translateAssist({
      text,
      mode: this.translateMode,
      context: 'reunião profissional'
    });

    document.getElementById('translateBtn').disabled = false;
    document.getElementById('translateBtn').textContent = '🔄 Traduzir';

    if (result.success) {
      const r = result.result;
      document.getElementById('translateResult').style.display = 'block';
      document.getElementById('mainTranslation').textContent = r.translation;
      
      let extras = '';
      if (r.alternatives?.length) {
        extras += `<p><strong>Alternativas:</strong> ${r.alternatives.join(' • ')}</p>`;
      }
      if (r.pronunciation) {
        extras += `<p><strong>Pronúncia:</strong> ${r.pronunciation}</p>`;
      }
      if (r.culturalNote) {
        extras += `<p><strong>Nota cultural:</strong> ${r.culturalNote}</p>`;
      }
      document.getElementById('translationExtras').innerHTML = extras;
    }
  }

  async generateSpeakPhrase() {
    const intent = document.getElementById('speakIntent').value.trim();
    const context = document.getElementById('speakContext').value;
    if (!intent) return;

    document.getElementById('speakResult').innerHTML = '<div class="loader" style="margin:20px auto;"></div>';
    document.getElementById('speakResult').style.display = 'block';

    const result = await window.electronAPI.speakForMe({ intent, context });

    if (result.success) {
      const r = result.result;
      document.getElementById('speakResult').innerHTML = `
        <div class="speak-phrase">
          <div class="speak-phrase-label">💼 Frase Principal</div>
          <div class="speak-phrase-text">"${r.mainPhrase}"</div>
        </div>
        <div class="speak-phrase">
          <div class="speak-phrase-label">👔 Versão Formal</div>
          <div class="speak-phrase-text">"${r.formal}"</div>
        </div>
        <div class="speak-phrase">
          <div class="speak-phrase-label">😊 Versão Casual</div>
          <div class="speak-phrase-text">"${r.casual}"</div>
        </div>
        <div class="speak-tip">
          <strong>💡 Como falar:</strong> ${r.howToDeliver}
        </div>
      `;
    }
  }

  // ============================================
  // V4 - COACHING MODE
  // ============================================

  async openCoachingModal() {
    if (this.conversationHistory.length < 5) {
      this.showNotification('Precisa de mais conversa para gerar coaching', 'info');
      return;
    }

    this.elements.coachingModal.style.display = 'flex';
    document.getElementById('coachingLoading').style.display = 'block';
    document.getElementById('coachingReport').style.display = 'none';

    // Analisa estatísticas de fala
    const statsResult = await window.electronAPI.analyzeSpeaking({
      conversationHistory: this.conversationHistory
    });

    // Gera relatório de coaching
    const result = await window.electronAPI.generateCoachingReport({
      conversationHistory: this.conversationHistory,
      speakingStats: statsResult.success ? statsResult.stats : null
    });

    document.getElementById('coachingLoading').style.display = 'none';

    if (result.success) {
      const report = result.report;
      document.getElementById('coachingReport').style.display = 'block';

      // Score principal
      document.querySelector('.coaching-score-circle .score-number').textContent = report.overallScore;

      // Categorias
      const categories = ['communication', 'clarity', 'assertiveness', 'activeListening'];
      const categoryNames = {
        communication: '💬 Comunicação',
        clarity: '✨ Clareza',
        assertiveness: '💪 Assertividade',
        activeListening: '👂 Escuta Ativa'
      };

      document.getElementById('coachingCategories').innerHTML = categories.map(cat => `
        <div class="coaching-category">
          <div class="coaching-category-name">${categoryNames[cat]}</div>
          <div class="coaching-category-score">${report[cat]?.score || 0}</div>
          <div class="coaching-category-feedback">${report[cat]?.feedback || ''}</div>
        </div>
      `).join('');

      // Pontos fortes
      document.getElementById('coachingStrengths').innerHTML = `
        <h5>✅ Pontos Fortes</h5>
        <div class="coaching-list">
          ${(report.strengths || []).map(s => `<div class="coaching-list-item strength">${s}</div>`).join('')}
        </div>
      `;

      // Áreas de melhoria
      document.getElementById('coachingImprove').innerHTML = `
        <h5>🎯 Áreas para Melhorar</h5>
        <div class="coaching-list">
          ${(report.improvementAreas || []).map(i => `<div class="coaching-list-item improve">${i}</div>`).join('')}
        </div>
      `;

      // Exercício prático
      document.getElementById('coachingExercise').innerHTML = `
        <h5>📝 Exercício para Próxima Reunião</h5>
        <div class="coaching-exercise-text">${report.practicalExercise || ''}</div>
        ${report.suggestedPhrase ? `<p style="margin-top:10px;font-style:italic;color:var(--accent-cyan);">"${report.suggestedPhrase}"</p>` : ''}
      `;
    }
  }

  // ============================================
  // V3/V4 - UTILITÁRIOS
  // ============================================

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
  }
}

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  window.app = new PerssuaApp();
});
