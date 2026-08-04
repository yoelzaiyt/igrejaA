/**
 * Text-to-Speech (TTS) utility for Santuário Digital totem.
 * Uses browser Web Speech API.
 */

let isVoiceEnabled = false;

export function setVoiceAssistEnabled(enabled: boolean) {
  isVoiceEnabled = enabled;
  if (enabled) {
    speakText('Guia de voz ativado. Toque nos botões para ouvir as descrições.', true);
  } else {
    // Speak one last time to confirm deactivation
    speakText('Guia de voz desativado.', true);
  }
}

export function getVoiceAssistEnabled(): boolean {
  return isVoiceEnabled;
}

export function speakText(text: string, force: boolean = false) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  if (isVoiceEnabled || force) {
    // Cancel any ongoing speech to prevent queues
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0; // Normal rate
    utterance.pitch = 1.0; // Friendly pitch

    // Find a Portuguese voice if available, otherwise fallback to default
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(voice => voice.lang.includes('pt-BR') || voice.lang.includes('pt_BR'));
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    window.speechSynthesis.speak(utterance);
  }
}
