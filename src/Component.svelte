<!--
  Plugin Budibase - Transcription vocale
  Auteur : MEMORA solutions, https://memora.solutions ; info@memora.ca
  Licence : MIT (attribution obligatoire)
  Web Speech API - gratuit, zéro backend. Note : l'audio transite par les serveurs Google/Apple pour la reconnaissance
-->
<script>
  import { getContext, onMount, onDestroy } from "svelte"

  const { styleable } = getContext("sdk")
  const component = getContext("component")

  // Budibase form binding
  const formContext = getContext("form")
  const formStepContext = getContext("form-step")
  const fieldGroupContext = getContext("field-group")
  let fieldApi
  let fieldState

  export let field
  export let label = "Description vocale"
  export let lang = "fr-CA"
  export let placeholder = "Appuyez sur le micro et parlez..."
  export let disabled = false

  let transcript = ""
  let interimText = ""
  let isRecording = false
  let recognition = null
  let supported = true
  let error = ""
  let shownPrivacy = false
  let consentGiven = false
  let showConsentDialog = false

  // i18n - messages adaptes a la langue choisie
  const messages = {
    "fr-CA": { listening: "Écoute en cours...", privacy: "Votre voix est envoyée en ligne pour la transcription.", consent: "En activant le micro, votre voix sera envoyée aux serveurs de Google (Chrome) ou Apple (Safari) pour la transcription. Aucune donnee n'est conservée par l'application.", accept: "J'accepte", decline: "Non merci", error: "Erreur", notSupported: "La reconnaissance vocale n'est pas supportée par ce navigateur.", start: "Démarrer l'enregistrement", stop: "Arrêter l'enregistrement", speak: "Parler", stopBtn: "Arrêter", clear: "Effacer" },
    "fr-FR": { listening: "Écoute en cours...", privacy: "Votre voix est envoyée en ligne pour la transcription.", consent: "En activant le micro, votre voix sera envoyée aux serveurs de Google (Chrome) ou Apple (Safari) pour la transcription. Aucune donnee n'est conservée par l'application.", accept: "J'accepte", decline: "Non merci", error: "Erreur", notSupported: "La reconnaissance vocale n'est pas supportée par ce navigateur.", start: "Démarrer l'enregistrement", stop: "Arrêter l'enregistrement", speak: "Parler", stopBtn: "Arrêter", clear: "Effacer" },
    "en-CA": { listening: "Listening...", privacy: "Your voice is sent online for transcription.", consent: "By activating the microphone, your voice will be sent to Google (Chrome) or Apple (Safari) servers for transcription. No data is stored by the application.", accept: "I accept", decline: "No thanks", error: "Error", notSupported: "Speech recognition is not supported by this browser.", start: "Start recording", stop: "Stop recording", speak: "Speak", stopBtn: "Stop", clear: "Clear" },
    "en-US": { listening: "Listening...", privacy: "Your voice is sent online for transcription.", consent: "By activating the microphone, your voice will be sent to Google (Chrome) or Apple (Safari) servers for transcription. No data is stored by the application.", accept: "I accept", decline: "No thanks", error: "Error", notSupported: "Speech recognition is not supported by this browser.", start: "Start recording", stop: "Stop recording", speak: "Speak", stopBtn: "Stop", clear: "Clear" }
  }
  $: t = messages[lang] || messages["fr-CA"]


  const fieldId = `vt-${Math.random().toString(36).substr(2, 9)}`

  // Register with Budibase form system (une seule fois)
  let registered = false
  $: if (formContext && field && !registered) {
    const formField = formContext.registerField(field, "string", "", disabled, null)
    if (formField) {
      fieldApi = formField.fieldApi
      fieldState = formField.fieldState
      registered = true
    }
  }

  // Sync transcript to Budibase form
  $: if (fieldApi && transcript !== undefined) {
    fieldApi.setValue(transcript)
  }

  onMount(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      supported = false
      error = t.notSupported
      return
    }

    recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = lang

    recognition.onresult = (event) => {
      let final = ""
      let interim = ""
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript + " "
        } else {
          interim += event.results[i][0].transcript
        }
      }
      if (final) {
        transcript = (transcript + final).trim()
        interimText = ""
      } else {
        interimText = interim
      }
    }

    recognition.onerror = (event) => {
      if (event.error === "no-speech") return
      error = t.error + " : " + event.error
      isRecording = false
    }

    recognition.onend = () => {
      if (isRecording) {
        try { recognition.start() } catch(e) {}
      }
    }
  })

  onDestroy(() => {
    if (recognition) {
      try { recognition.stop() } catch (e) {}
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
    }
  })

  function toggleRecording() {
    if (disabled || !supported) return
    if (isRecording) {
      recognition.stop()
      isRecording = false
    } else if (!consentGiven) {
      showConsentDialog = true
    } else {
      startListening()
    }
  }

  function acceptConsent() {
    consentGiven = true
    showConsentDialog = false
    startListening()
  }

  function declineConsent() {
    showConsentDialog = false
  }

  function startListening() {
    if (isRecording) return
    error = ""
    interimText = ""
    try {
      recognition.lang = lang
      recognition.start()
      isRecording = true
      shownPrivacy = true
    } catch (e) {
      error = t.error + " : " + e.message
    }
  }

  function clearTranscript() {
    transcript = ""
    interimText = ""
    error = ""
    if (isRecording) {
      recognition.stop()
      isRecording = false
    }
  }

  function handleInput(event) {
    transcript = event.target.value
  }

  $: displayText = interimText ? transcript + " " + interimText : transcript
</script>

<div class="vt-container" use:styleable={$component.styles}>
  {#if label}
    <label class="vt-label" for={fieldId}>{label}</label>
  {/if}

  <div class="vt-input-row">
    <textarea
      id={fieldId}
      class="vt-textarea"
      value={displayText}
      on:input={handleInput}
      {placeholder}
      {disabled}
      rows="3"
    ></textarea>

    <div class="vt-buttons">
      <button
        class="vt-btn vt-btn-mic"
        class:vt-recording={isRecording}
        on:click={toggleRecording}
        {disabled}
        aria-label={isRecording ? t.stop : t.start}
        title={isRecording ? t.stopBtn : t.speak}
      >
        {#if isRecording}
          <span class="vt-pulse"></span>
        {/if}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
      </button>

      <button
        class="vt-btn vt-btn-clear"
        on:click={clearTranscript}
        disabled={disabled || (!transcript && !interimText)}
        aria-label={t.clear}
        title={t.clear}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  </div>

  <div aria-live="polite" role="status">
    {#if !supported}
      <p class="vt-error">{error}</p>
    {:else if error}
      <p class="vt-error">{error}</p>
    {:else if isRecording}
      <p class="vt-status">{t.listening}</p>
    {/if}
  </div>

  {#if showConsentDialog}
    <div class="vt-consent">
      <p class="vt-consent-text">{t.consent}</p>
      <div class="vt-consent-buttons">
        <button class="vt-btn-accept" on:click={acceptConsent}>{t.accept}</button>
        <button class="vt-btn-decline" on:click={declineConsent}>{t.decline}</button>
      </div>
    </div>
  {/if}

  {#if shownPrivacy}
    <p class="vt-privacy">{t.privacy}</p>
  {/if}
</div>

<style>
  .vt-container { display:flex; flex-direction:column; gap:6px; width:100%; font-family:inherit; }
  .vt-label { font-weight:600; font-size:14px; color:#374151; }
  .vt-input-row { display:flex; gap:8px; align-items:flex-start; }
  .vt-textarea { flex:1; padding:10px 12px; border:1.5px solid #6B7280; border-radius:8px; font-size:15px; font-family:inherit; color:#374151; background:#fff; resize:vertical; min-height:60px; line-height:1.4; }
  .vt-textarea:focus { border-color:#1B4F72; box-shadow:0 0 0 3px rgba(27,79,114,0.15); outline:none; }
  .vt-textarea:disabled { background:#F3F4F6; color:#9CA3AF; cursor:not-allowed; }
  .vt-buttons { display:flex; flex-direction:column; gap:6px; }
  .vt-btn { display:flex; justify-content:center; align-items:center; min-width:48px; min-height:48px; border:none; border-radius:8px; cursor:pointer; color:#fff; transition:background-color 0.2s,transform 0.1s; position:relative; padding:0; }
  .vt-btn:active:not(:disabled) { transform:scale(0.95); }
  .vt-btn:disabled { opacity:0.4; cursor:not-allowed; }
  .vt-btn-mic { background:#1B4F72; }
  .vt-btn-mic:hover:not(:disabled) { background:#2E6B8A; }
  .vt-btn-mic.vt-recording { background:#DC2626; }
  .vt-btn-mic.vt-recording:hover:not(:disabled) { background:#B91C1C; }
  .vt-btn-clear { background:#6B7280; min-width:48px; min-height:36px; }
  .vt-btn-clear:hover:not(:disabled) { background:#4B5563; }
  .vt-pulse { position:absolute; top:4px; right:4px; width:10px; height:10px; background:#fff; border-radius:50%; animation:pulse 1.5s infinite; }
  @keyframes pulse { 0%{transform:scale(0.9);opacity:1} 50%{transform:scale(1.2);opacity:0.5} 100%{transform:scale(0.9);opacity:1} }
  .vt-status { font-size:12px; color:#1B4F72; margin:0; font-style:italic; }
  .vt-error { font-size:12px; color:#DC2626; margin:0; }
  .vt-consent { padding:12px; background:#FFFBEB; border:1px solid #D97706; border-radius:8px; margin-top:6px; }
  .vt-consent-text { font-size:13px; color:#374151; margin:0 0 8px 0; line-height:1.4; }
  .vt-consent-buttons { display:flex; gap:8px; }
  .vt-btn-accept { padding:8px 16px; background:#1B4F72; color:#fff; border:none; border-radius:6px; font-size:13px; font-weight:600; cursor:pointer; min-height:36px; }
  .vt-btn-accept:hover { background:#2E6B8A; }
  .vt-btn-decline { padding:8px 16px; background:#fff; color:#374151; border:1px solid #D1D5DB; border-radius:6px; font-size:13px; cursor:pointer; min-height:36px; }
  .vt-btn-decline:hover { background:#F3F4F6; }
  .vt-privacy { font-size:11px; color:#6B7280; margin:4px 0 0 0; padding:6px 8px; background:#F9FAFB; border-radius:4px; border-left:3px solid #D97706; line-height:1.3; }
  @media(max-width:639px) { .vt-btn{min-width:56px;min-height:56px} .vt-btn svg{width:28px;height:28px} }
</style>
