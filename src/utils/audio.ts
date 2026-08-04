/**
 * Audiovisual feedback helper for the Santuário Digital totem.
 * Uses Web Audio API to synthetically generate high-quality, soft, elegant auditory alerts.
 * This guarantees pristine quality without carrying external heavy binary media dependencies.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  
  // Resume if suspended (browser security policies)
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  return audioCtx;
}

/**
 * Plays a light, professional, celestial chiming chord (C5 - G5 - C6)
 * with soft volume envelopes (attack/decay) to fit the spiritual, serene ambiance of the sanctuary.
 */
export function playSuccessSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Low pass filter to keep it extra cozy, warm and smooth
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, now);
    filter.Q.setValueAtTime(1, now);
    filter.connect(ctx.destination);

    // Dynamic Master Gain control with smooth ramp down to avoid popping clicks
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.18, now + 0.05); // Elegant rapid fade-in
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8); // Serene long fade-out
    masterGain.connect(filter);

    // Chime tone pitches (serene major-fifth-octave harmony chord)
    // C5 (523.25 Hz), G5 (783.99 Hz), E6 (1318.51 Hz) or C6 (1046.50 Hz)
    const tones = [
      { freq: 523.25, type: 'sine' as OscillatorType, delay: 0 },
      { freq: 783.99, type: 'sine' as OscillatorType, delay: 0.1 },
      { freq: 1046.50, type: 'sine' as OscillatorType, delay: 0.2 }
    ];

    tones.forEach((tone) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = tone.type;
      osc.frequency.setValueAtTime(tone.freq, now + tone.delay);
      
      // Tone specific envelope to build nice acoustic-like balance
      oscGain.gain.setValueAtTime(0, now);
      oscGain.gain.linearRampToValueAtTime(0.4, now + tone.delay + 0.05);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + tone.delay + 1.2);

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start(now + tone.delay);
      osc.stop(now + tone.delay + 1.3);
    });
  } catch (err) {
    console.warn('Could not play auditory feedback due to browser AudioContext restrictions/configurations.', err);
  }
}

/**
 * Plays a short, subtle, low-frequency acoustic tap sound
 * to give immediate tactile response to button presses on the kiosk screen.
 */
export function playTapSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Quick gain envelope for snappy tap click
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.08, now + 0.002);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
    gainNode.connect(ctx.destination);

    // Sine wave oscillator at around 550 Hz for a dry, clean click
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(550, now);
    osc.connect(gainNode);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch (err) {
    // Fail silently for tap sounds to avoid spamming the console
  }
}

