const { contextBridge, ipcRenderer } = require('electron');

// Expõe APIs seguras para o renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // OpenAI
  initOpenAI: (apiKey) => ipcRenderer.invoke('init-openai', apiKey),
  transcribeAudio: (audioBuffer) => ipcRenderer.invoke('transcribe-audio', audioBuffer),
  generateSuggestionsStream: (data) => ipcRenderer.invoke('generate-suggestions-stream', data),
  generateSummary: (data) => ipcRenderer.invoke('generate-summary', data),
  
  // Streaming listeners
  onSuggestionChunk: (callback) => ipcRenderer.on('suggestion-chunk', (_, chunk) => callback(chunk)),
  onSuggestionComplete: (callback) => ipcRenderer.on('suggestion-complete', (_, full) => callback(full)),
  
  // Atalhos globais
  onShortcutAction: (callback) => ipcRenderer.on('shortcut-action', (_, action) => callback(action)),
  
  // Configurações
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  toggleAutoSuggestion: () => ipcRenderer.invoke('toggle-auto-suggestion'),
  getAutoSuggestion: () => ipcRenderer.invoke('get-auto-suggestion'),
  
  // Controles da janela
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  toggleAlwaysOnTop: () => ipcRenderer.invoke('toggle-always-on-top'),
  
  // Áudio
  getAudioSources: () => ipcRenderer.invoke('get-audio-sources'),
  
  // ============================================
  // PERFIS (v2.0)
  // ============================================
  getProfiles: () => ipcRenderer.invoke('get-profiles'),
  getActiveProfile: () => ipcRenderer.invoke('get-active-profile'),
  setActiveProfile: (profileId) => ipcRenderer.invoke('set-active-profile', profileId),
  createProfile: (profile) => ipcRenderer.invoke('create-profile', profile),
  updateProfile: (data) => ipcRenderer.invoke('update-profile', data),
  deleteProfile: (id) => ipcRenderer.invoke('delete-profile', id),
  
  // ============================================
  // HISTÓRICO (v2.0)
  // ============================================
  startMeeting: (data) => ipcRenderer.invoke('start-meeting', data),
  endMeeting: (data) => ipcRenderer.invoke('end-meeting', data),
  getMeetingHistory: (options) => ipcRenderer.invoke('get-meeting-history', options),
  getMeeting: (id) => ipcRenderer.invoke('get-meeting', id),
  deleteMeeting: (id) => ipcRenderer.invoke('delete-meeting', id),
  
  // ============================================
  // FEEDBACK (v2.0)
  // ============================================
  submitFeedback: (data) => ipcRenderer.invoke('submit-feedback', data),
  getFeedbackStats: () => ipcRenderer.invoke('get-feedback-stats'),
  
  // ============================================
  // DETECÇÃO DE APPS (v2.0)
  // ============================================
  detectMeetingApps: () => ipcRenderer.invoke('detect-meeting-apps'),
  
  // ============================================
  // V3 - SCREENSHOT + IA VISUAL
  // ============================================
  captureScreenshot: () => ipcRenderer.invoke('capture-screenshot'),
  analyzeImage: (data) => ipcRenderer.invoke('analyze-image', data),
  
  // ============================================
  // V3 - INTENT DETECTION
  // ============================================
  detectIntent: (text) => ipcRenderer.invoke('detect-intent', text),
  
  // ============================================
  // V3 - CHAT PARALELO
  // ============================================
  chatWithAI: (data) => ipcRenderer.invoke('chat-with-ai', data),
  
  // ============================================
  // V3 - REESCRITA INSTANTÂNEA
  // ============================================
  rewriteSuggestion: (data) => ipcRenderer.invoke('rewrite-suggestion', data),
  
  // ============================================
  // V3 - PERSONAS
  // ============================================
  getPersonas: () => ipcRenderer.invoke('get-personas'),
  generateWithPersona: (data) => ipcRenderer.invoke('generate-with-persona', data),
  
  // ============================================
  // V3 - WHAT SHOULD I SAY NOW
  // ============================================
  whatShouldISay: (data) => ipcRenderer.invoke('what-should-i-say', data),
  
  // ============================================
  // V3 - MEMÓRIA POR CLIENTE
  // ============================================
  getClientMemories: () => ipcRenderer.invoke('get-client-memories'),
  getClientMemory: (clientId) => ipcRenderer.invoke('get-client-memory', clientId),
  saveClientMemory: (data) => ipcRenderer.invoke('save-client-memory', data),
  addClientNote: (data) => ipcRenderer.invoke('add-client-note', data),
  deleteClientMemory: (clientId) => ipcRenderer.invoke('delete-client-memory', clientId),
  
  // ============================================
  // V3 - EXPORTAÇÃO
  // ============================================
  exportMeeting: (data) => ipcRenderer.invoke('export-meeting', data),
  
  // ============================================
  // V3 - MODO CONFIDENCIAL
  // ============================================
  toggleConfidentialMode: () => ipcRenderer.invoke('toggle-confidential-mode'),
  getConfidentialMode: () => ipcRenderer.invoke('get-confidential-mode'),
  
  // ============================================
  // V4 - MEETING GOAL ENGINE
  // ============================================
  setMeetingGoal: (goal) => ipcRenderer.invoke('set-meeting-goal', goal),
  getMeetingGoal: () => ipcRenderer.invoke('get-meeting-goal'),
  checkGoalProgress: (data) => ipcRenderer.invoke('check-goal-progress', data),
  getGoalFinalScore: (data) => ipcRenderer.invoke('get-goal-final-score', data),
  
  // ============================================
  // V4 - COACHING MODE
  // ============================================
  generateCoachingReport: (data) => ipcRenderer.invoke('generate-coaching-report', data),
  
  // ============================================
  // V4 - SIMULAÇÃO DE REUNIÃO
  // ============================================
  startSimulation: (data) => ipcRenderer.invoke('start-simulation', data),
  simulationRespond: (data) => ipcRenderer.invoke('simulation-respond', data),
  endSimulation: () => ipcRenderer.invoke('end-simulation'),
  
  // ============================================
  // V4 - ENGLISH ASSIST MODE
  // ============================================
  translateAssist: (data) => ipcRenderer.invoke('translate-assist', data),
  speakForMe: (data) => ipcRenderer.invoke('speak-for-me', data),
  
  // ============================================
  // V4 - CONTEXT INJECTION
  // ============================================
  injectContext: (data) => ipcRenderer.invoke('inject-context', data),
  getInjectedContext: () => ipcRenderer.invoke('get-injected-context'),
  clearInjectedContext: () => ipcRenderer.invoke('clear-injected-context'),
  generateWithContext: (data) => ipcRenderer.invoke('generate-with-context', data),
  
  // ============================================
  // V4 - SPEAKING ANALYTICS
  // ============================================
  analyzeSpeaking: (data) => ipcRenderer.invoke('analyze-speaking', data),
  
  // ============================================
  // V4 - ADAPTIVE PERSONALITY
  // ============================================
  getUserPreferences: () => ipcRenderer.invoke('get-user-preferences'),
  updateUserPreferences: (prefs) => ipcRenderer.invoke('update-user-preferences', prefs),
  recordPreferenceFeedback: (data) => ipcRenderer.invoke('record-preference-feedback', data)
});
