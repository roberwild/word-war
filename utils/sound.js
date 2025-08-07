const contextSingleton = { ctx: null };

function getAudioContext() {
  if (typeof window === 'undefined') {
    return null;
  }
  if (!contextSingleton.ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) {
      return null;
    }
    contextSingleton.ctx = new AC();
  }
  return contextSingleton.ctx;
}

export function resumeAudio() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') { ctx.resume(); }
}

function playBeep({ frequency = 700, durationMs = 120, type = 'square', gain = 0.03 } = {}) {
  const ctx = getAudioContext();
  if (!ctx) { return; }
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  g.gain.value = gain;
  osc.connect(g);
  g.connect(ctx.destination);
  const now = ctx.currentTime;
  osc.start(now);
  osc.stop(now + durationMs / 1000);
}

export function playShoot() {
  playBeep({ frequency: 1200, durationMs: 80, type: 'square', gain: 0.04 });
}

export function playExplosion() {
  const ctx = getAudioContext();
  if (!ctx) { return; }
  const bufferSize = 2 * ctx.sampleRate;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;
  const gain = ctx.createGain();
  gain.gain.value = 0.05;
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  const now = ctx.currentTime;
  noise.start(now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
  noise.stop(now + 0.5);
}

export function playImpact() {
  playBeep({ frequency: 250, durationMs: 60, type: 'square', gain: 0.03 });
}

export function playBigExplosion() {
  const ctx = getAudioContext();
  if (!ctx) { return; }
  // White noise burst + lowpass envelope + low-frequency thump
  const bufferSize = 2 * ctx.sampleRate;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 600;
  const gain = ctx.createGain();
  gain.gain.value = 0.12;
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  // Low-frequency thump
  const osc = ctx.createOscillator();
  const oGain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 90;
  oGain.gain.value = 0.09;
  osc.connect(oGain);
  oGain.connect(ctx.destination);

  const now = ctx.currentTime;
  noise.start(now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
  noise.stop(now + 0.8);

  osc.start(now);
  osc.frequency.exponentialRampToValueAtTime(50, now + 0.45);
  oGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
  osc.stop(now + 0.5);
}


